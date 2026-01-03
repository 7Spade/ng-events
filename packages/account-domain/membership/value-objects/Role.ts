/**
 * Membership role within a workspace.
 */
export type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer';

/**
 * Role Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents membership roles with validation.
 */
export class RoleVO {
  readonly value: Role;

  private constructor(value: Role) {
    this.value = value;
  }

  /**
   * Factory method to create Role instance
   * @param value - The role value
   * @returns RoleVO instance
   */
  static create(value: Role): RoleVO {
    // TODO: Implement validation logic (valid role check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the role
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The role string
   */
  getValue(): Role {
    return this.value;
  }

  /**
   * Checks equality with another RoleVO
   * @param other - Another RoleVO instance
   * @returns true if values are equal
   */
  equals(other: RoleVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}

// END OF FILE
