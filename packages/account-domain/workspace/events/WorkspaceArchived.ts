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

// END OF FILE
