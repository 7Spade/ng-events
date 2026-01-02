import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Emitted when an account is provisioned.
 */
export interface AccountCreated {
  accountId: AccountId;
  ownerId: string;
  status: AccountStatus;
  occurredAt: string;
  causationId?: string;
  correlationId?: string;
}

// END OF FILE
