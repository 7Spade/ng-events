import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Account Aggregate
 *
 * Represents a SaaS account that owns workspaces and module capabilities.
 */
export interface Account {
  accountId: AccountId;
  ownerId: string;
  status: AccountStatus;
  createdAt: string;
}

// END OF FILE
