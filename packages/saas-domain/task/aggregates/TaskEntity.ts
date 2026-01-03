import { AggregateRoot, CausalityMetadataFactory } from '@ng-events/core-engine';
import { generateAggregateId, generateEventId } from '@ng-events/core-engine/utils/id-generator';

import { TaskCreated, TaskCreatedPayload } from '../events/TaskCreated';
import { TaskAssigned, TaskAssignedPayload } from '../events/TaskAssigned';
import { TaskCompleted, TaskCompletedPayload } from '../events/TaskCompleted';
import { TaskCancelled, TaskCancelledPayload } from '../events/TaskCancelled';
import { TaskId } from '../value-objects/TaskId';
import { TaskStatus } from '../value-objects/TaskStatus';
import { TaskPriority } from '../value-objects/TaskPriority';

/**
 * TaskEntity Aggregate State
 * 
 * Represents the internal state of a Task entity within a Module.
 * 
 * **CRITICAL**: Uses workspaceId (not ownerId) following Workspace concept.
 * - workspaceId: Where the task exists (在哪)
 * - assigneeId: Who is assigned to the task (relationship, not ownership)
 */
export interface TaskState {
  taskId: TaskId;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  priority?: TaskPriority;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

/**
 * Union type of all Task events
 */
export type TaskEvent = TaskCreated | TaskAssigned | TaskCompleted | TaskCancelled;

/**
 * TaskEntity Aggregate Root
 * 
 * Represents a task within a business module (Task Module).
 * Follows the Module → Entity pattern from system architecture.
 * 
 * **Hierarchy:**
 * - Account → Workspace → Module → Entity
 * - TaskEntity is an Entity within the Task Module
 * - Belongs to a Workspace (via workspaceId)
 * 
 * **Event Causality:**
 * - TaskCreated causedBy ModuleEnabled (module must be enabled first)
 * - All events include complete causality metadata for audit trail
 * 
 * @extends AggregateRoot<TaskEvent, TaskId, TaskState>
 */
export class TaskEntity extends AggregateRoot<TaskEvent, TaskId, TaskState> {
  /**
   * Aggregate identifier (required by AggregateRoot)
   */
  readonly id: TaskId;

  /**
   * Aggregate type name (required by AggregateRoot)
   */
  readonly type = 'TaskEntity';

  /**
   * Internal aggregate state
   */
  private state: TaskState;

  /**
   * Private constructor - forces use of factory methods
   * 
   * @param state - Initial task state
   */
  private constructor(state: TaskState) {
    super();
    this.id = state.taskId;
    this.state = state;
  }

  // ==========================================================================
  // Factory Methods
  // ==========================================================================

  /**
   * Factory method - Create a new Task entity
   * 
   * Raises TaskCreated event with complete causality metadata.
   * 
   * @param params - Task creation parameters
   * @returns New TaskEntity instance with TaskCreated event raised
   * 
   * @example
   * ```typescript
   * const task = TaskEntity.create({
   *   workspaceId: 'workspace-123',
   *   title: 'Implement user authentication',
   *   description: 'Add JWT-based authentication',
   *   priority: 'high',
   *   causedBy: 'module-enabled-event-id',
   *   causedByUser: 'account-456',
   * });
   * ```
   */
  static create(params: {
    workspaceId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    priority?: TaskPriority;
    causedBy: string;
    causedByUser: string;
  }): TaskEntity {
    const taskId = generateAggregateId();
    const now = new Date().toISOString();

    const payload: TaskCreatedPayload = {
      workspaceId: params.workspaceId,
      title: params.title,
      description: params.description,
      status: 'pending',
      assigneeId: params.assigneeId,
      priority: params.priority || 'medium',
    };

    const event: TaskCreated = {
      id: generateEventId(),
      aggregateId: taskId,
      aggregateType: 'TaskEntity',
      eventType: 'TaskCreated',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'task.create',
        blueprintId: params.workspaceId,
      }),
    };

    const initialState: TaskState = {
      taskId,
      workspaceId: payload.workspaceId,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      assigneeId: payload.assigneeId,
      priority: payload.priority,
      createdAt: now,
    };

