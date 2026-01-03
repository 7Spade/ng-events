import { AggregateRoot, CausalityMetadataFactory } from '@ng-events/core-engine';
import { generateAggregateId, generateEventId } from '@ng-events/core-engine/utils/id-generator';

import { IssueCreated, IssueCreatedPayload } from '../events/IssueCreated';
import { IssueAssigned, IssueAssignedPayload } from '../events/IssueAssigned';
import { IssueClosed, IssueClosedPayload } from '../events/IssueClosed';
import { IssueReopened, IssueReopenedPayload } from '../events/IssueReopened';
import { IssueId } from '../value-objects/IssueId';
import { IssueStatus } from '../value-objects/IssueStatus';
import { IssueType } from '../value-objects/IssueType';
import { IssuePriority } from '../value-objects/IssuePriority';

/**
 * IssueEntity Aggregate State
 */
export interface IssueState {
  issueId: IssueId;
  workspaceId: string;
  title: string;
  description?: string;
  status: IssueStatus;
  type: IssueType;
  priority: IssuePriority;
  assigneeId?: string;
  reporterId: string;
  createdAt: string;
  closedAt?: string;
  reopenedAt?: string;
}

/**
 * Union type of all Issue events
 */
export type IssueEvent = IssueCreated | IssueAssigned | IssueClosed | IssueReopened;

/**
 * IssueEntity Aggregate Root
 * 
 * Represents an issue within the Issue Tracking Module.
 * Follows the Module → Entity pattern.
 */
export class IssueEntity extends AggregateRoot<IssueEvent, IssueId, IssueState> {
  readonly id: IssueId;
  readonly type = 'IssueEntity';
  private state: IssueState;

  private constructor(state: IssueState) {
    super();
    this.id = state.issueId;
    this.state = state;
  }

