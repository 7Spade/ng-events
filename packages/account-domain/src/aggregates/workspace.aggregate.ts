/**
 * Workspace Aggregate
 *
 * Workspace is the multi-tenant boundary (blueprintId) containing modules and entities.
 *
 * Core Principles (from architecture docs):
 * - Workspace = blueprintId boundary for multi-tenancy
 * - Modules are external plugins that Workspace enables/disables
 * - Workspace does NOT know module internals, only tracks enabled state
 * - Module enablement is event-driven for replay and audit
 * - Organization is NOT a Workspace (it's an Account that can own Workspaces)
 *
 * Invariants:
 * - workspaceId must equal blueprintId
 * - Must have an owner account
 * - Cannot enable the same module twice
 * - Cannot disable a module that's not enabled
 * - Archived workspaces cannot be modified
 */

import { AggregateRoot, DomainEvent, EventMetadata } from '@ng-events/core-engine';
import {
  WorkspaceState,
  WorkspaceStatus,
  ModuleKey
} from '../types/workspace.types';
import {
  WorkspaceCreatedEvent,
  WorkspaceCreatedEventData,
  WorkspaceUpdatedEvent,
  WorkspaceUpdatedEventData,
  ModuleEnabledEvent,
  ModuleEnabledEventData,
  ModuleDisabledEvent,
  ModuleDisabledEventData,
  WorkspaceSuspendedEvent,
  WorkspaceSuspendedEventData,
  WorkspaceArchivedEvent,
  WorkspaceArchivedEventData
} from '../events/workspace.events';

/**
 * Workspace Aggregate
 */
export class Workspace extends AggregateRoot {
  private ownerAccountId!: string;
  private name!: string;
  private description?: string;
  private status!: WorkspaceStatus;
  private enabledModules: ModuleKey[] = [];
  private createdAt!: string;
  private updatedAt?: string;

  constructor(workspaceId: string) {
    super(workspaceId);
  }

  /**
   * Factory: Create a new Workspace
   *
   * @param workspaceId - Workspace ID (blueprintId)
   * @param ownerAccountId - Account ID of the owner
   * @param name - Workspace name
   * @param description - Optional description
   * @param initialModules - Optional modules to enable on creation
   * @param eventMetadata - Causality metadata (MUST include blueprintId = workspaceId)
   */
  public static create(
    workspaceId: string,
    ownerAccountId: string,
    name: string,
    description: string | undefined,
    initialModules: ModuleKey[] = [],
    eventMetadata: EventMetadata
  ): Workspace {
    const workspace = new Workspace(workspaceId);

    // Validate
    if (!workspaceId || !ownerAccountId || !name) {
      throw new Error('workspaceId, ownerAccountId, and name are required');
    }

    // Ensure blueprintId matches workspaceId
    if (eventMetadata.blueprintId !== workspaceId) {
      throw new Error('blueprintId must equal workspaceId for WorkspaceCreated event');
    }

    // Create WorkspaceCreated event
    const eventData: WorkspaceCreatedEventData = {
      workspaceId,
      ownerAccountId,
      name,
      description,
      createdAt: new Date().toISOString()
    };

    const event: WorkspaceCreatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'WorkspaceCreated',
      aggregateId: workspaceId,
      aggregateType: 'Workspace',
      version: 1,
      data: eventData,
      metadata: eventMetadata
    };

    workspace.applyEvent(event);

    // Enable initial modules
    for (const moduleKey of initialModules) {
      workspace.enableModule(moduleKey, eventMetadata);
    }

