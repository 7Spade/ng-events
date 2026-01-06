import type { DomainEvent } from '@core-engine';

import type { CreateTaskCommand } from '../commands';
import type { TaskCreatedEvent } from '../events';

export class TaskAggregate {
  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly blueprintId: string
  ) {}

  static create(command: CreateTaskCommand): TaskCreatedEvent {
    const { taskId, title, blueprintId, metadata } = command;
    const event: DomainEvent<TaskCreatedEvent['data']> = {
      id: metadata?.causedBy ?? taskId,
      aggregateId: taskId,
      aggregateType: 'Task',
      eventType: 'TaskCreated',
      data: { title, blueprintId },
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

  static replay(events: DomainEvent[]): TaskAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    return new TaskAggregate(first?.aggregateId ?? '', data.title ?? '', data.blueprintId ?? '');
  }

  apply(event: DomainEvent): void {
    void event;
  }
}

// END OF FILE
