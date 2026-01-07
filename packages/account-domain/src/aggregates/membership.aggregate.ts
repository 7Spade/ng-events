import type { DomainEvent } from '@core-engine';

import type { InviteMemberCommand } from '../commands';
import type { MembershipCreatedEvent } from '../events';

/**
 * MembershipAggregate (skeleton)
 *
 * Represents ACL membership within a workspace.
 */
export class MembershipAggregate {
  constructor(
    public readonly membershipId: string,
    public readonly workspaceId: string,
    public readonly roles: string[],
    public readonly blueprintId: string
  ) {}

  static create(command: InviteMemberCommand): MembershipCreatedEvent {
    const { membershipId, workspaceId, memberUserId, roles, blueprintId, metadata } = command;
    const event: DomainEvent<MembershipCreatedEvent['data']> = {
      id: metadata?.causedBy ?? membershipId,
      aggregateId: membershipId,
      aggregateType: 'Membership',
      eventType: 'MembershipCreated',
      data: { workspaceId, memberUserId, roles },
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

  static replay(events: DomainEvent[]): MembershipAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    return new MembershipAggregate(
      first?.aggregateId ?? '',
      data.workspaceId ?? '',
      data.roles ?? [],
      first?.metadata.blueprintId ?? ''
    );
  }

  apply(event: DomainEvent): void {
    void event;
  }
}

// END OF FILE
