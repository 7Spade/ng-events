/**
 * Process Manager
 *
 * Orchestrates process lifecycle and event routing.
 * Manages process registry, persistence, and coordination.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { DomainEvent } from '../event-store';
import { ProcessBase } from './ProcessBase';
import { ProcessState, isTerminalState } from './ProcessState';
import { IProcessRepository, ProcessSnapshot } from './IProcessRepository';
import { RetryPolicy } from './RetryPolicy';
import { ProcessCommand } from './ProcessCommand';

/**
 * Process factory function
 *
 * Creates a new process instance from a snapshot
 */
export type ProcessFactory<T extends ProcessBase = ProcessBase> = (
  snapshot: ProcessSnapshot
) => T;

/**
 * Process Manager
 *
 * Central orchestrator for Process Manager pattern.
 * Handles event routing, lifecycle management, and persistence.
 */
export class ProcessManager {
  /**
   * Active process registry (processId → process instance)
   */
  private processes: Map<string, ProcessBase> = new Map();

  /**
   * Process factories (processType → factory function)
   */
  private factories: Map<string, ProcessFactory> = new Map();

  /**
   * Process repository for persistence
   */
  private repository: IProcessRepository;

  /**
   * Retry policy for failed operations
   */
  private retryPolicy: RetryPolicy;

  /**
   * Constructor
   *
   * @param repository - Process persistence repository
   * @param retryPolicy - Retry policy (optional, defaults to new instance)
   */
  constructor(repository: IProcessRepository, retryPolicy?: RetryPolicy) {
    this.repository = repository;
    this.retryPolicy = retryPolicy ?? new RetryPolicy();
  }

  /**
   * Register a process factory
   *
   * @param processType - Process type identifier
   * @param factory - Factory function to create process from snapshot
   */
  registerFactory(processType: string, factory: ProcessFactory): void {
    this.factories.set(processType, factory);
  }

  /**
   * Start a new process
   *
   * @param process - Process instance to start
   * @param processType - Process type identifier
   */
  async startProcess(process: ProcessBase, processType: string): Promise<void> {
    // Validate process not already started
    const existingProcess = this.processes.get(process.getProcessId());
    if (existingProcess) {
      throw new Error(`Process ${process.getProcessId()} already exists`);
    }

    // Start the process
    process.start();

    // Register in memory
    this.processes.set(process.getProcessId(), process);

    // Persist initial state
    await this.saveProcess(process, processType);
  }

  /**
   * Route event to all active processes
   *
   * Delivers event to processes that match correlation ID.
   *
   * @param event - Domain event to route
   * @returns Array of commands emitted by processes
   */
  async routeEvent(event: DomainEvent): Promise<ProcessCommand[]> {
    const allCommands: ProcessCommand[] = [];

    // Find processes by correlation ID
    const snapshots = await this.repository.findByCorrelationId(event.metadata.correlationId);

    for (const snapshot of snapshots) {
      // Skip terminal states
      if (isTerminalState(snapshot.state)) {
        continue;
      }

      // Load or get process instance
      let process = this.processes.get(snapshot.processId);
      if (!process) {
        process = await this.loadProcess(snapshot);
        if (!process) continue;
      }

      try {
        // React to event - may emit commands
        const commands = await process.react(event);
        allCommands.push(...commands);

        // Update last event timestamp
        snapshot.lastEventAt = new Date();

        // Persist updated state
        await this.saveProcess(process, snapshot.processType);

        // Record success for circuit breaker
        this.retryPolicy.recordSuccess();
      } catch (error) {
        // Handle failure
        await this.handleProcessFailure(process, snapshot, error as Error);
      }
    }

    return allCommands;
  }

  /**
   * Complete a process
   *
   * @param processId - Process identifier
   */
  async completeProcess(processId: string): Promise<void> {
    const snapshot = await this.repository.load(processId);
    if (!snapshot) {
      throw new Error(`Process ${processId} not found`);
    }

    const process = this.processes.get(processId);
    if (process) {
      process.complete();
      await this.saveProcess(process, snapshot.processType);
    } else {
      // Update snapshot directly if not in memory
      snapshot.state = ProcessState.Completed;
      snapshot.updatedAt = new Date();
      await this.repository.save(snapshot);
    }
  }

