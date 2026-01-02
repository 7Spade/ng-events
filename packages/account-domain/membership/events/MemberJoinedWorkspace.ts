import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Emitted when a user joins a workspace with a given role.
 */
export interface MemberJoinedWorkspace {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  occurredAt: string;
  causationId?: string;
  correlationId?: string;
}

// END OF FILE
