/**
 * ModuleRegistry - Service for managing module manifests
 *
 * ModuleRegistry:
 * - Maintains list of available modules
 * - Validates module dependencies
 * - Checks if a module can be enabled in a workspace
 *
 * Core Principles:
 * - Registry is read-only for modules
 * - Workspace queries registry before enabling modules
 * - Registry does NOT enable modules (Workspace does via events)
 * - Registry does NOT know about specific workspace state
 */

import { ModuleKey } from '@ng-events/account-domain';
import { ModuleManifest, ModuleRegistration } from '../types/module-manifest.types';

/**
 * ModuleRegistry - Manages module manifests and dependencies
 */
export class ModuleRegistry {
  private registrations = new Map<ModuleKey, ModuleRegistration>();

  /**
   * Register a module manifest
   */
  public register(manifest: ModuleManifest): void {
    if (this.registrations.has(manifest.key)) {
      throw new Error(`Module ${manifest.key} is already registered`);
    }

    const registration: ModuleRegistration = {
      moduleKey: manifest.key,
      manifest,
      registeredAt: new Date().toISOString(),
      isAvailable: true
    };

    this.registrations.set(manifest.key, registration);
  }

  /**
   * Get a module manifest by key
   */
  public getManifest(moduleKey: ModuleKey): ModuleManifest | undefined {
    const registration = this.registrations.get(moduleKey);
    return registration?.manifest;
  }

  /**
   * Check if a module is registered
   */
  public isRegistered(moduleKey: ModuleKey): boolean {
    return this.registrations.has(moduleKey);
  }

  /**
   * Check if a module can be enabled given currently enabled modules
   *
   * @param moduleKey - Module to check
   * @param enabledModules - Currently enabled modules in the workspace
   * @returns true if all dependencies are satisfied
   */
  public canEnable(moduleKey: ModuleKey, enabledModules: ModuleKey[]): boolean {
    const manifest = this.getManifest(moduleKey);
    if (!manifest) {
      return false; // Module not registered
    }

    // Check if all dependencies are already enabled
    for (const requiredModule of manifest.requires) {
      if (!enabledModules.includes(requiredModule)) {
        return false; // Missing dependency
      }
    }

    return true;
  }

  /**
   * Get missing dependencies for a module
   *
   * @param moduleKey - Module to check
   * @param enabledModules - Currently enabled modules
   * @returns Array of missing dependency keys
   */
  public getMissingDependencies(moduleKey: ModuleKey, enabledModules: ModuleKey[]): ModuleKey[] {
    const manifest = this.getManifest(moduleKey);
    if (!manifest) {
      return [];
    }

    return manifest.requires.filter(required => !enabledModules.includes(required));
  }

  /**
   * Get all registered modules
   */
  public getAllModules(): ModuleRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Get all available modules (registered and available)
   */
  public getAvailableModules(): ModuleRegistration[] {
    return this.getAllModules().filter(reg => reg.isAvailable);
  }
}

// END OF FILE
