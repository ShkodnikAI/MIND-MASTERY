/**
 * @file useAudioEngine -- React hook for audio engine integration.
 *
 * This hook is the BRIDGE between:
 * - `AudioEngine` (pure state machine, emits events)
 * - `expo-audio` (music + binaural playback)
 * - `expo-speech` (TTS voice narration)
 * - `expo-haptics` (vibration feedback)
 * - Zustand stores (sessionStore, audioStateStore)
 *
 * INV-2: The hook manages ALL audio session access. Components never call
 * expo-audio or expo-speech directly -- they use the controls returned
 * by this hook.
 *
 * INV-3: The hook syncs engine events to `audioStateStore` so the UI can
 * read state reactively without subscribing to the engine.
 *
 * Usage in a session screen:
 * ```tsx
 * const { start, pause, resume, stop } = useAudioEngine();
 * ```
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { AudioEngine } from '@/audio/AudioEngine';
import type { EngineEvent } from '@/audio/types';
import { startFade, effectiveVolume } from '@/audio/FadeController';
import type { FadeHandle } from '@/audio/FadeController';
import { resolveMusicUri, resolveBinauralUri } from '@/audio/assetResolver';
import { useAudioStateStore } from '@/store/audioStateStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSessionStore } from '@/store/sessionStore';
import { useContentStore } from '@/store/contentStore';
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics';
import { logger } from '@/utils/logger';
import type { Segment, SessionLength } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Return type of the `useAudioEngine()` hook. */
export interface AudioEngineControls {
  /**
   * Start a session for the given practice.
   * Resolves narration texts from contentStore.
   */
  startSession: (
    practiceId: string,
    systemId: string,
    sessionId: string,
    segments: readonly Segment[],
    length: SessionLength,
    totalDurationMs: number,
  ) => Promise<void>;

  /** Pause the current session. */
  pause: () => void;

  /** Resume a paused session. */
  resume: () => void;

  /** Stop / abort the current session. */
  stop: () => void;

  /** Whether the engine is currently active (playing or paused). */
  isActive: boolean;

