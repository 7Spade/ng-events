/**
 * Core Engine
 *
 * 💎 Pure domain core with ZERO framework dependencies
 *
 * Core Principles:
 * - NO Angular imports allowed
 * - NO Firebase imports allowed
 * - Pure TypeScript only
 * - Framework-agnostic domain logic
 *
 * Contains:
 * - Event Store abstractions
 * - Causality tracking
 * - Aggregate Root patterns
 * - Projection (Read Model) definitions
 * - Command/Event types
 * - Saga/Process Manager patterns
 */

// Session / workspace context boundary (skeleton)
export * from './src/session/session-context.interface';

// Event Sourcing Core
export * from './src/events/domain-event';
export * from './src/commands/command';
export * from './src/aggregates/aggregate-root';
export * from './src/store/event-store.interface';

// Causality Tracking
export * from './src/causality/causality-metadata';

// Saga / Process Managers
export * from './src/saga/process-manager';
