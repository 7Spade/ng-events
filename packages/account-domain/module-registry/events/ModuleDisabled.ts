import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';

/**
 * Payload for ModuleDisabled event
 */
export interface ModuleDisabledPayload {
  workspaceId: WorkspaceId;
  moduleId: ModuleId;
  reason?: string;
  disabledAt: string;
}

/**
 * Emitted when a module is deactivated for a workspace.
 */
export type ModuleDisabled = DomainEvent<
  ModuleDisabledPayload,
  WorkspaceId,
  CausalityMetadata
>;

// END OF FILE
