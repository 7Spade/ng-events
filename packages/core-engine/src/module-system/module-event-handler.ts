import type { WorkspaceModuleEnabled } from '@account-domain';

export interface ModuleEventHandler {
  onWorkspaceModuleEnabled(event: WorkspaceModuleEnabled): void | Promise<void>;
}

// END OF FILE
