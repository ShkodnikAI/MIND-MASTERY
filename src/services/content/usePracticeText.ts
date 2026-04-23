/**
 * usePracticeText — reads practice text from contentStore (memory only).
 * INV-3: NEVER makes SQL queries in render path.
 * Store must be hydrated at app startup via contentStore.loadTexts().
 */

import { useContentStore } from '@/store/contentStore';
import type { PracticeTextSchema } from '@content/schema';

/**
 * Returns practice text for a given practiceId.
 * Returns null if text is not loaded yet or practice doesn't exist.
 */
export function usePracticeText(practiceId: string): PracticeTextSchema | null {
  return useContentStore((s) => s.getText(practiceId));
}

/**
 * Returns whether text content is fully loaded.
 */
export function useTextsLoaded(): boolean {
  return useContentStore((s) => s.textsLoaded);
}
