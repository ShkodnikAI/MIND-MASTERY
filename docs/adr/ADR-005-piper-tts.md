# ADR-005: Piper TTS as Optional Feature (Stage 5.2)

**Status:** Proposed  
**Date:** 2025-01-15  
**Deciders:** Architecture team  

---

## Context

MIND MASTERY delivers spoken narration during meditation sessions. The voice layer is critical to the experience — it guides users through breathing, visualization, and body-scan exercises.

### Current TTS landscape (Russian language)

| Option | Quality | Latency | Offline | Bundle Size |
|--------|---------|---------|---------|-------------|
| System TTS (expo-speech) | Low-medium | Low | Depends on OS | ~0 KB (OS built-in) |
| Google Cloud TTS | High | Network-dependent | No | ~0 KB (API calls) |
| Piper TTS (on-device) | High | Low | Yes | ~30-60 MB per voice |
| Amazon Polly | High | Network-dependent | No | ~0 KB (API calls) |
| OpenTTS | Medium | Network-dependent | No | ~0 KB (API calls) |

### Requirements

1. **Russian language** must be the primary TTS target (app launches in Russian)
2. **Offline-capable** — meditation sessions often happen without network (airplanes, remote areas)
3. **Natural prosody** — robotic monotone TTS is unacceptable for meditation context
4. **No ongoing API costs** — the app is consumer-facing with potentially thousands of users
5. **Deterministic output** — same text must produce identical audio for caching and segment alignment

## Decision

### Two-phase approach:

#### Stage 5.1 (Mandatory): System TTS via expo-speech

- Use `expo-speech ~13.0.0` as the baseline TTS engine
- **Pros:** Zero bundle size, works immediately, no setup required
- **Cons:** Quality depends on device/OS; Android TTS quality varies significantly; iOS Russian Siri voice is acceptable but not premium
- **Implementation:** `Speech.speak(text, { language: 'ru-RU', pitch: 0.9, rate: 0.85 })`

#### Stage 5.2 (Optional): Piper TTS with Feature Flag

- Bundle Piper TTS as an **optional download** (not included in base APK/IPA)
- **Gate behind feature flag** (`INV-8: piper-tts`) in `src/core/flags.ts`
- **Voice model:** Russian female voice (~40 MB), downloaded on first request
- **Cached locally** in app's document directory after first download
- **Segment pre-generation:** Pre-render all narration segments to WAV files on first use, cache for subsequent sessions

### Feature flag behavior

```
Flag: piper-tts (default: false)
- false → use expo-speech (system TTS)
- true  → use Piper TTS if model downloaded; fallback to system TTS if not
```

## Consequences

### Positive

- **Stage 5.1 ships fast** — expo-speech works immediately, no additional development
- **Stage 5.2 is opt-in** — users who want premium voice can download it; others use system TTS
- **No API costs** — both options are fully offline
- **Deterministic** — Piper produces identical output for identical input; enables segment caching
- **Bundle size controlled** — base app stays small (~15 MB); Piper model is a separate download

### Negative

- **Piper bundle size** — Russian voice model is ~40 MB; must be a separate download to avoid bloating the APK
- **Piper integration complexity** — requires React Native bridge or JS-based inference; may need custom native module
- **Two codepaths** — voice player must support both expo-speech and Piper backends
- **Quality gap** — users on Stage 5.1 may have sub-par TTS on some Android devices

### Risks

- **Piper React Native compatibility** — Piper is primarily a Python/C++ project; JS bindings exist but may need adaptation
- **Download failure handling** — users in low-connectivity areas may struggle to download the voice model
- **Storage management** — 40 MB voice model must be tracked and cleanable; add to backup/export logic
- **Voice model updates** — new Piper versions may change pronunciation; cache invalidation needed

### Rejected Alternatives

| Alternative | Reason |
|-------------|--------|
| Google Cloud TTS only | Requires network; ongoing API costs; no offline support |
| Amazon Polly only | Requires network; ongoing API costs; no offline support |
| Piper-only (no system TTS) | Forces 40 MB download on all users; poor first experience |
| Pre-recorded human voice | Extremely expensive to produce 250+ segments; cannot customize per session length |

### Open Questions

- [ ] Which specific Piper Russian voice model to use? (need A/B quality test)
- [ ] Can Piper run efficiently on 2 GB RAM Android devices?
- [ ] Should we support voice switching (different Piper voices per system)?
- [ ] WAV or MP3 for cached audio? (WAV = quality, MP3 = size)
