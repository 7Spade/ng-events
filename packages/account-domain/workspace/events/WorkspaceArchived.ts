import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { WorkspaceId } from '../value-objects/WorkspaceId';

/**
 * Workspace status type
 */
export type WorkspaceStatus =
  | 'initializing'
  | 'ready'
  | 'restricted'
  | 'archived';

/**
 * Payload for WorkspaceArchived event
 */
export interface WorkspaceArchivedPayload {
  previousStatus: WorkspaceStatus;
  reason?: string;
}

/**
 * Emitted when a workspace is archived or closed.
 */
export type WorkspaceArchived = DomainEvent<
  WorkspaceArchivedPayload,
  WorkspaceId,
  CausalityMetadata
> & {
  eventType: 'WorkspaceArchived';
  aggregateType: 'Workspace';
};

/**
 * Event version for schema evolution
 */
const WORKSPACE_ARCHIVED_VERSION = 1;

/**
 * Serialized format for WorkspaceArchived event
 */
export interface WorkspaceArchivedData {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  data: {
    previousStatus: WorkspaceStatus;
    reason?: string;
  };
  metadata: {
    causedBy: string;
    causedByUser: string;
    causedByAction: string;
    timestamp: string;
    blueprintId: string;
    correlationId?: string;
  };
}

/**
 * WorkspaceArchived Event Class with Serialization
 *
 * Provides toData() for Firestore persistence and fromData() for deserialization.
 * Maintains backward compatibility with WorkspaceArchived type.
 */
export class WorkspaceArchivedEvent {
  private constructor(private readonly event: WorkspaceArchived) {}

  /**
   * Create a new WorkspaceArchived event
   *
   * @param params Event parameters
   * @returns WorkspaceArchivedEvent instance
   * @throws Error if validation fails
   */
  static create(params: {
    id: string;
    aggregateId: WorkspaceId;
    data: WorkspaceArchivedPayload;
    metadata: CausalityMetadata;
  }): WorkspaceArchivedEvent {
    // Validate required fields
    if (!params.id?.trim()) {
      throw new Error('Event id is required');
    }
    if (!params.aggregateId?.trim()) {
      throw new Error('Aggregate id is required');
    }
    if (!params.data?.previousStatus) {
      throw new Error('Previous status is required in payload');
    }

    // Validate previous status
    const validStatuses: WorkspaceStatus[] = ['initializing', 'ready', 'restricted', 'archived'];
    if (!validStatuses.includes(params.data.previousStatus)) {
      throw new Error(`Invalid previous status: ${params.data.previousStatus}`);
    }

    // Validate causality metadata
    if (!params.metadata?.causedBy?.trim()) {
      throw new Error('Causality metadata causedBy is required');
    }
    if (!params.metadata?.causedByUser?.trim()) {
      throw new Error('Causality metadata causedByUser is required');
    }
    if (!params.metadata?.causedByAction?.trim()) {
      throw new Error('Causality metadata causedByAction is required');
    }
    if (!params.metadata?.timestamp) {
      throw new Error('Causality metadata timestamp is required');
    }
    if (!params.metadata?.blueprintId?.trim()) {
      throw new Error('Causality metadata blueprintId is required');
    }

    const event: WorkspaceArchived = {
      id: params.id,
      aggregateId: params.aggregateId,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceArchived',
      data: params.data,
      metadata: params.metadata
    };

    return new WorkspaceArchivedEvent(event);
  }

  /**
   * Deserialize event from Firestore document data
   *
   * @param data Firestore document data
   * @returns WorkspaceArchivedEvent instance
   * @throws Error if deserialization fails
   */
  static fromData(data: WorkspaceArchivedData): WorkspaceArchivedEvent {
    // Validate data structure
    if (!data?.id?.trim()) {
      throw new Error('Event id is required in data');
    }
    if (!data?.aggregateId?.trim()) {
      throw new Error('Aggregate id is required in data');
    }
    if (data.eventType !== 'WorkspaceArchived') {
      throw new Error(`Invalid event type: ${data.eventType}`);
    }
    if (data.aggregateType !== 'Workspace') {
      throw new Error(`Invalid aggregate type: ${data.aggregateType}`);
    }

    // Reconstruct event
    return WorkspaceArchivedEvent.create({
      id: data.id,
      aggregateId: data.aggregateId as WorkspaceId,
      data: {
        previousStatus: data.data.previousStatus,
        reason: data.data.reason
      },
      metadata: {
        causedBy: data.metadata.causedBy,
        causedByUser: data.metadata.causedByUser,
        causedByAction: data.metadata.causedByAction,
        timestamp: data.metadata.timestamp,
        blueprintId: data.metadata.blueprintId,
        correlationId: data.metadata.correlationId
      }
    });
  }

  /**
   * Serialize event to plain object for Firestore persistence
   *
   * @returns Plain object suitable for Firestore
   */
  toData(): WorkspaceArchivedData {
    return {
      id: this.event.id,
      aggregateId: this.event.aggregateId,
      aggregateType: this.event.aggregateType,
      eventType: this.event.eventType,
      version: WORKSPACE_ARCHIVED_VERSION,
      data: {
        previousStatus: this.event.data.previousStatus,
        reason: this.event.data.reason
      },
      metadata: {
        causedBy: this.event.metadata.causedBy,
        causedByUser: this.event.metadata.causedByUser,
        causedByAction: this.event.metadata.causedByAction,
        timestamp: this.event.metadata.timestamp,
        blueprintId: this.event.metadata.blueprintId,
        correlationId: this.event.metadata.correlationId
      }
    };
  }

  /**
   * Get the underlying event object
   *
   * @returns WorkspaceArchived event
   */
  getEvent(): WorkspaceArchived {
    return this.event;
  }

  /**
   * Get event version for schema evolution
   *
   * @returns Event version number
   */
  static getVersion(): number {
    return WORKSPACE_ARCHIVED_VERSION;
  }

  /**
   * Check equality with another WorkspaceArchivedEvent
   *
   * @param other Other event to compare
   * @returns True if events have the same id
   */
  equals(other: WorkspaceArchivedEvent | null | undefined): boolean {
    if (!other) return false;
    return this.event.id === other.event.id;
  }
}

// END OF FILE
