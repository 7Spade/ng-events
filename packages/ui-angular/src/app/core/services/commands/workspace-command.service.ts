import { Injectable } from '@angular/core';
import { WorkspaceRepository } from '@ng-events/core-engine';

/**
 * Workspace Command Service
 * Handles write operations for Workspace aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly workspaceRepository: WorkspaceRepository
  ) {}

  /**
   * Create new workspace
   * TODO: Load aggregate → execute business method → save
   */
  async createWorkspace(params: {
    accountId: string;
    name: string;
    // Add other parameters
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. Workspace.create()
    // 2. workspaceRepository.save(aggregate)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Archive workspace
   * TODO: Load aggregate → archive() → save
   */
  async archiveWorkspace(workspaceId: string): Promise<void> {
    // TODO: Implement command flow
    // 1. workspaceRepository.load(workspaceId)
    // 2. workspace.archive()
    // 3. workspaceRepository.save(workspace)
    throw new Error('Not implemented - skeleton only');
  }
}
