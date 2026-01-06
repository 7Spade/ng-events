import type { DomainEvent } from '@core-engine';

import type { CreateIssueCommand } from '../commands';
import type { IssueCreatedEvent } from '../events';

export class IssueAggregate {
  constructor(
    public readonly issueId: string,
    public readonly summary: string,
    public readonly blueprintId: string
  ) {}

  static create(command: CreateIssueCommand): IssueCreatedEvent {
    const { issueId, summary, blueprintId, metadata } = command;
    const event: DomainEvent<IssueCreatedEvent['data']> = {
      id: metadata?.causedBy ?? issueId,
      aggregateId: issueId,
      aggregateType: 'Issue',
      eventType: 'IssueCreated',
      data: { summary, blueprintId },
      metadata: {
        timestamp: metadata?.timestamp ?? Date.now(),
        version: metadata?.version,
        causedBy: metadata?.causedBy,
        causedByUser: metadata?.causedByUser,
        causedByAction: metadata?.causedByAction,
        blueprintId
      }
    };
    return event;
  }

  static replay(events: DomainEvent[]): IssueAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    return new IssueAggregate(first?.aggregateId ?? '', data.summary ?? '', data.blueprintId ?? '');
  }

  apply(event: DomainEvent): void {
    void event;
  }
}

// END OF FILE
