/**
 * ID Generation Utilities
 * 
 * Provides utilities for generating unique identifiers for events and aggregates.
 */

/**
 * Generate a unique event ID
 * Uses timestamp + random string for uniqueness
 */
export function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `evt-${timestamp}-${randomPart}`;
}

/**
 * Generate a unique aggregate ID
 * Uses timestamp + random string for uniqueness
 */
export function generateAggregateId(prefix: string = 'agg'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Generate a UUID v4 (simple implementation)
 * For production, consider using a proper UUID library
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// END OF FILE
