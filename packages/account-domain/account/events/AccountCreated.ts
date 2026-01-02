import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Payload for AccountCreated event
 */
export interface AccountCreatedPayload {
  ownerId: string;
  status: AccountStatus;
}

/**
 * Emitted when an account is provisioned.
 */
export type AccountCreated = DomainEvent<
  AccountCreatedPayload,
  AccountId,
  CausalityMetadata
> & {
  eventType: 'AccountCreated';
  aggregateType: 'Account';
};

// END OF FILE
