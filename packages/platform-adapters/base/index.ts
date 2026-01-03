/**
 * Platform Adapters - Base Abstractions
 * 
 * 🔒 INTERFACE LAYER - Defines contracts, NO implementations
 * 
 * Clean Architecture Boundary:
 * - These interfaces define what Core-Engine expects from adapters
 * - Platform-specific implementations live in ../firebase, ../auth, etc.
 * - Dependency Rule: Core depends on abstractions, Platform implements abstractions
 * 
 * Exports:
 * - AdapterLifecycle: Base lifecycle contract for all adapters
 * - RepositoryAdapterCapability: Extended contract for repository adapters
 */

export * from './AdapterLifecycle';
export * from './RepositoryAdapterCapability';

// END OF FILE
