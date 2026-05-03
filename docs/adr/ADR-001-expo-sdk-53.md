# ADR-001: Expo SDK 53 as Target Platform

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Architecture team  

---

## Context

MIND MASTERY is a React Native meditation app that requires:

- **Audio playback** with low-latency mixing (voice + binaural + music layers)
- **SQLite** for persistent session data, journal, and progress tracking
- **Haptic feedback** for session phase transitions
- **Local notifications** for "Moment of Power" daily alarm
- **SVG + Skia** for visualization backgrounds
- **Brightness control** during sessions

We need a stable, well-supported Expo SDK that ships with the latest React Native and enables the New Architecture for performance-critical paths (audio mixing, Skia rendering).

## Decision

Use **Expo SDK 53** with the following configuration:

- **React Native 0.79** — ships with Fabric (new rendering system) and TurboModules
- **Hermes engine** — faster JS startup, lower memory footprint
- **New Architecture enabled** — required by `expo-audio` and `@shopify/react-native-skia`
- **Default Expo template** (`expo-router`) for file-based navigation

### Key dependencies pinned by SDK 53

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-audio` | ~0.3.0 | Primary audio engine (replaces deprecated `expo-av`) |
| `expo-sqlite` | ~15.0.0 | Local database with WAL mode |
| `expo-haptics` | ~14.0.0 | Haptic feedback |
| `expo-notifications` | ~0.29.0 | Local push notifications |
| `@shopify/react-native-skia` | ^1.5.0 | Canvas-based visualizations |

## Consequences

### Positive

- **Latest stable RN** — long-term support, community momentum
- **New Architecture by default** — better interop with native modules
- **Hermes** — measurable startup time improvement (important for daily-use meditation app)
- **expo-audio** available — solves the core audio layering requirement without workarounds

### Negative

- **New Architecture is relatively new** — some third-party libraries may have compatibility issues; mitigated by sticking to Expo-first packages
- **SDK 53 requires Node ≥ 20** — documented in `package.json` `engines`

### Risks

- **expo-audio breaking changes** — currently at 0.x semver; pin exact version and test thoroughly
- **Upgrade path** — Expo SDK 54 may introduce further audio/SQLite API changes; plan for annual SDK upgrade cycle

### Migration Notes

- To upgrade: `npx expo install expo@latest` and follow Expo changelog
- Hermes is the default engine; do NOT switch to JSC (performance regression)
