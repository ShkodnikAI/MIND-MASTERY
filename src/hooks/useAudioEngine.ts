/**
 * @file useAudioEngine -- React hook for audio engine integration.
 *
 * This hook is the BRIDGE between:
 * - `AudioEngine` (pure state machine, emits events)
 * - `expo-audio` (music + binaural + voice playback via 3 separate AudioPlayer instances)
 * - `expo-speech` (TTS voice narration fallback)
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
 * ARCHITECTURE:
 * - 3 independent expo-audio players (music, binaural, voice)
 * - Each layer is controlled independently — can be muted/unmuted at any time
 * - Background layers (music, binaural) persist for the entire session duration
 * - Voice plays sequentially per the AudioEngine timeline
 * - AudioEngine singleton is RESET between sessions to prevent stale state
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { AudioEngine } from '@/audio/AudioEngine';
import type { EngineEvent } from '@/audio/types';
import { startFade, effectiveVolume } from '@/audio/FadeController';
import type { FadeHandle } from '@/audio/FadeController';
import { resolveMusicUri, resolveBinauralUri, resolveVoiceUriAsync } from '@/audio/assetResolver';
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
// Helper: safe play with retry
// ---------------------------------------------------------------------------

/**
 * Attempt to play an AudioPlayer. Handles the expo-audio quirk where
 * `replace()` is async under the hood and `play()` may fail if called
 * too early. We use a short polling approach with a timeout.
 */
