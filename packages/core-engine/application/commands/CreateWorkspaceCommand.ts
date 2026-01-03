/**
 * Create Workspace Command
 * 
 * Skeleton: User intent to create a new workspace.
 * 🔒 NO IMPLEMENTATION - Data structure only
 */

/**
 * Create Workspace Command
 * 
 * Represents user intent to create a new workspace within an account.
 */
export interface CreateWorkspaceCommand {
  accountId: string;
  name: string;
  ownerId: string;
  blueprintId?: string;
}

// END OF FILE
