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
 */

// Session / workspace context boundary (skeleton)
export * from './src/session/session-context.interface';
// Event sourcing contracts
export * from './src/events';
// Projection contracts
export * from './src/projections';
// Causality utilities
export * from './src/causality';
export * from './src/module-system';