function safePlay(
  player: ReturnType<typeof useAudioPlayer>,
  label: string,
  maxAttempts: number = 30,  // 30 * 100ms = 3s
): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      try {
        player.play();
        clearInterval(check);
        logger.info('[useAudioEngine]', `${label} play() succeeded (attempt ${attempts})`);
        resolve();
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(check);
          logger.warn('[useAudioEngine]', `${label} play() failed after ${maxAttempts} attempts`);
          resolve(); // don't throw — resolve to not block the session
        }
      }
    }, 100);

    // Safety timeout
    setTimeout(() => {
      clearInterval(check);
      resolve();
    }, (maxAttempts + 5) * 100);
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAudioEngine(): AudioEngineControls {
  // ── Audio players (stable refs, never recreated) ────────────────
  const musicPlayer = useAudioPlayer();
  const binauralPlayer = useAudioPlayer();
  const voicePlayer = useAudioPlayer();

  // ── Store selectors ─────────────────────────────────────────────
  const setEngineState = useAudioStateStore((s) => s.setEngineState);
  const setPhase = useAudioStateStore((s) => s.setPhase);
  const setProgress = useAudioStateStore((s) => s.setProgress);
  const setTotalDuration = useAudioStateStore((s) => s.setTotalDuration);
  const setLayerState = useAudioStateStore((s) => s.setLayerState);
  const setLayerVolume = useAudioStateStore((s) => s.setLayerVolume);
  const setAudioError = useAudioStateStore((s) => s.setError);
  const setNarrationText = useAudioStateStore((s) => s.setNarrationText);
  const resetAudioState = useAudioStateStore((s) => s.reset);

  const updateSessionStatus = useSessionStore((s) => s.updateStatus);
  const updateSessionPhase = useSessionStore((s) => s.updatePhase);
  const updateSessionProgress = useSessionStore((s) => s.updateProgress);

  const engineRef = useRef<AudioEngine | null>(null);
  const musicFadeRef = useRef<FadeHandle | null>(null);
  const binauralFadeRef = useRef<FadeHandle | null>(null);

  // ── Refs to remember the last spoken text and last layer URIs for re-toggle ──
  const lastVoiceTextRef = useRef<string | null>(null);
  const lastMusicUriRef = useRef<string | null>(null);
  const lastMusicVolumeRef = useRef<number>(0);
  const lastMusicLoopRef = useRef<boolean>(true);
  const lastBinauralUriRef = useRef<string | null>(null);
  const lastBinauralVolumeRef = useRef<number>(0);

  // ── Session guard: incremented on each startSession to cancel stale async voice resolves ──
  const voiceSessionGuardRef = useRef<number>(0);

  // ── Text resolver (reads from store at call time, not via closure) ──
  const resolveText = useCallback(
    (textKey: string): string | null => {
      const getText = useContentStore.getState().getText;
      const dotIndex = textKey.indexOf('.');
      if (dotIndex === -1) return textKey;
      const practiceId = textKey.substring(0, dotIndex);
      const practiceText = getText(practiceId);
      if (!practiceText) {
        logger.warn('[useAudioEngine]', `No text for practice "${practiceId}"`);
        return null;
      }
      const text = practiceText.segments[textKey];
      if (typeof text === 'string' && text.length > 0) {
        return text;
      }
      const sectionKey = textKey.substring(dotIndex + 1);
      const fallback = practiceText.segments[sectionKey];
      if (typeof fallback === 'string' && fallback.length > 0) {
        return fallback;
      }
      logger.warn('[useAudioEngine]', `No text for key "${textKey}" in practice "${practiceId}"`);
      return null;
    },
    [],
  );

  // ── Helper: speak text with current voice settings ──────────────
  const speakText = useCallback(
    (text: string) => {
      const voice = useSettingsStore.getState().voice;
      const audio = useSettingsStore.getState().audio;
      const voiceVol = effectiveVolume(audio.masterVolume, audio.voiceVolume);
      setLayerVolume('voice', voiceVol);

      const speakOptions: Record<string, unknown> = {
        language: voice.language,
        rate: voice.speed,
        pitch: voice.pitch,
        onDone: () => {
          const isMuted = useAudioStateStore.getState().mutedLayers.voice;
          setLayerState('voice', { status: 'idle' });
          if (!isMuted) {
            lastVoiceTextRef.current = null;
          }
        },
        onError: () => {
          const isMuted = useAudioStateStore.getState().mutedLayers.voice;
          setLayerState('voice', { status: 'error' });
          if (!isMuted) {
            lastVoiceTextRef.current = null;
          }
        },
      };
      if (voice.voiceId) {
        speakOptions.voiceId = voice.voiceId;
      }
      Speech.speak(text, speakOptions);
    },
    [setLayerVolume, setLayerState],
  );

  // ── Helper: start a background player (music or binaural) ──────
  const startBackgroundPlayer = useCallback(
    async (
      player: ReturnType<typeof useAudioPlayer>,
      uri: string,
      label: string,
      targetVol: number,
      fadeInMs: number,
      loop: boolean,
      fadeRef: React.MutableRefObject<FadeHandle | null>,
      layer: 'music' | 'binaural',
    ) => {
      // Stop any current playback and reset
      try { player.pause(); } catch { /* noop */ }

      // Set loop
      player.loop = loop;

      // Replace source
      player.replace({ uri });
      player.volume = 0;

      // Wait a tick for native player to process the replace, then play
      await new Promise((r) => setTimeout(r, 150));
      await safePlay(player, label);

      // Start fade-in if needed
      if (fadeInMs > 0 && targetVol > 0) {
        fadeRef.current = startFade({
          fromVolume: 0,
          toVolume: targetVol,
          durationMs: fadeInMs,
          curve: 'exponential',
          onVolumeChange: (v) => {
            player.volume = v;
            setLayerVolume(layer, v);
          },
        });
      } else {
        player.volume = targetVol;
        setLayerVolume(layer, targetVol);
      }

      logger.info('[useAudioEngine]', `${label} started successfully`);
    },
    [setLayerVolume],
  );

  // ── Engine event handler (reads from stores at event time, NOT via closure) ──
  const handleEngineEvent = useCallback(
    (event: EngineEvent) => {
      // Read latest values from stores at event time to avoid stale closures
      const audio = useSettingsStore.getState().audio;
      const voice = useSettingsStore.getState().voice;
      const mutedLayers = useAudioStateStore.getState().mutedLayers;

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
            lastVoiceTextRef.current = null;
            lastMusicUriRef.current = null;
            lastBinauralUriRef.current = null;
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
          lastVoiceTextRef.current = null;
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
          lastVoiceTextRef.current = text;
          setLayerState('voice', { status: 'playing' });

          // Skip if voice is muted — but remember text for re-speak on un-mute
          if (mutedLayers.voice) {
            logger.info('[useAudioEngine]', 'Voice muted — skipping (text remembered)');
            break;
          }

          const vm = useSettingsStore.getState().voice.mode;
          if (vm === 'prerecorded') {
            // Async: load asset on-demand, then play MP3.
            // Do NOT fall back to TTS — only MP3 or nothing in prerecorded mode.
            // Capture the session guard to detect stale resolves (race condition fix).
            const guard = voiceSessionGuardRef.current;
            (async () => {
              try {
                // Stop any current voice playback before replacing
                try { voicePlayer.pause(); } catch { /* noop */ }
                Speech.stop(); // CRITICAL: stop system TTS to prevent overlap

                const vu = await resolveVoiceUriAsync(event.textKey);

                // ── RACE CONDITION GUARD ──
                // If a new session started while we were loading, discard this result.
                // Without this, session A's async resolve could overwrite session B's audio.
                if (voiceSessionGuardRef.current !== guard) {
                  logger.info('[useAudioEngine]', `Voice resolve stale (guard ${guard} != ${voiceSessionGuardRef.current}) — discarding`);
                  return;
                }

                if (vu) {
                  const vv = effectiveVolume(audio.masterVolume, audio.voiceVolume);
                  setLayerVolume('voice', vv);
                  voicePlayer.replace({ uri: vu });
                  voicePlayer.volume = vv;
                  // Play with delay to let replace() settle
                  await new Promise((r) => setTimeout(r, 150));

                  // Check guard again after await — session may have changed
                  if (voiceSessionGuardRef.current !== guard) {
                    logger.info('[useAudioEngine]', `Voice play stale after replace (guard ${guard}) — discarding`);
                    return;
                  }

                  try { voicePlayer.play(); } catch (e) {
                    logger.warn('[useAudioEngine]', 'Voice play() failed after asset load', e);
                  }
                } else {
                  logger.warn('[useAudioEngine]', `Voice MP3 not found for "${event.textKey}" — silent (no TTS fallback in prerecorded mode)`);
                }
              } catch (e) {
                logger.warn('[useAudioEngine]', 'Voice async error', e);
              }
            })();
          } else {
            // System TTS mode — use expo-speech
            Speech.stop(); // CRITICAL: stop any lingering prerecorded voice before TTS
            speakText(text);
          }
          break;
        }

        case 'stopVoice': {
          Speech.stop();
          try { voicePlayer.pause(); } catch { /* noop */ }
          lastVoiceTextRef.current = null;
          setLayerState('voice', { status: 'idle' });
          break;
        }

        // ── Music playback ───────────────────────────────────────
        case 'startMusic': {
          try {
            // Check if this is a custom track (selected by user via document picker)
            let uri = resolveMusicUri(event.trackId);
            if (!uri && event.trackId.startsWith('custom_')) {
              const customTracks = audio.customMusicTracks ?? [];
              const customTrack = customTracks.find(
                (t) => t.id === event.trackId,
              );
              if (customTrack) {
                uri = customTrack.uri;
              }
            }
            if (!uri) {
              logger.warn('[useAudioEngine]', `Cannot resolve music: ${event.trackId}`);
              setLayerState('music', { status: 'error' });
              break;
            }

            logger.info('[useAudioEngine]', `Starting music: ${event.trackId}`);

            const musicVol = effectiveVolume(audio.masterVolume, audio.musicVolume);
            const targetVol = mutedLayers.music ? 0 : musicVol * event.volume;

            // Remember for toggle un-mute (ALWAYS store the real volume, even if muted)
            // BUG FIX: previously if mutedLayers was true, targetVol was 0 and unmute would fail
            lastMusicUriRef.current = uri;
            lastMusicVolumeRef.current = musicVol * event.volume;
            lastMusicLoopRef.current = !!event.loop;

            setLayerState('music', { status: 'playing', currentTrackId: event.trackId, volume: 0 });

            // Start asynchronously (don't block event handler)
            startBackgroundPlayer(
              musicPlayer, uri, 'Music',
              targetVol, event.fadeInMs, !!event.loop,
              musicFadeRef, 'music',
            ).catch((err) => {
              logger.warn('[useAudioEngine]', 'Music start async failed', err);
            });
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
            const currentVol = musicPlayer.volume || lastMusicVolumeRef.current;
            musicFadeRef.current = startFade({
              fromVolume: currentVol, toVolume: 0, durationMs: event.fadeOutMs, curve: 'exponential',
              onVolumeChange: (v) => { musicPlayer.volume = v; setLayerVolume('music', v); },
              onComplete: () => {
                try { musicPlayer.pause(); } catch { /* noop */ }
                setLayerState('music', { status: 'idle' });
              },
            });
          } else {
            try { musicPlayer.pause(); } catch { /* noop */ }
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
              setLayerState('binaural', { status: 'error' });
              break;
            }

            logger.info('[useAudioEngine]', `Starting binaural: ${event.trackId}`);

            const binVol = effectiveVolume(audio.masterVolume, audio.binauralVolume);
            const targetVol = mutedLayers.binaural ? 0 : binVol * event.volume;

            // Remember for toggle un-mute (ALWAYS store the real volume, even if muted)
            // BUG FIX: previously if mutedLayers was true, targetVol was 0 and unmute would fail
            lastBinauralUriRef.current = uri;
            lastBinauralVolumeRef.current = binVol * event.volume;

            setLayerState('binaural', { status: 'playing', currentTrackId: event.trackId, volume: 0 });

            // Start asynchronously (don't block event handler)
            startBackgroundPlayer(
              binauralPlayer, uri, 'Binaural',
              targetVol, event.fadeInMs, true,
              binauralFadeRef, 'binaural',
            ).catch((err) => {
              logger.warn('[useAudioEngine]', 'Binaural start async failed', err);
            });
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
            const currentVol = binauralPlayer.volume || lastBinauralVolumeRef.current;
            binauralFadeRef.current = startFade({
              fromVolume: currentVol, toVolume: 0, durationMs: event.fadeOutMs, curve: 'exponential',
              onVolumeChange: (v) => { binauralPlayer.volume = v; setLayerVolume('binaural', v); },
              onComplete: () => {
                try { binauralPlayer.pause(); } catch { /* noop */ }
                setLayerState('binaural', { status: 'idle' });
              },
            });
          } else {
            try { binauralPlayer.pause(); } catch { /* noop */ }
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
    // ── Intentionally minimal deps: reads stores at event time ──
    [resolveText, speakText, startBackgroundPlayer, setEngineState, setPhase, setProgress,
     setTotalDuration, setLayerState, setLayerVolume, setAudioError, setNarrationText,
     updateSessionStatus, updateSessionPhase, updateSessionProgress,
     musicPlayer, binauralPlayer, voicePlayer],
  );

  // ── Engine lifecycle (subscribe once, stable) ───────────────────
  useEffect(() => {
    // CRITICAL: Reset the singleton to ensure clean state for new session.
    // Without this, a previous session's stale plan/config could leak.
    AudioEngine.resetInstance();

    const engine = AudioEngine.getInstance();
    engineRef.current = engine;
    const unsubscribe = engine.subscribe(handleEngineEvent);

    return () => {
      // CRITICAL: stop engine state machine to prevent stale session from emitting events
      try { engine.stop(); } catch { /* noop */ }
      AudioEngine.resetInstance(); // full reset on unmount
      unsubscribe();
      Speech.stop();
      try { musicPlayer.pause(); } catch { /* noop */ }
      try { binauralPlayer.pause(); } catch { /* noop */ }
      try { voicePlayer.pause(); } catch { /* noop */ }
      musicFadeRef.current?.cancel();
      binauralFadeRef.current?.cancel();
      lastVoiceTextRef.current = null;
      lastMusicUriRef.current = null;
      lastBinauralUriRef.current = null;
      resetAudioState();
      setIsAudioActiveAsync(false).catch(() => {});
    };
  }, [handleEngineEvent, musicPlayer, binauralPlayer, voicePlayer, resetAudioState]);

  // ── Inject default background layers if missing ────────────────
  const injectBackgroundLayers = useCallback(
    (segments: readonly Segment[], systemId: string): Segment[] => {
      const audio = useSettingsStore.getState().audio;
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
    [],
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
    const audio = useSettingsStore.getState().audio;
    const voice = useSettingsStore.getState().voice;

    // ── CRITICAL: Use the engine created by useEffect — do NOT reset here! ──
    // The useEffect manages the engine lifecycle (create, subscribe, destroy).
    // Resetting here would destroy the engine and lose all subscribers,
    // causing ALL events (playVoice, startMusic, startBinaural) to go nowhere.
    const engine = engineRef.current;
    if (!engine) {
      logger.error('[useAudioEngine]', 'startSession called but engine is not initialized');
      return;
    }

    resetAudioState();
    setTotalDuration(totalDurationMs);
    lastVoiceTextRef.current = null;
    lastMusicUriRef.current = null;
    lastBinauralUriRef.current = null;

    // ── Increment session guard to cancel any in-flight voice resolves ──
    voiceSessionGuardRef.current++;

    // Stop all players completely
    Speech.stop();
    musicFadeRef.current?.cancel(); musicFadeRef.current = null;
    binauralFadeRef.current?.cancel(); binauralFadeRef.current = null;
    try { musicPlayer.pause(); } catch { /* noop */ }
    try { binauralPlayer.pause(); } catch { /* noop */ }
    try { voicePlayer.pause(); } catch { /* noop */ }

    // Configure audio session: duckOthers allows music to play alongside TTS
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        shouldPlayInBackground: true,
      });
      await setIsAudioActiveAsync(true);
      logger.info('[useAudioEngine]', `Audio session configured for: ${practiceId}`);
    } catch (err) {
      logger.warn('[useAudioEngine]', 'Audio mode set failed', err);
    }

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

    logger.info('[useAudioEngine]', `Session started: ${practiceId} (${systemId})`);
  }, [resolveText, resetAudioState, setTotalDuration, injectBackgroundLayers]);

  const pause = useCallback(() => {
    AudioEngine.getInstance().pause();
  }, []);

  const resume = useCallback(() => {
    AudioEngine.getInstance().resume();
  }, []);

  const stop = useCallback(() => {
    AudioEngine.getInstance().stop();
  }, []);

  // ── Mute toggle ────────────────────────────────────────────────
  const toggleMute = useCallback(
    (layer: 'music' | 'binaural' | 'voice') => {
      const audio = useSettingsStore.getState().audio;
      const isCurrentlyMuted = useAudioStateStore.getState().mutedLayers[layer];
      useAudioStateStore.getState().toggleMute(layer);

      if (!isCurrentlyMuted) {
        // ── MUTING: silence the layer ──
        if (layer === 'music') {
          musicFadeRef.current?.cancel();
          musicFadeRef.current = null;
          musicPlayer.volume = 0;
          setLayerVolume('music', 0);
        } else if (layer === 'binaural') {
          binauralFadeRef.current?.cancel();
          binauralFadeRef.current = null;
          binauralPlayer.volume = 0;
          setLayerVolume('binaural', 0);
        } else if (layer === 'voice') {
          Speech.stop();
          try { voicePlayer.pause(); } catch { /* noop */ }
          setLayerState('voice', { status: 'idle' });
        }
      } else {
        // ── UNMUTING: restore the layer ──
        if (layer === 'music') {
          const targetVol = lastMusicVolumeRef.current;
          if (targetVol <= 0) return;

          // Check if player is actually playing; if not, re-start it
          let isActuallyPlaying = false;
          try { isActuallyPlaying = !!musicPlayer.playing; } catch { /* noop */ }

          if (!isActuallyPlaying && lastMusicUriRef.current) {
            // Player was stopped — need to re-create the playback
            startBackgroundPlayer(
              musicPlayer,
              lastMusicUriRef.current,
              'Music (unmute)',
              targetVol,
              1000,
              lastMusicLoopRef.current,
              musicFadeRef,
              'music',
            ).catch(() => {});
          } else {
            // Player is still running, just fade volume back in
            musicFadeRef.current = startFade({
              fromVolume: 0,
              toVolume: targetVol,
              durationMs: 1000,
              curve: 'exponential',
              onVolumeChange: (v) => { musicPlayer.volume = v; setLayerVolume('music', v); },
            });
          }
        } else if (layer === 'binaural') {
          const targetVol = lastBinauralVolumeRef.current;
          if (targetVol <= 0) return;

          // Check if player is actually playing
          let isActuallyPlaying = false;
          try { isActuallyPlaying = !!binauralPlayer.playing; } catch { /* noop */ }

          if (!isActuallyPlaying && lastBinauralUriRef.current) {
            // Player was stopped — need to re-create the playback
            startBackgroundPlayer(
              binauralPlayer,
              lastBinauralUriRef.current,
              'Binaural (unmute)',
              targetVol,
              1000,
              true,
              binauralFadeRef,
              'binaural',
            ).catch(() => {});
          } else {
            // Player is still running, just fade volume back in
            binauralFadeRef.current = startFade({
              fromVolume: 0,
              toVolume: targetVol,
              durationMs: 1000,
              curve: 'exponential',
              onVolumeChange: (v) => { binauralPlayer.volume = v; setLayerVolume('binaural', v); },
            });
          }
        } else if (layer === 'voice') {
          // Voice un-mute: re-speak the last text if engine is still playing
          const engineState = useAudioStateStore.getState().engineState;
          if (engineState === 'playing') {
            if (useSettingsStore.getState().voice.mode === 'prerecorded') {
              // For prerecorded: resume voicePlayer if it was paused
              // Do NOT fall back to TTS in prerecorded mode — that causes overlap!
              try {
                if (!voicePlayer.playing) {
                  voicePlayer.play();
                }
                setLayerState('voice', { status: 'playing' });
              } catch {
                logger.warn('[useAudioEngine]', 'Voice un-mute failed (prerecorded mode, no TTS fallback)');
                setLayerState('voice', { status: 'idle' });
              }
            } else if (lastVoiceTextRef.current) {
              setLayerState('voice', { status: 'playing' });
              speakText(lastVoiceTextRef.current);
            }
          }
        }
      }
    },
    [musicPlayer, binauralPlayer, voicePlayer, speakText, startBackgroundPlayer, setLayerVolume, setLayerState],
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
