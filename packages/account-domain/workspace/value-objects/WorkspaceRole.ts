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

  private static readonly VALID_ROLES: WorkspaceRole[] = ['Owner', 'Admin', 'Member', 'Viewer'];

  private constructor(value: WorkspaceRole) {
    this.value = value;
  }

  /**
   * Factory method to create WorkspaceRole instance
   * @param value - The workspace role value
   * @returns WorkspaceRoleVO instance
   * @throws Error if value is invalid
   */
  static create(value: string): WorkspaceRoleVO {
    if (!this.validate(value)) {
      throw new Error(`Invalid WorkspaceRole: must be one of ${this.VALID_ROLES.join(', ')}`);
    }
    return new WorkspaceRoleVO(value as WorkspaceRole);
  }

  /**
   * Validates the workspace role
   * @param value - The workspace role to validate
   * @returns true if valid role
   */
  static validate(value: string): boolean {
    return typeof value === 'string' && this.VALID_ROLES.includes(value as WorkspaceRole);
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
    if (!other || !(other instanceof WorkspaceRoleVO)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Check if role has higher or equal permission level
   * @param other - Another WorkspaceRoleVO instance
   * @returns true if this role has higher or equal permission
   */
  hasHigherOrEqualPermission(other: WorkspaceRoleVO): boolean {
    const roleHierarchy: Record<WorkspaceRole, number> = {
      'Owner': 4,
      'Admin': 3,
      'Member': 2,
      'Viewer': 1
    };
    return roleHierarchy[this.value] >= roleHierarchy[other.value];
  }
}

// END OF FILE
