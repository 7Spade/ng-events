import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Payload for MemberRoleChanged event
 */
export interface MemberRoleChangedPayload {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  previousRole: Role;
  newRole: Role;
  changedAt: string;
}

/**
 * Emitted when a member's role changes within a workspace.
 */
export type MemberRoleChanged = DomainEvent<
  MemberRoleChangedPayload,
  MemberId,
  CausalityMetadata
>;

// END OF FILE
