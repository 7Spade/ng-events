import { AggregateRoot, DomainEvent } from '@ng-events/core-engine';

import { MemberJoinedWorkspace } from '../events/MemberJoinedWorkspace';
import { MemberRoleChanged } from '../events/MemberRoleChanged';
import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Membership Aggregate
 *
 * Captures the relationship between a member and a workspace.
 */
export interface MembershipState {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  createdAt: string;
}

export type MembershipEvent =
  | DomainEvent<MemberJoinedWorkspace, MemberId>
  | DomainEvent<MemberRoleChanged, MemberId>;

export type MembershipAggregate = AggregateRoot<
  MembershipEvent,
  MemberId,
  MembershipState
>;

export type Membership = MembershipState;

// END OF FILE
