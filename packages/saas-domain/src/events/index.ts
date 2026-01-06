import type { DomainEvent } from '@core-engine';

export interface ModuleCreatedPayload {
  readonly key: string;
  readonly blueprintId: string;
}

export type ModuleCreatedEvent = DomainEvent<ModuleCreatedPayload>;

export interface ModuleEnabledPayload {
  readonly moduleId: string;
  readonly enabled: boolean;
  readonly blueprintId: string;
}

export type ModuleEnabledEvent = DomainEvent<ModuleEnabledPayload>;

export interface TaskCreatedPayload {
  readonly title: string;
  readonly blueprintId: string;
}

export type TaskCreatedEvent = DomainEvent<TaskCreatedPayload>;

export interface IssueCreatedPayload {
  readonly summary: string;
  readonly blueprintId: string;
}

export type IssueCreatedEvent = DomainEvent<IssueCreatedPayload>;

// END OF FILE