  /** Whether the engine is currently playing. */
  isPlaying: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that creates the audio engine, wires up expo-audio players,
 * expo-speech, and haptics, and provides session controls.
 *
 * Must be called from a React component (uses hooks internally).
 * The AudioEngine singleton is created once and reused across renders.
 */
export function useAudioEngine(): AudioEngineControls {
  // -- expo-audio players -----------------------------------------------
  // `useAudioPlayer()` returns an `AudioPlayer` instance directly.
  // Music layer -- plays background ambient tracks.
  const musicPlayer: AudioPlayer = useAudioPlayer();
  // Binaural layer -- plays pre-rendered binaural beat WAVs.
  const binauralPlayer: AudioPlayer = useAudioPlayer();

  // -- Stores -----------------------------------------------------------
  const audio = useSettingsStore((s) => s.audio);
  const voice = useSettingsStore((s) => s.voice);
  const getText = useContentStore((s) => s.getText);
  const updateSessionStatus = useSessionStore((s) => s.updateStatus);
  const updateSessionPhase = useSessionStore((s) => s.updatePhase);
  const updateSessionProgress = useSessionStore((s) => s.updateProgress);

  // Audio state store actions (for UI reads per INV-3)
  const setEngineState = useAudioStateStore((s) => s.setEngineState);
  const setPhase = useAudioStateStore((s) => s.setPhase);
  const setProgress = useAudioStateStore((s) => s.setProgress);
  const setTotalDuration = useAudioStateStore((s) => s.setTotalDuration);
  const setLayerState = useAudioStateStore((s) => s.setLayerState);
  const setLayerVolume = useAudioStateStore((s) => s.setLayerVolume);
  const setAudioError = useAudioStateStore((s) => s.setError);
  const resetAudioState = useAudioStateStore((s) => s.reset);

  // -- Engine singleton -------------------------------------------------
  const engineRef = useRef<AudioEngine | null>(null);

  // -- Fade handles for cleanup -----------------------------------------
  const musicFadeRef = useRef<FadeHandle | null>(null);
  const binauralFadeRef = useRef<FadeHandle | null>(null);

  // -- Text resolver ----------------------------------------------------
  const resolveText = useCallback(
    (textKey: string): string | null => {
      // TextKey format: "practiceId.section" (e.g. "breath_diaphragmatic.preparation")
      const dotIndex = textKey.indexOf('.');
      if (dotIndex === -1) return textKey; // fallback: return raw key

      const practiceId = textKey.substring(0, dotIndex);
      const sectionKey = textKey.substring(dotIndex + 1);

      const practiceText = getText(practiceId);
      if (!practiceText) {
        logger.warn('[useAudioEngine]', `No text for practice "${practiceId}"`);
        return null;
      }

      // PracticeTextSchema.segments is Record<string, string>
      // The textKey suffix maps directly to segment keys
      const text = practiceText.segments[sectionKey];
      if (typeof text === 'string' && text.length > 0) {
        return text;
      }

      return null;
    },
    [getText],
  );

  // -- Engine event handler ---------------------------------------------
  const handleEngineEvent = useCallback(
    (event: EngineEvent) => {
      switch (event.type) {
        // -- State events (sync to stores) ------------------------------

        case 'stateChange': {
          setEngineState(event.state);

          // Sync to sessionStore
          const statusMap: Record<string, 'idle' | 'playing' | 'paused' | 'finished' | 'error'> = {
            idle: 'idle',
            preparing: 'playing',
            playing: 'playing',
            paused: 'paused',
            finished: 'finished',
          };
          updateSessionStatus(statusMap[event.state] ?? 'idle');

          if (event.state === 'finished' || event.state === 'idle') {
            // Clean up fade handles
            musicFadeRef.current?.cancel();
            musicFadeRef.current = null;
            binauralFadeRef.current?.cancel();
            binauralFadeRef.current = null;
          }
          break;
        }

        case 'progress': {
          setProgress(event.segmentIndex, event.elapsedMs);
          updateSessionProgress(event.segmentIndex, event.elapsedMs);
          break;
        }

        case 'phaseChange': {
          setPhase(event.phase);
          updateSessionPhase(event.phase);
          break;
        }

        case 'segmentStart': {
          break;
        }

        case 'segmentEnd': {
          break;
        }

        case 'sessionComplete': {
          logger.info('[useAudioEngine]', 'Session complete');
          Speech.stop();
          break;
        }

        // -- Command events (execute I/O) --------------------------------

        case 'playVoice': {
          const text = resolveText(event.textKey);
          if (!text) {
            logger.warn('[useAudioEngine]', `Cannot resolve text for "${event.textKey}"`);
            break;
          }

          setLayerState('voice', { status: 'playing' });

          const voiceVol = effectiveVolume(audio.masterVolume, audio.voiceVolume);
          setLayerVolume('voice', voiceVol);

          Speech.speak(text, {
            language: 'ru-RU',
            rate: voice.speed,
            pitch: voice.pitch,
            onDone: () => {
              setLayerState('voice', { status: 'idle' });
            },
            onError: () => {
              setLayerState('voice', { status: 'error' });
              engineRef.current?.reportError(`TTS error for "${event.textKey}"`);
            },
          });
          break;
        }

        case 'stopVoice': {
          Speech.stop();
          setLayerState('voice', { status: 'idle' });
          break;
        }

        case 'startMusic': {
          try {
            const musicVol = effectiveVolume(audio.masterVolume, audio.musicVolume);
            const targetVol = musicVol * event.volume;

            // Resolve track ID to actual asset URI
            let trackUri = resolveMusicUri(event.trackId);
            if (!trackUri) {
              trackUri = event.trackId; // fallback: treat as direct URI
            }

            setLayerState('music', {
              status: 'playing',
              currentTrackId: event.trackId,
              volume: 0,
            });

            // expo-audio: use replace() to change source
            musicPlayer.replace({ uri: trackUri });
            musicPlayer.volume = 0;

            // Fade in
            if (event.fadeInMs > 0) {
              musicFadeRef.current = startFade({
                fromVolume: 0,
                toVolume: targetVol,
                durationMs: event.fadeInMs,
                curve: 'exponential',
                onVolumeChange: (v) => {
                  musicPlayer.volume = v;
                  setLayerVolume('music', v);
                },
              });
            } else {
              musicPlayer.volume = targetVol;
              setLayerVolume('music', targetVol);
            }

            musicPlayer.play();
          } catch (err) {
            logger.warn('[useAudioEngine]', 'Music start failed', err);
            setLayerState('music', { status: 'error' });
            engineRef.current?.reportError(
              `Music start failed: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
          break;
        }

        case 'stopMusic': {
          musicFadeRef.current?.cancel();

          if (event.fadeOutMs > 0) {
            const currentVol = effectiveVolume(audio.masterVolume, audio.musicVolume);
            musicFadeRef.current = startFade({
              fromVolume: currentVol,
              toVolume: 0,
              durationMs: event.fadeOutMs,
              curve: 'exponential',
              onVolumeChange: (v) => {
                musicPlayer.volume = v;
                setLayerVolume('music', v);
              },
              onComplete: () => {
                musicPlayer.pause();
                setLayerState('music', { status: 'idle' });
              },
            });
          } else {
            musicPlayer.pause();
            setLayerState('music', { status: 'idle' });
          }
          break;
        }

        case 'startBinaural': {
          try {
            const binVol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
            const targetVol = binVol * event.volume;

            // Resolve track ID to actual asset URI
            let trackUri = resolveBinauralUri(event.trackId);
            if (!trackUri) {
              trackUri = event.trackId; // fallback: treat as direct URI
            }

            setLayerState('binaural', {
              status: 'playing',
              currentTrackId: event.trackId,
              volume: 0,
            });

            // expo-audio: use replace() to change source
            binauralPlayer.replace({ uri: trackUri });
            binauralPlayer.volume = 0;

            // Fade in
            if (event.fadeInMs > 0) {
              binauralFadeRef.current = startFade({
                fromVolume: 0,
                toVolume: targetVol,
                durationMs: event.fadeInMs,
                curve: 'exponential',
                onVolumeChange: (v) => {
                  binauralPlayer.volume = v;
                  setLayerVolume('binaural', v);
                },
              });
            } else {
              binauralPlayer.volume = targetVol;
              setLayerVolume('binaural', targetVol);
            }

            binauralPlayer.play();
          } catch (err) {
            logger.warn('[useAudioEngine]', 'Binaural start failed', err);
            setLayerState('binaural', { status: 'error' });
            engineRef.current?.reportError(
              `Binaural start failed: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
          break;
        }

        case 'stopBinaural': {
          binauralFadeRef.current?.cancel();

          if (event.fadeOutMs > 0) {
            const currentVol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
            binauralFadeRef.current = startFade({
              fromVolume: currentVol,
              toVolume: 0,
              durationMs: event.fadeOutMs,
              curve: 'exponential',
              onVolumeChange: (v) => {
                binauralPlayer.volume = v;
                setLayerVolume('binaural', v);
              },
              onComplete: () => {
                binauralPlayer.pause();
                setLayerState('binaural', { status: 'idle' });
              },
            });
          } else {
            binauralPlayer.pause();
            setLayerState('binaural', { status: 'idle' });
          }
          break;
        }

        case 'setLayerVolume': {
          if (event.layer === 'music') {
            musicPlayer.volume = event.volume;
            setLayerVolume('music', event.volume);
          } else if (event.layer === 'binaural') {
            binauralPlayer.volume = event.volume;
            setLayerVolume('binaural', event.volume);
          }
          break;
        }

        case 'triggerHaptic': {
          switch (event.pattern) {
            case 'light':
              hapticLight();
              break;
            case 'medium':
              hapticMedium();
              break;
            case 'heavy':
              hapticHeavy();
              break;
          }
          break;
        }

        case 'showTheory': {
          break;
        }

        case 'error': {
          setAudioError(event.message);
          if (event.fatal) {
            logger.error('[useAudioEngine]', 'Fatal engine error', {
              message: event.message,
            });
          }
          break;
        }
      }
    },
    [
      audio,
      voice,
      resolveText,
      setEngineState,
      setPhase,
      setProgress,
      setTotalDuration,
      setLayerState,
      setLayerVolume,
      setAudioError,
      updateSessionStatus,
      updateSessionPhase,
      updateSessionProgress,
      musicPlayer,
      binauralPlayer,
    ],
  );

  // -- Initialize engine + subscribe ------------------------------------
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engineRef.current = engine;

    const unsubscribe = engine.subscribe(handleEngineEvent);

    return () => {
      unsubscribe();
      // Stop all audio on unmount
      Speech.stop();
      try {
        musicPlayer.pause();
      } catch {
        /* noop */
      }
      try {
        binauralPlayer.pause();
      } catch {
        /* noop */
      }
      musicFadeRef.current?.cancel();
      binauralFadeRef.current?.cancel();
      resetAudioState();
    };
  }, [handleEngineEvent, musicPlayer, binauralPlayer, resetAudioState]);

  // -- Controls ---------------------------------------------------------

  const startSession = useCallback(
    async (
      practiceId: string,
      systemId: string,
      sessionId: string,
      segments: readonly Segment[],
      length: SessionLength,
      totalDurationMs: number,
    ) => {
      const engine = AudioEngine.getInstance();

      // Reset UI state
      resetAudioState();
      setTotalDuration(totalDurationMs);

      await engine.startSession({
        practiceId,
        systemId,
        sessionId,
        segments,
        audioSettings: audio,
        voiceSettings: voice,
        length,
        resolveText,
      });
    },
    [audio, voice, resolveText, resetAudioState, setTotalDuration],
  );

  const pause = useCallback(() => {
    AudioEngine.getInstance().pause();
  }, []);

  const resume = useCallback(() => {
    AudioEngine.getInstance().resume();
  }, []);

  const stop = useCallback(() => {
    AudioEngine.getInstance().stop();
  }, []);

  // -- Derived state ----------------------------------------------------
  const engineState = useAudioStateStore((s) => s.engineState);

  const controls: AudioEngineControls = useMemo(
    () => ({
      startSession,
      pause,
      resume,
      stop,
      isActive:
        engineState === 'playing' || engineState === 'preparing' || engineState === 'paused',
      isPlaying: engineState === 'playing',
    }),
    [startSession, pause, resume, stop, engineState],
  );

  return controls;
}
