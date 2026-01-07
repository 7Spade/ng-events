import type { DomainEvent } from '@core-engine';
import type { ModuleKey } from '@core-engine/src/module-system/module-key';

export interface WorkspaceModuleEnabledPayload {
  readonly workspaceId: string;
  readonly moduleKey: ModuleKey;
  readonly enabledBy: string;
}

export type WorkspaceModuleEnabled = DomainEvent<WorkspaceModuleEnabledPayload>;

// END OF FILE
