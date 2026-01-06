import { Injectable, inject } from '@angular/core';
import type { User } from '@angular/fire/auth';

import { SESSION_CONTEXT } from '../session-context.token';
import { FirebaseAuthBridgeService } from './firebase-auth-bridge.service';

/**
 * SessionFacadeService
 *
 * UI-level facade exposing auth state and session context without
 * leaking SDK details.
 */
@Injectable({ providedIn: 'root' })
export class SessionFacadeService {
  private readonly bridge = inject(FirebaseAuthBridgeService);
  private readonly session = inject(SESSION_CONTEXT);

  waitForAuthState(): Promise<User | null> {
    return this.bridge.waitForAuthState();
  }

  refreshToken(): Promise<string> {
    return this.bridge.refreshToken();
  }

  get blueprintId(): string | null {
    return this.session.blueprintId ?? this.session.workspaceId ?? null;
  }

  get context() {
    return this.session;
  }
}

// END OF FILE
