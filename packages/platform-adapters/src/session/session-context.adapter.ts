import { SessionContext } from '@core-engine';

/**
 * SessionContextAdapter (skeleton)
 *
 * Bridges platform-specific session sources (e.g., Firebase, custom API)
 * to the framework-agnostic SessionContext shape.
 */
export abstract class SessionContextAdapter {
  /**
   * Retrieve the current session view.
   */
  abstract getContext(): Promise<SessionContext | null>;

  /**
   * Optional hook to refresh / re-hydrate session data.
   */
  abstract refresh(): Promise<void>;
}

// END OF FILE
