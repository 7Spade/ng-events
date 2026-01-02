import { AggregateRoot } from '../../../core-engine/aggregates/AggregateRoot';
import { DomainEvent } from '../../../core-engine/event-store';
import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Account state snapshot
 *
 * Represents a SaaS account that owns workspaces and module capabilities.
 */
export interface AccountState {
  accountId: AccountId;
  ownerId: string;
  status: AccountStatus;
  createdAt: string;
}

export type AccountEvent<TPayload = AccountState> = DomainEvent<TPayload, AccountId>;

export type AccountAggregate<
  TEvent extends DomainEvent<unknown, AccountId> = AccountEvent,
  SState extends AccountState = AccountState
> = AggregateRoot<TEvent, AccountId, SState>;

// Backward compatibility alias
export type Account = AccountState;

// END OF FILE
