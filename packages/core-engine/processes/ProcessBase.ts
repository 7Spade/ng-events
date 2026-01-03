/**
 * Process Base Class
 *
 * Abstract base for Process Manager pattern (Orchestration).
 * Manages stateful, long-running workflows across multiple aggregates.
 *
 * Key Features:
 * - State machine lifecycle (Pending → Running → Completed/Failed)
 * - Event handling with command emission
 * - Compensation support for rollback
 * - Correlation tracking for workflow context
 *
 * 🔒 SKELETON ONLY - Phase 2A foundation
 */

import { DomainEvent } from '../event-store';
import { ProcessState, isTerminalState, canCompensate } from './ProcessState';
import { ProcessCommand } from './ProcessCommand';

/**
 * Abstract Process Base Class
 *
 * Extend this for concrete Process Managers.
 * Implements orchestration pattern for multi-aggregate workflows.
 */
export abstract class ProcessBase<TState = unknown> {
  /**
   * Unique process instance identifier
   */
  protected processId: string;

  /**
   * Current lifecycle state
   */
  protected state: ProcessState;

  /**
   * Process-specific state data
   */
  protected processState: TState;

  /**
   * Correlation ID for tracking related events
   */
  protected correlationId: string;

  /**
   * Commands to emit (pending)
   */
  private pendingCommands: ProcessCommand[] = [];

  /**
   * Constructor
   *
   * @param processId - Unique process identifier
   * @param correlationId - Correlation ID for event tracking
   * @param initialState - Initial process-specific state
   */
  constructor(
    processId: string,
    correlationId: string,
    initialState: TState
  ) {
    this.processId = processId;
    this.correlationId = correlationId;
    this.state = ProcessState.Pending;
    this.processState = initialState;
  }

  /**
   * Start the process
   *
   * Transitions from Pending → Running
   *
   * @throws Error if process already started
   */
  start(): void {
    if (this.state !== ProcessState.Pending) {
      throw new Error(
        `Process ${this.processId} cannot start - current state: ${this.state}`
      );
    }

    this.state = ProcessState.Running;
    this.onStart();
  }

  /**
   * React to a domain event
   *
   * Processes the event and may emit commands.
   *
   * @param event - Domain event to handle
   * @returns Array of commands to execute
   * @throws Error if process in terminal state
   */
  async react(event: DomainEvent): Promise<ProcessCommand[]> {
    if (isTerminalState(this.state)) {
      throw new Error(
        `Process ${this.processId} cannot react - in terminal state: ${this.state}`
      );
    }

    // Clear pending commands
    this.pendingCommands = [];

    // Handle the event (subclass implementation)
    await this.handleEvent(event);

    // Return emitted commands
    return this.pendingCommands;
  }

  /**
   * Complete the process successfully
   *
   * Transitions to Completed state
   *
   * @throws Error if not in Running state
   */
  complete(): void {
    if (this.state !== ProcessState.Running) {
      throw new Error(
        `Process ${this.processId} cannot complete - current state: ${this.state}`
      );
    }

    this.state = ProcessState.Completed;
    this.onComplete();
  }

  /**
   * Fail the process
   *
   * Transitions to Failed state
   *
   * @param reason - Failure reason
   * @throws Error if already in terminal state
   */
  fail(reason: string): void {
    if (isTerminalState(this.state)) {
      throw new Error(
        `Process ${this.processId} cannot fail - already in terminal state: ${this.state}`
      );
    }

    this.state = ProcessState.Failed;
    this.onFail(reason);
  }

  /**
   * Compensate the process (rollback)
   *
   * Transitions to Compensating state
   *
   * @throws Error if compensation not possible
   */
  async compensate(): Promise<void> {
    if (!canCompensate(this.state)) {
      throw new Error(
        `Process ${this.processId} cannot compensate - current state: ${this.state}`
      );
    }

    this.state = ProcessState.Compensating;
    await this.onCompensate();
    this.state = ProcessState.Compensated;
  }

  /**
   * Emit a command for execution
   *
   * @param command - Command to emit
   */
  protected emitCommand(command: ProcessCommand): void {
    this.pendingCommands.push(command);
  }

  /**
   * Get current process state
   *
   * @returns Current ProcessState
   */
  getState(): ProcessState {
    return this.state;
  }

  /**
   * Get process ID
   *
   * @returns Process identifier
   */
  getProcessId(): string {
    return this.processId;
  }

  /**
   * Get correlation ID
   *
   * @returns Correlation identifier
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Hook: Called when process starts
   *
   * Override to execute initialization logic
   */
  protected onStart(): void {
    // Default: no-op
  }

  /**
   * Hook: Called when process completes
   *
   * Override to execute cleanup logic
   */
  protected onComplete(): void {
    // Default: no-op
  }

  /**
   * Hook: Called when process fails
   *
   * @param reason - Failure reason
   */
  protected onFail(reason: string): void {
    // Default: no-op
  }

  /**
   * Hook: Called during compensation
   *
   * Override to implement rollback logic
   */
  protected async onCompensate(): Promise<void> {
    // Default: no-op
  }

  /**
   * Abstract: Handle domain event
   *
   * Implement event-specific logic in subclasses.
   *
   * @param event - Domain event to handle
   */
  protected abstract handleEvent(event: DomainEvent): Promise<void>;
}

// END OF FILE
