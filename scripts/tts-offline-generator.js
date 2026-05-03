#!/usr/bin/env node
/**
 * @file TTS Offline Generator —批量生成TTS音频文件.
 *
 * Usage:
 *   node scripts/tts-offline-generator.js
 *   node scripts/tts-offline-generator.js --dry-run
 *   node scripts/tts-offline-generator.js --system breath
 *   node scripts/tts-offline-generator.js --key YOUR_API_KEY
 *
 * Reads all .ru.json text files from content/texts/,
 * generates TTS audio via Minimax API for each segment,
 * and saves MP3 files to assets/audio/voice/<system>/<practice>/<section>.mp3
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Constants ───────────────────────────────────────────────────

const API_URL = 'https://api.minimax.chat/v1/t2a_v2';
const DEFAULT_API_KEY = '2031325794852152128';
const DEFAULT_MODEL = 'speech-01-turbo';
const DEFAULT_VOICE = 'male-qn-qingse';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_TEXT_LENGTH = 5000;
const RATE_LIMIT_DELAY_MS = 1500; // Pause between requests to avoid rate-limiting

// ─── CLI Argument Parsing ───────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const DRY_RUN = args.includes('--dry-run');
const SYSTEM_FILTER = getArg('--system');
const API_KEY = getArg('--key') || DEFAULT_API_KEY;

// ─── Paths ───────────────────────────────────────────────────────

const ROOT_DIR = path.resolve(__dirname, '..');
const TEXTS_DIR = path.join(ROOT_DIR, 'content', 'texts');
const AUDIO_OUTPUT_DIR = path.join(ROOT_DIR, 'assets', 'audio', 'voice');

// ─── Utilities ───────────────────────────────────────────────────

function log(msg) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${msg}`);
}

function logError(msg) {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.error(`[${timestamp}] ERROR: ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Recursively find all .ru.json files in a directory.
 */
function findJsonFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) {
    logError(`Directory not found: ${dir}`);
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.name.endsWith('.ru.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Ensure a directory exists, creating intermediate directories as needed.
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Sanitize a string to be used as a filename component.
 */
function sanitizeFilename(str) {
  return str
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Make an HTTPS POST request and return the parsed JSON response.
 */
function httpsPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(body);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers,
      },
    };

    const timeoutId = setTimeout(() => {
      req.destroy(new Error(`Request timeout (${REQUEST_TIMEOUT_MS / 1000}s)`));
    }, REQUEST_TIMEOUT_MS);

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        clearTimeout(timeoutId);
        const raw = Buffer.concat(chunks).toString('utf-8');

        // Check content-type — if it's JSON, parse it
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(raw), raw });
          } catch {
            reject(new Error(`Failed to parse JSON response: ${raw.slice(0, 200)}`));
          }
        } else {
          // Binary response (shouldn't happen for this API, but handle it)
          resolve({ statusCode: res.statusCode, data: raw, raw });
        }
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    req.write(bodyStr);
    req.end();
  });
}

/**
 * Call Minimax TTS API to synthesize text and return base64 audio.
 */
