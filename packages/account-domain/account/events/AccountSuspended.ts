import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Payload for AccountSuspended event
 */
export interface AccountSuspendedPayload {
  previousStatus: AccountStatus;
  reason?: string;
}

/**
 * Emitted when an account is restricted or frozen.
 */
export type AccountSuspended = DomainEvent<
  AccountSuspendedPayload,
  AccountId,
  CausalityMetadata
> & {
  eventType: 'AccountSuspended';
  aggregateType: 'Account';
};

// END OF FILE
