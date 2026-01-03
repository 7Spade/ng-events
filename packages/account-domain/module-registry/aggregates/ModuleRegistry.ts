import { AggregateRoot, CausalityMetadata, generateEventId, generateAggregateId } from '@ng-events/core-engine';

import {
  ModuleDisabled,
  ModuleDisabledPayload,
} from '../events/ModuleDisabled';
import {
  ModuleEnabled,
  ModuleEnabledPayload,
} from '../events/ModuleEnabled';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
import { ModuleId } from '../value-objects/ModuleId';
import { ModuleStatus } from '../value-objects/ModuleStatus';
import { Capability } from '../value-objects/Capability';

/**
 * ModuleRegistry Aggregate State
 *
 * Tracks module enablement for a workspace.
 */
export interface ModuleRegistryState {
  workspaceId: WorkspaceId;
  modules: Record<ModuleId, ModuleStatus>;
  capabilities: Record<ModuleId, Capability[]>;
  createdAt: string;
}

/**
 * Union of all ModuleRegistry domain events
 */
export type ModuleRegistryEvent = ModuleEnabled | ModuleDisabled;

/**
 * ModuleRegistry Aggregate
 *
 * Manages module activation/deactivation for a workspace.
 * Enforces business rules around module lifecycle and capability grants.
 */
export class ModuleRegistry extends AggregateRoot<
  ModuleRegistryEvent,
  WorkspaceId,
  ModuleRegistryState
