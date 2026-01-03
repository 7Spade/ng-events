/**
 * Assign Task Handler
 * 
 * Skeleton: Handles AssignTaskCommand execution.
 * 🔒 NO IMPLEMENTATION - Abstract contract only
 */

import { AssignTaskCommand } from '../commands/AssignTaskCommand';

/**
 * Assign Task Command Handler
 * 
 * Abstract handler for assigning tasks to members.
 * Implementations will coordinate with TaskRepository and validate membership.
 */
export abstract class AssignTaskHandler {
  /**
   * Execute command to assign task
   * 
   * TODO: Load Task, validate member exists in workspace, assign, save events
   */
  abstract execute(command: AssignTaskCommand): Promise<void>;
}

// END OF FILE
