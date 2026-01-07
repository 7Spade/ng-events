import type { InviteMemberCommand } from '@account-domain';

import { AuthAdapterService } from '../auth/auth-adapter.service';

/**
 * MembershipFacade (skeleton)
 *
 * Injects session metadata (uid/blueprintId) into membership commands.
 */
export class MembershipFacade {
  constructor(private readonly auth: AuthAdapterService) {}

  async invite(command: InviteMemberCommand): Promise<InviteMemberCommand> {
    const blueprintId = await this.auth.ensureBlueprintId(command.blueprintId);
    return {
      ...command,
      blueprintId: blueprintId ?? command.blueprintId,
      metadata: {
        ...command.metadata,
        causedByUser: (await this.auth.getSession())?.uid
      }
    };
  }
}

// END OF FILE
