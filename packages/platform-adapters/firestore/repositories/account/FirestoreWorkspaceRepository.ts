/**
 * Firestore Workspace Repository
 * 
 * Implements WorkspaceRepository using dual-track pattern:
 * - WRITES: EventStore (event persistence)
 * - READS: Projections (query-optimized read models)
 * 
 * ✅ FULLY IMPLEMENTED - Phase 1D Infrastructure Layer
 * 🎯 Purpose: Persist and query Workspace aggregates
 * ⚠️ CRITICAL: Multi-tenant isolation via ownerId (Account ID)
 */

import { WorkspaceRepository } from '@ng-events/account-domain/workspace/repositories/WorkspaceRepository';
import { Workspace, WorkspaceEvent } from '@ng-events/account-domain/workspace/aggregates/Workspace';
import { WorkspaceStatus } from '@ng-events/account-domain/workspace/events/WorkspaceCreated';
import { FirestoreRepository } from '../FirestoreRepository';
import { Firestore, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

/**
 * Firestore-based Workspace Repository
 * 
 * Dual-Track Pattern:
 * - save(): Appends events to EventStore at events/Workspace/{workspaceId}/events/{eventId}
 * - load(): Reconstructs aggregate from EventStore events via Workspace.fromEvents()
 * - findByAccountId(): Queries projections/workspace collection WHERE accountId = X
 * - findByStatus(): Queries projections/workspace collection WHERE status = X
 * 
 * Multi-Tenant Isolation:
 * - Workspace uses ownerId (accountId) as isolation boundary
 * - NOT workspaceId (workspaceId is for SaaS entities like Task/Payment/Issue)
 */
export class FirestoreWorkspaceRepository 
  extends FirestoreRepository<Workspace, string> 
  implements WorkspaceRepository {

  /**
   * @param eventStore - Firestore EventStore instance
   * @param db - Firestore database instance for projection queries
   */
  constructor(
    eventStore: any, // FirestoreEventStore type
    private readonly db: Firestore
  ) {
    super(eventStore);
  }

  /**
   * Rebuild Workspace aggregate from event history
   * 
   * @param id - Workspace ID
   * @param events - Array of workspace events
   * @returns Workspace aggregate instance
   */
  protected fromEvents(id: string, events: any[]): Workspace {
    return Workspace.fromEvents(id, events as WorkspaceEvent[]);
  }

  /**
   * Get aggregate type name for EventStore path construction
   * 
   * @returns Aggregate type name 'Workspace'
   */
  protected getAggregateType(): string {
    return 'Workspace';
  }

  /**
   * Find all workspaces owned by an account
   * 
   * Queries: projections/workspace WHERE accountId = {accountId}
   * 
   * @param accountId - Account ID (ownerId)
   * @returns Array of workspace aggregates
   * 
   * @example
   * ```typescript
   * const workspaces = await repo.findByAccountId('acc-123');
   * // Returns all workspaces owned by account acc-123
   * ```
   */
  async findByAccountId(accountId: string): Promise<Workspace[]> {
    const q = query(
      collection(this.db, 'projections/workspace'),
      where('accountId', '==', accountId)
    );

    const snapshot = await getDocs(q);
    const workspaceIds = snapshot.docs.map(doc => doc.id);

    // Load aggregates from EventStore
    const workspaces = await Promise.all(
      workspaceIds.map(id => this.load(id))
    );

    return workspaces.filter(w => w !== null) as Workspace[];
  }

  /**
   * Find all ready workspaces
   * 
   * Queries: projections/workspace WHERE status = 'ready'
   * 
   * @returns Array of ready workspace aggregates
   * 
   * @example
   * ```typescript
   * const readyWorkspaces = await repo.findReadyWorkspaces();
   * ```
   */
  async findReadyWorkspaces(): Promise<Workspace[]> {
    return this.findByStatus('ready');
  }

  /**
   * Find workspaces by status
   * 
   * Queries: projections/workspace WHERE status = {status}
   * 
   * @param status - Workspace status filter
   * @returns Array of workspace aggregates matching the status
   * 
   * @example
   * ```typescript
   * const archivedWorkspaces = await repo.findByStatus('archived');
   * ```
   */
  async findByStatus(status: WorkspaceStatus): Promise<Workspace[]> {
    const q = query(
      collection(this.db, 'projections/workspace'),
      where('status', '==', status)
    );

    const snapshot = await getDocs(q);
    const workspaceIds = snapshot.docs.map(doc => doc.id);

    // Load aggregates from EventStore
    const workspaces = await Promise.all(
      workspaceIds.map(id => this.load(id))
    );

    return workspaces.filter(w => w !== null) as Workspace[];
  }

  /**
   * Find workspaces by account ID and status
   * 
   * Queries: projections/workspace WHERE accountId = X AND status = Y
   * 
   * @param accountId - Account ID (ownerId)
   * @param status - Workspace status filter
   * @returns Array of workspace aggregates matching both filters
   * 
   * @example
   * ```typescript
   * const readyWorkspaces = await repo.findByAccountIdAndStatus('acc-123', 'ready');
   * ```
   */
  async findByAccountIdAndStatus(accountId: string, status: WorkspaceStatus): Promise<Workspace[]> {
    const q = query(
      collection(this.db, 'projections/workspace'),
      where('accountId', '==', accountId),
      where('status', '==', status)
    );

    const snapshot = await getDocs(q);
    const workspaceIds = snapshot.docs.map(doc => doc.id);

    // Load aggregates from EventStore
    const workspaces = await Promise.all(
      workspaceIds.map(id => this.load(id))
    );

    return workspaces.filter(w => w !== null) as Workspace[];
  }

  /**
   * Count workspaces with optional filters
   * 
   * @param accountId - Optional account ID filter
   * @param status - Optional status filter
   * @returns Count of matching workspaces
   * 
   * @example
   * ```typescript
   * const totalWorkspaces = await repo.count();
   * const accountWorkspaces = await repo.count('acc-123');
   * const readyWorkspaces = await repo.count('acc-123', 'ready');
   * ```
   */
  async count(accountId?: string, status?: WorkspaceStatus): Promise<number> {
    let q = query(collection(this.db, 'projections/workspace'));

    if (accountId) {
      q = query(q, where('accountId', '==', accountId));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }
}

// END OF FILE
