/**
 * SessionContext (UI-facing semantics)
 *
 * Pure semantic contract with no framework or provider details.
 * Represents the authenticated session exposed to guards/UI/ACL.
 */
export interface SessionContext {
  isAuthenticated: boolean;
  userId: string | null;
  /**
   * Actor identity (account); may be null until projections hydrate.
   */
  accountId: string | null;
  accountType?: 'user' | 'organization' | 'bot';
  /**
   * Breadcrumb for causality metadata (Account → Workspace → Module → Entity → Event).
   * Metadata only; no enforcement here.
   */
  actorAccountId?: string | null;
  /**
   * Workspace scope only (no actor semantics).
   */
  workspaceId: string | null;
  workspaceType?: 'organization' | 'container';
  /**
   * Workspace owners (container only); actors must be user or organization.
   */
  ownerAccountIds?: string[];
  roles: string[];
  abilities?: string[];
  modules?: string[];
  expiresAt?: Date;
  hasRole(role: string): boolean;
  isExpired(): boolean;
}

// END OF FILE
