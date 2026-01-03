import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Payload for MemberJoinedWorkspace event
 */
export interface MemberJoinedWorkspacePayload {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  joinedAt: string;
}

/**
 * Emitted when a user joins a workspace with a given role.
 */
export type MemberJoinedWorkspace = DomainEvent<
  MemberJoinedWorkspacePayload,
  MemberId,
  CausalityMetadata
>;

// END OF FILE
