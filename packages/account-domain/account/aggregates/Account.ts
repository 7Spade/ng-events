import { AggregateRoot, DomainEvent, CausalityMetadataFactory } from '@ng-events/core-engine';
import { generateEventId } from '@ng-events/core-engine/utils/id-generator';

import { AccountCreated, AccountCreatedPayload } from '../events/AccountCreated';
import { AccountSuspended, AccountSuspendedPayload } from '../events/AccountSuspended';
import { AccountId } from '../value-objects/AccountId';
import { AccountStatus } from '../value-objects/AccountStatus';

/**
 * Account Aggregate State
 * 
 * Represents the internal state of an Account aggregate.
 */
export interface AccountState {
  accountId: AccountId;
  ownerId: string;
  status: AccountStatus;
  createdAt: string;
}

/**
 * Union type of all Account events
 */
export type AccountEvent = AccountCreated | AccountSuspended;

/**
 * Account Aggregate Root
 *
 * Represents a SaaS account that owns workspaces and module capabilities.
 * Follows the AggregateRoot<TEvent, TId, TState> pattern.
 */
export class Account extends AggregateRoot<AccountEvent, AccountId, AccountState> {
  /**
   * Aggregate identifier (required by AggregateRoot)
   */
  readonly id: AccountId;

  /**
   * Aggregate type name (required by AggregateRoot)
   */
  readonly type = 'Account';

  /**
   * Private constructor - forces use of factory methods
   * 
   * @param id - Account identifier
   */
  private constructor(id: AccountId) {
    super();
    this.id = id;
  }

  /**
   * Factory method - Create a new Account aggregate
   * 
   * @param params - Account creation parameters
   * @returns New Account instance with AccountCreated event raised
   */
  static create(params: {
    id: AccountId;
    ownerId: string;
    status?: AccountStatus;
    blueprintId?: string;
  }): Account {
    const account = new Account(params.id);
    
    const payload: AccountCreatedPayload = {
      ownerId: params.ownerId,
      status: params.status || 'active',
    };

    account.raiseEvent({
      id: generateEventId(),
      aggregateId: params.id,
      aggregateType: 'Account',
      eventType: 'AccountCreated',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: 'system',
        causedByUser: params.ownerId,
        causedByAction: 'account.create',
        blueprintId: params.blueprintId || params.id,
      }),
    } as AccountCreated);

    return account;
  }

  /**
   * Factory method - Rebuild Account from event history
   * 
   * @param id - Account identifier
   * @param events - Historical events to replay
   * @returns Account instance with state rebuilt from events
   */
  static fromEvents(id: AccountId, events: AccountEvent[]): Account {
    const account = new Account(id);
    account.replay(events);
    return account;
  }

  /**
   * Apply an event to update aggregate state (required by AggregateRoot)
   * 
   * @param event - Event to apply
   */
  protected applyEvent(event: AccountEvent): void {
    switch (event.eventType) {
      case 'AccountCreated':
        this.applyAccountCreated(event);
        break;
      case 'AccountSuspended':
        this.applyAccountSuspended(event);
        break;
      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = event;
        throw new Error(`Unknown event type: ${(_exhaustive as any).eventType}`);
    }
  }

  /**
   * Apply AccountCreated event
   */
  private applyAccountCreated(event: AccountCreated): void {
    this.state = {
      accountId: event.aggregateId,
      ownerId: event.data.ownerId,
      status: event.data.status,
      createdAt: event.metadata.timestamp,
    };
  }

  /**
   * Apply AccountSuspended event
   */
  private applyAccountSuspended(event: AccountSuspended): void {
    if (!this.state) {
      throw new Error('Cannot apply AccountSuspended to uninitialized Account');
    }
    this.state.status = 'suspended';
  }

  /**
   * Business behavior - Suspend account
   * 
   * @param params - Suspension parameters
   */
  suspend(params: {
    reason?: string;
    suspendedBy: string;
    blueprintId?: string;
  }): void {
    // Business rule validation
    if (!this.state) {
      throw new Error('Cannot suspend uninitialized account');
    }

    if (this.state.status === 'suspended') {
      throw new Error('Account is already suspended');
    }

    const payload: AccountSuspendedPayload = {
      previousStatus: this.state.status,
      reason: params.reason,
    };

    this.raiseEvent({
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'Account',
      eventType: 'AccountSuspended',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: this.getLastEventId(),
        causedByUser: params.suspendedBy,
        causedByAction: 'account.suspend',
        blueprintId: params.blueprintId || this.state.accountId,
      }),
    } as AccountSuspended);
  }

  /**
   * Get the last event ID for causality tracking
   */
  private getLastEventId(): string {
    const events = this.getUncommittedEvents();
    if (events.length > 0) {
      return events[events.length - 1].id;
    }
    return 'system';
  }

  // ===== Read-only Getters =====

  /**
   * Get account owner ID
   */
  get ownerId(): string | undefined {
    return this.state?.ownerId;
  }

  /**
   * Get account status
   */
  get status(): AccountStatus | undefined {
    return this.state?.status;
  }

  /**
   * Get account creation timestamp
   */
  get createdAt(): string | undefined {
    return this.state?.createdAt;
  }

  /**
   * Check if account is active
   */
  get isActive(): boolean {
    return this.state?.status === 'active';
  }

  /**
   * Check if account is suspended
   */
  get isSuspended(): boolean {
    return this.state?.status === 'suspended';
  }
}

// Type aliases for backward compatibility and clarity
export type AccountAggregate = Account;

// END OF FILE
