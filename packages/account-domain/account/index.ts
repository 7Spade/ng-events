/**
 * Account Domain Module
 *
 * Represents SaaS account lifecycle and ownership context.
 * Focuses on:
 * - Account provisioning and suspension
 * - Account-level status that gates workspace creation
 */

export * from './aggregates/Account';
export * from './value-objects/AccountId';
export * from './value-objects/AccountStatus';
export * from './events/AccountCreated';
export * from './events/AccountSuspended';

// END OF FILE
