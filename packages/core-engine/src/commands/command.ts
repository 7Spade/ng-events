/**
 * Command - Base interface for all commands
 *
 * Commands represent intentions to change state. They are requests that may be
 * accepted or rejected by the domain.
 *
 * Core Principles:
 * - Commands are imperative (verb + noun: CreateAccount, InviteMember)
 * - Commands MUST include actor information (who is requesting)
 * - Commands MUST include blueprintId for workspace-scoped operations
 * - Commands may be rejected (validation, business rules)
 */
export interface Command<T = any> {
  /**
   * Unique identifier for this command
   */
  readonly commandId: string;

  /**
   * Type of the command (e.g., 'CreateAccountCommand', 'InviteMemberCommand')
   */
  readonly commandType: string;

  /**
   * Command payload/data
   */
  readonly data: T;

  /**
   * Command metadata (actor, workspace context, etc.)
   */
  readonly metadata: CommandMetadata;
}

/**
 * CommandMetadata - Actor and context information
 *
 * Every command MUST include this metadata for:
 * - Authorization (who is making the request)
 * - Multi-tenant boundary enforcement
 * - Causality tracking when events are produced
 */
export interface CommandMetadata {
  /**
   * ID of the account executing this command
   */
  readonly actorAccountId: string;

  /**
   * Workspace context (blueprintId boundary)
   * Required for workspace-scoped commands
   * NULL/undefined for system-level commands (e.g., CreateAccount)
   */
  readonly blueprintId?: string;

  /**
   * Timestamp when the command was issued (ISO 8601)
   */
  readonly issuedAt: string;

  /**
   * Correlation ID for tracking related commands/events
   */
  readonly correlationId?: string;

  /**
   * Idempotency key to prevent duplicate command execution
   */
  readonly idempotencyKey?: string;

  /**
   * Action description (for causality tracking in resulting events)
   */
  readonly action: string;
}

// END OF FILE
