/**
 * Module Manifest Types
 *
 * Module manifests define module capabilities, dependencies, and integration points.
 *
 * Core Principles (from architecture docs):
 * - Modules are external plugins to Workspace
 * - Modules declare their dependencies (requires: [])
 * - Workspace only tracks enabled/disabled state
 * - Modules consume Workspace context, never modify it
 * - Module enablement is event-driven
 *
 * Module Flow:
 * 1. Module declares manifest
 * 2. Workspace checks if dependencies are satisfied
 * 3. Workspace emits ModuleEnabled event
 * 4. Module listens and initializes itself (passive)
 */

import { ModuleKey } from '@ng-events/account-domain';

/**
 * ModuleManifest - Module declaration
 */
export interface ModuleManifest {
  /**
   * Unique module identifier
   */
  readonly key: ModuleKey;

  /**
   * Human-readable module name
   */
  readonly name: string;

  /**
   * Module description
   */
  readonly description: string;

  /**
   * Module version (semver)
   */
  readonly version: string;

  /**
   * Module dependencies (must be enabled first)
   */
  readonly requires: ModuleKey[];

  /**
   * Optional capabilities/features
   */
  readonly capabilities?: string[];

  /**
   * Metadata for UI display
   */
  readonly metadata?: ModuleMetadata;
}

/**
 * ModuleMetadata - UI display information
 */
export interface ModuleMetadata {
  /**
   * Display icon
   */
  readonly icon?: string;

  /**
   * Display color
   */
  readonly color?: string;

  /**
   * Display category
   */
  readonly category?: string;

  /**
   * Whether this is a premium module
   */
  readonly isPremium?: boolean;
}

/**
 * ModuleRegistration - Module registration state
 */
export interface ModuleRegistration {
  /**
   * Module key
   */
  readonly moduleKey: ModuleKey;

  /**
   * Module manifest
   */
  readonly manifest: ModuleManifest;

  /**
   * When registered
   */
  readonly registeredAt: string;

  /**
   * Whether module is available for enablement
   */
  readonly isAvailable: boolean;
}

// END OF FILE
