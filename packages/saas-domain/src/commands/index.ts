import type { CausalityMetadata } from '@core-engine';

export interface CommandMetadata extends CausalityMetadata {
  readonly timestamp?: number;
  readonly version?: number;
}

export interface CreateModuleCommand {
  readonly moduleId: string;
  readonly blueprintId: string;
  readonly key: string;
  readonly metadata?: CommandMetadata;
}

export interface EnableModuleCommand {
  readonly moduleId: string;
  readonly blueprintId: string;
  readonly enabled: boolean;
  readonly metadata?: CommandMetadata;
}

export interface CreateTaskCommand {
  readonly taskId: string;
  readonly blueprintId: string;
  readonly title: string;
  readonly metadata?: CommandMetadata;
}

export interface CreateIssueCommand {
  readonly issueId: string;
  readonly blueprintId: string;
  readonly summary: string;
  readonly metadata?: CommandMetadata;
}

// END OF FILE
