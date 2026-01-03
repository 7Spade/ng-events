/**
 * Workspace Query Service
 * 
 * Implements CQRS Query side for Workspace projections.
 * 
 * Architecture:
 * - Reads ONLY from Firestore projections (NOT EventStore)
 * - Returns WorkspaceProjectionSchema (plain objects, NOT aggregates)
 * - NO Repository dependency (CQRS separation)
 * - NO business logic (queries are pure data access)
 * 
 * Multi-Tenant Isolation:
 * - Uses ownerId (accountId) for Workspace isolation
 * - Queries filtered by ownerId for multi-tenant security
 * 
 * Path: projections/workspace/{workspaceId}
 */

import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, query, where, getDocs, getCountFromServer } from '@angular/fire/firestore';

/**
 * Workspace Projection Schema
 * 
 * Read model for Workspace queries.
 * This is the QUERY side of CQRS - optimized for reads.
 */
export interface WorkspaceProjectionSchema {
  /** Workspace ID (same as aggregateId) */
  id: string;
  /** Owner Account ID (multi-tenant boundary) */
  ownerId: string;
  /** Workspace status */
  status: 'initializing' | 'ready' | 'restricted' | 'archived';
  /** Created timestamp (ISO string) */
  createdAt: string;
  /** Archived timestamp (ISO string, optional) */
  archivedAt?: string;
  /** Projection version for conflict detection */
  version: number;
  /** Last event timestamp that updated this projection */
  lastEventAt: string;
}

/**
 * Workspace Query Service
 * 
 * CQRS Query Side:
 * - Reads from Firestore projections
 * - Returns plain objects (NOT domain aggregates)
 * - NO write operations (use WorkspaceCommandService)
 * - NO Repository dependency
 * 
 * Usage:
 * ```typescript
 * const workspace = await queryService.getWorkspaceById('ws-123');
 * const workspaces = await queryService.getWorkspacesByOwnerId('acc-456');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceQueryService {
  private readonly collectionPath = 'projections/workspace';

  constructor(private readonly firestore: Firestore) {}

  /**
   * Get workspace projection by ID
   * 
   * @param workspaceId - Workspace ID
   * @returns Workspace projection or null if not found
   */
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceProjectionSchema | null> {
    try {
      const docRef = doc(this.firestore, this.collectionPath, workspaceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as WorkspaceProjectionSchema;
    } catch (error) {
      console.error('Error getting workspace by ID:', { workspaceId, error });
      throw error;
    }
  }

  /**
   * Get all workspaces by owner ID
   * 
   * Multi-tenant isolation: Filters by ownerId (accountId)
   * 
   * @param ownerId - Account ID (owner of workspaces)
   * @returns Array of workspace projections
   */
  async getWorkspacesByOwnerId(ownerId: string): Promise<WorkspaceProjectionSchema[]> {
    try {
      const q = query(
        collection(this.firestore, this.collectionPath),
        where('ownerId', '==', ownerId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WorkspaceProjectionSchema);
    } catch (error) {
      console.error('Error getting workspaces by owner ID:', { ownerId, error });
      throw error;
    }
  }

  /**
   * Get workspaces by status
   * 
   * @param status - Workspace status
   * @returns Array of workspace projections
   */
  async getWorkspacesByStatus(
    status: WorkspaceProjectionSchema['status']
  ): Promise<WorkspaceProjectionSchema[]> {
    try {
      const q = query(
        collection(this.firestore, this.collectionPath),
        where('status', '==', status)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WorkspaceProjectionSchema);
    } catch (error) {
      console.error('Error getting workspaces by status:', { status, error });
      throw error;
    }
  }

  /**
   * Get workspaces by owner ID and status
   * 
   * Multi-tenant isolation + status filter
   * 
   * @param ownerId - Account ID
   * @param status - Workspace status
   * @returns Array of workspace projections
   */
  async getWorkspacesByOwnerIdAndStatus(
    ownerId: string,
    status: WorkspaceProjectionSchema['status']
  ): Promise<WorkspaceProjectionSchema[]> {
    try {
      const q = query(
        collection(this.firestore, this.collectionPath),
        where('ownerId', '==', ownerId),
        where('status', '==', status)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WorkspaceProjectionSchema);
    } catch (error) {
      console.error('Error getting workspaces by owner and status:', { ownerId, status, error });
      throw error;
    }
  }

  /**
   * Get ready workspaces by owner ID
   * 
   * Convenience method for getting active/ready workspaces
   * 
   * @param ownerId - Account ID
   * @returns Array of ready workspace projections
   */
  async getReadyWorkspacesByOwnerId(ownerId: string): Promise<WorkspaceProjectionSchema[]> {
    return this.getWorkspacesByOwnerIdAndStatus(ownerId, 'ready');
  }

  /**
   * Get count of workspaces by owner ID
   * 
   * Efficient count query without fetching full documents
   * 
   * @param ownerId - Account ID
   * @returns Count of workspaces
   */
  async getWorkspaceCountByOwnerId(ownerId: string): Promise<number> {
    try {
      const q = query(
        collection(this.firestore, this.collectionPath),
        where('ownerId', '==', ownerId)
      );

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting workspace count:', { ownerId, error });
      throw error;
    }
  }

  /**
   * Check if workspace exists
   * 
   * @param workspaceId - Workspace ID
   * @returns True if workspace exists
   */
  async workspaceExists(workspaceId: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.collectionPath, workspaceId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking workspace existence:', { workspaceId, error });
      throw error;
    }
  }
}

// END OF FILE
