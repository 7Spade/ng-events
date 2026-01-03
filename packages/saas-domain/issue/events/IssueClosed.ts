import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * IssueClosed Event Payload
 */
export interface IssueClosedPayload {
  closedAt: string;
  resolution?: string;
}

/**
 * IssueClosed Domain Event
 */
export type IssueClosed = DomainEvent<
  IssueClosedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'IssueClosed';
  aggregateType: 'IssueEntity';
};
