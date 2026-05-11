/**
 * @file AudioEngine -- session playback orchestrator (pure state machine).
 *
 * Manages the complete lifecycle of a meditation session:
 *
 * 1. **Planning** -- builds a SessionPlan from practice segments via SegmentQueue.
 * 2. **Background layers** -- emits start/stop commands for music & binaural.
 * 3. **Sequential timeline** -- steps through voice/silence/theory segments,
 *    emitting playback commands for the hook layer to execute.
 * 4. **Fading** -- delegates fade timing to the hook layer via events.
 * 5. **State machine** -- idle -> preparing -> playing <=> paused -> finished.
 * 6. **Progress** -- emits periodic progress updates (2 Hz).
 *
 * INV-2: This engine is the SINGLE audio-session owner. All playback intents
 * flow through engine events -- the engine never imports expo-audio or
 * expo-speech directly.
 *
 * INV-3: Engine events are consumed by `useAudioEngine` hook which syncs
 * state to `audioStateStore` for UI reads.
 *
 * The engine is a **singleton** -- only one session can be active at a time.
 */

import type { EngineState, EngineEvent, SessionConfig, SessionPlan, TimelineEntry } from './types';
import type { PlaybackAction } from '@/domain/session/playSegment';
import { buildSessionPlan } from './SegmentQueue';
import { getPlaybackActions } from '@/domain/session/playSegment';
import { logger } from '@/utils/logger';

// ---------------------------------------------------------------------------
// Subscriber type
// ---------------------------------------------------------------------------

type EventCallback = (event: EngineEvent) => void;

// ---------------------------------------------------------------------------
// AudioEngine class
// ---------------------------------------------------------------------------

export class AudioEngine {
  // -- Singleton -------------------------------------------------------

  private static instance: AudioEngine | null = null;

