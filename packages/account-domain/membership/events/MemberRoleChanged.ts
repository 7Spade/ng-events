import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Emitted when a member's role changes within a workspace.
 */
export interface MemberRoleChanged {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  previousRole: Role;
  newRole: Role;
  occurredAt: string;
  causationId?: string;
  correlationId?: string;
}

// END OF FILE
