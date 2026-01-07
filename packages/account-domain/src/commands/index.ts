import type { CausalityMetadata } from '@core-engine';

export interface CommandMetadata extends CausalityMetadata {
  readonly actorAccountId?: string;
  readonly timestamp?: number;
  readonly version?: number;
}

export interface CreateAccountCommand {
  readonly accountId: string;
  readonly ownerUserId: string;
  readonly blueprintId?: string;
  readonly metadata?: CommandMetadata;
}

export interface CreateWorkspaceCommand {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly blueprintId: string;
  readonly metadata?: CommandMetadata;
}

export interface InviteMemberCommand {
  readonly membershipId: string;
  readonly workspaceId: string;
  readonly memberUserId: string;
  readonly roles: string[];
  readonly blueprintId: string;
  readonly metadata?: CommandMetadata;
}

// END OF FILE

export * from './enable-module.command';
