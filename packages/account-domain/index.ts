/**
 * Account Domain
 *
 * Identity × Organization × Capability context for the SaaS platform.
 *
 * Contains domain modules for:
 * - Account lifecycle (User/Organization/Bot)
 * - Workspace lifecycle (blueprintId boundary)
 * - Module enablement (workspace-scoped capabilities)
 *
 * Architecture Flow:
 * Account (誰) → Workspace (在哪) → Module (做什麼) → Entity (狀態)
 *
 * Rules:
 * - Pure TypeScript only
 * - Can depend on @ng-events/core-engine
 * - Must NOT import framework SDKs (Angular, Firebase, etc.)
 */

// Account Types
export * from './src/types/account.types';
export * from './src/types/workspace.types';

// Account Commands
export * from './src/commands/account.commands';
export * from './src/commands/workspace.commands';

// Account Events
export * from './src/events/account.events';
export * from './src/events/workspace.events';

// Account Aggregates
export * from './src/aggregates/account.aggregate';
export * from './src/aggregates/workspace.aggregate';

export const ACCOUNT_DOMAIN_VERSION = '0.1.0';

// END OF FILE
