import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Emitted when an account is restricted or frozen.
 */
export interface AccountSuspended {
  accountId: AccountId;
  previousStatus: AccountStatus;
  reason?: string;
  occurredAt: string;
}