    const task = new TaskEntity(initialState);
    task.raiseEvent(event);
    return task;
  }

  /**
   * Factory method - Reconstruct Task entity from event stream
   * 
   * Replays events to rebuild aggregate state (Event Sourcing).
   * 
   * @param events - Array of TaskEvent to replay
   * @returns Reconstructed TaskEntity instance
   */
  static fromEvents(events: TaskEvent[]): TaskEntity {
    if (events.length === 0) {
      throw new Error('Cannot reconstruct TaskEntity from empty event stream');
    }

    const firstEvent = events[0];
    if (firstEvent.eventType !== 'TaskCreated') {
      throw new Error('First event must be TaskCreated');
    }

    // Initialize with minimal state, applyEvent will populate
    const task = new TaskEntity({
      taskId: firstEvent.aggregateId,
      workspaceId: firstEvent.data.workspaceId,
      title: firstEvent.data.title,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Replay all events to rebuild state
    events.forEach(event => task.applyEvent(event));

    return task;
  }

  // ==========================================================================
  // Event Application (State Mutation)
  // ==========================================================================

  /**
   * Apply event to aggregate state (required by AggregateRoot)
   * 
   * This is the only method that mutates aggregate state.
   * All state changes MUST go through events.
   * 
   * @param event - Domain event to apply
   */
  protected applyEvent(event: TaskEvent): void {
    switch (event.eventType) {
      case 'TaskCreated':
        this.state.workspaceId = event.data.workspaceId;
        this.state.title = event.data.title;
        this.state.description = event.data.description;
        this.state.status = event.data.status;
        this.state.assigneeId = event.data.assigneeId;
        this.state.priority = event.data.priority;
        this.state.createdAt = event.metadata.timestamp.toISOString();
        break;

      case 'TaskAssigned':
        this.state.assigneeId = event.data.assigneeId;
        break;

      case 'TaskCompleted':
        this.state.status = 'completed';
        this.state.completedAt = event.data.completedAt;
        break;

      case 'TaskCancelled':
        this.state.status = 'cancelled';
        this.state.cancelledAt = event.data.cancelledAt;
        break;

      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = event;
        throw new Error(`Unknown event type: ${(_exhaustive as any).eventType}`);
    }
  }

  // ==========================================================================
  // Business Behavior Methods
  // ==========================================================================

  /**
   * Assign task to a user
   * 
   * Business rule: Cannot reassign a completed or cancelled task.
   * 
   * @param params - Assignment parameters
   * @throws Error if task is already completed or cancelled
   */
  assign(params: {
    assigneeId: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    // Validation: Cannot assign completed/cancelled tasks
    if (this.state.status === 'completed') {
      throw new Error('Cannot assign a completed task');
    }
    if (this.state.status === 'cancelled') {
      throw new Error('Cannot assign a cancelled task');
    }

    const payload: TaskAssignedPayload = {
      assigneeId: params.assigneeId,
      assignedAt: new Date().toISOString(),
    };

    const event: TaskAssigned = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'TaskEntity',
      eventType: 'TaskAssigned',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'task.assign',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  /**
   * Mark task as completed
   * 
   * Business rule: Can only complete tasks that are pending or in progress.
   * 
   * @param params - Completion parameters
   * @throws Error if task is already completed or cancelled
   */
  complete(params: {
    notes?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    // Validation: Cannot complete already completed/cancelled tasks
    if (this.state.status === 'completed') {
      throw new Error('Task is already completed');
    }
    if (this.state.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled task');
    }

    const payload: TaskCompletedPayload = {
      completedAt: new Date().toISOString(),
      notes: params.notes,
    };

    const event: TaskCompleted = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'TaskEntity',
      eventType: 'TaskCompleted',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'task.complete',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  /**
   * Cancel task
   * 
   * Business rule: Can only cancel tasks that are not already completed or cancelled.
   * 
   * @param params - Cancellation parameters
   * @throws Error if task is already completed or cancelled
   */
  cancel(params: {
    reason?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    // Validation: Cannot cancel completed/cancelled tasks
    if (this.state.status === 'completed') {
      throw new Error('Cannot cancel a completed task');
    }
    if (this.state.status === 'cancelled') {
      throw new Error('Task is already cancelled');
    }

    const payload: TaskCancelledPayload = {
      reason: params.reason,
      cancelledAt: new Date().toISOString(),
    };

    const event: TaskCancelled = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'TaskEntity',
      eventType: 'TaskCancelled',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'task.cancel',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  // ==========================================================================
  // State Accessors (Read-only Getters)
  // ==========================================================================

  /**
   * Get workspace ID where task belongs
   */
  get workspaceId(): string {
    return this.state.workspaceId;
  }

  /**
   * Get task title
   */
  get title(): string {
    return this.state.title;
  }

  /**
   * Get task description
   */
  get description(): string | undefined {
    return this.state.description;
  }

  /**
   * Get current task status
   */
  get status(): TaskStatus {
    return this.state.status;
  }

  /**
   * Get assigned user ID
   */
  get assigneeId(): string | undefined {
    return this.state.assigneeId;
  }

  /**
   * Get task priority
   */
  get priority(): TaskPriority | undefined {
    return this.state.priority;
  }

  /**
   * Get creation timestamp
   */
  get createdAt(): string {
    return this.state.createdAt;
  }

  /**
   * Get completion timestamp
   */
  get completedAt(): string | undefined {
    return this.state.completedAt;
  }

  /**
   * Get cancellation timestamp
   */
  get cancelledAt(): string | undefined {
    return this.state.cancelledAt;
  }

  // ==========================================================================
  // Helper Methods (Convenience Queries)
  // ==========================================================================

  /**
   * Check if task is pending
   */
  get isPending(): boolean {
    return this.state.status === 'pending';
  }

  /**
   * Check if task is in progress
   */
  get isInProgress(): boolean {
    return this.state.status === 'in_progress';
  }

  /**
   * Check if task is completed
   */
  get isCompleted(): boolean {
    return this.state.status === 'completed';
  }

  /**
   * Check if task is cancelled
   */
  get isCancelled(): boolean {
    return this.state.status === 'cancelled';
  }

  /**
   * Check if task is assigned
   */
  get isAssigned(): boolean {
    return this.state.assigneeId !== undefined;
  }
}

// ============================================================================
// Type Aliases for Clarity (following T/I/S pattern)
// ============================================================================

/**
 * Type alias for TaskEntity state (S = State)
 */
export type TaskEntityState = TaskState;

/**
 * Type alias for TaskEntity events (T = Type/Event)
 */
export type TaskEntityEvent = TaskEvent;

/**
 * Type alias for TaskEntity aggregate (main export)
 */
export type Task = TaskEntity;
