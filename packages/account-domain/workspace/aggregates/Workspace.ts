import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceId } from '../value-objects/WorkspaceId';

export type WorkspaceStatus =
  | 'initializing'
  | 'ready'
  | 'restricted'
  | 'archived';

/**
 * Workspace Aggregate
 *
 * Represents a working environment owned by an account.
 */
export interface Workspace {
  workspaceId: WorkspaceId;
  accountId: AccountId;
  status: WorkspaceStatus;
  createdAt?: string;
}
