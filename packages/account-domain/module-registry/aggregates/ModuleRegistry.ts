import { AggregateRoot, DomainEvent } from '@ng-events/core-engine';

import { ModuleDisabled } from '../events/ModuleDisabled';
import { ModuleEnabled } from '../events/ModuleEnabled';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';
import { ModuleStatus } from '../value-objects/ModuleStatus';
import { Capability } from '../value-objects/Capability';

/**
 * ModuleRegistry Aggregate
 *
 * Tracks module enablement for a workspace.
 */
export interface ModuleRegistryState {
  workspaceId: WorkspaceId;
  modules: Record<ModuleId, ModuleStatus>;
  capabilities?: Record<ModuleId, Capability[]>;
  createdAt: string;
}

export type ModuleRegistryEvent =
  | DomainEvent<ModuleEnabled, WorkspaceId>
  | DomainEvent<ModuleDisabled, WorkspaceId>;

export type ModuleRegistryAggregate = AggregateRoot<
  ModuleRegistryEvent,
  WorkspaceId,
  ModuleRegistryState
>;

export type ModuleRegistry = ModuleRegistryState;

// END OF FILE
