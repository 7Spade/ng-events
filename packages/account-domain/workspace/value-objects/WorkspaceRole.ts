/**
 * WorkspaceRole
 *
 * Role that defines workspace-level responsibilities.
 * This mirrors membership roles but scoped to workspace operations.
 */
export type WorkspaceRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

/**
 * WorkspaceRole Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents workspace role assignments with validation.
 */
export class WorkspaceRoleVO {
  readonly value: WorkspaceRole;

  private constructor(value: WorkspaceRole) {
    this.value = value;
  }

  /**
   * Factory method to create WorkspaceRole instance
   * @param value - The workspace role value
   * @returns WorkspaceRoleVO instance
   */
  static create(value: WorkspaceRole): WorkspaceRoleVO {
    // TODO: Implement validation logic (valid role check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the workspace role
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The workspace role string
   */
  getValue(): WorkspaceRole {
    return this.value;
  }

  /**
   * Checks equality with another WorkspaceRoleVO
   * @param other - Another WorkspaceRoleVO instance
   * @returns true if values are equal
   */
  equals(other: WorkspaceRoleVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}

// END OF FILE
