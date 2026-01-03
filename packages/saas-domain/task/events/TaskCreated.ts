import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * TaskCreated Event Payload
 * 
 * Data structure for the TaskCreated domain event.
 */
export interface TaskCreatedPayload {
  /** Workspace where the task belongs (critical: NOT ownerId) */
  workspaceId: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Initial status */
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  /** Optional assignee account ID */
  assigneeId?: string;
  /** Optional priority */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * TaskCreated Domain Event
 * 
 * Raised when a new task is created within a workspace.
 * Follows DomainEvent<TPayload, TId, TMetadata> pattern.
 * 
 * **Causality chain:**
 * - causedBy: ModuleEnabled event ID (module must be enabled first)
 * - causedByUser: Account ID of the user creating the task
 * - causedByAction: 'task.create'
 * - blueprintId: workspaceId (multi-tenant boundary)
 */
export type TaskCreated = DomainEvent<
  TaskCreatedPayload,    // TPayload
  string,                // TId (TaskId)
  CausalityMetadata      // TMetadata
> & {
  eventType: 'TaskCreated';
  aggregateType: 'TaskEntity';
};
