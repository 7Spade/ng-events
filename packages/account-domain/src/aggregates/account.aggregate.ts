import type { DomainEvent } from '@core-engine';

import type { CreateAccountCommand } from '../commands';
import type { AccountCreatedEvent } from '../events';

/**
 * AccountAggregate (skeleton)
 *
 * Represents a tenant/account root. BlueprintId is optional at this layer;
 * downstream workspaces must always stamp their blueprintId.
 */
export class AccountAggregate {
  constructor(
    public readonly accountId: string,
    public readonly ownerUserId: string,
    public readonly blueprintId?: string
  ) {}

  static create(command: CreateAccountCommand): AccountCreatedEvent {
    const { accountId, ownerUserId, blueprintId, metadata } = command;
    const event: DomainEvent<AccountCreatedEvent['data']> = {
      id: metadata?.causedBy ?? accountId,
      aggregateId: accountId,
      aggregateType: 'Account',
      eventType: 'AccountCreated',
      data: { ownerUserId },
      metadata: {
        timestamp: metadata?.timestamp ?? Date.now(),
        version: metadata?.version,
        causedBy: metadata?.causedBy,
        causedByUser: metadata?.causedByUser,
        causedByAction: metadata?.causedByAction,
        blueprintId
      }
    };
    return event;
  }

  /**
   * Rehydrate aggregate from historical events.
   */
  static replay(events: DomainEvent[]): AccountAggregate {
    const first = events[0];
    const ownerUserId = (first?.data as any)?.ownerUserId ?? '';
    return new AccountAggregate(first?.aggregateId ?? '', ownerUserId, first?.metadata.blueprintId);
  }

  apply(event: DomainEvent): void {
    // No-op placeholder; real logic would mutate internal state.
    void event;
  }
}

// END OF FILE
