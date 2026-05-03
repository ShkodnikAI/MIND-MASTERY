/**
 * @file MIND MASTERY — Visual signatures for each practice system.
 *
 * Each system has a unique visual identity used by the visualisation engine
 * for backgrounds, particles, and ambient effects during sessions.
 *
 * These match the `VisualSignature` interface defined in @/types/content.
 */

import type { VisualSignature } from '@/types';

export const systemThemes: Record<string, VisualSignature> = {
  transurfing: {
    primaryColor: '#6C5CE7',
    secondaryColor: '#A29BFE',
    gradientColors: ['#6C5CE7', '#A29BFE', '#DDA0FF'],
    particleStyle: 'waves',
    glowIntensity: 0.6,
    animationSpeed: 1.0,
    patternId: 'waves',
  },

  silva: {
    primaryColor: '#00B894',
    secondaryColor: '#55EFC4',
    gradientColors: ['#00B894', '#55EFC4', '#BADC58'],
    particleStyle: 'orbital',
    glowIntensity: 0.5,
    animationSpeed: 0.8,
    patternId: 'leaves',
  },

  dispenza: {
    primaryColor: '#FDCB6E',
    secondaryColor: '#F8B500',
    gradientColors: ['#FDCB6E', '#F8B500', '#E17055'],
    particleStyle: 'spiral',
    glowIntensity: 0.7,
    animationSpeed: 1.2,
    patternId: 'golden',
  },

  feldenkrais: {
    primaryColor: '#E17055',
    secondaryColor: '#FAB1A0',
    gradientColors: ['#E17055', '#FAB1A0', '#FDCB6E'],
    particleStyle: 'flow',
    glowIntensity: 0.4,
    animationSpeed: 0.6,
    patternId: 'earth',
  },

  breath: {
    primaryColor: '#74B9FF',
    secondaryColor: '#0984E3',
    gradientColors: ['#74B9FF', '#0984E3', '#6C5CE7'],
    particleStyle: 'dots',
    glowIntensity: 0.5,
    animationSpeed: 0.4,
    patternId: 'bubbles',
  },

  domfreq: {
    primaryColor: '#E84393',
    secondaryColor: '#FD79A8',
    gradientColors: ['#E84393', '#FD79A8', '#A29BFE'],
    particleStyle: 'spiral',
    glowIntensity: 0.8,
    animationSpeed: 1.4,
    patternId: 'frequency',
  },
} as const;

/**
 * Retrieve the visual signature for a given system id.
 * Falls back to transurfing theme if the id is unknown.
 */
export function getSystemTheme(systemId: string): VisualSignature {
  return systemThemes[systemId] ?? systemThemes.transurfing;
}