async function synthesizeSpeech(text, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await httpsPost(
        API_URL,
        {
          model: DEFAULT_MODEL,
          text: text,
          stream: false,
          voice_setting: {
            voice_id: DEFAULT_VOICE,
            speed: 1.0,
            pitch: 1.0,
          },
          audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: 'mp3',
          },
          language_hint: 'ru',
        },
        {
          Authorization: `Bearer ${API_KEY}`,
        },
      );

      if (response.statusCode === 429) {
        const waitMs = RETRY_DELAY_MS * Math.pow(2, attempt);
        log(`  ⏳ Rate limited, waiting ${waitMs / 1000}s (attempt ${attempt + 1}/${retries})...`);
        await sleep(waitMs);
        continue;
      }

      if (response.statusCode !== 200) {
        const errMsg =
          response.data?.base_resp?.status_msg ||
          response.data?.message ||
          `HTTP ${response.statusCode}`;
        throw new Error(`API error: ${errMsg}`);
      }

      const audioBase64 = response.data?.data?.audio;
      if (!audioBase64) {
        throw new Error('API returned no audio data');
      }

      return audioBase64;
    } catch (err) {
      if (attempt < retries - 1) {
        const waitMs = RETRY_DELAY_MS * Math.pow(2, attempt);
        log(`  ⚠️  Attempt ${attempt + 1} failed: ${err.message}, retrying in ${waitMs / 1000}s...`);
        await sleep(waitMs);
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  log('═'.repeat(60));
  log('  TTS Offline Generator');
  log('═'.repeat(60));

  if (DRY_RUN) {
    log('🔍 DRY RUN MODE — no files will be generated');
  }
  if (SYSTEM_FILTER) {
    log(`🎯 System filter: ${SYSTEM_FILTER}`);
  }
  log(`🔑 API key: ${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
  log(`📁 Texts directory: ${TEXTS_DIR}`);
  log(`📁 Output directory: ${AUDIO_OUTPUT_DIR}`);
  log('');

  // 1. Find all text JSON files
  const jsonFiles = findJsonFiles(TEXTS_DIR);
  log(`📄 Found ${jsonFiles.length} .ru.json text file(s)`);

  if (jsonFiles.length === 0) {
    log('No text files found. Exiting.');
    return;
  }

  // 2. Parse files and build task list
  const tasks = [];

  for (const filePath of jsonFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const { practiceId, systemId, segments } = data;

      if (!systemId || !practiceId || !segments || typeof segments !== 'object') {
        logError(`Skipping ${filePath}: missing practiceId, systemId, or segments`);
        continue;
      }

      // Apply system filter
      if (SYSTEM_FILTER && systemId !== SYSTEM_FILTER) {
        continue;
      }

      // Sanitize practiceId and systemId for file paths
      const safeSystem = sanitizeFilename(systemId);
      const safePractice = sanitizeFilename(practiceId);

      for (const [sectionKey, text] of Object.entries(segments)) {
        if (typeof text !== 'string' || text.trim().length === 0) {
          continue;
        }

        if (text.length > MAX_TEXT_LENGTH) {
          logError(`Skipping ${safeSystem}/${safePractice}/${sectionKey}: text too long (${text.length} chars, max ${MAX_TEXT_LENGTH})`);
          continue;
        }

        const safeSection = sanitizeFilename(sectionKey);
        const outputPath = path.join(AUDIO_OUTPUT_DIR, safeSystem, safePractice, `${safeSection}.mp3`);

        tasks.push({
          systemId,
          practiceId,
          sectionKey,
          text: text.trim(),
          outputPath,
          sourceFile: filePath,
        });
      }
    } catch (err) {
      logError(`Failed to parse ${filePath}: ${err.message}`);
    }
  }

  log(`📋 Total tasks: ${tasks.length}`);
  log('');

  if (tasks.length === 0) {
    log('No tasks to process. Exiting.');
    return;
  }

  // 3. Filter out already existing files (resume support)
  const toGenerate = [];
  const skipped = [];

  for (const task of tasks) {
    if (fs.existsSync(task.outputPath)) {
      skipped.push(task);
    } else {
      toGenerate.push(task);
    }
  }

  log(`✅ Already exist: ${skipped.length}`);
  log(`🔄 To generate:  ${toGenerate.length}`);
  log('');

  // 4. Dry run — just list tasks
  if (DRY_RUN) {
    log('─'.repeat(60));
    log('  Tasks to generate:');
    log('─'.repeat(60));
    for (const task of toGenerate) {
      const relPath = path.relative(ROOT_DIR, task.outputPath);
      log(`  🎤 ${task.systemId}/${task.practiceId} → ${task.sectionKey}`);
      log(`     ${relPath} (${task.text.length} chars)`);
    }
    log('');
    log('─'.repeat(60));
    log('  Already exist (skipped):');
    log('─'.repeat(60));
    for (const task of skipped) {
      const relPath = path.relative(ROOT_DIR, task.outputPath);
      log(`  ⏭️  ${relPath}`);
    }
    log('');
    log('✅ Dry run complete.');
    return;
  }

  // 5. Generate audio files
  log('─'.repeat(60));
  log('  Generating audio files...');
  log('─'.repeat(60));
  log('');

  let successCount = 0;
  let failCount = 0;
  const failedTasks = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const task = toGenerate[i];
    const num = `[${i + 1}/${toGenerate.length}]`;
    const relPath = path.relative(ROOT_DIR, task.outputPath);

    log(`${num} ${task.systemId}/${task.practiceId} → ${task.sectionKey}`);

    try {
      // Generate TTS
      const audioBase64 = await synthesizeSpeech(task.text);

      // Save to file
      ensureDir(path.dirname(task.outputPath));
      const buffer = Buffer.from(audioBase64, 'base64');
      fs.writeFileSync(task.outputPath, buffer);

      const sizeKB = Math.round(buffer.length / 1024);
      log(`  ✅ Saved: ${relPath} (${sizeKB} KB)`);
      successCount++;
    } catch (err) {
      logError(`${num} Failed: ${relPath}`);
      logError(`  ${err.message}`);
      failCount++;
      failedTasks.push({ task, error: err.message });
    }

    // Rate limit delay between requests
    if (i < toGenerate.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  // 6. Print summary
  log('');
  log('═'.repeat(60));
  log('  Summary');
  log('═'.repeat(60));
  log(`  Total tasks:      ${tasks.length}`);
  log(`  Already existed:  ${skipped.length}`);
  log(`  Generated (new):  ${successCount}`);
  log(`  Failed:           ${failCount}`);
  log(`  Total audio:      ${successCount + skipped.length}/${tasks.length}`);
  log('');

  if (failedTasks.length > 0) {
    log('─'.repeat(60));
    log('  Failed tasks:');
    log('─'.repeat(60));
    for (const { task, error } of failedTasks) {
      const relPath = path.relative(ROOT_DIR, task.outputPath);
      log(`  ❌ ${relPath}`);
      log(`     ${error}`);
    }
    log('');
  }

  if (failCount === 0) {
    log('🎉 All tasks completed successfully!');
  } else {
    log(`⚠️  ${failCount} task(s) failed. Re-run the script to retry (existing files will be skipped).`);
  }
}

// ─── Run ─────────────────────────────────────────────────────────

main().catch((err) => {
  logError(`Fatal error: ${err.message}`);
  process.exit(1);
});
