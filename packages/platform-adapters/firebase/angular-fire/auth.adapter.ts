/**
 * Firebase Angular Auth Adapter
 *
 * 🌐 Frontend implementation using @angular/fire SDK
 *
 * ✅ IMPORTANT: This file ONLY runs in Angular/browser
 * ✅ Uses @angular/fire (Client SDK wrapper)
 * ❌ NEVER use firebase-admin in this file
 *
 * Bridges Firebase Auth with @delon/auth token service
 */

import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthAdapter {
  private auth = inject(Auth);
  private tokenService = inject(DA_SERVICE_TOKEN);
  private router = inject(Router);

  /**
   * 初始化 Firebase Auth 狀態監聽
   * 自動同步到 @delon/auth
   */
  init(): void {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        // 用戶已登入
        const token = await user.getIdToken();
        const tokenExpiration = await this.getTokenExpiration(user);

        this.tokenService.set({
          token,
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          avatar: user.photoURL,
          expired: tokenExpiration
        });
      } else {
        // 用戶已登出
        this.tokenService.clear();
      }
    });
  }

  /**
   * 獲取 token 過期時間（毫秒時間戳）
   */
  private async getTokenExpiration(user: User): Promise<number> {
    const idTokenResult = await user.getIdTokenResult();
    return new Date(idTokenResult.expirationTime).getTime();
  }

  /**
   * 強制刷新 token
   */
  async refreshToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    const token = await user.getIdToken(true); // 強制刷新
    return token;
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}

// END OF FILE
