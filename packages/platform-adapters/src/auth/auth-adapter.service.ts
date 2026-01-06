import type { SessionContext } from '@core-engine';

import { SessionContextAdapter } from '../session/session-context.adapter';

/**
 * AuthAdapterService
 *
 * Enriches commands/events with session claims (uid, blueprintId, roles).
 * Concrete infrastructure (Firebase, HTTP) should extend this base class.
 */
export class AuthAdapterService {
  constructor(protected readonly sessionAdapter: SessionContextAdapter) {}

  async getSession(): Promise<SessionContext | null> {
    return this.sessionAdapter.getContext();
  }

  async ensureBlueprintId(commandBlueprintId?: string): Promise<string | undefined> {
    const session = await this.getSession();
    return commandBlueprintId ?? session?.blueprintId ?? session?.tenantId;
  }
}

// END OF FILE