    return workspace;
  }

  /**
   * Update workspace metadata
   */
  public updateMetadata(
    name: string | undefined,
    description: string | undefined,
    eventMetadata: EventMetadata
  ): void {
    // Cannot update archived workspace
    if (this.status === 'archived') {
      throw new Error('Cannot update archived workspace');
    }

    const eventData: WorkspaceUpdatedEventData = {
      workspaceId: this.id,
      name,
      description,
      updatedAt: new Date().toISOString()
    };

    const event: WorkspaceUpdatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'WorkspaceUpdated',
      aggregateId: this.id,
      aggregateType: 'Workspace',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Enable a module in this workspace
   */
  public enableModule(moduleKey: ModuleKey, eventMetadata: EventMetadata): void {
    // Cannot modify archived workspace
    if (this.status === 'archived') {
      throw new Error('Cannot enable module in archived workspace');
    }

    // Check if already enabled
    if (this.enabledModules.includes(moduleKey)) {
      throw new Error(`Module ${moduleKey} is already enabled`);
    }

    const eventData: ModuleEnabledEventData = {
      workspaceId: this.id,
      moduleKey,
      enabledAt: new Date().toISOString()
    };

    const event: ModuleEnabledEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'ModuleEnabled',
      aggregateId: this.id,
      aggregateType: 'Workspace',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Disable a module in this workspace
   */
  public disableModule(moduleKey: ModuleKey, eventMetadata: EventMetadata): void {
    // Cannot modify archived workspace
    if (this.status === 'archived') {
      throw new Error('Cannot disable module in archived workspace');
    }

    // Check if enabled
    if (!this.enabledModules.includes(moduleKey)) {
      throw new Error(`Module ${moduleKey} is not enabled`);
    }

    const eventData: ModuleDisabledEventData = {
      workspaceId: this.id,
      moduleKey,
      disabledAt: new Date().toISOString()
    };

    const event: ModuleDisabledEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'ModuleDisabled',
      aggregateId: this.id,
      aggregateType: 'Workspace',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Suspend the workspace
   */
  public suspend(reason: string, eventMetadata: EventMetadata): void {
    if (this.status !== 'active') {
      throw new Error(`Cannot suspend workspace with status: ${this.status}`);
    }

    const eventData: WorkspaceSuspendedEventData = {
      workspaceId: this.id,
      reason,
      suspendedAt: new Date().toISOString()
    };

    const event: WorkspaceSuspendedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'WorkspaceSuspended',
      aggregateId: this.id,
      aggregateType: 'Workspace',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Archive the workspace
   */
  public archive(reason: string | undefined, eventMetadata: EventMetadata): void {
    if (this.status === 'archived') {
      throw new Error('Workspace is already archived');
    }

    const eventData: WorkspaceArchivedEventData = {
      workspaceId: this.id,
      reason,
      archivedAt: new Date().toISOString()
    };

    const event: WorkspaceArchivedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'WorkspaceArchived',
      aggregateId: this.id,
      aggregateType: 'Workspace',
      version: this.version + 1,
      data: eventData,
      metadata: eventMetadata
    };

    this.applyEvent(event);
  }

  /**
   * Event handler - applies events to update aggregate state
   */
  protected when(event: DomainEvent): void {
    switch (event.eventType) {
      case 'WorkspaceCreated':
        this.whenWorkspaceCreated(event as WorkspaceCreatedEvent);
        break;
      case 'WorkspaceUpdated':
        this.whenWorkspaceUpdated(event as WorkspaceUpdatedEvent);
        break;
      case 'ModuleEnabled':
        this.whenModuleEnabled(event as ModuleEnabledEvent);
        break;
      case 'ModuleDisabled':
        this.whenModuleDisabled(event as ModuleDisabledEvent);
        break;
      case 'WorkspaceSuspended':
        this.whenWorkspaceSuspended(event as WorkspaceSuspendedEvent);
        break;
      case 'WorkspaceArchived':
        this.whenWorkspaceArchived(event as WorkspaceArchivedEvent);
        break;
    }
  }

  private whenWorkspaceCreated(event: WorkspaceCreatedEvent): void {
    this.ownerAccountId = event.data.ownerAccountId;
    this.name = event.data.name;
    this.description = event.data.description;
    this.status = 'active';
    this.createdAt = event.data.createdAt;
  }

  private whenWorkspaceUpdated(event: WorkspaceUpdatedEvent): void {
    if (event.data.name) {
      this.name = event.data.name;
    }
    if (event.data.description !== undefined) {
      this.description = event.data.description;
    }
    this.updatedAt = event.data.updatedAt;
  }

  private whenModuleEnabled(event: ModuleEnabledEvent): void {
    this.enabledModules.push(event.data.moduleKey);
    this.updatedAt = event.data.enabledAt;
  }

  private whenModuleDisabled(event: ModuleDisabledEvent): void {
    this.enabledModules = this.enabledModules.filter(m => m !== event.data.moduleKey);
    this.updatedAt = event.data.disabledAt;
  }

  private whenWorkspaceSuspended(event: WorkspaceSuspendedEvent): void {
    this.status = 'suspended';
    this.updatedAt = event.data.suspendedAt;
  }

  private whenWorkspaceArchived(event: WorkspaceArchivedEvent): void {
    this.status = 'archived';
    this.updatedAt = event.data.archivedAt;
  }

  /**
   * Get current workspace state (for projections)
   */
  public getState(): WorkspaceState {
    return {
      workspaceId: this.id,
      ownerAccountId: this.ownerAccountId,
      name: this.name,
      description: this.description,
      status: this.status,
      enabledModules: [...this.enabledModules],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Check if a module is enabled
   */
  public isModuleEnabled(moduleKey: ModuleKey): boolean {
    return this.enabledModules.includes(moduleKey);
  }
}

// END OF FILE
