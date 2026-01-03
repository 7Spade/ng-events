/**
 * Module Registry Domain Module
 *
 * Tracks which capabilities are enabled for a workspace.
 * Determines availability of downstream SaaS modules (task, issue, payment, etc.).
 */

export * from './aggregates/ModuleRegistry';
export * from './value-objects/ModuleId';
export * from './value-objects/ModuleStatus';
export * from './value-objects/Capability';
export * from './events/ModuleEnabled';
export * from './events/ModuleDisabled';
export * from './repositories/ModuleRegistryRepository';

// END OF FILE
