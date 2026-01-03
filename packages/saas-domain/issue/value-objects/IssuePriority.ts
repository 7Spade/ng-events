/**
 * IssuePriority Value Object
 */
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * IssuePriority Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents issue priority levels with validation.
 */
export class IssuePriorityVO {
  readonly value: IssuePriority;

  private constructor(value: IssuePriority) {
    this.value = value;
  }

  /**
   * Factory method to create IssuePriority instance
   * @param value - The issue priority value
   * @returns IssuePriorityVO instance
   */
  static create(value: IssuePriority): IssuePriorityVO {
    // TODO: Implement validation logic (valid priority check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the issue priority
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The issue priority string
   */
  getValue(): IssuePriority {
    return this.value;
  }

  /**
   * Checks equality with another IssuePriorityVO
   * @param other - Another IssuePriorityVO instance
   * @returns true if values are equal
   */
  equals(other: IssuePriorityVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
