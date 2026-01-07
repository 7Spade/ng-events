import type { DomainEvent } from '@core-engine';

export interface AccountCreatedPayload {
  readonly ownerUserId: string;
}

export type AccountCreatedEvent = DomainEvent<AccountCreatedPayload>;

export interface WorkspaceCreatedPayload {
  readonly accountId: string;
  readonly blueprintId: string;
}

export type WorkspaceCreatedEvent = DomainEvent<WorkspaceCreatedPayload>;

export interface MembershipCreatedPayload {
  readonly workspaceId: string;
  readonly memberUserId: string;
  readonly roles: string[];
}

export type MembershipCreatedEvent = DomainEvent<MembershipCreatedPayload>;

export type { WorkspaceModuleEnabled, WorkspaceModuleEnabledPayload } from './workspace-module-enabled.event';

// END OF FILE
