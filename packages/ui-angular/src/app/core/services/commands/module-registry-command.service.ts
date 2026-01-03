import { Injectable } from '@angular/core';
import { ModuleRegistryRepository } from '@ng-events/core-engine';

/**
 * ModuleRegistry Command Service
 * Handles write operations for ModuleRegistry aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class ModuleRegistryCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly moduleRegistryRepository: ModuleRegistryRepository
  ) {}

  /**
   * Enable module in workspace
   * TODO: Load aggregate → enableModule() → save
   */
  async enableModule(params: {
    workspaceId: string;
    moduleId: string;
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. moduleRegistryRepository.load(workspaceId)
    // 2. moduleRegistry.enableModule(moduleId)
    // 3. moduleRegistryRepository.save(moduleRegistry)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Disable module in workspace
   * TODO: Load aggregate → disableModule() → save
   */
  async disableModule(params: {
    workspaceId: string;
    moduleId: string;
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. moduleRegistryRepository.load(workspaceId)
    // 2. moduleRegistry.disableModule(moduleId)
    // 3. moduleRegistryRepository.save(moduleRegistry)
    throw new Error('Not implemented - skeleton only');
  }
}
