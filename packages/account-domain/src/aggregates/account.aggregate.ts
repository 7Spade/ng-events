/**
 * Account Aggregate
 *
 * Account represents a business actor in the system (User/Organization/Bot).
 *
 * Core Principles (from architecture docs):
 * - Account is the unified entity for all identity types
 * - User: Can login, human interface
 * - Organization: Container/group, cannot login directly
 * - Bot: Token-based, narrow permissions
 * - All events reference accountId, never userI/orgId/botId separately
 *
 * Invariants:
 * - accountId must be unique
 * - User accounts must have email
 * - Organization accounts must have name
 * - Bot accounts must have ownerAccountId
 * - Deleted accounts cannot be reactivated
 */

import { AggregateRoot, DomainEvent, EventMetadata } from '@ng-events/core-engine';
import {
  AccountType,
  AccountStatus,
  AccountMetadata,
  AccountState,
  UserMetadata,
  OrganizationMetadata,
  BotMetadata
} from '../types/account.types';
import {
  AccountCreatedEvent,
  AccountCreatedEventData,
  AccountUpdatedEvent,
  AccountUpdatedEventData,
  AccountSuspendedEvent,
  AccountSuspendedEventData,
  AccountReactivatedEvent,
  AccountReactivatedEventData,
  AccountDeletedEvent,
  AccountDeletedEventData
} from '../events/account.events';

/**
 * Account Aggregate
 */
export class Account extends AggregateRoot {
  private accountType!: AccountType;
  private status!: AccountStatus;
  private createdAt!: string;
  private updatedAt?: string;
  private metadata!: AccountMetadata;

  constructor(accountId: string) {
    super(accountId);
  }

  /**
   * Factory: Create a new Account
   */
  public static create(
    accountId: string,
    accountType: AccountType,
    metadata: AccountMetadata,
    eventMetadata: EventMetadata
  ): Account {
    const account = new Account(accountId);

    // Validate based on account type
    account.validateMetadataForType(accountType, metadata);

    // Create the AccountCreated event
    const eventData: AccountCreatedEventData = {
      accountId,
      accountType,
      metadata,
      createdAt: new Date().toISOString()
    };

    const event: AccountCreatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'AccountCreated',
      aggregateId: accountId,
      aggregateType: 'Account',
      version: 1,
      data: eventData,
      metadata: eventMetadata
    };

    account.applyEvent(event);
    return account;
  }

  /**
   * Update account metadata
   */
  public updateMetadata(
    updates: Partial<AccountMetadata>,
    eventMetadata: EventMetadata
  ): void {
    // Cannot update deleted account
    if (this.status === 'deleted') {
      throw new Error('Cannot update deleted account');
    }

    const eventData: AccountUpdatedEventData = {
      accountId: this.id,
      metadata: updates,
      updatedAt: new Date().toISOString()
    };

    const event: AccountUpdatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'AccountUpdated',
      aggregateId: this.id,
      aggregateType: 'Account',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Suspend the account
   */
  public suspend(reason: string, eventMetadata: EventMetadata): void {
    // Can only suspend active accounts
    if (this.status !== 'active') {
      throw new Error(`Cannot suspend account with status: ${this.status}`);
    }

    const eventData: AccountSuspendedEventData = {
      accountId: this.id,
      reason,
      suspendedAt: new Date().toISOString()
    };

    const event: AccountSuspendedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'AccountSuspended',
      aggregateId: this.id,
      aggregateType: 'Account',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Reactivate a suspended account
   */
  public reactivate(eventMetadata: EventMetadata): void {
    // Can only reactivate suspended accounts
    if (this.status !== 'suspended') {
      throw new Error(`Cannot reactivate account with status: ${this.status}`);
    }

    const eventData: AccountReactivatedEventData = {
      accountId: this.id,
      reactivatedAt: new Date().toISOString()
    };

    const event: AccountReactivatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'AccountReactivated',
      aggregateId: this.id,
      aggregateType: 'Account',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Soft delete the account
   */
  public delete(reason: string | undefined, eventMetadata: EventMetadata): void {
    // Cannot delete already deleted account
    if (this.status === 'deleted') {
      throw new Error('Account is already deleted');
    }

    const eventData: AccountDeletedEventData = {
      accountId: this.id,
      reason,
      deletedAt: new Date().toISOString()
    };

    const event: AccountDeletedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'AccountDeleted',
      aggregateId: this.id,
      aggregateType: 'Account',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Event handler - applies events to update aggregate state
   */
  protected when(event: DomainEvent): void {
    switch (event.eventType) {
      case 'AccountCreated':
        this.whenAccountCreated(event as AccountCreatedEvent);
        break;
      case 'AccountUpdated':
        this.whenAccountUpdated(event as AccountUpdatedEvent);
        break;
      case 'AccountSuspended':
        this.whenAccountSuspended(event as AccountSuspendedEvent);
        break;
      case 'AccountReactivated':
        this.whenAccountReactivated(event as AccountReactivatedEvent);
        break;
      case 'AccountDeleted':
        this.whenAccountDeleted(event as AccountDeletedEvent);
        break;
    }
  }

  private whenAccountCreated(event: AccountCreatedEvent): void {
    this.accountType = event.data.accountType;
    this.status = 'active';
    this.metadata = event.data.metadata;
    this.createdAt = event.data.createdAt;
  }

  private whenAccountUpdated(event: AccountUpdatedEvent): void {
    this.metadata = { ...this.metadata, ...event.data.metadata };
    this.updatedAt = event.data.updatedAt;
  }

  private whenAccountSuspended(event: AccountSuspendedEvent): void {
    this.status = 'suspended';
    this.updatedAt = event.data.suspendedAt;
  }

  private whenAccountReactivated(event: AccountReactivatedEvent): void {
    this.status = 'active';
    this.updatedAt = event.data.reactivatedAt;
  }

  private whenAccountDeleted(event: AccountDeletedEvent): void {
    this.status = 'deleted';
    this.updatedAt = event.data.deletedAt;
  }

  /**
   * Validate metadata matches account type
   */
  private validateMetadataForType(type: AccountType, metadata: AccountMetadata): void {
    switch (type) {
      case 'user':
        const userMeta = metadata as UserMetadata;
        if (!userMeta.email) {
          throw new Error('User accounts must have email');
        }
        break;
      case 'organization':
        const orgMeta = metadata as OrganizationMetadata;
        if (!orgMeta.name) {
          throw new Error('Organization accounts must have name');
        }
        break;
      case 'bot':
        const botMeta = metadata as BotMetadata;
        if (!botMeta.name || !botMeta.ownerAccountId) {
          throw new Error('Bot accounts must have name and ownerAccountId');
        }
        break;
    }
  }

  /**
   * Get current account state (for projections)
   */
  public getState(): AccountState {
    return {
      accountId: this.id,
      accountType: this.accountType,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }
}

// END OF FILE
