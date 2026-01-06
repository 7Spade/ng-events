import type { DomainEvent } from '@core-engine';

import type { CreateModuleCommand, EnableModuleCommand } from '../commands';
import type { ModuleCreatedEvent, ModuleEnabledEvent } from '../events';

/**
 * ModuleAggregate (skeleton)
 *
 * Gated by workspace blueprintId and enabledModules policy.
 */
export class ModuleAggregate {
  constructor(
    public readonly moduleId: string,
    public readonly key: string,
    public readonly blueprintId: string,
    public readonly enabled: boolean
  ) {}

  static create(command: CreateModuleCommand): ModuleCreatedEvent {
    const { moduleId, key, blueprintId, metadata } = command;
    const event: DomainEvent<ModuleCreatedEvent['data']> = {
      id: metadata?.causedBy ?? moduleId,
      aggregateId: moduleId,
      aggregateType: 'Module',
      eventType: 'ModuleCreated',
      data: { key, blueprintId },
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

  static enable(command: EnableModuleCommand): ModuleEnabledEvent {
    const { moduleId, enabled, blueprintId, metadata } = command;
    const event: DomainEvent<ModuleEnabledEvent['data']> = {
      id: metadata?.causedBy ?? moduleId,
      aggregateId: moduleId,
      aggregateType: 'Module',
      eventType: 'ModuleEnabled',
      data: { moduleId, enabled, blueprintId },
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

  static replay(events: DomainEvent[]): ModuleAggregate {
    const first = events[0];
    const data = (first?.data as any) ?? {};
    const lastEvent = events[events.length - 1];
    const enabled = (lastEvent?.data as any)?.enabled ?? true;
    return new ModuleAggregate(first?.aggregateId ?? '', data.key ?? '', data.blueprintId ?? '', enabled);
  }

  apply(event: DomainEvent): void {
    void event;
  }
}

// END OF FILE
