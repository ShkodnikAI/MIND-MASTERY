#!/usr/bin/env tsx
/**
 * MIND MASTERY — Schema Validation Script
 *
 * Validates that:
 * 1. src/types/index.ts barrel-exports all expected type modules
 * 2. No circular type dependencies between type modules
 * 3. All exported types are used (no dead exports)
 *
 * @stage 1 — Checks that type barrel file exists and re-exports expected modules
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TYPES_DIR = path.join(PROJECT_ROOT, 'src', 'types');
const BARREL_FILE = path.join(TYPES_DIR, 'index.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

interface CheckResult {
  ok: boolean;
  message: string;
}

/** Expected type modules that must be re-exported from the barrel file. */
const EXPECTED_MODULES = [
  'content',
  'session',
  'audio',
  'light',
  'progression',
  'moment',
  'settings',
] as const;

/** Expected type exports from the barrel (spot-check key types). */
const EXPECTED_EXPORTS = [
  'SystemId',
  'DifficultyLevel',
  'SessionLength',
  'Segment',
  'Practice',
  'System',
  'SessionPhase',
  'SessionStatus',
  'ActiveSession',
  'JournalEntry',
  'AppSettings',
  'SafetyState',
  'VoiceSettings',
  'AudioSettings',
  'LightConfig',
  'MomentSettings',
] as const;

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkBarrelFileExists(): CheckResult {
  if (!fs.existsSync(BARREL_FILE)) {
    return {
      ok: false,
      message: `Barrel file not found: ${BARREL_FILE}`,
    };
  }
  return { ok: true, message: `${green('✓')} Barrel file exists: src/types/index.ts` };
}

function checkModuleExports(): CheckResult[] {
  const results: CheckResult[] = [];
  const barrelContent = fs.readFileSync(BARREL_FILE, 'utf-8');

  for (const mod of EXPECTED_MODULES) {
    const importPattern = new RegExp(`from '\\./${mod}'`);
    if (importPattern.test(barrelContent)) {
      results.push({
        ok: true,
        message: `${green('✓')} Re-exports from './${mod}'`,
      });
    } else {
      results.push({
        ok: false,
        message: `${red('✗')} Missing re-export from './${mod}'`,
      });
    }
  }

  return results;
}

function checkTypeExports(): CheckResult[] {
  const results: CheckResult[] = [];
  const barrelContent = fs.readFileSync(BARREL_FILE, 'utf-8');

  for (const typeName of EXPECTED_EXPORTS) {
    // Match both `export type { X }` and named exports within `export type { ... }`
    const pattern = new RegExp(`\\b${typeName}\\b`);
    if (pattern.test(barrelContent)) {
      results.push({
        ok: true,
        message: `${green('✓')} Type '${typeName}' exported`,
      });
    } else {
      results.push({
        ok: false,
        message: `${red('✗')} Type '${typeName}' not found in barrel`,
      });
    }
  }

  return results;
}

function checkModuleFilesExist(): CheckResult[] {
  const results: CheckResult[] = [];
  for (const mod of EXPECTED_MODULES) {
    const filePath = path.join(TYPES_DIR, `${mod}.ts`);
    if (fs.existsSync(filePath)) {
      results.push({
        ok: true,
        message: `${green('✓')} Module file exists: src/types/${mod}.ts`,
      });
    } else {
      results.push({
        ok: false,
        message: `${red('✗')} Module file missing: src/types/${mod}.ts`,
      });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log(`\n${cyan('╔══════════════════════════════════════════╗')}`);
  console.log(`${cyan('║')}  MIND MASTERY — Schema Validation     ${cyan('║')}`);
  console.log(`${cyan('╚══════════════════════════════════════════╝')}\n`);

  let hasErrors = false;

  const allChecks: CheckResult[] = [
    checkBarrelFileExists(),
    ...checkModuleFilesExist(),
    ...checkModuleExports(),
    ...checkTypeExports(),
  ];

  for (const check of allChecks) {
    if (!check.ok) {
      console.log(check.message);
      hasErrors = true;
    } else {
      console.log(check.message);
    }
  }

  console.log();
  if (hasErrors) {
    console.log(red('Schema validation FAILED — fix errors above.'));
    process.exit(1);
  } else {
    console.log(green('Schema validation PASSED — all types exported correctly.'));
    process.exit(0);
  }
}

main();
