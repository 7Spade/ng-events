import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * IssueAssigned Event Payload
 */
export interface IssueAssignedPayload {
  assigneeId: string;
  assignedAt: string;
}

/**
 * IssueAssigned Domain Event
 */
export type IssueAssigned = DomainEvent<
  IssueAssignedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'IssueAssigned';
  aggregateType: 'IssueEntity';
};
