/**
 * SessionContext (skeleton)
 *
 * Workspace / account session view exposed to infrastructure & adapters.
 * UI must consume via adapters/facades, never directly modify.
 *
 * NOTE: Skeleton only — no runtime logic here.
 */
export interface SessionContext {
  readonly tenantId?: string;
  /**
   * Workspace-scoped boundary (Account → Workspace/blueprint → Module → Entity).
   */
  readonly blueprintId?: string;
  readonly uid?: string;
  readonly issuedAt?: number;
  readonly expiresAt?: number;
}

// END OF FILE
