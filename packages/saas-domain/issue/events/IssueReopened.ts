import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * IssueReopened Event Payload
 */
export interface IssueReopenedPayload {
  reopenedAt: string;
  reason?: string;
}

/**
 * IssueReopened Domain Event
 */
export type IssueReopened = DomainEvent<
  IssueReopenedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'IssueReopened';
  aggregateType: 'IssueEntity';
};
