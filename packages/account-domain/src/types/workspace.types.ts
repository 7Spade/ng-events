/**
 * Workspace Types
 *
 * Workspace is the multi-tenant boundary (blueprintId) in the system.
 *
 * Core Principles (from architecture docs):
 * - Workspace is the container for tenant-specific data (blueprintId boundary)
 * - One Workspace = One blueprintId
 * - Modules are enabled/disabled at Workspace level
 * - Workspace ownership and membership are separate concerns
 * - Organization is NOT a Workspace - it's an Account type that can own Workspaces
 *
 * Flow: Account (誰) → Workspace (在哪) → Module (做什麼) → Entity (狀態)
 */

/**
 * ModuleKey - Identifier for available modules
 */
export type ModuleKey = 'task' | 'issue' | 'payment' | 'analytics';

/**
 * WorkspaceStatus - Lifecycle status
 */
export type WorkspaceStatus = 'active' | 'suspended' | 'archived';

/**
 * Workspace State - Current state of a Workspace aggregate
 */
export interface WorkspaceState {
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
   * Current status
   */
  readonly status: WorkspaceStatus;

  /**
   * Enabled modules
   */
  readonly enabledModules: ModuleKey[];

  /**
   * Creation timestamp
   */
  readonly createdAt: string;

  /**
   * Last update timestamp
   */
  readonly updatedAt?: string;
}

// END OF FILE
