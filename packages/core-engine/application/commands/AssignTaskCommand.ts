/**
 * Assign Task Command
 * 
 * Skeleton: User intent to assign a task to a member.
 * 🔒 NO IMPLEMENTATION - Data structure only
 */

/**
 * Assign Task Command
 * 
 * Represents user intent to assign a task to a workspace member.
 */
export interface AssignTaskCommand {
  taskId: string;
  memberId: string;
  workspaceId: string;
  assignedBy: string;
}

// END OF FILE
