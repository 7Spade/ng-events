/**
 * TaskPriority Value Object
 * 
 * Represents the priority level of a task.
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * TaskPriority Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents task priority levels with validation.
 */
export class TaskPriorityVO {
  readonly value: TaskPriority;

  private constructor(value: TaskPriority) {
    this.value = value;
  }

  /**
   * Factory method to create TaskPriority instance
   * @param value - The task priority value
   * @returns TaskPriorityVO instance
   */
  static create(value: TaskPriority): TaskPriorityVO {
    // TODO: Implement validation logic (valid priority check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the task priority
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The task priority string
   */
  getValue(): TaskPriority {
    return this.value;
  }

  /**
   * Checks equality with another TaskPriorityVO
   * @param other - Another TaskPriorityVO instance
   * @returns true if values are equal
   */
  equals(other: TaskPriorityVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
