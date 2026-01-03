/**
 * Process Repository Interface
 *
 * Defines persistence contract for Process Manager state.
 * Supports multiple implementations (in-memory, Firestore, etc.)
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { ProcessState } from './ProcessState';

/**
 * Persisted process snapshot
 *
 * Serializable representation of process state
 */
export interface ProcessSnapshot<TState = unknown> {
  /**
   * Unique process identifier
   */
  processId: string;

  /**
   * Process type (e.g., 'CreateAccountProcess')
   */
  processType: string;

  /**
   * Current lifecycle state
   */
  state: ProcessState;

  /**
   * Correlation ID for event tracking
   */
  correlationId: string;

  /**
   * Process-specific state data
   */
  processState: TState;

  /**
   * Timestamp when process was created
   */
  createdAt: Date;

  /**
   * Timestamp when process was last updated
   */
  updatedAt: Date;

  /**
   * Optional failure reason (if state is Failed)
   */
  failureReason?: string;

  /**
   * Retry attempt count
   */
  retryCount: number;

  /**
   * Timestamp when process last received an event
   */
  lastEventAt?: Date;
}

/**
 * Process Repository Interface
 *
 * Abstract contract for process persistence.
 * Implementations: InMemoryProcessRepository, FirestoreProcessRepository
 */
export interface IProcessRepository {
  /**
   * Save process snapshot
   *
   * Creates or updates process state in storage.
   *
   * @param snapshot - Process snapshot to save
   */
  save(snapshot: ProcessSnapshot): Promise<void>;

  /**
   * Load process snapshot by ID
   *
   * @param processId - Process identifier
   * @returns Process snapshot or null if not found
   */
  load(processId: string): Promise<ProcessSnapshot | null>;

  /**
   * Delete process snapshot
   *
   * @param processId - Process identifier
   */
  delete(processId: string): Promise<void>;

  /**
   * Find processes by state
   *
   * @param state - Process state to filter by
   * @returns Array of matching process snapshots
   */
  findByState(state: ProcessState): Promise<ProcessSnapshot[]>;

  /**
   * Find processes by correlation ID
   *
   * @param correlationId - Correlation ID to search
   * @returns Array of matching process snapshots
   */
  findByCorrelationId(correlationId: string): Promise<ProcessSnapshot[]>;

  /**
   * Find stale processes (no events within timeout)
   *
   * @param timeoutMs - Timeout threshold in milliseconds
   * @returns Array of stale process snapshots
   */
  findStale(timeoutMs: number): Promise<ProcessSnapshot[]>;

  /**
   * Count processes by state
   *
   * @param state - Process state to count (optional, counts all if omitted)
   * @returns Count of processes
   */
  count(state?: ProcessState): Promise<number>;
}

// END OF FILE
