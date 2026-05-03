/**
 * Performance markers with sync-throw safety (FIX-16).
 * Wraps async operations to measure elapsed time without
 * leaking unhandled rejections.
 */

import { logger } from '@/utils/logger';

interface PerfMark {
  name: string;
  start: number;
  end?: number;
}

class PerformanceTracker {
  private marks: Map<string, PerfMark> = new Map();

  start(name: string): void {
    this.marks.set(name, { name, start: Date.now() });
  }

  end(name: string): number {
    const mark = this.marks.get(name);
    if (!mark) {
      logger.warn('[perf]', `end() called for unknown mark "${name}"`);
      return 0;
    }
    const duration = Date.now() - mark.start;
    mark.end = Date.now();
    this.marks.delete(name);
    logger.debug('[perf]', `${name}: ${duration}ms`);
    return duration;
  }

  wrap<T>(name: string, fn: () => Promise<T>): Promise<T> {
    // Protected from sync-throws (FIX-16)
    const start = Date.now();
    return Promise.resolve()
      .then(() => fn())
      .finally(() => {
        const elapsed = Date.now() - start;
        logger.debug('[perf]', `${name}: ${elapsed}ms`);
      });
  }
}

export const perf = new PerformanceTracker();
