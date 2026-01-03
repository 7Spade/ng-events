/**
 * WorkspaceId
 *
 * Unique identifier for Workspace aggregate.
 */
export type WorkspaceId = string;

/**
 * WorkspaceId Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Provides validation and encapsulation for workspace identifiers.
 */
export class WorkspaceIdVO {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Factory method to create WorkspaceId instance
   * @param value - The workspace identifier string (UUID format)
   * @returns WorkspaceIdVO instance
   * @throws Error if value is invalid
   */
  static create(value: string): WorkspaceIdVO {
    if (!this.validate(value)) {
      throw new Error('Invalid WorkspaceId format: must be a valid UUID');
    }
    return new WorkspaceIdVO(value);
  }

  /**
   * Validates the workspace identifier
   * @param value - The workspace identifier to validate
   * @returns true if valid UUID format
   */
  static validate(value: string): boolean {
    // UUID v4 format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && value.length > 0 && uuidRegex.test(value);
  }

  /**
   * Gets the raw value
   * @returns The workspace identifier string
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Checks equality with another WorkspaceIdVO
   * @param other - Another WorkspaceIdVO instance
   * @returns true if values are equal
   */
  equals(other: WorkspaceIdVO): boolean {
    if (!other || !(other instanceof WorkspaceIdVO)) {
      return false;
    }
    return this.value === other.value;
  }
}

// END OF FILE
