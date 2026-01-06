import type { CausalityMetadata } from '../events';

/**
 * Validates causality metadata for commands/events before processing.
 */
export function validateCausalityMetadata(metadata: CausalityMetadata, context = 'causality metadata'): void {
  const required: (keyof CausalityMetadata)[] = ['causedBy', 'causedByUser', 'causedByAction', 'blueprintId'];
  const missing = required.filter(key => !metadata[key]);

  if (missing.length > 0) {
    throw new Error(`${context} missing fields: ${missing.join(', ')}`);
  }
}

// END OF FILE
