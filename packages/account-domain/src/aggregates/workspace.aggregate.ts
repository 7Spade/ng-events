import type { DomainEvent } from '@core-engine';

import type { CreateWorkspaceCommand } from '../commands';
import type { WorkspaceCreatedEvent } from '../events';

/**
 * WorkspaceAggregate (skeleton)
 *
 * Enforces Account → Workspace (blueprintId) boundary.
 */
export class WorkspaceAggregate {
  constructor(
    public readonly workspaceId: string,
    public readonly accountId: string,
    public readonly blueprintId: string
  ) {}

  static create(command: CreateWorkspaceCommand): WorkspaceCreatedEvent {
    const { workspaceId, accountId, blueprintId, metadata } = command;
    const event: DomainEvent<WorkspaceCreatedEvent['data']> = {
      id: metadata?.causedBy ?? workspaceId,
      aggregateId: workspaceId,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceCreated',
      data: { accountId, blueprintId },
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

  static replay(events: DomainEvent[]): WorkspaceAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    return new WorkspaceAggregate(first?.aggregateId ?? '', data.accountId ?? '', data.blueprintId ?? '');
  }

  apply(event: DomainEvent): void {
    void event;
  }
}

// END OF FILE
