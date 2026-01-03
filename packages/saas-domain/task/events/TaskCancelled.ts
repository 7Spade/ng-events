import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * TaskCancelled Event Payload
 */
export interface TaskCancelledPayload {
  /** Reason for cancellation */
  reason?: string;
  /** Timestamp of cancellation */
  cancelledAt: string;
}

/**
 * TaskCancelled Domain Event
 * 
 * Raised when a task is cancelled.
 */
export type TaskCancelled = DomainEvent<
  TaskCancelledPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'TaskCancelled';
  aggregateType: 'TaskEntity';
};
