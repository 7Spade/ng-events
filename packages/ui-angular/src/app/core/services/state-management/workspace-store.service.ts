/**
 * Workspace Store Service
 * 
 * Reactive state management for Workspace projections.
 * 
 * Architecture:
 * - Wraps WorkspaceQueryService with BehaviorSubject
 * - Provides Observable streams for UI components
 * - Caches projections in memory
 * - NO business logic (pure state management)
 * 
 * Pattern:
 * - Query → Cache → Observable → UI
 * - UI subscribes to Observable streams
 * - Store refreshes cache on demand
 * 
 * Multi-Tenant Isolation:
 * - Filters workspaces by ownerId (accountId)
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceQueryService, WorkspaceProjectionSchema } from '../queries/workspace-query.service';

/**
 * Workspace Store Service
 * 
 * Reactive State Management:
 * - Caches workspace projections in memory
 * - Provides Observable streams for UI
 * - Refreshes cache on demand
 * - NO direct Firestore access (uses QueryService)
 * 
 * Usage:
 * ```typescript
 * // Load workspaces for current user
 * await storeService.loadWorkspacesByOwnerId('acc-123');
 * 
 * // Subscribe to workspace changes in UI
 * storeService.workspaces$.subscribe(workspaces => {
 *   console.log('Workspaces updated:', workspaces);
 * });
 * 
 * // Get single workspace
 * storeService.selectWorkspaceById('ws-456').subscribe(workspace => {
 *   console.log('Workspace:', workspace);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceStoreService {
  /**
   * Internal state: All cached workspaces
   */
  private readonly workspacesSubject = new BehaviorSubject<WorkspaceProjectionSchema[]>([]);

  /**
   * Observable stream of all workspaces
   * UI components subscribe to this for reactive updates
   */
  public readonly workspaces$: Observable<WorkspaceProjectionSchema[]> = this.workspacesSubject.asObservable();

  /**
   * Internal state: Currently selected workspace ID
   */
  private readonly selectedWorkspaceIdSubject = new BehaviorSubject<string | null>(null);

  /**
   * Observable stream of selected workspace ID
   */
  public readonly selectedWorkspaceId$: Observable<string | null> = this.selectedWorkspaceIdSubject.asObservable();

  constructor(
    private readonly queryService: WorkspaceQueryService
  ) {}

  /**
   * Load workspaces by owner ID and update cache
   * 
   * Multi-tenant isolation: Fetches only workspaces owned by accountId
   * 
   * @param ownerId - Account ID (owner of workspaces)
   */
  async loadWorkspacesByOwnerId(ownerId: string): Promise<void> {
    try {
      const workspaces = await this.queryService.getWorkspacesByOwnerId(ownerId);
      this.workspacesSubject.next(workspaces);
    } catch (error) {
      console.error('Error loading workspaces by owner ID:', { ownerId, error });
      throw error;
    }
  }

  /**
   * Load ready workspaces by owner ID
   * 
   * Convenience method for loading only active workspaces
   * 
   * @param ownerId - Account ID
   */
  async loadReadyWorkspacesByOwnerId(ownerId: string): Promise<void> {
    try {
      const workspaces = await this.queryService.getReadyWorkspacesByOwnerId(ownerId);
      this.workspacesSubject.next(workspaces);
    } catch (error) {
      console.error('Error loading ready workspaces:', { ownerId, error });
      throw error;
    }
  }

  /**
   * Refresh workspace cache
   * 
   * Re-fetches all workspaces for the current ownerId
   * Useful after command execution to update UI
   * 
   * @param ownerId - Account ID
   */
  async refreshWorkspaces(ownerId: string): Promise<void> {
    await this.loadWorkspacesByOwnerId(ownerId);
  }

  /**
   * Select workspace by ID as current workspace
   * 
   * Updates selectedWorkspaceId$ stream
   * 
   * @param workspaceId - Workspace ID
   */
  selectWorkspace(workspaceId: string): void {
    this.selectedWorkspaceIdSubject.next(workspaceId);
  }

  /**
   * Clear selected workspace
   */
  clearSelection(): void {
    this.selectedWorkspaceIdSubject.next(null);
  }

  /**
   * Get observable stream of workspace by ID
   * 
   * Derived stream that emits single workspace when cache updates
   * 
   * @param workspaceId - Workspace ID
   * @returns Observable of workspace or null
   */
  selectWorkspaceById(workspaceId: string): Observable<WorkspaceProjectionSchema | null> {
    return this.workspaces$.pipe(
      map(workspaces => workspaces.find(w => w.id === workspaceId) || null)
    );
  }

  /**
   * Get observable stream of workspaces by status
   * 
   * @param status - Workspace status
   * @returns Observable of filtered workspaces
   */
  selectWorkspacesByStatus(
    status: WorkspaceProjectionSchema['status']
  ): Observable<WorkspaceProjectionSchema[]> {
    return this.workspaces$.pipe(
      map(workspaces => workspaces.filter(w => w.status === status))
    );
  }

  /**
   * Get current workspaces snapshot (non-reactive)
   * 
   * @returns Current cached workspaces
   */
  getWorkspacesSnapshot(): WorkspaceProjectionSchema[] {
    return this.workspacesSubject.value;
  }

  /**
   * Get current selected workspace ID snapshot
   * 
   * @returns Current selected workspace ID or null
   */
  getSelectedWorkspaceIdSnapshot(): string | null {
    return this.selectedWorkspaceIdSubject.value;
  }

  /**
   * Get workspace by ID from cache (non-reactive)
   * 
   * @param workspaceId - Workspace ID
   * @returns Workspace or null if not found in cache
   */
  getWorkspaceByIdSnapshot(workspaceId: string): WorkspaceProjectionSchema | null {
    return this.workspacesSubject.value.find(w => w.id === workspaceId) || null;
  }

  /**
   * Clear all cached workspaces
   * 
   * Useful for logout or account switching
   */
  clear(): void {
    this.workspacesSubject.next([]);
    this.selectedWorkspaceIdSubject.next(null);
  }

  /**
   * Check if workspace exists in cache
   * 
   * @param workspaceId - Workspace ID
   * @returns True if workspace is in cache
   */
  hasWorkspace(workspaceId: string): boolean {
    return this.workspacesSubject.value.some(w => w.id === workspaceId);
  }

  /**
   * Get workspace count from cache
   * 
   * @returns Number of cached workspaces
   */
  getWorkspaceCount(): number {
    return this.workspacesSubject.value.length;
  }
}

// END OF FILE
