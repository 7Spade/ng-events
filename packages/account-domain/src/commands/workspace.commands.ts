/**
 * Workspace Commands
 *
 * Commands for managing Workspace aggregates.
 *
 * Core Principles:
 * - Workspace creation requires an owner Account
 * - Module enabling/disabling is workspace-scoped
 * - Only workspace owner or admins can modify workspace
 */

import { Command } from '@ng-events/core-engine';
import { ModuleKey } from '../types/workspace.types';

/**
 * CreateWorkspaceCommand - Create a new workspace
 */
export interface CreateWorkspaceCommandData {
  /**
   * Workspace ID (equals blueprintId)
   */
  readonly workspaceId: string;

  /**
   * Account ID of the owner
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
   * Initial modules to enable (optional)
   */
  readonly initialModules?: ModuleKey[];
}

export interface CreateWorkspaceCommand extends Command<CreateWorkspaceCommandData> {
  readonly commandType: 'CreateWorkspaceCommand';
}

/**
 * UpdateWorkspaceCommand - Update workspace metadata
 */
export interface UpdateWorkspaceCommandData {
  /**
   * Workspace ID to update
   */
  readonly workspaceId: string;

  /**
   * Updated name (optional)
   */
  readonly name?: string;

  /**
   * Updated description (optional)
   */
  readonly description?: string;
}

export interface UpdateWorkspaceCommand extends Command<UpdateWorkspaceCommandData> {
  readonly commandType: 'UpdateWorkspaceCommand';
}

/**
 * EnableModuleCommand - Enable a module in the workspace
 */
export interface EnableModuleCommandData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Module to enable
   */
  readonly moduleKey: ModuleKey;
}

export interface EnableModuleCommand extends Command<EnableModuleCommandData> {
  readonly commandType: 'EnableModuleCommand';
}

/**
 * DisableModuleCommand - Disable a module in the workspace
 */
export interface DisableModuleCommandData {
  /**
   * Workspace ID
   */
  readonly workspaceId: string;

  /**
   * Module to disable
   */
  readonly moduleKey: ModuleKey;
}

export interface DisableModuleCommand extends Command<DisableModuleCommandData> {
  readonly commandType: 'DisableModuleCommand';
}

/**
 * SuspendWorkspaceCommand - Suspend a workspace
 */
export interface SuspendWorkspaceCommandData {
  /**
   * Workspace ID to suspend
   */
  readonly workspaceId: string;

  /**
   * Reason for suspension
   */
  readonly reason: string;
}

export interface SuspendWorkspaceCommand extends Command<SuspendWorkspaceCommandData> {
  readonly commandType: 'SuspendWorkspaceCommand';
}

/**
 * ArchiveWorkspaceCommand - Archive a workspace
 */
export interface ArchiveWorkspaceCommandData {
  /**
   * Workspace ID to archive
   */
  readonly workspaceId: string;

  /**
   * Reason for archiving
   */
  readonly reason?: string;
}

export interface ArchiveWorkspaceCommand extends Command<ArchiveWorkspaceCommandData> {
  readonly commandType: 'ArchiveWorkspaceCommand';
}

// END OF FILE
