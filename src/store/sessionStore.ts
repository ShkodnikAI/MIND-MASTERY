import { create } from 'zustand';
import type { ActiveSession, SessionStatus, SessionPhase } from '@/types';

// ─── State Interface ────────────────────────────────────────────

interface SessionState {
  session: ActiveSession | null;
  error: string | null;

  // Actions
  startSession: (session: ActiveSession) => void;
  updateStatus: (status: SessionStatus) => void;
  updatePhase: (phase: SessionPhase) => void;
  updateProgress: (segmentIndex: number, elapsedMs: number) => void;
  setError: (error: string | null) => void;
  endSession: () => void;
  reset: () => void;
}

// ─── Store ──────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>()((set) => ({
  session: null,
  error: null,

  startSession: (session: ActiveSession) => set({ session, error: null }),

  updateStatus: (status: SessionStatus) =>
    set((state) => {
      if (state.session === null) return state;
      return {
        session: { ...state.session, status },
        error: status === 'error' ? state.error : null,
      };
    }),

  updatePhase: (phase: SessionPhase) =>
    set((state) => {
      if (state.session === null) return state;
      return {
        session: { ...state.session, phase },
      };
    }),

  updateProgress: (segmentIndex: number, elapsedMs: number) =>
    set((state) => {
      if (state.session === null) return state;
      return {
        session: {
          ...state.session,
          currentSegmentIndex: segmentIndex,
          elapsedMs,
        },
      };
    }),

  setError: (error: string | null) => set({ error }),

  endSession: () =>
    set((state) => {
      if (state.session === null) return state;
      return {
        session: { ...state.session, status: 'finished' as const },
      };
    }),

  reset: () =>
    set({
      session: null,
      error: null,
    }),
}));
