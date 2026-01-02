import { AggregateRoot } from '../../../core-engine/aggregates/AggregateRoot';
import { DomainEvent } from '../../../core-engine/event-store';
import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceId } from '../value-objects/WorkspaceId';

export type WorkspaceStatus =
  | 'initializing'
  | 'ready'
  | 'restricted'
  | 'archived';

/**
 * Workspace state snapshot
 *
 * Represents a working environment owned by an account.
 */
export interface WorkspaceState {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  status: WorkspaceStatus;
  createdAt: string;
}

export type WorkspaceEvent<TPayload = WorkspaceState> = DomainEvent<TPayload, WorkspaceId>;

export type WorkspaceAggregate<
  TEvent extends DomainEvent<unknown, WorkspaceId> = WorkspaceEvent,
  SState extends WorkspaceState = WorkspaceState
> = AggregateRoot<WorkspaceId, TEvent, SState>;

// Backward compatibility alias
export type Workspace = WorkspaceState;

// END OF FILE
