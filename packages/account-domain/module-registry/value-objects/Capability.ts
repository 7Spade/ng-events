/**
 * Capability
 *
 * Describes a module capability exposed to the workspace.
 */
export type Capability = string;

/**
 * Capability Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents module capabilities with validation.
 */
export class CapabilityVO {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Factory method to create Capability instance
   * @param value - The capability string
   * @returns CapabilityVO instance
   */
  static create(value: string): CapabilityVO {
    // TODO: Implement validation logic (non-empty, format check, etc.)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the capability
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The capability string
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Checks equality with another CapabilityVO
   * @param other - Another CapabilityVO instance
   * @returns true if values are equal
   */
  equals(other: CapabilityVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}

// END OF FILE
