import { Injectable, inject } from '@angular/core';
import type { InviteMemberCommand } from '@account-domain';
import { MembershipFacade as PlatformMembershipFacade } from '@platform-adapters';

import { SessionFacadeService } from '../core/auth/session-facade.service';

/**
 * MembershipFacade (UI)
 *
 * Provides UI-facing membership operations scoped by blueprintId and actor uid.
 */
@Injectable({ providedIn: 'root' })
export class MembershipFacade {
  private readonly platform = inject(PlatformMembershipFacade, { optional: true });
  private readonly session = inject(SessionFacadeService);

  async invite(command: InviteMemberCommand): Promise<InviteMemberCommand> {
    const blueprintId = command.blueprintId ?? this.session.blueprintId ?? undefined;
    const enriched: InviteMemberCommand = {
      ...command,
      blueprintId,
      metadata: {
        ...command.metadata,
        causedByUser: this.session.context.userId ?? undefined
      }
    };
    return this.platform?.invite(enriched) ?? enriched;
  }
}

// END OF FILE
