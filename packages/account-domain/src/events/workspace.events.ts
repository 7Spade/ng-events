/**
 * Workspace Events
 *
 * Events representing state changes in Workspace aggregates.
 *
 * Core Principles:
 * - All workspace events MUST include blueprintId (workspace boundary)
 * - Module enablement is event-driven for audit trail
 * - Events follow causality chain (causedBy, causedByUser, causedByAction)
 */

import { DomainEvent } from '@ng-events/core-engine';
import { ModuleKey, WorkspaceStatus } from '../types/workspace.types';

/**
 * WorkspaceCreated - A workspace was created
 */
export interface WorkspaceCreatedEventData {
  /**
   * Workspace ID (blueprintId)
   */
  readonly workspaceId: string;

  /**
   * Owner account ID
   */
  readonly ownerAccountId: string;

  /**
   * Workspace name
   */
  readonly name: string;

  /**
   * Workspace description
   */
  readonly description?: string;

  /**
   * Creation timestamp
   */
  readonly createdAt: string;
}

export interface WorkspaceCreatedEvent extends DomainEvent<WorkspaceCreatedEventData> {
  readonly eventType: 'WorkspaceCreated';
  readonly aggregateType: 'Workspace';
}

/**
 * WorkspaceUpdated - Workspace metadata was updated
 */
export interface WorkspaceUpdatedEventData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Updated name
   */
  readonly name?: string;

  /**
   * Updated description
   */
  readonly description?: string;

  /**
   * Update timestamp
   */
  readonly updatedAt: string;
}

export interface WorkspaceUpdatedEvent extends DomainEvent<WorkspaceUpdatedEventData> {
  readonly eventType: 'WorkspaceUpdated';
  readonly aggregateType: 'Workspace';
}

/**
 * ModuleEnabled - A module was enabled in the workspace
 */
export interface ModuleEnabledEventData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Module that was enabled
   */
  readonly moduleKey: ModuleKey;

  /**
   * When enabled
   */
  readonly enabledAt: string;
}

export interface ModuleEnabledEvent extends DomainEvent<ModuleEnabledEventData> {
  readonly eventType: 'ModuleEnabled';
  readonly aggregateType: 'Workspace';
}

/**
 * ModuleDisabled - A module was disabled in the workspace
 */
export interface ModuleDisabledEventData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Module that was disabled
   */
  readonly moduleKey: ModuleKey;

  /**
   * When disabled
   */
  readonly disabledAt: string;
}

export interface ModuleDisabledEvent extends DomainEvent<ModuleDisabledEventData> {
  readonly eventType: 'ModuleDisabled';
  readonly aggregateType: 'Workspace';
}

/**
 * WorkspaceSuspended - Workspace was suspended
 */
export interface WorkspaceSuspendedEventData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Reason for suspension
   */
  readonly reason: string;

  /**
   * Suspension timestamp
   */
  readonly suspendedAt: string;
}

export interface WorkspaceSuspendedEvent extends DomainEvent<WorkspaceSuspendedEventData> {
  readonly eventType: 'WorkspaceSuspended';
  readonly aggregateType: 'Workspace';
}

/**
 * WorkspaceArchived - Workspace was archived
 */
export interface WorkspaceArchivedEventData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Reason for archiving
   */
  readonly reason?: string;

  /**
   * Archive timestamp
   */
  readonly archivedAt: string;
}

export interface WorkspaceArchivedEvent extends DomainEvent<WorkspaceArchivedEventData> {
  readonly eventType: 'WorkspaceArchived';
  readonly aggregateType: 'Workspace';
}

// END OF FILE
