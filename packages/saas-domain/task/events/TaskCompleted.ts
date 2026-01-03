import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * TaskCompleted Event Payload
 */
export interface TaskCompletedPayload {
  /** Timestamp of completion */
  completedAt: string;
  /** Optional completion notes */
  notes?: string;
}

/**
 * TaskCompleted Domain Event
 * 
 * Raised when a task is marked as completed.
 */
export type TaskCompleted = DomainEvent<
  TaskCompletedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'TaskCompleted';
  aggregateType: 'TaskEntity';
};
