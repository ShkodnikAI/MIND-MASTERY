/**
 * @file Asset Resolver — maps track IDs to bundled audio assets.
 *
 * Music tracks: 'space', 'ocean', 'forest', 'fireplace', 'winter', 'meditation'
 * Binaural tracks: '200hz-10hz', '200hz-8hz', '200hz-6hz', '200hz-4hz', etc.
 *
 * INV: All require() calls are static (Metro bundler requirement).
 * Call preloadAudioAssets() once at app startup.
 */

import { Asset } from 'expo-asset';
import voiceManifest from './voiceManifest';

// ---------------------------------------------------------------------------
// Static asset modules (Metro resolves these at bundle time)
// ---------------------------------------------------------------------------

const musicModules: Record<string, ReturnType<typeof require>> = {
  space: require('../../assets/audio/music/space.wav'),
  ocean: require('../../assets/audio/music/ocean.wav'),
  forest: require('../../assets/audio/music/forest.wav'),
  fireplace: require('../../assets/audio/music/fireplace.wav'),
  winter: require('../../assets/audio/music/winter.wav'),
  meditation: require('../../assets/audio/music/meditation.wav'),
};

const binauralModules: Record<string, ReturnType<typeof require>> = {
  '200hz-10hz': require('../../assets/audio/binaural/200hz-10hz.wav'),
  '200hz-8hz': require('../../assets/audio/binaural/200hz-8hz.wav'),
  '200hz-6hz': require('../../assets/audio/binaural/200hz-6hz.wav'),
  '200hz-4hz': require('../../assets/audio/binaural/200hz-4hz.wav'),
  '100hz-10hz': require('../../assets/audio/binaural/100hz-10hz.wav'),
  '100hz-8hz': require('../../assets/audio/binaural/100hz-8hz.wav'),
  '100hz-6hz': require('../../assets/audio/binaural/100hz-6hz.wav'),
  '100hz-4hz': require('../../assets/audio/binaural/100hz-4hz.wav'),
  '150hz-10hz': require('../../assets/audio/binaural/150hz-10hz.wav'),
  '150hz-8hz': require('../../assets/audio/binaural/150hz-8hz.wav'),
  '150hz-6hz': require('../../assets/audio/binaural/150hz-6hz.wav'),
  '150hz-4hz': require('../../assets/audio/binaural/150hz-4hz.wav'),
};

const voiceModules: Record<string, Record<string, ReturnType<typeof require>>> = voiceManifest;

// ---------------------------------------------------------------------------
// URI cache
// ---------------------------------------------------------------------------

const uriCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve a music track ID to its local file URI.
 * Returns null if the track is unknown.
 */
export function resolveMusicUri(trackId: string): string | null {
  const cacheKey = `music:${trackId}`;
  if (uriCache.has(cacheKey)) return uriCache.get(cacheKey)!;

  const mod = musicModules[trackId];
  if (!mod) {
    console.warn(`[assetResolver] Unknown music track: ${trackId}`);
    return null;
  }

  const asset = Asset.fromModule(mod);
  const uri = asset.localUri ?? asset.uri ?? null;
  if (uri) uriCache.set(cacheKey, uri);
  return uri;
}

/**
 * Resolve a binaural track ID to its local file URI.
 * Returns null if the track is unknown.
 */
export function resolveBinauralUri(trackId: string): string | null {
  const cacheKey = `binaural:${trackId}`;
  if (uriCache.has(cacheKey)) return uriCache.get(cacheKey)!;

  const mod = binauralModules[trackId];
  if (!mod) {
    console.warn(`[assetResolver] Unknown binaural track: ${trackId}`);
    return null;
  }

  const asset = Asset.fromModule(mod);
  const uri = asset.localUri ?? asset.uri ?? null;
  if (uri) uriCache.set(cacheKey, uri);
  return uri;
}

/**
 * Resolve a pre-recorded voice MP3 URI for a given textKey.
 * textKey format: practiceId.segmentName
 */
export function resolveVoiceUri(textKey: string): string | null {
  const cacheKey = `voice:${'${textKey}'}`;
  if (uriCache.has(cacheKey)) return uriCache.get(cacheKey)!;
  const dotIndex = textKey.indexOf('.');
  if (dotIndex === -1) return null;
  const practiceId = textKey.substring(0, dotIndex);
  const segmentName = textKey.substring(dotIndex + 1);
  const practiceVoices = voiceModules[practiceId];
  if (!practiceVoices) return null;
  const mod = practiceVoices[segmentName];
  if (!mod) return null;
  const asset = Asset.fromModule(mod);
  const uri = asset.localUri ?? asset.uri ?? null;
  if (uri) uriCache.set(cacheKey, uri);
  return uri;
}

/** All available music track IDs. */
export const MUSIC_TRACKS = Object.keys(musicModules);

/** All available binaural track IDs. */
export const BINAURAL_TRACKS = Object.keys(binauralModules);

/**
 * Pre-load all audio assets so they are available for local playback.
 * Call once at app startup (e.g., in root layout).
 */
export async function preloadAudioAssets(): Promise<void> {
  const allModules = [
    ...Object.values(musicModules),
    ...Object.values(binauralModules),
    // Voice modules loaded on-demand via Asset.fromModule (591 MP3s would OOM)
  ];
  await Asset.loadAsync(allModules);
  // Invalidate cache so URIs are re-resolved with localUri
  uriCache.clear();
}
