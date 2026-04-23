#!/usr/bin/env tsx
/**
 * MIND MASTERY — Content Validation Pipeline
 * INV-4: Commits with invalid content are technically impossible.
 *
 * Checks (full implementation in later stages):
 * 1. Each JSON in content/texts/** matches PracticeText schema
 * 2. practiceId in TS matches JSON filename
 * 3. Each VoiceSegment.textKey exists in JSON segments
 * 4. No orphaned JSON keys
 * 5. Text length warnings (80-120 words per segment)
 *
 * Exit codes:
 *   0 = all valid
 *   1 = errors found
 *   2 = only warnings
 *
 * @stage 1 — Checks directory structure; reports "no practices yet"
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content', 'texts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CheckResult {
  ok: boolean;
  message: string;
}

/** ANSI colour helpers (no-op when stdout is not a TTY). */
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

// ---------------------------------------------------------------------------
// Stage 1 checks
// ---------------------------------------------------------------------------

function checkContentDirExists(): CheckResult {
  if (!fs.existsSync(CONTENT_DIR)) {
    return {
      ok: false,
      message: `Content directory not found: ${CONTENT_DIR}`,
    };
  }

  const systemDirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (systemDirs.length === 0) {
    return {
      ok: true,
      message: `${cyan(CONTENT_DIR)} exists — no system directories yet`,
    };
  }

  return {
    ok: true,
    message: `${cyan(CONTENT_DIR)} exists — ${systemDirs.length} system(s): ${systemDirs.join(', ')}`,
  };
}

function checkSystemDirectories(): CheckResult[] {
  const results: CheckResult[] = [];
  const EXPECTED_SYSTEMS = [
    'transurfing',
    'silva',
    'dispenza',
    'feldenkrais',
    'breath',
  ];

  if (!fs.existsSync(CONTENT_DIR)) {
    for (const sys of EXPECTED_SYSTEMS) {
      results.push({
        ok: false,
        message: `Missing system directory: content/texts/${sys}/`,
      });
    }
    return results;
  }

  const existing = new Set(
    fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );

  for (const sys of EXPECTED_SYSTEMS) {
    if (existing.has(sys)) {
      const files = fs.readdirSync(path.join(CONTENT_DIR, sys));
      results.push({
        ok: true,
        message: `${green('✓')} content/texts/${sys}/ — ${files.length} file(s)`,
      });
    } else {
      results.push({
        ok: true,
        message: `${yellow('○')} content/texts/${sys}/ — not yet created (expected in Stage 2)`,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Full pipeline stubs (will be implemented in Stage 2b+)
// ---------------------------------------------------------------------------

// @ts-expect-error -- Stage 2b+ stub (intentionally unused)
function _checkJsonSchema(_systemId: string): CheckResult[] {
  // Stage 2b: Validate each .json against PracticeText schema
  return [];
}

// @ts-expect-error -- Stage 2b+ stub (intentionally unused)
function _checkTsToJSync(_systemId: string): CheckResult[] {
  // Stage 2b: Ensure VoiceSegment.textKey references exist in JSON
  return [];
}

// @ts-expect-error -- Stage 2b+ stub (intentionally unused)
function _checkTextLengths(_systemId: string): CheckResult[] {
  // Stage 2b: Warn on segments outside 80-120 word range
  return [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log(`\n${cyan('╔══════════════════════════════════════════╗')}`);
  console.log(`${cyan('║')}  MIND MASTERY — Content Validation    ${cyan('║')}`);
  console.log(`${cyan('╚══════════════════════════════════════════╝')}\n`);

  let hasErrors = false;
  let hasWarnings = false;

  const allChecks: CheckResult[] = [
    checkContentDirExists(),
    ...checkSystemDirectories(),
  ];

  for (const check of allChecks) {
    if (!check.ok) {
      console.log(`${red('✗')} ${check.message}`);
      hasErrors = true;
    } else {
      console.log(check.message);
      if (check.message.includes('not yet created')) {
        hasWarnings = true;
      }
    }
  }

  console.log();
  if (hasErrors) {
    console.log(red('Validation FAILED — fix errors above.'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(yellow('Validation PASSED with warnings (Stage 1 — no practices yet).'));
    process.exit(2);
  } else {
    console.log(green('Validation PASSED — all checks green.'));
    process.exit(0);
  }
}

main();
