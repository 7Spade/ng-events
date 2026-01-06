/**
 * Core Engine Facade
 *
 * 🎭 Bridge between Angular UI and core-engine/saas-domain
 *
 * This facade provides a clean API for the UI to interact with:
 * - Domain logic from core-engine
 * - Business rules from saas-domain
 * - Platform adapters
 *
 * The UI should NEVER import core-engine or saas-domain directly.
 * Always go through this facade.
 */

import { Injectable, inject } from '@angular/core';
import { FirebaseAuthBridgeService } from '@core/auth/firebase-auth-bridge.service';

/**
 * Facade for accessing core functionality from Angular UI
 *
 * Benefits:
 * - Hides complexity from UI components
 * - Provides a stable API even if internal structure changes
 * - Makes testing easier (mock the facade instead of many services)
 */
@Injectable({ providedIn: 'root' })
export class CoreEngineFacade {
  // Auth bridge (Firebase ↔ @delon/auth)
  private authBridge = inject(FirebaseAuthBridgeService);

  /**
   * Initialize the facade
   * Called during app startup
   */
  init(): void {
    this.authBridge.init();
  }

  // Auth operations
  getCurrentUser() {
    return this.authBridge.getCurrentUser();
  }

  async refreshToken(): Promise<string> {
    return this.authBridge.refreshToken();
  }
}

// END OF FILE
