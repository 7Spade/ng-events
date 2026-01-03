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
 *
 * Examples:
 * - CreateAccountProcess: Account creation workflow
 * - JoinWorkspaceProcess: Member joining workflow
 *
 * 🔒 Phase 2A Foundation - Skeleton implementation
 */

export * from './ProcessBase';
export * from './ProcessState';
export * from './ProcessCommand';
export * from './examples';

// END OF FILE