  /**
   * Fail a process
   *
   * @param processId - Process identifier
   * @param reason - Failure reason
   */
  async failProcess(processId: string, reason: string): Promise<void> {
    const snapshot = await this.repository.load(processId);
    if (!snapshot) {
      throw new Error(`Process ${processId} not found`);
    }

    const process = this.processes.get(processId);
    if (process) {
      process.fail(reason);
      await this.saveProcess(process, snapshot.processType);
    } else {
      // Update snapshot directly if not in memory
      snapshot.state = ProcessState.Failed;
      snapshot.failureReason = reason;
      snapshot.updatedAt = new Date();
      await this.repository.save(snapshot);
    }
  }

  /**
   * Compensate a process (rollback)
   *
   * @param processId - Process identifier
   */
  async compensateProcess(processId: string): Promise<void> {
    const snapshot = await this.repository.load(processId);
    if (!snapshot) {
      throw new Error(`Process ${processId} not found`);
    }

    const process = this.processes.get(processId) ?? (await this.loadProcess(snapshot));
    if (!process) {
      throw new Error(`Cannot load process ${processId}`);
    }

    try {
      await process.compensate();
      await this.saveProcess(process, snapshot.processType);
    } catch (error) {
      throw new Error(`Compensation failed for ${processId}: ${(error as Error).message}`);
    }
  }

  /**
   * Query processes by state
   *
   * @param state - Process state to filter by
   * @returns Array of process snapshots
   */
  async queryByState(state: ProcessState): Promise<ProcessSnapshot[]> {
    return this.repository.findByState(state);
  }

  /**
   * Query processes by correlation ID
   *
   * @param correlationId - Correlation ID to search
   * @returns Array of process snapshots
   */
  async queryByCorrelationId(correlationId: string): Promise<ProcessSnapshot[]> {
    return this.repository.findByCorrelationId(correlationId);
  }

  /**
   * Get process count
   *
   * @param state - Optional state filter
   * @returns Count of processes
   */
  async getCount(state?: ProcessState): Promise<number> {
    return this.repository.count(state);
  }

  /**
   * Save process state to repository
   *
   * @param process - Process instance
   * @param processType - Process type identifier
   */
  private async saveProcess(process: ProcessBase, processType: string): Promise<void> {
    const snapshot: ProcessSnapshot = {
      processId: process.getProcessId(),
      processType,
      state: process.getState(),
      correlationId: process.getCorrelationId(),
      processState: (process as any).processState, // Access protected field
      createdAt: (process as any).createdAt ?? new Date(),
      updatedAt: new Date(),
      retryCount: (process as any).retryCount ?? 0,
      lastEventAt: new Date(),
    };

    await this.repository.save(snapshot);
  }

  /**
   * Load process from snapshot
   *
   * @param snapshot - Process snapshot
   * @returns Process instance or null if factory not registered
   */
  private async loadProcess(snapshot: ProcessSnapshot): Promise<ProcessBase | null> {
    const factory = this.factories.get(snapshot.processType);
    if (!factory) {
      console.warn(`No factory registered for process type: ${snapshot.processType}`);
      return null;
    }

    const process = factory(snapshot);
    this.processes.set(snapshot.processId, process);
    return process;
  }

  /**
   * Handle process failure with retry logic
   *
   * @param process - Process instance
   * @param snapshot - Process snapshot
   * @param error - Error that occurred
   */
  private async handleProcessFailure(
    process: ProcessBase,
    snapshot: ProcessSnapshot,
    error: Error
  ): Promise<void> {
    snapshot.retryCount = (snapshot.retryCount ?? 0) + 1;

    // Record failure for circuit breaker
    this.retryPolicy.recordFailure();

    // Check if should retry
    if (this.retryPolicy.shouldRetry(snapshot.retryCount, error)) {
      // Will retry - persist snapshot with incremented count
      snapshot.updatedAt = new Date();
      await this.repository.save(snapshot);
    } else {
      // Max retries exceeded - fail the process
      process.fail(`Max retries exceeded: ${error.message}`);
      snapshot.state = ProcessState.Failed;
      snapshot.failureReason = error.message;
      snapshot.updatedAt = new Date();
      await this.repository.save(snapshot);
    }
  }
}

// END OF FILE
