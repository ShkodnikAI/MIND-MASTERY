# ADR-002: Zustand v5 for State Management

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Architecture team  

---

## Context

MIND MASTERY requires global state management for:

- **Settings** — theme, audio volumes, voice preferences, safety flags (persisted)
- **Session progress** — completed practices, levels, streaks (persisted)
- **Active session** — current meditation state, phase, timer (ephemeral)
- **Journal** — mood entries and notes (synced to SQLite)
- **Moment of Power** — daily alarm configuration (persisted)
- **Light settings** — visual effect configuration (ephemeral)

Requirements:

1. **Minimal boilerplate** — we have 7 distinct state slices; Redux would be overkill
2. **TypeScript-first** — all stores must be fully typed with zero `any`
3. **Selective persistence** — some stores persist (settings, progress), others are ephemeral (session)
4. **No middleware complexity** — we don't need sagas, thunks, or epics
5. **React Native compatible** — must work with `@react-native-async-storage/async-storage` for persistence

## Decision

Use **Zustand v5** with the following configuration:

- **Separate store files** per domain slice (7 stores total)
- **`persist` middleware** from `zustand/middleware` for stores that survive app restarts
- **AsyncStorage adapter** from `zustand/middleware/persist` for React Native persistence
- **No devtools middleware** in production builds (conditional)

### Store Architecture

```
src/store/
├── settingsStore.ts      # persisted → AsyncStorage
├── progressStore.ts      # persisted → AsyncStorage
├── momentStore.ts        # persisted → AsyncStorage
├── sessionStore.ts       # ephemeral (in-memory only)
├── journalStore.ts       # ephemeral (source of truth: SQLite)
├── contentStore.ts       # ephemeral (source of truth: content/texts/)
└── lightSettingsStore.ts # ephemeral
```

### Persisted store storage keys

| Store | AsyncStorage Key |
|-------|-----------------|
| settingsStore | `mindmastery-settings` |
| progressStore | `mindmastery-progress` |
| momentStore | `mindmastery-moment` |

## Consequences

### Positive

- **~90% less boilerplate** than Redux Toolkit for equivalent functionality
- **Native TypeScript support** — no decorator or string-action-type overhead
- **Tree-shakeable** — unused stores are eliminated at bundle time
- **Selector-based re-renders** — components subscribe to specific slices via `useStore(selector)`
- **AsyncStorage persistence** works out-of-the-box via `zustand/middleware/persist`

### Negative

- **No built-in devtools** — Redux DevTools not available; mitigated by `zustand/middleware/devtools` (optional)
- **No action replay / time-travel** — not needed for this app's use case
- **Ecosystem smaller than Redux** — fewer community middleware options; we don't need them

### Constraints

- **Never use `any` in store definitions** — all state and actions must be fully typed
- **Date serialization** — `Date` objects must be converted to ISO strings before persisting (JSON round-trip)
- **Partial updates only** — actions should accept `Partial<State>` for update operations to avoid overwriting unrelated fields

### Rejected Alternatives

| Alternative | Reason |
|-------------|--------|
| Redux Toolkit | Excessive boilerplate for 7 simple stores; over-engineered for this scale |
| MobX | Implicit reactivity model conflicts with React Native's strict mode; debugging harder |
| Jotai/Valtio | Atomic/proxy models add complexity for persisted state; Zustand is simpler for key-value persistence |
| Context + useReducer | No persistence; no dev ergonomics; scales poorly beyond 2-3 contexts |
