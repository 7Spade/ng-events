import { Injectable, inject } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { AuthStateService, AuthUserSnapshot } from '@platform-adapters';

import { FirebaseAuthBridgeService } from '../core/auth/firebase-auth-bridge.service';

/**
 * AuthStateFacade (skeleton)
 *
 * UI-facing facade that delegates to platform AuthStateService.
 * Keeps UI from touching SDK-specific details.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateFacade {
  // Optional to avoid runtime failures until concrete provider is wired.
  private platform = inject(AuthStateService, { optional: true });
  // Single token source from @delon/auth (use DA_SERVICE_TOKEN injection token)
  private tokenService: ITokenService | null = inject<ITokenService>(DA_SERVICE_TOKEN, { optional: true });
  private bridge = inject(FirebaseAuthBridgeService);

  init(): void {
    this.bridge.init();
    this.platform?.init();
  }

  waitForAuthState(): Promise<AuthUserSnapshot | null> {
    // Skeleton: prefer platform service, fallback to token snapshot
    return this.platform?.waitForAuthState() ?? (this.bridge.waitForAuthState() as Promise<AuthUserSnapshot | null>);
  }

  refreshToken(): Promise<string> {
    return this.platform?.refreshToken() ?? this.bridge.refreshToken();
  }

  /**
   * Expose token service for UI consumers that must read tokens,
   * keeping @delon/auth as唯一來源.
   */
  getTokenService(): ITokenService | null {
    return this.tokenService;
  }
}

// END OF FILE
