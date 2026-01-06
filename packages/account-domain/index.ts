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

export * from './src/aggregates/account.aggregate';
export * from './src/aggregates/workspace.aggregate';
export * from './src/aggregates/membership.aggregate';
export * from './src/commands';
export * from './src/events';

// END OF FILE
