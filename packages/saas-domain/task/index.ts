/**
 * Task Domain Module
 *
 * SaaS business logic for task management following Module → Entity pattern.
 *
 * **Architecture:**
 * - Account → Workspace → Module → Entity
 * - TaskEntity is an Entity within the Task Module
 * - All tasks belong to a Workspace (via workspaceId)
 *
 * This module contains:
 * - TaskEntity aggregate (event-sourced)
 * - Task domain events (TaskCreated, TaskAssigned, TaskCompleted, TaskCancelled)
 * - Task business rules (assignment, completion, cancellation)
 * - Task value objects (TaskId, TaskStatus, TaskPriority)
 */

// Events
export * from './events/TaskCreated';
export * from './events/TaskAssigned';
export * from './events/TaskCompleted';
export * from './events/TaskCancelled';

// Aggregates
export * from './aggregates/TaskEntity';

// Value Objects
export * from './value-objects/TaskId';
export * from './value-objects/TaskStatus';
export * from './value-objects/TaskPriority';
