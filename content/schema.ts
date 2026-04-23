/**
 * Practice Text Schema — manual validation (no Zod dependency).
 * Validates JSON structure of practice text files.
 */

export interface PracticeTextSchema {
  practiceId: string;
  systemId: string;
  locale: string;
  version: number;
  title: string;
  shortDescription: string;
  segments: Record<string, string>; // textKey → text content
  theory?: {
    title: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePracticeText(data: unknown, filename: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [`[${filename}] Invalid JSON: not an object`], warnings };
  }

  const obj = data as Record<string, unknown>;

  // Required fields
  if (!obj.practiceId || typeof obj.practiceId !== 'string') {
    errors.push(`[${filename}] Missing or invalid 'practiceId'`);
  }
  if (!obj.systemId || typeof obj.systemId !== 'string') {
    errors.push(`[${filename}] Missing or invalid 'systemId'`);
  }
  if (!obj.locale || typeof obj.locale !== 'string') {
    errors.push(`[${filename}] Missing or invalid 'locale'`);
  }
  if (typeof obj.version !== 'number') {
    errors.push(`[${filename}] Missing or invalid 'version'`);
  }
  if (!obj.title || typeof obj.title !== 'string') {
    errors.push(`[${filename}] Missing or invalid 'title'`);
  }
  if (!obj.segments || typeof obj.segments !== 'object' || Array.isArray(obj.segments)) {
    errors.push(`[${filename}] Missing or invalid 'segments' (must be object)`);
  } else {
    const segments = obj.segments as Record<string, unknown>;
    const segmentKeys = Object.keys(segments);
    if (segmentKeys.length === 0) {
      warnings.push(`[${filename}] No text segments defined`);
    }
    for (const [key, value] of Object.entries(segments)) {
      if (typeof value !== 'string') {
        errors.push(`[${filename}] Segment '${key}' must be a string`);
      } else {
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount < 10) {
          warnings.push(`[${filename}] Segment '${key}' has only ${wordCount} words (expected 80-120)`);
        } else if (wordCount > 200) {
          warnings.push(`[${filename}] Segment '${key}' has ${wordCount} words (consider shortening)`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
