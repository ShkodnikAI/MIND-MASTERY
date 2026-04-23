#!/usr/bin/env tsx
/**
 * MIND MASTERY — System Coverage Checker
 *
 * Reports which practices have:
 * - Text content (content/texts/<system>/<practice>.json)
 * - Voice recordings (assets/audio/<system>/<practice>/)
 * - Visual assets (assets/visuals/<system>/)
 *
 * @stage 1 — No practices registered yet; reports placeholder status
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content', 'texts');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'assets', 'audio');
const VISUALS_DIR = path.join(PROJECT_ROOT, 'assets', 'visuals');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

interface SystemCoverage {
  id: string;
  hasTexts: boolean;
  hasAudio: boolean;
  hasVisuals: boolean;
  practiceCount: number;
}

const SYSTEMS = [
  'transurfing',
  'silva',
  'dispenza',
  'feldenkrais',
  'breath',
] as const;

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function getSystemCoverage(systemId: string): SystemCoverage {
  const textDir = path.join(CONTENT_DIR, systemId);
  const audioDir = path.join(AUDIO_DIR, systemId);
  const visualsDir = path.join(VISUALS_DIR, systemId);

  const hasTexts = fs.existsSync(textDir) && fs.readdirSync(textDir).length > 0;
  const hasAudio = fs.existsSync(audioDir) && fs.readdirSync(audioDir).length > 0;
  const hasVisuals = fs.existsSync(visualsDir) && fs.readdirSync(visualsDir).length > 0;

  // Count practice JSON files as proxy for practice count
  let practiceCount = 0;
  if (fs.existsSync(textDir)) {
    practiceCount = fs
      .readdirSync(textDir)
      .filter((f) => f.endsWith('.json')).length;
  }

  return { id: systemId, hasTexts, hasAudio, hasVisuals, practiceCount };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log(`\n${cyan('╔══════════════════════════════════════════╗')}`);
  console.log(`${cyan('║')}  MIND MASTERY — System Coverage       ${cyan('║')}`);
  console.log(`${cyan('╚══════════════════════════════════════════╝')}\n`);

  const coverages = SYSTEMS.map(getSystemCoverage);
  const anyContent = coverages.some((c) => c.practiceCount > 0);

  if (!anyContent) {
    console.log(yellow('No practices registered yet.'));
    console.log(yellow('Content will be added in Stage 2b/2c.\n'));
    console.log('Expected systems:');
    for (const sys of SYSTEMS) {
      console.log(`  - ${sys}`);
    }
    console.log();
    process.exit(0);
  }

  // Print table header
  console.log('System          | Texts | Audio | Visuals | Practices');
  console.log('----------------|-------|-------|---------|----------');

  for (const cov of coverages) {
    const textsIcon = cov.hasTexts ? '✓' : '○';
    const audioIcon = cov.hasAudio ? '✓' : '○';
    const visualsIcon = cov.hasVisuals ? '✓' : '○';
    const name = cov.id.padEnd(15);
    console.log(
      `${name} |   ${textsIcon}   |   ${audioIcon}   |    ${visualsIcon}    | ${cov.practiceCount}`,
    );
  }

  console.log();

  const totalPractices = coverages.reduce((sum, c) => sum + c.practiceCount, 0);
  const textSystems = coverages.filter((c) => c.hasTexts).length;
  const audioSystems = coverages.filter((c) => c.hasAudio).length;
  const visualSystems = coverages.filter((c) => c.hasVisuals).length;

  console.log(`Total practices: ${totalPractices}`);
  console.log(`Systems with texts:   ${textSystems}/${SYSTEMS.length}`);
  console.log(`Systems with audio:   ${audioSystems}/${SYSTEMS.length}`);
  console.log(`Systems with visuals: ${visualSystems}/${SYSTEMS.length}`);
  console.log();
  process.exit(0);
}

main();
