import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

/**
 * IssueCreated Event Payload
 */
export interface IssueCreatedPayload {
  workspaceId: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'closed' | 'reopened';
  type: 'bug' | 'feature' | 'enhancement' | 'task';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  reporterId: string;
}

/**
 * IssueCreated Domain Event
 */
export type IssueCreated = DomainEvent<
  IssueCreatedPayload,
  string,
  CausalityMetadata
> & {
  eventType: 'IssueCreated';
  aggregateType: 'IssueEntity';
};
