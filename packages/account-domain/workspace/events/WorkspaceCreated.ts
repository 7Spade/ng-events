import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { AccountId } from '../../account/value-objects/AccountId';
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
 * Payload for WorkspaceCreated event
 */
export interface WorkspaceCreatedPayload {
  accountId: AccountId;
  status: WorkspaceStatus;
}

/**
 * Emitted when a workspace is initialized for an account.
 */
export type WorkspaceCreated = DomainEvent<
  WorkspaceCreatedPayload,
  WorkspaceId,
  CausalityMetadata
> & {
  eventType: 'WorkspaceCreated';
  aggregateType: 'Workspace';
};

/**
 * Event version for schema evolution
 */
const WORKSPACE_CREATED_VERSION = 1;

/**
 * Serialized format for WorkspaceCreated event
 */
export interface WorkspaceCreatedData {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  data: {
    accountId: string;
    status: WorkspaceStatus;
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
 * WorkspaceCreated Event Class with Serialization
 *
 * Provides toData() for Firestore persistence and fromData() for deserialization.
 * Maintains backward compatibility with WorkspaceCreated type.
 */
export class WorkspaceCreatedEvent {
  private constructor(private readonly event: WorkspaceCreated) {}

  /**
   * Create a new WorkspaceCreated event
   *
   * @param params Event parameters
   * @returns WorkspaceCreatedEvent instance
   * @throws Error if validation fails
   */
  static create(params: {
    id: string;
    aggregateId: WorkspaceId;
    data: WorkspaceCreatedPayload;
    metadata: CausalityMetadata;
  }): WorkspaceCreatedEvent {
    // Validate required fields
    if (!params.id?.trim()) {
      throw new Error('Event id is required');
    }
    if (!params.aggregateId?.trim()) {
      throw new Error('Aggregate id is required');
    }
    if (!params.data?.accountId?.trim()) {
      throw new Error('Account id is required in payload');
    }
    if (!params.data?.status) {
      throw new Error('Status is required in payload');
    }

    // Validate status
    const validStatuses: WorkspaceStatus[] = ['initializing', 'ready', 'restricted', 'archived'];
    if (!validStatuses.includes(params.data.status)) {
      throw new Error(`Invalid status: ${params.data.status}`);
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

    const event: WorkspaceCreated = {
      id: params.id,
      aggregateId: params.aggregateId,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceCreated',
      data: params.data,
      metadata: params.metadata
    };

    return new WorkspaceCreatedEvent(event);
  }

  /**
   * Deserialize event from Firestore document data
   *
   * @param data Firestore document data
   * @returns WorkspaceCreatedEvent instance
   * @throws Error if deserialization fails
   */
  static fromData(data: WorkspaceCreatedData): WorkspaceCreatedEvent {
    // Validate data structure
    if (!data?.id?.trim()) {
      throw new Error('Event id is required in data');
    }
    if (!data?.aggregateId?.trim()) {
      throw new Error('Aggregate id is required in data');
    }
    if (data.eventType !== 'WorkspaceCreated') {
      throw new Error(`Invalid event type: ${data.eventType}`);
    }
    if (data.aggregateType !== 'Workspace') {
      throw new Error(`Invalid aggregate type: ${data.aggregateType}`);
    }

    // Reconstruct event
    return WorkspaceCreatedEvent.create({
      id: data.id,
      aggregateId: data.aggregateId as WorkspaceId,
      data: {
        accountId: data.data.accountId as AccountId,
        status: data.data.status
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
  toData(): WorkspaceCreatedData {
    return {
      id: this.event.id,
      aggregateId: this.event.aggregateId,
      aggregateType: this.event.aggregateType,
      eventType: this.event.eventType,
      version: WORKSPACE_CREATED_VERSION,
      data: {
        accountId: this.event.data.accountId,
        status: this.event.data.status
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
   * @returns WorkspaceCreated event
   */
  getEvent(): WorkspaceCreated {
    return this.event;
  }

  /**
   * Get event version for schema evolution
   *
   * @returns Event version number
   */
  static getVersion(): number {
    return WORKSPACE_CREATED_VERSION;
  }

  /**
   * Check equality with another WorkspaceCreatedEvent
   *
   * @param other Other event to compare
   * @returns True if events have the same id
   */
  equals(other: WorkspaceCreatedEvent | null | undefined): boolean {
    if (!other) return false;
    return this.event.id === other.event.id;
  }
}

// END OF FILE
