/**
 * Feature flags — INV-8.
 * Centralised toggle for experimental or stage-gated features.
 * All flags are typed; adding a new flag requires updating this object.
 */

export const flags = {
  piperTts: false, // Enable Piper TTS (Stage 5.2)
  nativeBinaural: true, // Enable native binaural module
  // skiaVisuals removed: @shopify/react-native-skia incompatible with RN 0.79 + React 18
  entrainment: true, // Enable light entrainment
  otaUpdates: false, // Enable OTA content updates
} as const;

export type FeatureFlag = keyof typeof flags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}
