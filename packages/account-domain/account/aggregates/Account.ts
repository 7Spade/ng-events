import { AggregateRoot, DomainEvent } from '@ng-events/core-engine';

import { AccountCreated } from '../events/AccountCreated';
import { AccountSuspended } from '../events/AccountSuspended';
import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Account Aggregate
 *
 * Represents a SaaS account that owns workspaces and module capabilities.
 */
export interface AccountState {
  accountId: AccountId;
  ownerId: string;
  status: AccountStatus;
  createdAt: string;
}

export type AccountEvent =
  | DomainEvent<AccountCreated, AccountId>
  | DomainEvent<AccountSuspended, AccountId>;

export type AccountAggregate = AggregateRoot<AccountEvent, AccountId, AccountState>;

export type Account = AccountState;

// END OF FILE
