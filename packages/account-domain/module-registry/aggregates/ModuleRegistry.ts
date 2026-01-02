import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';
import { ModuleStatus } from '../value-objects/ModuleStatus';
import { Capability } from '../value-objects/Capability';

/**
 * ModuleRegistry Aggregate
 *
 * Tracks module enablement for a workspace.
 */
export interface ModuleRegistry {
  workspaceId: WorkspaceId;
  modules: Record<ModuleId, ModuleStatus>;
  capabilities?: Record<ModuleId, Capability[]>;
  createdAt: string;
}

// END OF FILE
