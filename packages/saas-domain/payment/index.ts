/**
 * Payment Domain Module
 *
 * SaaS business logic for payment processing following Module → Entity pattern.
 *
 * **Architecture:**
 * - Account → Workspace → Module → Entity
 * - PaymentEntity is an Entity within the Payment Module
 * - All payments belong to a Workspace (via workspaceId)
 *
 * This module contains:
 * - PaymentEntity aggregate (event-sourced)
 * - Payment domain events (PaymentCreated, PaymentProcessed, PaymentRefunded)
 * - Payment business rules (processing, refund validation)
 * - Payment value objects (PaymentId, PaymentStatus, Currency)
 */

// Events
export * from './events/PaymentCreated';
export * from './events/PaymentProcessed';
export * from './events/PaymentRefunded';

// Aggregates
export * from './aggregates/PaymentEntity';

// Value Objects
export * from './value-objects/PaymentId';
export * from './value-objects/PaymentStatus';
export * from './value-objects/Currency';

// Repositories
export * from './repositories/PaymentRepository';
