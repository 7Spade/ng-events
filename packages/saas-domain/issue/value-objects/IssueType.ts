/**
 * IssueType Value Object
 */
export type IssueType = 'bug' | 'feature' | 'enhancement' | 'task';

/**
 * IssueType Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents issue types with validation.
 */
export class IssueTypeVO {
  readonly value: IssueType;

  private constructor(value: IssueType) {
    this.value = value;
  }

  /**
   * Factory method to create IssueType instance
   * @param value - The issue type value
   * @returns IssueTypeVO instance
   */
  static create(value: IssueType): IssueTypeVO {
    // TODO: Implement validation logic (valid type check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the issue type
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The issue type string
   */
  getValue(): IssueType {
    return this.value;
  }

  /**
   * Checks equality with another IssueTypeVO
   * @param other - Another IssueTypeVO instance
   * @returns true if values are equal
   */
  equals(other: IssueTypeVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
