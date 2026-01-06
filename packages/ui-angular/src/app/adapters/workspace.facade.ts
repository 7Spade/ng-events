import { Injectable, inject } from '@angular/core';
import type { CreateWorkspaceCommand } from '@account-domain';
import { WorkspaceFacade as PlatformWorkspaceFacade } from '@platform-adapters';

import { SessionFacadeService } from '../core/auth/session-facade.service';

/**
 * WorkspaceFacade (UI)
 *
 * Delegates workspace operations to platform adapters while enriching
 * commands with blueprintId from the current session.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceFacade {
  private readonly platform = inject(PlatformWorkspaceFacade, { optional: true });
  private readonly session = inject(SessionFacadeService);

  async create(command: CreateWorkspaceCommand): Promise<CreateWorkspaceCommand> {
    const blueprintId = command.blueprintId ?? this.session.blueprintId ?? undefined;
    const enriched: CreateWorkspaceCommand = { ...command, blueprintId };
    return this.platform?.create(enriched) ?? enriched;
  }
}

// END OF FILE
