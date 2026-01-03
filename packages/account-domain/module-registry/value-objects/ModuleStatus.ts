/**
 * ModuleStatus
 *
 * Indicates whether a module is available in a workspace.
 */
export type ModuleStatus = 'enabled' | 'disabled';

/**
 * ModuleStatus Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents module status states with validation.
 */
export class ModuleStatusVO {
  readonly value: ModuleStatus;

  private constructor(value: ModuleStatus) {
    this.value = value;
  }

  /**
   * Factory method to create ModuleStatus instance
   * @param value - The module status value
   * @returns ModuleStatusVO instance
   */
  static create(value: ModuleStatus): ModuleStatusVO {
    // TODO: Implement validation logic (valid status check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the module status
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The module status string
   */
  getValue(): ModuleStatus {
    return this.value;
  }

  /**
   * Checks equality with another ModuleStatusVO
   * @param other - Another ModuleStatusVO instance
   * @returns true if values are equal
   */
  equals(other: ModuleStatusVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}

// END OF FILE
