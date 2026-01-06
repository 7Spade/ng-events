import { Injectable, inject } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@delon/auth';

import { SessionContext } from '../session-context.interface';

/**
 * Assumed token payload (projection-fed, all optional):
 * uid/accountId/accountType/workspaceId/workspaceType/roles/abilities/modules/ownerAccountIds/expired.
 */
interface DelonTokenPayload extends ITokenModel {
  uid?: string;
  accountId?: string;
  accountType?: 'user' | 'organization' | 'bot';
  workspaceId?: string;
  workspaceType?: 'organization' | 'container';
  roles?: string[];
  abilities?: string[];
  modules?: string[];
  ownerAccountIds?: string[];
  expired?: number;
}

/**
 * DelonSessionContextAdapter
 *
 * Maps @delon/auth token storage to semantic SessionContext.
 * Keeps token structure knowledge inside the adapter boundary.
 */
@Injectable({ providedIn: 'root' })
export class DelonSessionContextAdapter implements SessionContext {
  private readonly tokenService = inject<ITokenService>(DA_SERVICE_TOKEN);

  private isTokenPayload(value: ITokenModel | null | undefined): value is DelonTokenPayload {
    return !!value && typeof value === 'object';
  }

  private get token(): DelonTokenPayload | undefined {
    const value = this.tokenService.get();
    return this.isTokenPayload(value) ? value : undefined;
  }

  // TODO(Phase3): replace token payload with projection-fed membership/workspace module data (event-sourced).
  // TODO(Phase0-Account): map accountId/accountType from Account projection when available (Account is actor).
  // TODO(Phase3-Owner): map ownerAccountIds (user/org only) when projection delivers them.
  get isAuthenticated(): boolean {
    return !!this.token?.token;
  }

  get userId(): string | null {
    const uid = this.token?.uid;
    return typeof uid === 'string' && uid ? uid : null;
  }

  get accountId(): string | null {
    const accountId = this.token?.accountId ?? this.token?.uid;
    return typeof accountId === 'string' && accountId ? accountId : null;
  }

  get actorAccountId(): string | null {
    return this.accountId;
  }

  get accountType(): 'user' | 'organization' | 'bot' | undefined {
    const accountType = this.token?.accountType;
    return accountType === 'user' || accountType === 'organization' || accountType === 'bot' ? accountType : undefined;
  }

  get workspaceId(): string | null {
    const workspace = this.token?.workspaceId;
    return typeof workspace === 'string' && workspace ? workspace : null;
  }

  get workspaceType(): 'organization' | 'container' | undefined {
    const workspaceType = this.token?.workspaceType;
    return workspaceType === 'organization' || workspaceType === 'container' ? workspaceType : undefined;
  }

  get roles(): string[] {
    const roles = this.token?.roles;
    return Array.isArray(roles) ? roles : [];
  }

  get abilities(): string[] {
    const abilities = this.token?.abilities;
    return Array.isArray(abilities) ? abilities : [];
  }

  get modules(): string[] {
    const modules = this.token?.modules;
    return Array.isArray(modules) ? modules.filter(m => typeof m === 'string' && !!m) : [];
  }

  get ownerAccountIds(): string[] {
    if (this.workspaceType !== 'container') return [];
    const owners = this.token?.ownerAccountIds;
    return Array.isArray(owners) ? owners.filter(id => typeof id === 'string' && !!id) : [];
  }

  get expiresAt(): Date | undefined {
    const expired = this.token?.expired;
    if (typeof expired === 'number') return new Date(expired);
    return undefined;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isExpired(): boolean {
    const expiry = this.expiresAt;
    return !!expiry && Date.now() > expiry.getTime();
  }
}

// END OF FILE
