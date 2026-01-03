/**
 * IssueStatus Value Object
 */
export type IssueStatus = 'open' | 'in_progress' | 'closed' | 'reopened';

/**
 * IssueStatus Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents issue states with validation.
 */
export class IssueStatusVO {
  readonly value: IssueStatus;

  private constructor(value: IssueStatus) {
    this.value = value;
  }

  /**
   * Factory method to create IssueStatus instance
   * @param value - The issue status value
   * @returns IssueStatusVO instance
   */
  static create(value: IssueStatus): IssueStatusVO {
    // TODO: Implement validation logic (valid status check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the issue status
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The issue status string
   */
  getValue(): IssueStatus {
    return this.value;
  }

  /**
   * Checks equality with another IssueStatusVO
   * @param other - Another IssueStatusVO instance
   * @returns true if values are equal
   */
  equals(other: IssueStatusVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
