import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Membership Aggregate
 *
 * Captures the relationship between a member and a workspace.
 */
export interface Membership {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  joinedAt?: string;
}
