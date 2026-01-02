import { AggregateRoot, DomainEvent } from '@ng-events/core-engine';

import { WorkspaceArchived } from '../events/WorkspaceArchived';
import { WorkspaceCreated } from '../events/WorkspaceCreated';
import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceId } from '../value-objects/WorkspaceId';

export type WorkspaceStatus =
  | 'initializing'
  | 'ready'
  | 'restricted'
  | 'archived';

/**
 * Workspace Aggregate
 *
 * Represents a working environment owned by an account.
 */
export interface WorkspaceState {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  status: WorkspaceStatus;
  createdAt: string;
}

export type WorkspaceEvent =
  | DomainEvent<WorkspaceCreated, WorkspaceId>
  | DomainEvent<WorkspaceArchived, WorkspaceId>;

export type WorkspaceAggregate = AggregateRoot<
  WorkspaceEvent,
  WorkspaceId,
  WorkspaceState
>;

export type Workspace = WorkspaceState;

// END OF FILE
