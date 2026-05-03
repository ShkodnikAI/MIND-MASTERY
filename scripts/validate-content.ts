#!/usr/bin/env tsx
/**
 * MIND MASTERY — Content Validation Pipeline
 * INV-4: Commits with invalid content are technically impossible.
 *
 * Checks:
 * 1. Each JSON in content/texts/** matches PracticeText schema
 * 2. practiceId in TS matches JSON filename
 * 3. Each VoiceSegment.textKey exists in JSON segments
 * 4. No orphaned JSON keys (keys that don't match any TS textKey)
 * 5. Text length warnings (segments outside 20-200 word range)
 *
 * Exit codes:
 *   0 = all valid
 *   1 = errors found
 *   2 = only warnings
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content', 'texts');
const SYSTEMS_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'systems');

const EXPECTED_SYSTEMS = ['transurfing', 'silva', 'dispenza', 'feldenkrais', 'breath'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CheckResult {
  ok: boolean;
  message: string;
  isWarning?: boolean;
}

const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ---------------------------------------------------------------------------
// Directory structure checks
// ---------------------------------------------------------------------------

function checkContentDirExists(): CheckResult {
  if (!fs.existsSync(CONTENT_DIR)) {
    return { ok: false, message: `Content directory not found: ${CONTENT_DIR}` };
  }

  const systemDirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return {
    ok: true,
    message: `${cyan(CONTENT_DIR)} — ${systemDirs.length} system(s): ${systemDirs.join(', ')}`,
  };
}

function checkSystemDirectories(): CheckResult[] {
  const results: CheckResult[] = [];

  if (!fs.existsSync(CONTENT_DIR)) {
    for (const sys of EXPECTED_SYSTEMS) {
      results.push({ ok: false, message: `Missing: content/texts/${sys}/` });
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
    if (!existing.has(sys)) {
      results.push({ ok: false, message: `Missing: content/texts/${sys}/` });
      continue;
    }
    const files = fs
      .readdirSync(path.join(CONTENT_DIR, sys))
      .filter((f) => f.endsWith('.json'));
    results.push({
      ok: files.length > 0,
      message: `${green('✓')} content/texts/${sys}/ — ${files.length} file(s)`,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// JSON schema validation
// ---------------------------------------------------------------------------

function checkJsonSchema(systemId: string): CheckResult[] {
  const results: CheckResult[] = [];
  const sysDir = path.join(CONTENT_DIR, systemId);

  if (!fs.existsSync(sysDir)) return results;

  const jsonFiles = fs.readdirSync(sysDir).filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const filePath = path.join(sysDir, file);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      // Required fields
      if (!data.practiceId || typeof data.practiceId !== 'string') {
        errors.push('Missing/invalid practiceId');
      }
      if (!data.systemId || typeof data.systemId !== 'string') {
        errors.push('Missing/invalid systemId');
      }
      if (data.systemId !== systemId) {
        errors.push(`systemId "${data.systemId}" doesn't match directory "${systemId}"`);
      }
      if (!data.locale || typeof data.locale !== 'string') {
        errors.push('Missing/invalid locale');
      }
      if (typeof data.version !== 'number') {
        errors.push('Missing/invalid version');
      }
      if (!data.title || typeof data.title !== 'string') {
        errors.push('Missing/invalid title');
      }
      if (!data.segments || typeof data.segments !== 'object' || Array.isArray(data.segments)) {
        errors.push('Missing/invalid segments (must be object)');
      } else {
        const segments = data.segments as Record<string, unknown>;
        const keys = Object.keys(segments);
        if (keys.length === 0) {
          warnings.push('No text segments defined');
        }
        for (const [key, value] of Object.entries(segments)) {
          if (typeof value !== 'string') {
            errors.push(`Segment "${key}" must be a string`);
          } else {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 20) {
              warnings.push(`Segment "${key}": only ${wordCount} words (recommended 20+)`);
            } else if (wordCount > 200) {
              warnings.push(`Segment "${key}": ${wordCount} words (consider shortening)`);
            }
          }
        }
      }

      // practiceId should match filename
      const expectedId = file.replace(/\.ru\.json$/, '');
      if (data.practiceId && data.practiceId !== expectedId) {
        errors.push(`practiceId "${data.practiceId}" doesn't match filename "${expectedId}"`);
      }

      if (errors.length > 0) {
        results.push({
          ok: false,
          message: `${red('✗')} ${systemId}/${file}: ${errors.join('; ')}`,
        });
      } else if (warnings.length > 0) {
        results.push({
          ok: true,
          isWarning: true,
          message: `${yellow('⚠')} ${systemId}/${file}: ${warnings.join('; ')}`,
        });
      } else {
        results.push({
          ok: true,
          message: `${green('✓')} ${systemId}/${file} — valid (${Object.keys(data.segments).length} segments)`,
        });
      }
    } catch (err) {
      results.push({
        ok: false,
        message: `${red('✗')} ${systemId}/${file}: failed to parse JSON`,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// TS ↔ JSON textKey sync
// ---------------------------------------------------------------------------

function checkTsToJSync(systemId: string): CheckResult[] {
  const results: CheckResult[] = [];
  const practicesPath = path.join(SYSTEMS_DIR, systemId, 'practices.ts');
  const jsonDir = path.join(CONTENT_DIR, systemId);

  if (!fs.existsSync(practicesPath)) {
    results.push({
      ok: false,
      message: `${red('✗')} ${systemId}: practices.ts not found`,
    });
    return results;
  }
  if (!fs.existsSync(jsonDir)) {
    results.push({
      ok: false,
      message: `${red('✗')} ${systemId}: JSON directory not found`,
    });
    return results;
  }

  // Extract textKeys from TS
  const tsContent = fs.readFileSync(practicesPath, 'utf-8');
  const tsTextKeys = new Set(
    [...tsContent.matchAll(/textKey:\s*'([^']+)'/g)].map((m) => m[1]),
  );

  // Extract segment keys from all JSON files
  const jsonFiles = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));
  const jsonKeys = new Set<string>();

  for (const file of jsonFiles) {
    try {
      const raw = fs.readFileSync(path.join(jsonDir, file), 'utf-8');
      const data = JSON.parse(raw);
      if (data.segments && typeof data.segments === 'object') {
        for (const key of Object.keys(data.segments)) {
          jsonKeys.add(key);
        }
      }
    } catch {
      // JSON parse errors are caught by checkJsonSchema
    }
  }

  // Find mismatches
  const missingInJson = [...tsTextKeys].filter((k) => !jsonKeys.has(k));
  const extraInJson = [...jsonKeys].filter((k) => !tsTextKeys.has(k));

  if (missingInJson.length > 0) {
    results.push({
      ok: false,
      message: `${red('✗')} ${systemId}: ${missingInJson.length} textKey(s) missing in JSON: ${missingInJson.slice(0, 5).join(', ')}${missingInJson.length > 5 ? '...' : ''}`,
    });
  }

  if (extraInJson.length > 0) {
    results.push({
      ok: false,
      message: `${red('✗')} ${systemId}: ${extraInJson.length} orphaned JSON key(s): ${extraInJson.slice(0, 5).join(', ')}${extraInJson.length > 5 ? '...' : ''}`,
    });
  }

  if (missingInJson.length === 0 && extraInJson.length === 0) {
    results.push({
      ok: true,
      message: `${green('✓')} ${systemId}: ${tsTextKeys.size} textKeys synced with JSON`,
    });
  }

  return results;
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
  const allChecks: CheckResult[] = [];

  // Phase 1: Directory structure
  console.log(bold('Phase 1: Directory structure'));
  allChecks.push(checkContentDirExists());
  allChecks.push(...checkSystemDirectories());

  // Phase 2: JSON schema validation
  console.log(`\n${bold('Phase 2: JSON schema validation')}`);
  for (const sys of EXPECTED_SYSTEMS) {
    allChecks.push(...checkJsonSchema(sys));
  }

  // Phase 3: TS ↔ JSON sync
  console.log(`\n${bold('Phase 3: TypeScript ↔ JSON textKey sync')}`);
  for (const sys of EXPECTED_SYSTEMS) {
    allChecks.push(...checkTsToJSync(sys));
  }

  // Output results
  for (const check of allChecks) {
    if (!check.ok) {
      console.log(check.message);
      hasErrors = true;
    } else if (check.isWarning) {
      console.log(check.message);
      hasWarnings = true;
    } else {
      console.log(check.message);
    }
  }

  // Summary
  console.log();
  const totalFiles = allChecks.filter(
    (c) => c.message.includes('.json') && c.ok && !c.isWarning,
  ).length;
  const totalTextKeys = allChecks
    .filter((c) => c.message.includes('textKeys synced'))
    .map((c) => c.message.match(/(\d+)\s+textKeys/)?.[1])
    .filter(Boolean)
    .reduce((sum, n) => sum + Number(n), 0);

  if (hasErrors) {
    console.log(red('Validation FAILED — fix errors above.'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(yellow(`Validation PASSED with warnings (${totalFiles} files, ${totalTextKeys} textKeys).`));
    process.exit(2);
  } else {
    console.log(green(`Validation PASSED — ${totalFiles} files, ${totalTextKeys} textKeys, 0 errors.`));
    process.exit(0);
  }
}

main();
