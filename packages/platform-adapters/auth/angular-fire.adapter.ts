/**
 * Firebase Angular Auth State Adapter
 * 
 * 🌐 Frontend auth state management
 * 
 * ✅ IMPORTANT: This file ONLY runs in Angular/browser
 * ✅ Uses @angular/fire (Client SDK wrapper)
 * ❌ NEVER use firebase-admin in this file
 * 
 * Handles client-side auth state only.
 */

import { Injectable, inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Angular Firebase Auth State Adapter
 * 
 * Provides reactive auth state for UI components.
 */
@Injectable({ providedIn: 'root' })
export class AngularFireAuthStateAdapter {
  private auth = inject(Auth);
  
  /**
   * Get current user (client-side only)
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
  
  /**
   * Get user ID token
   */
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
  
  /**
   * Get custom claims (permissions)
   */
  async getCustomClaims(): Promise<Record<string, any>> {
    const user = this.auth.currentUser;
    if (!user) return {};
    
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims;
  }
}

// END OF FILE
