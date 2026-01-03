/**
 * Workspace Command Service
 * 
 * Implements CQRS Command side for Workspace aggregate.
 * 
 * Architecture:
 * - Writes ONLY through Repository → EventStore (NOT Firestore directly)
 * - Uses Workspace aggregate business methods
 * - NO Projection queries (use WorkspaceQueryService)
 * - NO Firestore dependency (Clean Architecture)
 * 
 * CQRS Pattern:
 * - Commands: Load aggregate → Execute business method → Save via Repository
 * - Events: Repository persists events to EventStore
 * - Projections: Updated asynchronously by ProjectionBuilder
 * 
 * Multi-Tenant Isolation:
 * - Workspace uses ownerId (accountId) as isolation boundary
 */

import { Injectable } from '@angular/core';
import { WorkspaceRepository } from '@ng-events/account-domain/workspace/repositories/WorkspaceRepository';
import { Workspace } from '@ng-events/account-domain/workspace/aggregates/Workspace';
import { WorkspaceStatus } from '@ng-events/account-domain/workspace/events/WorkspaceCreated';

/**
 * Workspace Command Service
 * 
 * CQRS Command Side:
 * - Executes write operations via Repository
 * - Uses domain aggregate business methods
 * - NO queries (use WorkspaceQueryService)
 * - NO direct Firestore access
 * 
 * Usage:
 * ```typescript
 * const workspaceId = await commandService.createWorkspace('acc-123', 'ready');
 * await commandService.archiveWorkspace('ws-456');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceCommandService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository
  ) {}

  /**
   * Create new workspace
   * 
   * Command Flow:
   * 1. Create aggregate via Workspace.create()
   * 2. Aggregate raises WorkspaceCreatedEvent
   * 3. Save aggregate via repository (persists events to EventStore)
   * 4. ProjectionBuilder updates read model asynchronously
   * 
   * @param accountId - Owner Account ID (multi-tenant boundary)
   * @param status - Initial workspace status
   * @returns Created workspace ID
   */
  async createWorkspace(
    accountId: string,
    status: WorkspaceStatus
  ): Promise<string> {
    try {
      // Validate inputs
      if (!accountId || accountId.trim() === '') {
        throw new Error('Account ID is required');
      }
      if (!status) {
        throw new Error('Status is required');
      }

      // Create workspace aggregate (raises WorkspaceCreatedEvent)
      const workspace = Workspace.create(accountId, status);

      // Save aggregate (persists events to EventStore)
      await this.workspaceRepository.save(workspace);

      // Return workspace ID
      return workspace.getId();
    } catch (error) {
      console.error('Error creating workspace:', { accountId, status, error });
      throw error;
    }
  }

  /**
   * Archive workspace
   * 
   * Command Flow:
   * 1. Load aggregate from EventStore via repository
   * 2. Execute business method: workspace.archive()
   * 3. Aggregate raises WorkspaceArchivedEvent
   * 4. Save aggregate via repository (persists new event)
   * 5. ProjectionBuilder updates read model asynchronously
   * 
   * @param workspaceId - Workspace ID to archive
   */
  async archiveWorkspace(workspaceId: string): Promise<void> {
    try {
      // Validate input
      if (!workspaceId || workspaceId.trim() === '') {
        throw new Error('Workspace ID is required');
      }

      // Load aggregate from EventStore
      const workspace = await this.workspaceRepository.load(workspaceId);
      if (!workspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Execute business method (raises WorkspaceArchivedEvent)
      const timestamp = new Date().toISOString();
      workspace.archive(timestamp);

      // Save aggregate (persists new event to EventStore)
      await this.workspaceRepository.save(workspace);
    } catch (error) {
      console.error('Error archiving workspace:', { workspaceId, error });
      throw error;
    }
  }

  /**
   * Mark workspace as ready
   * 
   * Command Flow:
   * 1. Load aggregate from EventStore
   * 2. Execute business method: workspace.markReady()
   * 3. Save aggregate (if state changed)
   * 
   * @param workspaceId - Workspace ID
   */
  async markWorkspaceReady(workspaceId: string): Promise<void> {
    try {
      // Validate input
      if (!workspaceId || workspaceId.trim() === '') {
        throw new Error('Workspace ID is required');
      }

      // Load aggregate
      const workspace = await this.workspaceRepository.load(workspaceId);
      if (!workspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Execute business method
      workspace.markReady();

      // Save aggregate (persists events if any)
      await this.workspaceRepository.save(workspace);
    } catch (error) {
      console.error('Error marking workspace ready:', { workspaceId, error });
      throw error;
    }
  }
}

// END OF FILE
