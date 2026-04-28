/**
 * @file MIND MASTERY — Complete colour palette (dark theme).
 *
 * All UI colours are sourced from this module. Import via:
 *   import { colors } from '@/ui/theme';
 *
 * No hardcoded colour strings are allowed outside this file.
 */

export const colors = {
  // Base dark backgrounds
  background: {
    primary: '#0A0E1A',
    secondary: '#1A1F36',
    tertiary: '#252B48',
    elevated: '#2D3454',
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#A0AEC0',
    tertiary: '#718096',
    inverse: '#0A0E1A',
  },

  // Semantic accent colours
  accent: {
    primary: '#6C5CE7', // Main brand accent (indigo)
    secondary: '#A29BFE', // Lighter indigo
    success: '#00B894', // Emerald green
    warning: '#FDCB6E', // Amber
    error: '#E17055', // Coral red
    info: '#74B9FF', // Sky blue
  },

  // System-specific brand colours
  transurfing: '#6C5CE7',
  silva: '#00B894',
  dispenza: '#FDCB6E',
  feldenkrais: '#E17055',
  breath: '#74B9FF',
  domfreq: '#E84393',

  // UI chrome
  border: '#2D3748',
  divider: '#1A202C',
  overlay: 'rgba(0, 0, 0, 0.5)',
  statusBar: '#0A0E1A',
  tabBar: '#0D1117',
} as const;

export type ColorKeys = keyof typeof colors;
