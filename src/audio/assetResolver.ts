/**
<<<<<<< HEAD
 * @file Asset URI Resolver — maps audio track IDs to asset:// URIs.
 *
 * In Expo, bundled assets are accessed via `Asset.fromModule(require(...)).uri`.
 * This utility provides a simple mapping from track IDs
 * (like 'space', '200hz-10hz') to the actual require() calls for WAV files
 * in assets/audio/.
 *
 * INV-2: Pure resolution logic, no side effects.
=======
 * @file Asset Resolver — maps track IDs to bundled audio assets.
 *
 * Music tracks: 'space', 'ocean', 'forest', 'fireplace', 'winter', 'meditation'
 * Binaural tracks: '200hz-10hz', '200hz-8hz', '200hz-6hz', '200hz-4hz', etc.
 *
 * INV: All require() calls are static (Metro bundler requirement).
 * Call preloadAudioAssets() once at app startup.
>>>>>>> 2fdfd61 (feat: full audio system — asset resolver, binaural beats, music, narration text, mute toggles)
 */

import { Asset } from 'expo-asset';

// ---------------------------------------------------------------------------
<<<<<<< HEAD
// Music tracks
// ---------------------------------------------------------------------------

const MUSIC_ASSETS: Record<string, number> = {
  space: require('../../assets/audio/music/space.wav'),
  ocean: require('../../assets/audio/music/ocean.wav'),
  forest: require('../../assets/audio/music/forest.wav'),
  meditation: require('../../assets/audio/music/meditation.wav'),
  fireplace: require('../../assets/audio/music/fireplace.wav'),
  winter: require('../../assets/audio/music/winter.wav'),
};

// ---------------------------------------------------------------------------
// Binaural beat tracks
// ---------------------------------------------------------------------------

const BINAURAL_ASSETS: Record<string, number> = {
=======
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
>>>>>>> 2fdfd61 (feat: full audio system — asset resolver, binaural beats, music, narration text, mute toggles)
  '200hz-10hz': require('../../assets/audio/binaural/200hz-10hz.wav'),
  '200hz-8hz': require('../../assets/audio/binaural/200hz-8hz.wav'),
  '200hz-6hz': require('../../assets/audio/binaural/200hz-6hz.wav'),
  '200hz-4hz': require('../../assets/audio/binaural/200hz-4hz.wav'),
<<<<<<< HEAD
  '200hz-12hz': require('../../assets/audio/binaural/200hz-12hz.wav'),
  '100hz-10hz': require('../../assets/audio/binaural/100hz-10hz.wav'),
  '150hz-7hz': require('../../assets/audio/binaural/150hz-7hz.wav'),
};

// ---------------------------------------------------------------------------
// Gongs / chimes
// ---------------------------------------------------------------------------

const GONG_ASSETS: Record<string, number> = {
  moment_chime: require('../../assets/audio/gongs/moment_chime.wav'),
};

// ---------------------------------------------------------------------------
// URI cache (avoid re-resolving the same asset)
=======
  '100hz-10hz': require('../../assets/audio/binaural/100hz-10hz.wav'),
  '100hz-8hz': require('../../assets/audio/binaural/100hz-8hz.wav'),
  '100hz-6hz': require('../../assets/audio/binaural/100hz-6hz.wav'),
  '100hz-4hz': require('../../assets/audio/binaural/100hz-4hz.wav'),
  '150hz-10hz': require('../../assets/audio/binaural/150hz-10hz.wav'),
  '150hz-8hz': require('../../assets/audio/binaural/150hz-8hz.wav'),
  '150hz-6hz': require('../../assets/audio/binaural/150hz-6hz.wav'),
  '150hz-4hz': require('../../assets/audio/binaural/150hz-4hz.wav'),
};

// ---------------------------------------------------------------------------
// URI cache
>>>>>>> 2fdfd61 (feat: full audio system — asset resolver, binaural beats, music, narration text, mute toggles)
// ---------------------------------------------------------------------------

const uriCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
<<<<<<< HEAD
 * Resolve a music track ID to its asset URI.
 *
 * @param trackId — e.g. 'space', 'ocean', 'meditation'
 * @returns The resolved URI string, or null if not found.
 */
export function resolveMusicUri(trackId: string): string | null {
  if (uriCache.has(`music:${trackId}`)) {
    return uriCache.get(`music:${trackId}`)!;
  }

  const assetModule = MUSIC_ASSETS[trackId];
  if (!assetModule) return null;

  const asset = Asset.fromModule(assetModule);
  const uri = asset.uri ?? asset.localUri;
  if (uri) {
    uriCache.set(`music:${trackId}`, uri);
  }
  return uri ?? null;
}

/**
 * Resolve a binaural beat track ID to its asset URI.
 *
 * @param trackId — e.g. '200hz-10hz', '200hz-6hz'
 * @returns The resolved URI string, or null if not found.
 */
export function resolveBinauralUri(trackId: string): string | null {
  if (uriCache.has(`binaural:${trackId}`)) {
    return uriCache.get(`binaural:${trackId}`)!;
  }

  const assetModule = BINAURAL_ASSETS[trackId];
  if (!assetModule) return null;

  const asset = Asset.fromModule(assetModule);
  const uri = asset.uri ?? asset.localUri;
  if (uri) {
    uriCache.set(`binaural:${trackId}`, uri);
  }
  return uri ?? null;
}

/**
 * Resolve a gong/chime track ID to its asset URI.
 *
 * @param trackId — e.g. 'moment_chime'
 * @returns The resolved URI string, or null if not found.
 */
export function resolveGongUri(trackId: string): string | null {
  if (uriCache.has(`gong:${trackId}`)) {
    return uriCache.get(`gong:${trackId}`)!;
  }

  const assetModule = GONG_ASSETS[trackId];
  if (!assetModule) return null;

  const asset = Asset.fromModule(assetModule);
  const uri = asset.uri ?? asset.localUri;
  if (uri) {
    uriCache.set(`gong:${trackId}`, uri);
  }
  return uri ?? null;
}

/**
 * Get list of all available music track IDs.
 */
export function getAvailableMusicTracks(): string[] {
  return Object.keys(MUSIC_ASSETS);
}

/**
 * Get list of all available binaural track IDs.
 */
export function getAvailableBinauralTracks(): string[] {
  return Object.keys(BINAURAL_ASSETS);
=======
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
  ];
  await Asset.loadAsync(allModules);
  // Invalidate cache so URIs are re-resolved with localUri
  uriCache.clear();
>>>>>>> 2fdfd61 (feat: full audio system — asset resolver, binaural beats, music, narration text, mute toggles)
}
