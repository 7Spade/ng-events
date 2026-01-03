import { AggregateRoot, CausalityMetadataFactory } from '@ng-events/core-engine';
import { generateEventId } from '@ng-events/core-engine/utils/id-generator';

import { WorkspaceArchived, WorkspaceArchivedPayload, WorkspaceStatus } from '../events/WorkspaceArchived';
import { WorkspaceCreated, WorkspaceCreatedPayload } from '../events/WorkspaceCreated';
import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceId } from '../value-objects/WorkspaceId';

/**
 * Workspace Aggregate State
 * 
 * Represents the internal state of a Workspace aggregate.
 */
export interface WorkspaceState {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  status: WorkspaceStatus;
  createdAt: string;
}

/**
 * Union type of all Workspace events
 */
export type WorkspaceEvent = WorkspaceCreated | WorkspaceArchived;

/**
 * Workspace Aggregate Root
 *
 * Represents a working environment owned by an account.
 * Follows the AggregateRoot<TEvent, TId, TState> pattern.
 */
export class Workspace extends AggregateRoot<WorkspaceEvent, WorkspaceId, WorkspaceState> {
  /**
   * Aggregate identifier (required by AggregateRoot)
   */
  readonly id: WorkspaceId;

  /**
   * Aggregate type name (required by AggregateRoot)
   */
  readonly type = 'Workspace';

  /**
   * Private constructor - forces use of factory methods
   * 
   * @param id - Workspace identifier
   */
  private constructor(id: WorkspaceId) {
    super();
    this.id = id;
  }

  /**
   * Factory method - Create a new Workspace aggregate
   * 
   * @param params - Workspace creation parameters
   * @returns New Workspace instance with WorkspaceCreated event raised
   */
  static create(params: {
    id: WorkspaceId;
    accountId: AccountId;
    status?: WorkspaceStatus;
    createdBy: string;
    blueprintId?: string;
  }): Workspace {
    const workspace = new Workspace(params.id);
    
    const payload: WorkspaceCreatedPayload = {
      accountId: params.accountId,
      status: params.status || 'initializing',
    };

    workspace.raiseEvent({
      id: generateEventId(),
      aggregateId: params.id,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceCreated',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: 'system',
        causedByUser: params.createdBy,
        causedByAction: 'workspace.create',
        blueprintId: params.blueprintId || params.accountId,
      }),
    } as WorkspaceCreated);

    return workspace;
  }

  /**
   * Factory method - Rebuild Workspace from event history
   * 
   * @param id - Workspace identifier
   * @param events - Historical events to replay
   * @returns Workspace instance with state rebuilt from events
   */
  static fromEvents(id: WorkspaceId, events: WorkspaceEvent[]): Workspace {
    const workspace = new Workspace(id);
    workspace.replay(events);
    return workspace;
  }

  /**
   * Apply an event to update aggregate state (required by AggregateRoot)
   * 
   * @param event - Event to apply
   */
  protected applyEvent(event: WorkspaceEvent): void {
    switch (event.eventType) {
      case 'WorkspaceCreated':
        this.applyWorkspaceCreated(event);
        break;
      case 'WorkspaceArchived':
        this.applyWorkspaceArchived(event);
        break;
      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = event;
        throw new Error(`Unknown event type: ${(_exhaustive as any).eventType}`);
    }
  }

  /**
   * Apply WorkspaceCreated event
   */
  private applyWorkspaceCreated(event: WorkspaceCreated): void {
    this.state = {
      workspaceId: event.aggregateId,
      accountId: event.data.accountId,
      status: event.data.status,
      createdAt: event.metadata.timestamp,
    };
  }

  /**
   * Apply WorkspaceArchived event
   */
  private applyWorkspaceArchived(event: WorkspaceArchived): void {
    if (!this.state) {
      throw new Error('Cannot apply WorkspaceArchived to uninitialized Workspace');
    }
    this.state.status = 'archived';
  }

  /**
   * Business behavior - Mark workspace as ready
   */
  markReady(params: {
    readyBy: string;
    blueprintId?: string;
  }): void {
    if (!this.state) {
      throw new Error('Cannot mark uninitialized workspace as ready');
    }

    if (this.state.status !== 'initializing') {
      throw new Error(`Cannot mark workspace as ready from status: ${this.state.status}`);
    }

    // In a real implementation, this would raise a WorkspaceReady event
    // For now, we'll keep it simple
    throw new Error('WorkspaceReady event not yet implemented');
  }

  /**
   * Business behavior - Archive workspace
   * 
   * @param params - Archive parameters
   */
  archive(params: {
    reason?: string;
    archivedBy: string;
    blueprintId?: string;
  }): void {
    // Business rule validation
    if (!this.state) {
      throw new Error('Cannot archive uninitialized workspace');
    }

    if (this.state.status === 'archived') {
      throw new Error('Workspace is already archived');
    }

    const payload: WorkspaceArchivedPayload = {
      previousStatus: this.state.status,
      reason: params.reason,
    };

    this.raiseEvent({
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceArchived',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: this.getLastEventId(),
        causedByUser: params.archivedBy,
        causedByAction: 'workspace.archive',
        blueprintId: params.blueprintId || this.state.accountId,
      }),
    } as WorkspaceArchived);
  }

  /**
   * Get the last event ID for causality tracking
   */
  private getLastEventId(): string {
    const events = this.getUncommittedEvents();
    if (events.length > 0) {
      return events[events.length - 1].id;
    }
    return 'system';
  }

  // ===== Read-only Getters =====

  /**
   * Get workspace account ID
   */
  get accountId(): AccountId | undefined {
    return this.state?.accountId;
  }

  /**
   * Get workspace status
   */
  get status(): WorkspaceStatus | undefined {
    return this.state?.status;
  }

  /**
   * Get workspace creation timestamp
   */
  get createdAt(): string | undefined {
    return this.state?.createdAt;
  }

  /**
   * Check if workspace is ready
   */
  get isReady(): boolean {
    return this.state?.status === 'ready';
  }

  /**
   * Check if workspace is archived
   */
  get isArchived(): boolean {
    return this.state?.status === 'archived';
  }

  /**
   * Check if workspace is initializing
   */
  get isInitializing(): boolean {
    return this.state?.status === 'initializing';
  }
}

// Type aliases for backward compatibility and clarity
export type WorkspaceAggregate = Workspace;

// Re-export WorkspaceStatus for convenience
export { WorkspaceStatus } from '../events/WorkspaceArchived';

// END OF FILE
