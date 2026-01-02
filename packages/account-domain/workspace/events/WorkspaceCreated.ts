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

// END OF FILE
