/**
 * Saga / Process Manager types
 *
 * Sagas coordinate long-running business processes that span multiple aggregates.
 * They react to events and issue commands to orchestrate complex workflows.
 *
 * Core Principles:
 * - Sagas are event-driven
 * - Sagas maintain their own state via events
 * - Sagas can trigger compensating actions
 * - Sagas handle timeouts and retries
 *
 * Example: Workspace creation saga
 * 1. WorkspaceCreated event
 * 2. Saga issues CreateDefaultModulesCommand
 * 3. Saga issues InviteOwnerCommand
 * 4. Saga completes when all modules are initialized
 */

import { DomainEvent } from '../events/domain-event';
import { Command } from '../commands/command';

/**
 * SagaStatus - Lifecycle states for a saga
 */
export type SagaStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'compensating'
  | 'compensated'
  | 'timeout'
  | 'dead-letter';

/**
 * Saga - Base interface for all sagas
 */
export interface Saga {
  /**
   * Unique saga identifier
   */
  readonly sagaId: string;

  /**
   * Current status of the saga
   */
  readonly status: SagaStatus;

  /**
   * Events that have been processed by this saga
   */
  readonly eventsHandled: string[];

  /**
   * Commands issued by this saga
   */
  readonly commandsIssued: string[];

  /**
   * Retry count for failed operations
   */
  readonly retryCount: number;

  /**
   * Maximum retries before moving to dead-letter
   */
  readonly maxRetries: number;

  /**
   * Timeout deadline (ISO timestamp)
   */
  readonly timeoutAt?: string;

  /**
   * Workspace boundary
   */
  readonly blueprintId?: string;

  /**
   * Saga metadata
   */
  readonly metadata: SagaMetadata;
}

/**
 * SagaMetadata - Additional context for saga execution
 */
export interface SagaMetadata {
  /**
   * Initiating event ID
   */
  readonly initiatedBy: string;

  /**
   * Account that triggered the saga
   */
  readonly initiatedByUser: string;

  /**
   * When the saga started
   */
  readonly startedAt: string;

  /**
   * When the saga completed or failed
   */
  readonly completedAt?: string;

  /**
   * Error information if saga failed
   */
  readonly error?: string;

  /**
   * Correlation ID for tracking
   */
  readonly correlationId?: string;
}

/**
 * ProcessManager - Abstract base for implementing sagas
 */
export abstract class ProcessManager {
  protected sagaId: string;
  protected status: SagaStatus = 'pending';
  protected eventsHandled: string[] = [];
  protected commandsIssued: string[] = [];

  constructor(sagaId: string) {
    this.sagaId = sagaId;
  }

  /**
   * Handle an incoming domain event
   * Subclasses implement this to react to events
   */
  abstract handle(event: DomainEvent): Promise<Command[]>;

  /**
   * Check if saga can handle this event type
   */
  abstract canHandle(eventType: string): boolean;

  /**
   * Get saga state for persistence
   */
  public getState(): Saga {
    return {
      sagaId: this.sagaId,
      status: this.status,
      eventsHandled: this.eventsHandled,
      commandsIssued: this.commandsIssued,
      retryCount: 0,
      maxRetries: 3,
      metadata: {
        initiatedBy: '',
        initiatedByUser: '',
        startedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Mark event as handled
   */
  protected markEventHandled(eventId: string): void {
    this.eventsHandled.push(eventId);
  }

  /**
   * Mark command as issued
   */
  protected markCommandIssued(commandId: string): void {
    this.commandsIssued.push(commandId);
  }
}

// END OF FILE
