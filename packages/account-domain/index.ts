/**
 * Account Domain
 *
 * Identity × Organization × Capability context for the SaaS platform.
 *
 * Contains domain modules for:
 * - Account lifecycle
 * - Workspace lifecycle
 * - Membership (user ↔ workspace roles)
 * - Module registry (capabilities per workspace)
 *
 * Rules:
 * - Pure TypeScript only
 * - Can depend on @ng-events/core-engine
 * - Must NOT import framework SDKs (Angular, Firebase, etc.)
 */

export * from './account';
export * from './workspace';
export * from './membership';
export * from './module-registry';
