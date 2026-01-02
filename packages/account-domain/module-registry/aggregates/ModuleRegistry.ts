import { AggregateRoot } from '../../../core-engine/aggregates/AggregateRoot';
import { DomainEvent } from '../../../core-engine/event-store';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { Capability } from '../value-objects/Capability';
import { ModuleId } from '../value-objects/ModuleId';
import { ModuleStatus } from '../value-objects/ModuleStatus';

/**
 * ModuleRegistry state snapshot
 *
 * Tracks module enablement for a workspace.
 */
export interface ModuleRegistryState {
  workspaceId: WorkspaceId;
  modules: Record<ModuleId, ModuleStatus>;
  capabilities?: Record<ModuleId, Capability[]>;
  createdAt: string;
}

export type ModuleRegistryEvent<TPayload = ModuleRegistryState> = DomainEvent<
  TPayload,
  WorkspaceId
>;

export type ModuleRegistryAggregate<
  TEvent extends DomainEvent<unknown, WorkspaceId> = ModuleRegistryEvent,
  SState extends ModuleRegistryState = ModuleRegistryState
> = AggregateRoot<TEvent, WorkspaceId, SState>;

// Backward compatibility alias
export type ModuleRegistry = ModuleRegistryState;

// END OF FILE
