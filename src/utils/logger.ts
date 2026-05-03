/**
 * Structured logger — no console.log in production builds.
 * Uses __DEV__ global provided by React Native / Expo.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

declare const __DEV__: boolean;

class Logger {
  private minLevel: LogLevel = __DEV__ ? 'debug' : 'info';

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(tag: string, message: string, data?: unknown): void {
    this.log('debug', tag, message, data);
  }

  info(tag: string, message: string, data?: unknown): void {
    this.log('info', tag, message, data);
  }

  warn(tag: string, message: string, data?: unknown): void {
    this.log('warn', tag, message, data);
  }

  error(tag: string, message: string, error?: unknown): void {
    this.log('error', tag, message, error);
  }

  private log(level: LogLevel, tag: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.format(tag, level, message);

    switch (level) {
      case 'debug':
        console.debug(formatted, data ?? '');
        break;
      case 'info':
        console.info(formatted, data ?? '');
        break;
      case 'warn':
        console.warn(formatted, data ?? '');
        break;
      case 'error':
        console.error(formatted, data ?? '');
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private format(tag: string, level: string, message: string): string {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${tag}: ${message}`;
  }
}

export const logger = new Logger();
