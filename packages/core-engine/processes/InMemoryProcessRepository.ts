/**
 * In-Memory Process Repository
 *
 * Simple in-memory implementation of IProcessRepository for testing and development.
 * Data is NOT persisted - lost on process restart.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { IProcessRepository, ProcessSnapshot } from './IProcessRepository';
import { ProcessState } from './ProcessState';

/**
 * In-Memory Process Repository
 *
 * Stores process snapshots in memory using Map.
 * Useful for testing and development without Firestore dependency.
 */
export class InMemoryProcessRepository implements IProcessRepository {
  /**
   * In-memory storage (processId → snapshot)
   */
  private store: Map<string, ProcessSnapshot> = new Map();

  /**
   * Save process snapshot
   *
   * @param snapshot - Process snapshot to save
   */
  async save(snapshot: ProcessSnapshot): Promise<void> {
    // Create defensive copy to prevent external mutations
    const copy = { ...snapshot, updatedAt: new Date() };
    this.store.set(snapshot.processId, copy);
  }

  /**
   * Load process snapshot by ID
   *
   * @param processId - Process identifier
   * @returns Process snapshot or null if not found
   */
  async load(processId: string): Promise<ProcessSnapshot | null> {
    const snapshot = this.store.get(processId);
    return snapshot ? { ...snapshot } : null; // Return defensive copy
  }

  /**
   * Delete process snapshot
   *
   * @param processId - Process identifier
   */
  async delete(processId: string): Promise<void> {
    this.store.delete(processId);
  }

  /**
   * Find processes by state
   *
   * @param state - Process state to filter by
   * @returns Array of matching process snapshots
   */
  async findByState(state: ProcessState): Promise<ProcessSnapshot[]> {
    const results: ProcessSnapshot[] = [];
    for (const snapshot of this.store.values()) {
      if (snapshot.state === state) {
        results.push({ ...snapshot }); // Defensive copy
      }
    }
    return results;
  }

  /**
   * Find processes by correlation ID
   *
   * @param correlationId - Correlation ID to search
   * @returns Array of matching process snapshots
   */
  async findByCorrelationId(correlationId: string): Promise<ProcessSnapshot[]> {
    const results: ProcessSnapshot[] = [];
    for (const snapshot of this.store.values()) {
      if (snapshot.correlationId === correlationId) {
        results.push({ ...snapshot }); // Defensive copy
      }
    }
    return results;
  }

  /**
   * Find stale processes (no events within timeout)
   *
   * @param timeoutMs - Timeout threshold in milliseconds
   * @returns Array of stale process snapshots
   */
  async findStale(timeoutMs: number): Promise<ProcessSnapshot[]> {
    const now = Date.now();
    const threshold = now - timeoutMs;
    const results: ProcessSnapshot[] = [];

    for (const snapshot of this.store.values()) {
      // Skip terminal states (Completed/Failed/Compensated)
      if (
        snapshot.state === ProcessState.Completed ||
        snapshot.state === ProcessState.Failed ||
        snapshot.state === ProcessState.Compensated
      ) {
        continue;
      }

      // Check if last event time exceeds threshold
      const lastEventTime = snapshot.lastEventAt?.getTime() ?? snapshot.createdAt.getTime();
      if (lastEventTime < threshold) {
        results.push({ ...snapshot }); // Defensive copy
      }
    }

    return results;
  }

  /**
   * Count processes by state
   *
   * @param state - Process state to count (optional, counts all if omitted)
   * @returns Count of processes
   */
  async count(state?: ProcessState): Promise<number> {
    if (state === undefined) {
      return this.store.size;
    }

    let count = 0;
    for (const snapshot of this.store.values()) {
      if (snapshot.state === state) {
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all stored processes (testing utility)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get all processes (testing utility)
   *
   * @returns Array of all process snapshots
   */
  getAll(): ProcessSnapshot[] {
    return Array.from(this.store.values()).map((s) => ({ ...s }));
  }
}

// END OF FILE
