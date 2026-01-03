/**
 * Process Module
 *
 * Provides Process Manager pattern infrastructure for orchestrating
 * long-running workflows across multiple aggregates.
 *
 * Key Components:
 * - ProcessBase: Abstract base class for Process Managers
 * - ProcessState: Lifecycle state enumeration
 * - ProcessCommand: Command interface for process actions
 * - ProcessManager: Central orchestrator for process lifecycle
 * - ProcessRepository: Persistence layer for process state
 * - RetryPolicy: Retry strategies with exponential backoff
 * - TimeoutMonitor: Timeout detection and handling
 *
 * Examples:
 * - CreateAccountProcess: Account creation workflow
 * - JoinWorkspaceProcess: Member joining workflow
 *
 * Phase 2A: Foundation - Skeleton implementation
 * Phase 2B: Failure Compensation / State Machine - Persistence + Retry + Timeout
 */

export * from './ProcessBase';
export * from './ProcessState';
export * from './ProcessCommand';
export * from './ProcessManager';
export * from './IProcessRepository';
export * from './InMemoryProcessRepository';
export * from './RetryPolicy';
export * from './TimeoutMonitor';
export * from './examples';

// END OF FILE
