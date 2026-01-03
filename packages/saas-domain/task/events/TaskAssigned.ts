import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * TaskAssigned Event Payload
 */
export interface TaskAssignedPayload {
  /** Account ID of the assignee */
  assigneeId: string;
  /** Timestamp of assignment */
  assignedAt: string;
}

/**
 * TaskAssigned Domain Event
 * 
 * Raised when a task is assigned to a user.
 */
export type TaskAssigned = DomainEvent<
  TaskAssignedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'TaskAssigned';
  aggregateType: 'TaskEntity';
};
