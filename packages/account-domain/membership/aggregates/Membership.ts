import { AggregateRoot } from '../../../core-engine/aggregates/AggregateRoot';
import { DomainEvent } from '../../../core-engine/event-store';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';

/**
 * Membership state snapshot
 *
 * Captures the relationship between a member and a workspace.
 */
export interface MembershipState {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  createdAt: string;
}

export type MembershipEvent<TPayload = MembershipState> = DomainEvent<TPayload, MemberId>;

export type MembershipAggregate<
  TEvent extends DomainEvent<unknown, MemberId> = MembershipEvent,
  SState extends MembershipState = MembershipState
> = AggregateRoot<TEvent, MemberId, SState>;

// Backward compatibility alias
export type Membership = MembershipState;

// END OF FILE
