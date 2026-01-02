import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceId } from '../value-objects/WorkspaceId';
import { WorkspaceStatus } from '../aggregates/Workspace';

/**
 * Emitted when a workspace is initialized for an account.
 */
export interface WorkspaceCreated {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  status: WorkspaceStatus;
  occurredAt: string;
}
