import { WorkspaceId } from '../value-objects/WorkspaceId';
import { WorkspaceStatus } from '../aggregates/Workspace';

/**
 * Emitted when a workspace is archived or closed.
 */
export interface WorkspaceArchived {
  workspaceId: WorkspaceId;
  previousStatus: WorkspaceStatus;
  occurredAt: string;
  causationId?: string;
  correlationId?: string;
}

// END OF FILE
