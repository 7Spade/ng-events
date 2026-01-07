import type { CreateWorkspaceCommand } from '@account-domain';

import { AuthAdapterService } from '../auth/auth-adapter.service';

/**
 * WorkspaceFacade (skeleton)
 *
 * Adapter layer entry for workspace operations. Enriches commands with
 * session-derived blueprintId before delegating to domain/application services.
 */
export class WorkspaceFacade {
  constructor(private readonly auth: AuthAdapterService) {}

  async create(command: CreateWorkspaceCommand): Promise<CreateWorkspaceCommand> {
    const blueprintId = await this.auth.ensureBlueprintId(command.blueprintId);
    return { ...command, blueprintId: blueprintId ?? command.blueprintId };
  }
}

// END OF FILE
