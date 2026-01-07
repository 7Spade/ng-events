import type { ModuleEventHandler } from '@core-engine/src/module-system/module-event-handler';
import type { WorkspaceModuleEnabled } from '@account-domain';

export class IssueModuleHandler implements ModuleEventHandler {
  async onWorkspaceModuleEnabled(event: WorkspaceModuleEnabled): Promise<void> {
    if (event.data.moduleKey !== 'issue') {
      return;
    }

    // TODO: Initialize issue read models/projections for the workspace
    void event;
  }
}

// END OF FILE
