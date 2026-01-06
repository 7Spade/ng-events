/**
 * SaaS Domain
 *
 * 🏢 Pure TypeScript business domain models
 *
 * Contains domain logic for:
 * - Task management
 * - Payment processing
 * - Issue tracking
 *
 * Rules:
 * - Pure TypeScript only
 * - Can depend on @core-engine
 * - NO framework dependencies (Angular, Firebase, etc.)
 * - NO SDK dependencies
 */

export * from './src/aggregates/module.aggregate';
export * from './src/aggregates/task.aggregate';
export * from './src/aggregates/issue.aggregate';
export * from './src/commands';
export * from './src/events';
