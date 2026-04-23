# ADR-003: expo-audio as Primary Audio Engine

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Architecture team  

---

## Context

MIND MASTERY's core experience is **multi-layered audio playback** during meditation sessions:

1. **Voice layer** — spoken narration (TTS or pre-recorded)
2. **Binaural layer** — generated sine-wave beats for brainwave entrainment
3. **Music layer** — ambient background tracks
4. **Silence layer** — intentional pauses for breathing exercises

Requirements:

- **Simultaneous playback** of 2-3 audio streams (voice + binaural + music)
- **Per-layer volume control** — user adjusts voice, binaural, and music independently
- **Fade in/out** — smooth transitions between segments (no audio pops/clicks)
- **Gapless playback** — segments must flow seamlessly (no silence gaps between tracks)
- **React Native 0.79 / New Architecture compatible**

### expo-av status

`expo-av` has been **deprecated** in Expo SDK 53. It lacks support for the New Architecture and multi-stream mixing. It was the previous default for Expo audio but is now actively discouraged.

## Decision

Use **expo-audio ~0.3.0** as the sole audio engine. **expo-av is FORBIDDEN** — it must not appear in `package.json` or any import.

### Architecture

```
src/audio/
├── engine.ts          # Multi-layer mixer (expo-audio)
├── voicePlayer.ts     # Voice narration layer
├── binauralGenerator.ts # Real-time binaural beat generation
├── musicPlayer.ts     # Background music layer
└── types.ts           # AudioEngine types (already in src/types/audio.ts)
```

### expo-audio capabilities used

| Feature | API | Purpose |
|---------|-----|---------|
| Audio playback | `useAudioPlayer()` | Play voice narration and music tracks |
| Volume control | `player.volume` | Per-layer independent volume |
| Play/pause/seek | `player.play()`, `player.pause()` | Session control |
| Status callbacks | `player.playing` | React to playback state changes |

### Binaural beat generation

Binaural beats require **real-time sine wave generation** with different frequencies per ear. This is NOT a file-based operation:

- **Approach:** Generate PCM buffers using Web Audio API concepts, adapted for React Native
- **Fallback (Stage 5.1):** Pre-render binaural beats as stereo WAV files at build time with known carrier/beat frequencies
- **expo-audio limitation:** Does not natively generate audio — we may need a custom native module or pre-rendered files for binaurals

## Consequences

### Positive

- **Official Expo support** — maintained by Expo team, compatible with SDK 53+
- **New Architecture compatible** — uses TurboModules
- **TypeScript-first** — fully typed API
- **Simple API surface** — `useAudioPlayer()` hook integrates cleanly with React components

### Negative

- **No built-in mixing API** — we must manage multiple `useAudioPlayer()` instances manually
- **No built-in audio generation** — binaural beats need pre-rendered files or a custom module
- **0.x semver** — API may change between minor versions; pin exact version
- **No gapless looping** — music loops may have micro-gaps; mitigated by crossfade implementation

### Risks

- **expo-audio breaking changes** — pin to `~0.3.0` and test thoroughly before upgrading
- **Simultaneous stream limit** — iOS/Android may limit concurrent audio players; need to verify 3+ streams work
- **Binaural generation** — may require a custom native module in Stage 5 if pre-rendering is insufficient

### Constraints

- **expo-av is FORBIDDEN** — add to lint rules and CI checks
- **Always test with headphones** — binaural beats are meaningless on speakers (mono output)
- **Headphone detection** — pause binaural playback if headphones are unplugged (use `expo-audio` hooks)
