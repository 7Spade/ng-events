/**
 * DomainEvent - Base interface for all domain events
 *
 * All events in the system must implement this interface and include causality metadata.
 * Events are immutable records of business-significant occurrences.
 *
 * Core Principles:
 * - Events are facts that happened (past tense naming: TaskCreated, MemberInvited)
 * - Events MUST include causality metadata (causedBy, causedByUser, causedByAction)
 * - Events MUST include blueprintId for multi-tenant boundary enforcement
 * - Events are immutable once created
 */
export interface DomainEvent<T = any> {
  /**
   * Unique identifier for this event
   */
  readonly eventId: string;

  /**
   * Type of the event (e.g., 'AccountCreated', 'WorkspaceCreated')
   */
  readonly eventType: string;

  /**
   * ID of the aggregate that produced this event
   */
  readonly aggregateId: string;

  /**
   * Type of the aggregate (e.g., 'Account', 'Workspace')
   */
  readonly aggregateType: string;

  /**
   * Version number of the aggregate when this event was created
   */
  readonly version: number;

  /**
   * Event payload/data
   */
  readonly data: T;

  /**
   * Causality and multi-tenant metadata
   */
  readonly metadata: EventMetadata;
}

/**
 * EventMetadata - Causality tracking and multi-tenant boundary
 *
 * Every event MUST include this metadata for:
 * - Causality tracking (which event/command caused this)
 * - Multi-tenant isolation (blueprintId boundary)
 * - Audit trail (who triggered, when, why)
 */
export interface EventMetadata {
  /**
   * ID of the parent event or command that caused this event
   * Forms the causality chain for event tracing
   */
  readonly causedBy: string;

  /**
   * ID of the user/account that triggered the action
   */
  readonly causedByUser: string;

  /**
   * Description of the action that caused this event
   * (e.g., 'CreateAccountCommand', 'InviteMemberCommand')
   */
  readonly causedByAction: string;

  /**
   * Workspace boundary (multi-tenant container ID)
   * MUST be present for all workspace-scoped events
   * NULL/undefined only for system-level Account creation events
   */
  readonly blueprintId?: string;

  /**
   * Timestamp when the event occurred (ISO 8601)
   */
  readonly timestamp: string;

  /**
   * Correlation ID for tracking related events across aggregates
   */
  readonly correlationId?: string;

  /**
   * Idempotency key to prevent duplicate event processing
   */
  readonly idempotencyKey?: string;
}

// END OF FILE
