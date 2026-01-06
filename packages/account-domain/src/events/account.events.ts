/**
 * Account Events
 *
 * Events representing state changes in Account aggregates.
 *
 * Naming Convention: Noun + Past Tense Verb (AccountCreated, AccountUpdated, etc.)
 *
 * All events MUST include:
 * - Full causality metadata (causedBy, causedByUser, causedByAction)
 * - blueprintId is optional for Account creation (system-level event)
 */

import { DomainEvent, EventMetadata } from '@ng-events/core-engine';
import { AccountType, AccountMetadata, AccountStatus } from '../types/account.types';

/**
 * AccountCreated - An account was created
 */
export interface AccountCreatedEventData {
  /**
   * Account ID
   */
  readonly accountId: string;

  /**
   * Type of account
   */
  readonly accountType: AccountType;

  /**
   * Initial metadata
   */
  readonly metadata: AccountMetadata;

  /**
   * Creation timestamp
   */
  readonly createdAt: string;
}

export interface AccountCreatedEvent extends DomainEvent<AccountCreatedEventData> {
  readonly eventType: 'AccountCreated';
  readonly aggregateType: 'Account';
}

/**
 * AccountUpdated - Account metadata was updated
 */
export interface AccountUpdatedEventData {
  /**
   * Account ID
   */
  readonly accountId: string;

  /**
   * Updated metadata
   */
  readonly metadata: Partial<AccountMetadata>;

  /**
   * Update timestamp
   */
  readonly updatedAt: string;
}

export interface AccountUpdatedEvent extends DomainEvent<AccountUpdatedEventData> {
  readonly eventType: 'AccountUpdated';
  readonly aggregateType: 'Account';
}

/**
 * AccountSuspended - Account was suspended
 */
export interface AccountSuspendedEventData {
  /**
   * Account ID
   */
  readonly accountId: string;

  /**
   * Reason for suspension
   */
  readonly reason: string;

  /**
   * Suspension timestamp
   */
  readonly suspendedAt: string;
}

export interface AccountSuspendedEvent extends DomainEvent<AccountSuspendedEventData> {
  readonly eventType: 'AccountSuspended';
  readonly aggregateType: 'Account';
}

/**
 * AccountReactivated - Account was reactivated after suspension
 */
export interface AccountReactivatedEventData {
  /**
   * Account ID
   */
  readonly accountId: string;

  /**
   * Reactivation timestamp
   */
  readonly reactivatedAt: string;
}

export interface AccountReactivatedEvent extends DomainEvent<AccountReactivatedEventData> {
  readonly eventType: 'AccountReactivated';
  readonly aggregateType: 'Account';
}

/**
 * AccountDeleted - Account was soft deleted
 */
export interface AccountDeletedEventData {
  /**
   * Account ID
   */
  readonly accountId: string;

  /**
   * Reason for deletion
   */
  readonly reason?: string;

  /**
   * Deletion timestamp
   */
  readonly deletedAt: string;
}

export interface AccountDeletedEvent extends DomainEvent<AccountDeletedEventData> {
  readonly eventType: 'AccountDeleted';
  readonly aggregateType: 'Account';
}

// END OF FILE
