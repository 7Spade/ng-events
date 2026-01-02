import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';

/**
 * Emitted when a module is deactivated for a workspace.
 */
export interface ModuleDisabled {
  workspaceId: WorkspaceId;
  moduleId: ModuleId;
  occurredAt: string;
  reason?: string;
  causationId?: string;
  correlationId?: string;
}

// END OF FILE
