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
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioPlayer } from 'expo-audio';
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
import type { Segment, SessionLength, MusicSegment, BinauralSegment } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Return type of the `useAudioEngine()` hook. */
export interface AudioEngineControls {
  startSession: (
    practiceId: string,
    systemId: string,
    sessionId: string,
    segments: readonly Segment[],
    length: SessionLength,
    totalDurationMs: number,
  ) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggleMute: (layer: 'music' | 'binaural' | 'voice') => void;
  isActive: boolean;
  isPlaying: boolean;
}

// ---------------------------------------------------------------------------
// Defaults for auto-injected background layers
// ---------------------------------------------------------------------------

/** Binaural frequency per system (alpha/theta for meditation). */
const SYSTEM_BINAURAL: Record<string, { baseHz: number; beatHz: number }> = {
  silva: { baseHz: 200, beatHz: 10 },
  dispenza: { baseHz: 200, beatHz: 4 },
  transurfing: { baseHz: 200, beatHz: 10 },
  feldenkrais: { baseHz: 150, beatHz: 8 },
  domfreq: { baseHz: 200, beatHz: 8 },
  breath: { baseHz: 200, beatHz: 10 },
};

const DEFAULT_BINAURAL = { baseHz: 200, beatHz: 10 };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAudioEngine(): AudioEngineControls {
  const musicPlayer = useAudioPlayer();
  const binauralPlayer = useAudioPlayer();

  const audio = useSettingsStore((s) => s.audio);
  const voice = useSettingsStore((s) => s.voice);
  const getText = useContentStore((s) => s.getText);
  const updateSessionStatus = useSessionStore((s) => s.updateStatus);
  const updateSessionPhase = useSessionStore((s) => s.updatePhase);
  const updateSessionProgress = useSessionStore((s) => s.updateProgress);

  const setEngineState = useAudioStateStore((s) => s.setEngineState);
  const setPhase = useAudioStateStore((s) => s.setPhase);
  const setProgress = useAudioStateStore((s) => s.setProgress);
  const setTotalDuration = useAudioStateStore((s) => s.setTotalDuration);
  const setLayerState = useAudioStateStore((s) => s.setLayerState);
  const setLayerVolume = useAudioStateStore((s) => s.setLayerVolume);
  const setAudioError = useAudioStateStore((s) => s.setError);
  const setNarrationText = useAudioStateStore((s) => s.setNarrationText);
  const mutedLayers = useAudioStateStore((s) => s.mutedLayers);
  const resetAudioState = useAudioStateStore((s) => s.reset);

  const engineRef = useRef<AudioEngine | null>(null);
  const musicFadeRef = useRef<FadeHandle | null>(null);
  const binauralFadeRef = useRef<FadeHandle | null>(null);

  // ── Text resolver ──────────────────────────────────────────────
  const resolveText = useCallback(
    (textKey: string): string | null => {
      const dotIndex = textKey.indexOf('.');
      if (dotIndex === -1) return textKey;
      const practiceId = textKey.substring(0, dotIndex);
      const sectionKey = textKey.substring(dotIndex + 1);
      const practiceText = getText(practiceId);
      if (!practiceText) {
        logger.warn('[useAudioEngine]', `No text for practice "${practiceId}"`);
        return null;
      }
      const text = practiceText.segments[sectionKey];
      if (typeof text === 'string' && text.length > 0) {
        return text;
      }
      return null;
    },
    [getText],
  );

  // ── Engine event handler ───────────────────────────────────────
  const handleEngineEvent = useCallback(
    (event: EngineEvent) => {
      switch (event.type) {
        case 'stateChange': {
          setEngineState(event.state);
          const statusMap: Record<string, 'idle' | 'playing' | 'paused' | 'finished' | 'error'> = {
            idle: 'idle', preparing: 'playing', playing: 'playing',
            paused: 'paused', finished: 'finished',
          };
          updateSessionStatus(statusMap[event.state] ?? 'idle');
          if (event.state === 'finished' || event.state === 'idle') {
            musicFadeRef.current?.cancel(); musicFadeRef.current = null;
            binauralFadeRef.current?.cancel(); binauralFadeRef.current = null;
            setNarrationText('');
          }
          break;
        }
        case 'progress': {
          setProgress(event.segmentIndex, event.elapsedMs);
          updateSessionProgress(event.segmentIndex, event.elapsedMs);
          break;
        }
        case 'phaseChange': { setPhase(event.phase); updateSessionPhase(event.phase); break; }
        case 'segmentStart': { break; }
        case 'segmentEnd': { break; }
        case 'sessionComplete': {
          logger.info('[useAudioEngine]', 'Session complete');
          Speech.stop();
          break;
        }

        // ── Voice narration ──────────────────────────────────────
        case 'playVoice': {
          const text = resolveText(event.textKey);
          if (!text) {
            logger.warn('[useAudioEngine]', `Cannot resolve text for "${event.textKey}"`);
            break;
          }
          setNarrationText(text);
          setLayerState('voice', { status: 'playing' });

          // Skip TTS if voice is muted
          if (mutedLayers.voice) {
            logger.info('[useAudioEngine]', 'Voice muted — skipping TTS');
            break;
          }

          const voiceVol = effectiveVolume(audio.masterVolume, audio.voiceVolume);
          setLayerVolume('voice', voiceVol);
          Speech.speak(text, {
            language: voice.language,
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

        // ── Music playback ───────────────────────────────────────
        case 'startMusic': {
          try {
            const uri = resolveMusicUri(event.trackId);
            if (!uri) {
              logger.warn('[useAudioEngine]', `Cannot resolve music: ${event.trackId}`);
              break;
            }
            const musicVol = effectiveVolume(audio.masterVolume, audio.musicVolume);
            const targetVol = mutedLayers.music ? 0 : musicVol * event.volume;
            setLayerState('music', { status: 'playing', currentTrackId: event.trackId, volume: 0 });
            musicPlayer.replace({ uri });
            musicPlayer.volume = 0;
            if (event.fadeInMs > 0 && !mutedLayers.music) {
              musicFadeRef.current = startFade({
                fromVolume: 0, toVolume: targetVol, durationMs: event.fadeInMs, curve: 'exponential',
                onVolumeChange: (v) => { musicPlayer.volume = v; setLayerVolume('music', v); },
              });
            } else {
              musicPlayer.volume = targetVol;
              setLayerVolume('music', targetVol);
            }
            musicPlayer.play();
          } catch (err) {
            logger.warn('[useAudioEngine]', 'Music start failed', err);
            setLayerState('music', { status: 'error' });
            engineRef.current?.reportError(`Music start failed: ${err instanceof Error ? err.message : String(err)}`);
          }
          break;
        }
        case 'stopMusic': {
          musicFadeRef.current?.cancel();
          if (event.fadeOutMs > 0) {
            const currentVol = effectiveVolume(audio.masterVolume, audio.musicVolume);
            musicFadeRef.current = startFade({
              fromVolume: currentVol, toVolume: 0, durationMs: event.fadeOutMs, curve: 'exponential',
              onVolumeChange: (v) => { musicPlayer.volume = v; setLayerVolume('music', v); },
              onComplete: () => { musicPlayer.pause(); setLayerState('music', { status: 'idle' }); },
            });
          } else {
            musicPlayer.pause();
            setLayerState('music', { status: 'idle' });
          }
          break;
        }

        // ── Binaural playback ────────────────────────────────────
        case 'startBinaural': {
          try {
            const uri = resolveBinauralUri(event.trackId);
            if (!uri) {
              logger.warn('[useAudioEngine]', `Cannot resolve binaural: ${event.trackId}`);
              break;
            }
            const binVol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
            const targetVol = mutedLayers.binaural ? 0 : binVol * event.volume;
            setLayerState('binaural', { status: 'playing', currentTrackId: event.trackId, volume: 0 });
            binauralPlayer.replace({ uri });
            binauralPlayer.volume = 0;
            if (event.fadeInMs > 0 && !mutedLayers.binaural) {
              binauralFadeRef.current = startFade({
                fromVolume: 0, toVolume: targetVol, durationMs: event.fadeInMs, curve: 'exponential',
                onVolumeChange: (v) => { binauralPlayer.volume = v; setLayerVolume('binaural', v); },
              });
            } else {
              binauralPlayer.volume = targetVol;
              setLayerVolume('binaural', targetVol);
            }
            binauralPlayer.play();
          } catch (err) {
            logger.warn('[useAudioEngine]', 'Binaural start failed', err);
            setLayerState('binaural', { status: 'error' });
            engineRef.current?.reportError(`Binaural start failed: ${err instanceof Error ? err.message : String(err)}`);
          }
          break;
        }
        case 'stopBinaural': {
          binauralFadeRef.current?.cancel();
          if (event.fadeOutMs > 0) {
            const currentVol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
            binauralFadeRef.current = startFade({
              fromVolume: currentVol, toVolume: 0, durationMs: event.fadeOutMs, curve: 'exponential',
              onVolumeChange: (v) => { binauralPlayer.volume = v; setLayerVolume('binaural', v); },
              onComplete: () => { binauralPlayer.pause(); setLayerState('binaural', { status: 'idle' }); },
            });
          } else {
            binauralPlayer.pause();
            setLayerState('binaural', { status: 'idle' });
          }
          break;
        }

        // ── Volume control ───────────────────────────────────────
        case 'setLayerVolume': {
          if (event.layer === 'music') {
            if (!mutedLayers.music) {
              musicPlayer.volume = event.volume;
              setLayerVolume('music', event.volume);
            }
          } else if (event.layer === 'binaural') {
            if (!mutedLayers.binaural) {
              binauralPlayer.volume = event.volume;
              setLayerVolume('binaural', event.volume);
            }
          }
          break;
        }

        // ── Haptic feedback ──────────────────────────────────────
        case 'triggerHaptic': {
          switch (event.pattern) {
            case 'light': hapticLight(); break;
            case 'medium': hapticMedium(); break;
            case 'heavy': hapticHeavy(); break;
          }
          break;
        }

        case 'showTheory': { break; }
        case 'error': {
          setAudioError(event.message);
          if (event.fatal) {
            logger.error('[useAudioEngine]', 'Fatal engine error', { message: event.message });
          }
          break;
        }
      }
    },
    [audio, voice, mutedLayers, resolveText, setEngineState, setPhase, setProgress,
     setTotalDuration, setLayerState, setLayerVolume, setAudioError, setNarrationText,
     updateSessionStatus, updateSessionPhase, updateSessionProgress,
     musicPlayer, binauralPlayer],
  );

  // ── Engine lifecycle ───────────────────────────────────────────
  useEffect(() => {
    const engine = AudioEngine.getInstance();
    engineRef.current = engine;
    const unsubscribe = engine.subscribe(handleEngineEvent);
    return () => {
      unsubscribe();
      Speech.stop();
      try { musicPlayer.pause(); } catch { /* noop */ }
      try { binauralPlayer.pause(); } catch { /* noop */ }
      musicFadeRef.current?.cancel();
      binauralFadeRef.current?.cancel();
      resetAudioState();
    };
  }, [handleEngineEvent, musicPlayer, binauralPlayer, resetAudioState]);

  // ── Inject default background layers if missing ────────────────
  const injectBackgroundLayers = useCallback(
    (segments: readonly Segment[], systemId: string): Segment[] => {
      const hasMusic = segments.some((s) => s.kind === 'music');
      const hasBinaural = segments.some((s) => s.kind === 'binaural');

      if (hasMusic && hasBinaural) return [...segments];

      const injected: Segment[] = [];

      // Inject music if not present
      if (!hasMusic) {
        const musicSeg: MusicSegment = {
          kind: 'music',
          trackId: audio.selectedMusicTrack || 'space',
          fadeInSec: 3,
          fadeOutSec: 5,
          volume: 0.3,
          loop: true,
        };
        injected.push(musicSeg);
      }

      // Inject binaural if not present
      if (!hasBinaural) {
        const freq = SYSTEM_BINAURAL[systemId] ?? DEFAULT_BINAURAL;
        const binauralSeg: BinauralSegment = {
          kind: 'binaural',
          baseHz: freq.baseHz,
          beatHz: freq.beatHz,
          fadeInSec: 5,
          fadeOutSec: 5,
          volume: 0.5,
        };
        injected.push(binauralSeg);
      }

      return [...injected, ...segments];
    },
    [audio.selectedMusicTrack],
  );

  // ── Session controls ───────────────────────────────────────────
  const startSession = useCallback(async (
    practiceId: string,
    systemId: string,
    sessionId: string,
    segments: readonly Segment[],
    length: SessionLength,
    totalDurationMs: number,
  ) => {
    const engine = AudioEngine.getInstance();
    resetAudioState();
    setTotalDuration(totalDurationMs);

    // Inject default music + binaural if practice doesn't define them
    const enrichedSegments = injectBackgroundLayers(segments, systemId);

    await engine.startSession({
      practiceId,
      systemId,
      sessionId,
      segments: enrichedSegments,
      audioSettings: audio,
      voiceSettings: voice,
      length,
      resolveText,
    });
  }, [audio, voice, resolveText, resetAudioState, setTotalDuration, injectBackgroundLayers]);

  const pause = useCallback(() => { AudioEngine.getInstance().pause(); }, []);
  const resume = useCallback(() => { AudioEngine.getInstance().resume(); }, []);
  const stop = useCallback(() => { AudioEngine.getInstance().stop(); }, []);

  // ── Mute toggle ────────────────────────────────────────────────
  const toggleMute = useCallback(
    (layer: 'music' | 'binaural' | 'voice') => {
      const isCurrentlyMuted = useAudioStateStore.getState().mutedLayers[layer];
      useAudioStateStore.getState().toggleMute(layer);

      if (!isCurrentlyMuted) {
        // Muting: set volume to 0
        if (layer === 'music') {
          musicFadeRef.current?.cancel();
          musicPlayer.volume = 0;
          setLayerVolume('music', 0);
        } else if (layer === 'binaural') {
          binauralFadeRef.current?.cancel();
          binauralPlayer.volume = 0;
          setLayerVolume('binaural', 0);
        } else if (layer === 'voice') {
          Speech.stop();
          setLayerState('voice', { status: 'idle' });
        }
      } else {
        // Unmuting: restore volume
        if (layer === 'music') {
          const vol = effectiveVolume(audio.masterVolume, audio.musicVolume);
          musicFadeRef.current = startFade({
            fromVolume: 0, toVolume: vol * 0.3, durationMs: 1000, curve: 'exponential',
            onVolumeChange: (v) => { musicPlayer.volume = v; setLayerVolume('music', v); },
          });
        } else if (layer === 'binaural') {
          const vol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
          binauralFadeRef.current = startFade({
            fromVolume: 0, toVolume: vol * 0.5, durationMs: 1000, curve: 'exponential',
            onVolumeChange: (v) => { binauralPlayer.volume = v; setLayerVolume('binaural', v); },
          });
        }
        // Voice un-mute: next playVoice event will speak normally
      }
    },
    [audio, musicPlayer, binauralPlayer, setLayerVolume, setLayerState],
  );

  // ── Computed state ─────────────────────────────────────────────
  const engineState = useAudioStateStore((s) => s.engineState);
  const controls: AudioEngineControls = useMemo(() => ({
    startSession, pause, resume, stop, toggleMute,
    isActive: engineState === 'playing' || engineState === 'preparing' || engineState === 'paused',
    isPlaying: engineState === 'playing',
  }), [startSession, pause, resume, stop, toggleMute, engineState]);

  return controls;
}