  /**
   * Factory method - Create a new Issue entity
   */
  static create(params: {
    workspaceId: string;
    title: string;
    description?: string;
    type: IssueType;
    priority: IssuePriority;
    assigneeId?: string;
    reporterId: string;
    causedBy: string;
    causedByUser: string;
  }): IssueEntity {
    const issueId = generateAggregateId();
    const now = new Date().toISOString();

    const payload: IssueCreatedPayload = {
      workspaceId: params.workspaceId,
      title: params.title,
      description: params.description,
      status: 'open',
      type: params.type,
      priority: params.priority,
      assigneeId: params.assigneeId,
      reporterId: params.reporterId,
    };

    const event: IssueCreated = {
      id: generateEventId(),
      aggregateId: issueId,
      aggregateType: 'IssueEntity',
      eventType: 'IssueCreated',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'issue.create',
        blueprintId: params.workspaceId,
      }),
    };

    const initialState: IssueState = {
      issueId,
      workspaceId: payload.workspaceId,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      type: payload.type,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      reporterId: payload.reporterId,
      createdAt: now,
    };

    const issue = new IssueEntity(initialState);
    issue.raiseEvent(event);
    return issue;
  }

  /**
   * Factory method - Reconstruct Issue entity from event stream
   */
  static fromEvents(events: IssueEvent[]): IssueEntity {
    if (events.length === 0) {
      throw new Error('Cannot reconstruct IssueEntity from empty event stream');
    }

    const firstEvent = events[0];
    if (firstEvent.eventType !== 'IssueCreated') {
      throw new Error('First event must be IssueCreated');
    }

    const issue = new IssueEntity({
      issueId: firstEvent.aggregateId,
      workspaceId: firstEvent.data.workspaceId,
      title: firstEvent.data.title,
      status: 'open',
      type: firstEvent.data.type,
      priority: firstEvent.data.priority,
      reporterId: firstEvent.data.reporterId,
      createdAt: new Date().toISOString(),
    });

    events.forEach(event => issue.applyEvent(event));
    return issue;
  }

  protected applyEvent(event: IssueEvent): void {
    switch (event.eventType) {
      case 'IssueCreated':
        this.state.workspaceId = event.data.workspaceId;
        this.state.title = event.data.title;
        this.state.description = event.data.description;
        this.state.status = event.data.status;
        this.state.type = event.data.type;
        this.state.priority = event.data.priority;
        this.state.assigneeId = event.data.assigneeId;
        this.state.reporterId = event.data.reporterId;
        this.state.createdAt = event.metadata.timestamp.toISOString();
        break;

      case 'IssueAssigned':
        this.state.assigneeId = event.data.assigneeId;
        break;

      case 'IssueClosed':
        this.state.status = 'closed';
        this.state.closedAt = event.data.closedAt;
        break;

      case 'IssueReopened':
        this.state.status = 'reopened';
        this.state.reopenedAt = event.data.reopenedAt;
        break;

      default:
        const _exhaustive: never = event;
        throw new Error(`Unknown event type: ${(_exhaustive as any).eventType}`);
    }
  }

  /**
   * Assign issue to a user
   */
  assign(params: {
    assigneeId: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    if (this.state.status === 'closed') {
      throw new Error('Cannot assign a closed issue');
    }

    const payload: IssueAssignedPayload = {
      assigneeId: params.assigneeId,
      assignedAt: new Date().toISOString(),
    };

    const event: IssueAssigned = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'IssueEntity',
      eventType: 'IssueAssigned',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'issue.assign',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  /**
   * Close issue
   */
  close(params: {
    resolution?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    if (this.state.status === 'closed') {
      throw new Error('Issue is already closed');
    }

    const payload: IssueClosedPayload = {
      closedAt: new Date().toISOString(),
      resolution: params.resolution,
    };

    const event: IssueClosed = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'IssueEntity',
      eventType: 'IssueClosed',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'issue.close',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  /**
   * Reopen issue
   */
  reopen(params: {
    reason?: string;
    causedBy: string;
    causedByUser: string;
  }): void {
    if (this.state.status !== 'closed') {
      throw new Error('Can only reopen closed issues');
    }

    const payload: IssueReopenedPayload = {
      reopenedAt: new Date().toISOString(),
      reason: params.reason,
    };

    const event: IssueReopened = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'IssueEntity',
      eventType: 'IssueReopened',
      data: payload,
      metadata: CausalityMetadataFactory.create({
        causedBy: params.causedBy,
        causedByUser: params.causedByUser,
        causedByAction: 'issue.reopen',
        blueprintId: this.state.workspaceId,
      }),
    };

    this.raiseEvent(event);
  }

  // Getters
  get workspaceId(): string { return this.state.workspaceId; }
  get title(): string { return this.state.title; }
  get description(): string | undefined { return this.state.description; }
  get status(): IssueStatus { return this.state.status; }
  get issueType(): IssueType { return this.state.type; }
  get priority(): IssuePriority { return this.state.priority; }
  get assigneeId(): string | undefined { return this.state.assigneeId; }
  get reporterId(): string { return this.state.reporterId; }
  get createdAt(): string { return this.state.createdAt; }
  get closedAt(): string | undefined { return this.state.closedAt; }
  get reopenedAt(): string | undefined { return this.state.reopenedAt; }

  // Helper methods
  get isOpen(): boolean { return this.state.status === 'open'; }
  get isInProgress(): boolean { return this.state.status === 'in_progress'; }
  get isClosed(): boolean { return this.state.status === 'closed'; }
  get isReopened(): boolean { return this.state.status === 'reopened'; }
  get isAssigned(): boolean { return this.state.assigneeId !== undefined; }
  get isCritical(): boolean { return this.state.priority === 'critical'; }
  get isBug(): boolean { return this.state.type === 'bug'; }
}

export type IssueEntityState = IssueState;
export type IssueEntityEvent = IssueEvent;
export type Issue = IssueEntity;
