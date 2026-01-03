/**
 * Process State Enumeration
 *
 * Defines the lifecycle states for Process/Saga orchestration.
 * Enables state machine pattern for long-running workflows.
 */

/**
 * Process lifecycle states
 *
 * State transitions:
 * - Pending → Running (when process starts)
 * - Running → Completed (when successful)
 * - Running → Failed (when error occurs)
 * - Running → Compensating (when rolling back)
 * - Compensating → Compensated (when rollback complete)
 */
export enum ProcessState {
  /**
   * Process has been created but not yet started
   */
  Pending = 'Pending',

  /**
   * Process is actively executing
   */
  Running = 'Running',

  /**
   * Process completed successfully
   */
  Completed = 'Completed',

  /**
   * Process failed with an error
   */
  Failed = 'Failed',

  /**
   * Process is executing compensation logic (rollback)
   */
  Compensating = 'Compensating',

  /**
   * Compensation completed successfully
   */
  Compensated = 'Compensated',
}

/**
 * Check if process is in a terminal state
 *
 * @param state - Current process state
 * @returns True if process cannot transition further
 */
export function isTerminalState(state: ProcessState): boolean {
  return (
    state === ProcessState.Completed ||
    state === ProcessState.Failed ||
    state === ProcessState.Compensated
  );
}

/**
 * Check if process can be compensated
 *
 * @param state - Current process state
 * @returns True if compensation is possible
 */
export function canCompensate(state: ProcessState): boolean {
  return (
    state === ProcessState.Running ||
    state === ProcessState.Failed
  );
}

// END OF FILE
