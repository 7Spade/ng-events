import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';
import { Capability } from '../value-objects/Capability';

/**
 * Emitted when a module is activated for a workspace.
 */
export interface ModuleEnabled {
  workspaceId: WorkspaceId;
  moduleId: ModuleId;
  enabledAt: string;
  capabilities?: Capability[];
}
