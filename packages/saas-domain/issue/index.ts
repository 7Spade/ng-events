/**
 * Issue Domain Module
 *
 * SaaS business logic for issue tracking following Module → Entity pattern.
 *
 * **Architecture:**
 * - Account → Workspace → Module → Entity
 * - IssueEntity is an Entity within the Issue Tracking Module
 * - All issues belong to a Workspace (via workspaceId)
 *
 * This module contains:
 * - IssueEntity aggregate (event-sourced)
 * - Issue domain events (IssueCreated, IssueAssigned, IssueClosed, IssueReopened)
 * - Issue business rules (assignment, closing, reopening)
 * - Issue value objects (IssueId, IssueStatus, IssueType, IssuePriority)
 */

// Events
export * from './events/IssueCreated';
export * from './events/IssueAssigned';
export * from './events/IssueClosed';
export * from './events/IssueReopened';

// Aggregates
export * from './aggregates/IssueEntity';

// Value Objects
export * from './value-objects/IssueId';
export * from './value-objects/IssueStatus';
export * from './value-objects/IssueType';
export * from './value-objects/IssuePriority';

// Repositories
export * from './repositories/IssueRepository';
