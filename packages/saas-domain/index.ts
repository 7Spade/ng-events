/**
 * SaaS Domain
 *
 * 🏢 Pure TypeScript business domain models
 *
 * Contains:
 * - Module system (manifests, registry, dependencies)
 * - Workspace-Module relationships
 * - SaaS business rules and policies
 *
 * Architecture Flow:
 * Workspace → ModuleRegistry → Module → Entity
 *
 * Core Principles:
 * - Modules are plugins that workspaces enable/disable
 * - Module dependencies are declared in manifests
 * - ModuleRegistry validates dependencies before enablement
 * - Modules listen to workspace events (passive initialization)
 *
 * Rules:
 * - Pure TypeScript only
 * - Can depend on @ng-events/core-engine and @ng-events/account-domain
 * - NO framework dependencies (Angular, Firebase, etc.)
 * - NO SDK dependencies
 */

// Module Types
export * from './src/types/module-manifest.types';

// Module Registry
export * from './src/modules/module-registry';
export * from './src/modules/predefined-modules';

export const SAAS_DOMAIN_VERSION = '0.1.0';

// END OF FILE
