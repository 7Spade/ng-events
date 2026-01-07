import type { DomainEvent } from '@core-engine';
import type { ModuleManifest } from '@core-engine/src/module-system/module-manifest';
import type { ModuleKey } from '@core-engine/src/module-system/module-key';
import type { ModuleRegistry } from '@core-engine/src/module-system/module-registry';
import { ModuleGuard } from '@core-engine/src/module-system/module-guard';

import type { CreateWorkspaceCommand, EnableModuleCommand } from '../commands';
import type { WorkspaceCreatedEvent, WorkspaceModuleEnabled } from '../events';

/**
 * WorkspaceAggregate (skeleton)
 *
 * Enforces Account → Workspace (blueprintId) boundary.
 */
export class WorkspaceAggregate {
  constructor(
    public readonly workspaceId: string,
    public readonly accountId: string,
    public readonly blueprintId: string,
    public enabledModules: ModuleKey[] = []
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
        actorAccountId: metadata?.actorAccountId ?? accountId,
        blueprintId
      }
    };
    return event;
  }

  static replay(events: DomainEvent[]): WorkspaceAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    const aggregate = new WorkspaceAggregate(first?.aggregateId ?? '', data.accountId ?? '', data.blueprintId ?? '', []);
    for (const event of events) {
      aggregate.apply(event);
    }
    return aggregate;
  }

  enableModule(
    command: EnableModuleCommand,
    registry: ModuleRegistry,
    manifests: ModuleManifest[]
  ): WorkspaceModuleEnabled {
    ModuleGuard.assertWorkspaceContext(command.workspaceId);

    if (!registry.canEnable(command.moduleKey, this.enabledModules, manifests)) {
      throw new Error('Module dependencies not satisfied');
    }

    const event: WorkspaceModuleEnabled = {
      id: command.metadata?.causedBy ?? `${command.workspaceId}:${command.moduleKey}`,
      aggregateId: command.workspaceId,
      aggregateType: 'Workspace',
      eventType: 'WorkspaceModuleEnabled',
      data: {
        workspaceId: command.workspaceId,
        moduleKey: command.moduleKey,
        enabledBy: command.actorAccountId
      },
      metadata: {
        timestamp: command.metadata?.timestamp ?? Date.now(),
        version: command.metadata?.version,
        causedBy: command.metadata?.causedBy,
        causedByUser: command.metadata?.causedByUser,
        causedByAction: command.metadata?.causedByAction,
        actorAccountId: command.actorAccountId,
        blueprintId: command.blueprintId
      }
    };

    this.apply(event);
    return event;
  }

  apply(event: DomainEvent): void {
    if (event.eventType === 'WorkspaceModuleEnabled') {
      const data = event.data as any;
      if (!this.enabledModules.includes(data.moduleKey)) {
        this.enabledModules.push(data.moduleKey);
      }
    }
  }
}

// END OF FILE
