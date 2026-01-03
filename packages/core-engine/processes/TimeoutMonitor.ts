/**
 * Timeout Monitor
 *
 * Monitors processes for timeout conditions and triggers appropriate actions.
 * Detects stalled processes that haven't received events within threshold.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { IProcessRepository, ProcessSnapshot } from './IProcessRepository';
import { ProcessManager } from './ProcessManager';

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /**
   * Timeout threshold in milliseconds
   */
  timeoutMs: number;

  /**
   * Check interval in milliseconds
   */
  checkIntervalMs: number;

  /**
   * Auto-fail stale processes
   */
  autoFail: boolean;

  /**
   * Auto-compensate instead of failing
   */
  autoCompensate: boolean;
}

/**
 * Timeout Monitor
 *
 * Periodically checks for stalled processes and handles them.
 * Can auto-fail or auto-compensate based on configuration.
 */
export class TimeoutMonitor {
  /**
   * Process repository for querying stale processes
   */
  private repository: IProcessRepository;

  /**
   * Process manager for lifecycle operations
   */
  private processManager: ProcessManager;

  /**
   * Timeout configuration
   */
  private config: TimeoutConfig;

  /**
   * Interval timer ID
   */
  private intervalId?: NodeJS.Timeout;

  /**
   * Monitor running flag
   */
  private isRunning: boolean = false;

  /**
   * Constructor
   *
   * @param repository - Process repository
   * @param processManager - Process manager
   * @param config - Timeout configuration
   */
  constructor(
    repository: IProcessRepository,
    processManager: ProcessManager,
    config?: Partial<TimeoutConfig>
  ) {
    this.repository = repository;
    this.processManager = processManager;
    this.config = {
      timeoutMs: config?.timeoutMs ?? 300000, // 5 minutes default
      checkIntervalMs: config?.checkIntervalMs ?? 60000, // 1 minute default
      autoFail: config?.autoFail ?? true,
      autoCompensate: config?.autoCompensate ?? false,
    };
  }

  /**
   * Start monitoring
   *
   * Begins periodic timeout checks
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.checkTimeouts();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop monitoring
   *
   * Stops periodic timeout checks
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Check for timed-out processes
   *
   * Finds stale processes and handles them based on configuration
   *
   * @returns Array of stale process snapshots
   */
  async checkTimeouts(): Promise<ProcessSnapshot[]> {
    try {
      const staleProcesses = await this.repository.findStale(this.config.timeoutMs);

      for (const snapshot of staleProcesses) {
        await this.handleStaleProcess(snapshot);
      }

      return staleProcesses;
    } catch (error) {
      console.error('Error checking timeouts:', error);
      return [];
    }
  }

  /**
   * Handle a stale process
   *
   * @param snapshot - Stale process snapshot
   */
  private async handleStaleProcess(snapshot: ProcessSnapshot): Promise<void> {
    try {
      if (this.config.autoCompensate) {
        // Auto-compensate (rollback)
        await this.processManager.compensateProcess(snapshot.processId);
      } else if (this.config.autoFail) {
        // Auto-fail with timeout reason
        const lastEventTime = snapshot.lastEventAt ?? snapshot.createdAt;
        const staleDuration = Date.now() - lastEventTime.getTime();
        const reason = `Process timeout: no events for ${staleDuration}ms (threshold: ${this.config.timeoutMs}ms)`;
        await this.processManager.failProcess(snapshot.processId, reason);
      }
    } catch (error) {
      console.error(`Error handling stale process ${snapshot.processId}:`, error);
    }
  }

  /**
   * Update timeout configuration
   *
   * @param config - Partial configuration to override
   */
  configure(config: Partial<TimeoutConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    // Restart interval if running with new check interval
    if (this.isRunning && config.checkIntervalMs) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current config (immutable copy)
   */
  getConfig(): Readonly<TimeoutConfig> {
    return { ...this.config };
  }

  /**
   * Check if monitor is running
   *
   * @returns True if monitoring, false otherwise
   */
  isMonitoring(): boolean {
    return this.isRunning;
  }
}

// END OF FILE
