/**
 * Core Engine Facade
 * 
 * 🎭 Bridge between Angular UI and core-engine/saas-domain
 * 
 * This facade provides a clean API for the UI to interact with:
 * - Domain logic from core-engine
 * - Business rules from saas-domain
 * - Platform adapters
 * 
 * The UI should NEVER import core-engine or saas-domain directly.
 * Always go through this facade.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Import adapters from platform-adapters
import { FirebaseAuthAdapter, TaskQueryAdapter } from '@platform-adapters/firebase/angular-fire';

/**
 * Facade for accessing core functionality from Angular UI
 * 
 * Benefits:
 * - Hides complexity from UI components
 * - Provides a stable API even if internal structure changes
 * - Makes testing easier (mock the facade instead of many services)
 */
@Injectable({ providedIn: 'root' })
export class CoreEngineFacade {
  // Inject platform adapters
  private authAdapter = inject(FirebaseAuthAdapter);
  private taskQueryAdapter = inject(TaskQueryAdapter);
  
  /**
   * Initialize the facade
   * Called during app startup
   */
  init(): void {
    this.authAdapter.init();
  }
  
  // Auth operations
  getCurrentUser() {
    return this.authAdapter.getCurrentUser();
  }
  
  async refreshToken(): Promise<string> {
    return this.authAdapter.refreshToken();
  }
  
  // Task operations
  async getTaskById(taskId: string) {
    return this.taskQueryAdapter.getById(taskId);
  }
  
  async getTasksByBlueprint(blueprintId: string) {
    return this.taskQueryAdapter.getByBlueprint(blueprintId);
  }
  
  async getTasksByStatus(blueprintId: string, status: string) {
    return this.taskQueryAdapter.getByStatus(blueprintId, status);
  }
  
  // TODO: Add more domain operations as needed
  // - Payment operations
  // - Issue operations
  // - Event sourcing operations
}

// END OF FILE
