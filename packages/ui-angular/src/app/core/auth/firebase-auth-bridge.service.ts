import { Injectable, inject } from '@angular/core';
import { Auth, Unsubscribe, onAuthStateChanged, User } from '@angular/fire/auth';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ReplaySubject, firstValueFrom, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthBridgeService {
  private auth = inject(Auth);
  private tokenService = inject<ITokenService>(DA_SERVICE_TOKEN);
  private authState$ = new ReplaySubject<User | null>(1);
  private unsubscribeFn?: Unsubscribe;

  /**
   * 初始化 Firebase Auth 狀態監聽
   * 自動同步到 @delon/auth
   *
   * NOTE: 只建立一次監聽，避免重複 onAuthStateChanged 造成競態
   */
  init(): void {
    if (this.unsubscribeFn) {
      return;
    }

    this.unsubscribeFn = onAuthStateChanged(this.auth, async (user: User | null) => {
      await this.syncToken(user);
      this.authState$.next(user);
    });

    // Seed latest auth state immediately to unblock waiters and keep token service in sync.
    void this.syncToken(this.auth.currentUser);
    this.authState$.next(this.auth.currentUser);
  }

  /**
   * 強制刷新 token
   */
  async refreshToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      this.tokenService.clear();
      throw new Error('No authenticated user');
    }
    const token = await user.getIdToken(true); // 強制刷新
    await this.setTokenOnService(user, token);
    this.authState$.next(user);
    return token;
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * 單一來源的 Auth 狀態 (避免多處監聽)
   */
  waitForAuthState(): Promise<User | null> {
    return firstValueFrom(this.authState$.pipe(take(1)));
  }

  private async syncToken(user: User | null): Promise<void> {
    try {
      if (user) {
        await this.setTokenOnService(user);
      } else {
        this.tokenService.clear();
      }
    } catch (error) {
      console.warn('[FirebaseAuthBridgeService] syncToken failed; clearing token', error);
      this.tokenService.clear();
    }
  }

  private async setTokenOnService(user: User, token?: string): Promise<void> {
    const [resolvedToken, idTokenResult] = await Promise.all([token ?? user.getIdToken(), user.getIdTokenResult()]);
    const tokenExpiration = new Date(idTokenResult.expirationTime).getTime();
    const blueprintId =
      typeof idTokenResult.claims?.['blueprintId'] === 'string'
        ? (idTokenResult.claims['blueprintId'] as string)
        : undefined;

    this.tokenService.set({
      token: resolvedToken,
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email,
      avatar: user.photoURL,
      expired: tokenExpiration,
      blueprintId
    });
  }
}

// END OF FILE