  private constructor() {
    logger.debug('[AudioEngine]', 'Singleton created');
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Reset the singleton.  Only useful in tests / HMR scenarios.
   */
  static resetInstance(): void {
    if (AudioEngine.instance) {
      AudioEngine.instance.destroy();
    }
    AudioEngine.instance = null;
  }

  // -- Internal state ---------------------------------------------------

  private state: EngineState = 'idle';
  private plan: SessionPlan | null = null;
  private config: SessionConfig | null = null;
  private currentTimelineIndex = 0;
  private sessionStartRealMs = 0;
  private elapsedAtPauseMs = 0;
  private progressTimerId: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Set<EventCallback>();
  private errorCount = 0;
  /** Whether `destroy()` has been called. */
  private destroyed = false;

  // -- Event subscription -----------------------------------------------

  /**
   * Subscribe to engine events.  Returns an unsubscribe function.
   *
   * Events are dispatched synchronously in the order they occur.
   * Subscribers MUST NOT throw -- errors are caught and logged.
   */
  subscribe(callback: EventCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /** Emit an event to all subscribers. */
  private emit(event: EngineEvent): void {
    if (this.destroyed) return;
    for (const cb of this.subscribers) {
      try {
        cb(event);
      } catch (err) {
        logger.error('[AudioEngine]', 'Subscriber error', err);
      }
    }
  }

  // -- Public getters ---------------------------------------------------

  getState(): EngineState {
    return this.state;
  }

  isPlaying(): boolean {
    return this.state === 'playing';
  }

  isActive(): boolean {
    return this.state === 'playing' || this.state === 'preparing' || this.state === 'paused';
  }

  getElapsedMs(): number {
    if (this.state === 'playing') {
      return this.elapsedAtPauseMs + (Date.now() - this.sessionStartRealMs);
    }
    return this.elapsedAtPauseMs;
  }

  getCurrentSegmentIndex(): number {
    return this.currentTimelineIndex;
  }

  getPlan(): SessionPlan | null {
    return this.plan;
  }

  // -- Session lifecycle -----------------------------------------------

  /**
   * Start a new meditation session.
   *
   * 1. Validates config.
   * 2. Transitions to `preparing`.
   * 3. Builds the SessionPlan.
   * 4. Emits background-layer start commands.
   * 5. Transitions to `playing`.
   * 6. Starts the progress timer and begins sequential segment playback.
   *
   * If a session is already active, this call is a no-op (logged as warning).
   */
  async startSession(config: SessionConfig): Promise<void> {
    if (this.isActive()) {
      logger.warn('[AudioEngine]', 'startSession called while active -- force-stopping previous session', {
        state: this.state,
      });
      this.stop();
      // Brief yield to let stop() propagate state changes
      await new Promise((r) => setTimeout(r, 0));
    }

    this.destroyed = false;

    try {
      // -- Phase 1: Prepare --
      this.setState('preparing');
      this.config = config;
      this.currentTimelineIndex = 0;
      this.elapsedAtPauseMs = 0;
      this.errorCount = 0;

      // -- Phase 2: Build plan --
      this.plan = buildSessionPlan(config.segments);
      logger.info('[AudioEngine]', 'Session plan built', {
        timelineEntries: this.plan.timeline.length,
        backgroundLayers: this.plan.layers.length,
        totalDurationMs: this.plan.totalDurationMs,
      });

      // -- Phase 3: Start background layers --
      this.emitBackgroundStartCommands(this.plan.layers);

      // -- Phase 4: Transition to playing --
      this.setState('playing');
      this.sessionStartRealMs = Date.now();
      this.startProgressTimer();

      // -- Phase 5: Begin sequential playback --
      await this.advanceTimeline();

      logger.info('[AudioEngine]', 'Session started successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('[AudioEngine]', 'Session start failed', error);
      this.emitFatalError(`Session start failed: ${msg}`);
      this.cleanup();
    }
  }

  /**
   * Pause the current session.
   *
   * - Stops the progress timer.
   * - Records elapsed time at pause point.
   * - Emits `stopVoice` and layer-pause commands.
   * - Transitions to `paused`.
   */
  pause(): void {
    if (this.state !== 'playing') {
      logger.warn('[AudioEngine]', 'pause() called while not playing', {
        state: this.state,
      });
      return;
    }

    // Record elapsed at pause point
    this.elapsedAtPauseMs = this.getElapsedMs();
    this.stopProgressTimer();

    // Tell the hook to pause all audio
    this.emit({ type: 'stopVoice' });
    this.emit({ type: 'setLayerVolume', layer: 'music', volume: 0 });
    this.emit({ type: 'setLayerVolume', layer: 'binaural', volume: 0 });

    this.setState('paused');
    logger.info('[AudioEngine]', 'Session paused at', {
      elapsedMs: this.elapsedAtPauseMs,
      segmentIndex: this.currentTimelineIndex,
    });
  }

  /**
   * Resume a paused session.
   *
   * - Restarts the progress timer.
   * - Emits layer-resume commands.
   * - Transitions back to `playing`.
   * - Continues timeline from where it was paused.
   */
  async resume(): Promise<void> {
    if (this.state !== 'paused') {
      logger.warn('[AudioEngine]', 'resume() called while not paused', {
        state: this.state,
      });
      return;
    }

    this.setState('playing');
    this.sessionStartRealMs = Date.now();
    this.startProgressTimer();

    // Tell the hook to resume background layers
    this.emitBackgroundStartCommands(this.plan?.layers ?? []);

    // Continue timeline from current index
    await this.advanceTimeline();

    logger.info('[AudioEngine]', 'Session resumed');
  }

  /**
   * Stop the current session (user-initiated abort or error).
   *
   * - Emits fade-out commands for all background layers.
   * - Emits `stopVoice`.
   * - Stops the progress timer.
   * - Emits `sessionComplete`.
   * - Transitions to `finished`.
   */
  stop(): void {
    if (this.state === 'idle' || this.state === 'finished') {
      return;
    }

    logger.info('[AudioEngine]', 'Session stopping');

    // Fade out background layers
    this.emitBackgroundStopCommands(this.plan?.layers ?? []);

    // Stop voice
    this.emit({ type: 'stopVoice' });

    // Stop timers
    this.stopProgressTimer();

    // Mark finished
    this.setState('finished');
    this.emit({ type: 'sessionComplete' });

    this.cleanup();
  }

  // -- External error reporting -----------------------------------------

  /**
   * Called by the hook layer when an I/O error occurs (e.g. audio file
   * not found, TTS failure, decoder error).
   *
   * Behaviour depends on the `audioSettings.errorPolicy`:
   * - `skip`  -- log and continue to next segment.
   * - `stop`  -- abort the session.
   * - `retry` -- (future) attempt the current segment again.
   */
  reportError(message: string, fatal: boolean = false): void {
    this.errorCount++;
    this.emit({
      type: 'error',
      message,
      segmentIndex: this.currentTimelineIndex,
      fatal,
    });

    if (fatal || this.errorCount >= 5) {
      logger.error('[AudioEngine]', 'Too many errors -- aborting session', {
        errorCount: this.errorCount,
        lastMessage: message,
      });
      this.stop();
    } else {
      logger.warn('[AudioEngine]', 'Non-fatal error reported', {
        message,
        errorCount: this.errorCount,
      });
    }
  }

  // -- Destroy (cleanup for HMR / testing) ------------------------------

  destroy(): void {
    this.destroyed = true;
    this.stopProgressTimer();
    this.subscribers.clear();
    this.cleanup();
    logger.debug('[AudioEngine]', 'Instance destroyed');
  }

  // -----------------------------------------------------------------
  // PRIVATE: Sequential timeline playback
  // -----------------------------------------------------------------

  /**
   * Advance through the timeline entries one by one.
   * For each entry, emit the appropriate commands and wait for
   * the declared duration before moving to the next entry.
   *
   * This method is async and recursive -- it awaits the duration of
   * each entry before calling itself for the next one.
   */
  private async advanceTimeline(): Promise<void> {
    // Guard: must be playing
    if (this.state !== 'playing' || !this.plan) return;

    // Guard: all segments played
    if (this.currentTimelineIndex >= this.plan.timeline.length) {
      // Session naturally complete
      this.stop();
      return;
    }

    const entry = this.plan.timeline[this.currentTimelineIndex];

    // Emit segment start
    this.emit({
      type: 'segmentStart',
      segmentIndex: entry.segmentIndex,
    });

    // Build and emit playback actions for this segment
    const segment = this.config?.segments[entry.segmentIndex];
    if (segment) {
      const actions = getPlaybackActions(segment);
      await this.emitActionsForEntry(actions, entry);
    }

    // Wait for the entry's duration
    if (entry.durationMs > 0 && this.state === 'playing') {
      await this.waitForDuration(entry.durationMs);
    }

    // Mark segment end
    if (this.state === 'playing') {
      this.emit({
        type: 'segmentEnd',
        segmentIndex: entry.segmentIndex,
      });
      this.currentTimelineIndex++;
      // Recurse to next entry
      await this.advanceTimeline();
    }
  }

  /**
   * Emit the appropriate engine commands for each PlaybackAction in
   * the current timeline entry.
   */
  private async emitActionsForEntry(
    actions: readonly PlaybackAction[],
    _entry: TimelineEntry,
  ): Promise<void> {
    for (const action of actions) {
      // Check state before each action (user may have paused/stopped)
      if (this.state !== 'playing') return;

      switch (action.type) {
        case 'speak': {
          const resolvedText = this.config?.resolveText(action.textKey);
          if (resolvedText) {
            this.emit({
              type: 'playVoice',
              textKey: action.textKey,
              durationSec: action.durationSec,
            });
          } else {
            logger.warn(
              '[AudioEngine]',
              `Text not found for key "${action.textKey}" -- skipping voice`,
            );
          }
          break;
        }

        case 'silence': {
          // Already handled by `waitForDuration` at the entry level
          break;
        }

        case 'playMusic': {
          // Background layers are started at session begin.
          // For MVP: all music layers start at session init.
          break;
        }

        case 'playBinaural': {
          // Same as music -- handled at session init.
          break;
        }

        case 'showTheory': {
          this.emit({ type: 'showTheory' });
          break;
        }

        case 'haptic': {
          this.emit({ type: 'triggerHaptic', pattern: action.pattern });
          break;
        }

        case 'phaseChange': {
          this.emit({ type: 'phaseChange', phase: action.phase });
          break;
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // PRIVATE: Background layer commands
  // -----------------------------------------------------------------

  /**
   * Emit start commands for all background layers (music, binaural).
   * The hook layer will create/start the appropriate audio players.
   */
  private emitBackgroundStartCommands(layers: readonly import('./types').BackgroundLayer[]): void {
    for (const layer of layers) {
      if (layer.kind === 'music') {
        this.emit({
          type: 'startMusic',
          trackId: layer.trackId,
          fadeInMs: layer.fadeInMs,
          volume: layer.volume,
          loop: layer.loop,
        });
      } else if (layer.kind === 'binaural') {
        this.emit({
          type: 'startBinaural',
          trackId: layer.trackId,
          fadeInMs: layer.fadeInMs,
          volume: layer.volume,
        });
      }
    }
  }

  /**
   * Emit stop commands for all background layers.
   * Includes fade-out durations so the hook can fade smoothly.
   */
  private emitBackgroundStopCommands(layers: readonly import('./types').BackgroundLayer[]): void {
    for (const layer of layers) {
      if (layer.kind === 'music') {
        this.emit({ type: 'stopMusic', fadeOutMs: layer.fadeOutMs });
      } else if (layer.kind === 'binaural') {
        this.emit({ type: 'stopBinaural', fadeOutMs: layer.fadeOutMs });
      }
    }
  }

  // -----------------------------------------------------------------
  // PRIVATE: Timing utilities
  // -----------------------------------------------------------------

  /**
   * Wait for a specified duration, respecting pause/stop states.
   * Returns immediately if the engine state changes from `playing`.
   */
  private waitForDuration(durationMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (durationMs <= 0) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const pollInterval = 100; // ms -- balances responsiveness vs CPU

      const check = (): void => {
        // If state changed, resolve immediately (allows pause/stop to take effect)
        if (this.state !== 'playing') {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        if (elapsed >= durationMs) {
          resolve();
        } else {
          setTimeout(check, pollInterval);
        }
      };

      // Start polling after a short delay to allow event loop to process
      setTimeout(check, pollInterval);
    });
  }

  /**
   * Start the periodic progress timer (emits progress events at 2 Hz).
   */
  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimerId = setInterval(() => {
      if (this.state !== 'playing') return;
      this.emit({
        type: 'progress',
        elapsedMs: this.getElapsedMs(),
        segmentIndex: this.currentTimelineIndex,
      });
    }, 500); // 2 Hz
  }

  /** Stop the progress timer. */
  private stopProgressTimer(): void {
    if (this.progressTimerId !== null) {
      clearInterval(this.progressTimerId);
      this.progressTimerId = null;
    }
  }

  // -----------------------------------------------------------------
  // PRIVATE: State machine helpers
  // -----------------------------------------------------------------

  private setState(newState: EngineState): void {
    const oldState = this.state;
    this.state = newState;
    if (oldState !== newState) {
      logger.debug('[AudioEngine]', `State: ${oldState} -> ${newState}`);
      this.emit({ type: 'stateChange', state: newState });
    }
  }

  private emitFatalError(message: string): void {
    this.emit({
      type: 'error',
      message,
      fatal: true,
    });
    this.setState('finished');
  }

  private cleanup(): void {
    this.plan = null;
    this.config = null;
    this.currentTimelineIndex = 0;
    this.elapsedAtPauseMs = 0;
    this.errorCount = 0;
    this.stopProgressTimer();
  }
}
