/**
 * TaskStatus Value Object
 * 
 * Represents the possible states of a task.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * TaskStatus Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents task states with validation.
 */
export class TaskStatusVO {
  readonly value: TaskStatus;

  private constructor(value: TaskStatus) {
    this.value = value;
  }

  /**
   * Factory method to create TaskStatus instance
   * @param value - The task status value
   * @returns TaskStatusVO instance
   */
  static create(value: TaskStatus): TaskStatusVO {
    // TODO: Implement validation logic (valid status check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the task status
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The task status string
   */
  getValue(): TaskStatus {
    return this.value;
  }

  /**
   * Checks equality with another TaskStatusVO
   * @param other - Another TaskStatusVO instance
   * @returns true if values are equal
   */
  equals(other: TaskStatusVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
