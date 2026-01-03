import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';
import { Capability } from '../value-objects/Capability';

/**
 * Payload for ModuleEnabled event
 */
export interface ModuleEnabledPayload {
  workspaceId: WorkspaceId;
  moduleId: ModuleId;
  capabilities?: Capability[];
  enabledAt: string;
}

/**
 * Emitted when a module is activated for a workspace.
 */
export type ModuleEnabled = DomainEvent<
  ModuleEnabledPayload,
  WorkspaceId,
  CausalityMetadata
>;

// END OF FILE
