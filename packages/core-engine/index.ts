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
 * - Utility functions for ID generation
 */

export * from './causality';
export * from './event-store';
export * from './aggregates';
export * from './projection';
export * from './utils/id-generator';
