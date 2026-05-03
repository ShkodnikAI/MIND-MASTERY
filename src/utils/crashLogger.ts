/**
 * @file CrashLogger — Captures console.error/warn and unhandled JS errors.
 *
 * Stores log entries in an in-memory ring buffer (max 500).
 * Provides export helpers for GitHub issue creation.
 */

import { Platform } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  component?: string;
}

// ─── State ────────────────────────────────────────────────────────

const MAX_LOGS = 500;
let logs: LogEntry[] = [];
let initialized = false;

// ─── Helpers ──────────────────────────────────────────────────────

function formatEntry(entry: LogEntry): string {
  let line = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  if (entry.component) line += ` (${entry.component})`;
  if (entry.stack) line += `\n${entry.stack}`;
  return line;
}

function addLog(level: LogEntry['level'], message: string, stack?: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    stack,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(-MAX_LOGS);
  }
}

// ─── Public API ───────────────────────────────────────────────────

export function initCrashLogger(): void {
  if (initialized) return;
  initialized = true;

  const origError = console.error;
  console.error = (...args: any[]) => {
    origError.apply(console, args);
    addLog('error', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
  };

  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    origWarn.apply(console, args);
    addLog('warn', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
  };

  // Catch unhandled errors via global.ErrorUtils (RN 0.81+ compatible)
  if (typeof global !== 'undefined' && typeof (global as any).ErrorUtils !== 'undefined') {
    const errorUtils = (global as any).ErrorUtils;
    const originalHandler = errorUtils.getGlobalHandler?.() || null;
    try {
      errorUtils.setGlobalHandler(
        (error: Error, isFatal: boolean) => {
          addLog(
            'error',
            `Unhandled ${isFatal ? 'FATAL' : 'error'}: ${error.message}`,
            error.stack,
          );
          if (originalHandler) originalHandler(error, isFatal);
        },
      );
    } catch {
      // ErrorUtils may not be available in all environments (e.g. Expo Go)
    }
  }
}

export function addInfoLog(message: string, component?: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    component,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS);
}

export function getLogs(): readonly LogEntry[] {
  return logs;
}

export function exportLogs(): string {
  return logs.map(formatEntry).join('\n\n');
}

export function clearLogs(): void {
  logs = [];
}

export function getLogCount(): number {
  return logs.length;
}

export function createGitHubIssueBody(title: string, description?: string): string {
  const deviceInfo = [
    `Platform: ${Platform.OS}`,
    `Version: ${Platform.Version}`,
    `Timestamp: ${new Date().toISOString()}`,
  ].join('\n');

  const body = [
    `## ${title}`,
    '',
    description || '',
    '',
    '---',
    '## Device Info',
    '```',
    deviceInfo,
    '```',
    '',
    '## Logs',
    '```',
    exportLogs(),
    '```',
  ].join('\n');

  return body;
}