> {
  /**
   * Private constructor - use factory methods to create instances
   */
  private constructor(id: WorkspaceId) {
    super(id);
  }

  /**
   * Factory method: Create a new ModuleRegistry for a workspace
   *
   * @param workspaceId - Workspace identifier
   * @param causedByUser - User who initiated this action
   * @param blueprintId - Multi-tenant boundary identifier
   * @returns New ModuleRegistry aggregate instance
   */
  static create(
    workspaceId: WorkspaceId,
    causedByUser: string,
    blueprintId: string
  ): ModuleRegistry {
    const registry = new ModuleRegistry(workspaceId);

    // Initialize with empty state
    registry.state = {
      workspaceId,
      modules: {},
      capabilities: {},
      createdAt: new Date().toISOString(),
    };

    return registry;
  }

  /**
   * Factory method: Reconstitute ModuleRegistry from event history
   *
   * @param events - Historical events for this aggregate
   * @returns ModuleRegistry aggregate with replayed state
   */
  static fromEvents(events: ModuleRegistryEvent[]): ModuleRegistry {
    if (events.length === 0) {
      throw new Error('Cannot reconstitute ModuleRegistry from empty event list');
    }

    const firstEvent = events[0];
    const registry = new ModuleRegistry(firstEvent.aggregateId);

    // Initialize base state
    registry.state = {
      workspaceId: firstEvent.aggregateId,
      modules: {},
      capabilities: {},
      createdAt: firstEvent.timestamp,
    };

    events.forEach((event) => registry.applyEvent(event));

    return registry;
  }

  /**
   * Apply an event to update aggregate state (event replay)
   *
   * @param event - Domain event to apply
   */
  protected applyEvent(event: ModuleRegistryEvent): void {
    switch (event.eventType) {
      case 'ModuleEnabled': {
        const payload = event.payload as ModuleEnabledPayload;
        this.state = {
          ...this.state,
          modules: {
            ...this.state.modules,
            [payload.moduleId]: 'enabled' as ModuleStatus,
          },
          capabilities: {
            ...this.state.capabilities,
            [payload.moduleId]: payload.capabilities || [],
          },
        };
        break;
      }

      case 'ModuleDisabled': {
        const payload = event.payload as ModuleDisabledPayload;
        this.state = {
          ...this.state,
          modules: {
            ...this.state.modules,
            [payload.moduleId]: 'disabled' as ModuleStatus,
          },
          capabilities: {
            ...this.state.capabilities,
            [payload.moduleId]: [],
          },
        };
        break;
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = event;
        throw new Error(`Unhandled event type: ${(_exhaustive as any).eventType}`);
      }
    }
  }

  /**
   * Business behavior: Enable a module for the workspace
   *
   * @param moduleId - Module to enable
   * @param capabilities - Optional capabilities granted by this module
   * @param causedByUser - User who initiated this action
   * @throws Error if module is already enabled
   */
  enableModule(
    moduleId: ModuleId,
    capabilities: Capability[] | undefined,
    causedByUser: string
  ): void {
    if (!this.state) {
      throw new Error('Cannot enable module on uninitialized ModuleRegistry');
    }

    if (this.state.modules[moduleId] === 'enabled') {
      throw new Error(`Module ${moduleId} is already enabled`);
    }

    const payload: ModuleEnabledPayload = {
      workspaceId: this.state.workspaceId,
      moduleId,
      capabilities,
      enabledAt: new Date().toISOString(),
    };

    const metadata: CausalityMetadata = {
      causedBy: this.getUncommittedEvents()[0]?.id || 'system',
      causedByUser,
      causedByAction: 'moduleRegistry.enableModule',
      timestamp: new Date().toISOString(),
      blueprintId: this.getUncommittedEvents()[0]?.metadata?.blueprintId || '',
    };

    const event: ModuleEnabled = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'ModuleRegistry',
      eventType: 'ModuleEnabled',
      payload,
      metadata,
      timestamp: metadata.timestamp,
    };

    this.raiseEvent(event);
  }

  /**
   * Business behavior: Disable a module for the workspace
   *
   * @param moduleId - Module to disable
   * @param reason - Optional reason for disabling
   * @param causedByUser - User who initiated this action
   * @throws Error if module is already disabled or not registered
   */
  disableModule(moduleId: ModuleId, reason: string | undefined, causedByUser: string): void {
    if (!this.state) {
      throw new Error('Cannot disable module on uninitialized ModuleRegistry');
    }

    if (!this.state.modules[moduleId]) {
      throw new Error(`Module ${moduleId} is not registered`);
    }

    if (this.state.modules[moduleId] === 'disabled') {
      throw new Error(`Module ${moduleId} is already disabled`);
    }

    const payload: ModuleDisabledPayload = {
      workspaceId: this.state.workspaceId,
      moduleId,
      reason,
      disabledAt: new Date().toISOString(),
    };

    const metadata: CausalityMetadata = {
      causedBy: this.getUncommittedEvents()[0]?.id || 'system',
      causedByUser,
      causedByAction: 'moduleRegistry.disableModule',
      timestamp: new Date().toISOString(),
      blueprintId: this.getUncommittedEvents()[0]?.metadata?.blueprintId || '',
    };

    const event: ModuleDisabled = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'ModuleRegistry',
      eventType: 'ModuleDisabled',
      payload,
      metadata,
      timestamp: metadata.timestamp,
    };

    this.raiseEvent(event);
  }

  // ========================================
  // Getters (State Access)
  // ========================================

  get workspaceId(): WorkspaceId {
    return this.state?.workspaceId || ('' as WorkspaceId);
  }

  get modules(): Record<ModuleId, ModuleStatus> {
    return this.state?.modules || {};
  }

  get capabilities(): Record<ModuleId, Capability[]> {
    return this.state?.capabilities || {};
  }

  get createdAt(): string {
    return this.state?.createdAt || '';
  }

  /**
   * Check if a specific module is enabled
   */
  isModuleEnabled(moduleId: ModuleId): boolean {
    return this.state?.modules[moduleId] === 'enabled';
  }

  /**
   * Get capabilities for a specific module
   */
  getModuleCapabilities(moduleId: ModuleId): Capability[] {
    return this.state?.capabilities[moduleId] || [];
  }

  /**
   * Get all enabled modules
   */
  get enabledModules(): ModuleId[] {
    if (!this.state) return [];
    return Object.entries(this.state.modules)
      .filter(([_, status]) => status === 'enabled')
      .map(([moduleId]) => moduleId as ModuleId);
  }
}

// END OF FILE
