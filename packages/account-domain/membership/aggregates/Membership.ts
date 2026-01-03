import { AggregateRoot, CausalityMetadata, generateEventId, generateAggregateId } from '@ng-events/core-engine';

import {
  MemberJoinedWorkspace,
  MemberJoinedWorkspacePayload,
} from '../events/MemberJoinedWorkspace';
import {
  MemberRoleChanged,
  MemberRoleChangedPayload,
} from '../events/MemberRoleChanged';
import { MemberId } from '../value-objects/MemberId';
import { Role } from '../value-objects/Role';
import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';

/**
 * Membership Aggregate State
 *
 * Captures the relationship between a member and a workspace.
 */
export interface MembershipState {
  memberId: MemberId;
  workspaceId: WorkspaceId;
  role: Role;
  joinedAt: string;
}

/**
 * Union of all Membership domain events
 */
export type MembershipEvent = MemberJoinedWorkspace | MemberRoleChanged;

/**
 * Membership Aggregate
 *
 * Manages member-workspace relationships and role assignments.
 * Enforces business rules around role changes and membership lifecycle.
 */
export class Membership extends AggregateRoot<
  MembershipEvent,
  MemberId,
  MembershipState
> {
  /**
   * Private constructor - use factory methods to create instances
   */
  private constructor(id: MemberId) {
    super(id);
  }

  /**
   * Factory method: Create a new Membership when a member joins a workspace
   *
   * @param memberId - Unique identifier for the member
   * @param workspaceId - Workspace being joined
   * @param role - Initial role assignment
   * @param causedByUser - User who initiated this action
   * @param blueprintId - Multi-tenant boundary identifier
   * @returns New Membership aggregate instance
   */
  static create(
    memberId: MemberId,
    workspaceId: WorkspaceId,
    role: Role,
    causedByUser: string,
    blueprintId: string
  ): Membership {
    const membership = new Membership(memberId);

    const payload: MemberJoinedWorkspacePayload = {
      memberId,
      workspaceId,
      role,
      joinedAt: new Date().toISOString(),
    };

    const metadata: CausalityMetadata = {
      causedBy: 'system',
      causedByUser,
      causedByAction: 'membership.create',
      timestamp: new Date().toISOString(),
      blueprintId,
    };

    const event: MemberJoinedWorkspace = {
      id: generateEventId(),
      aggregateId: memberId,
      aggregateType: 'Membership',
      eventType: 'MemberJoinedWorkspace',
      payload,
      metadata,
      timestamp: metadata.timestamp,
    };

    membership.raiseEvent(event);
    return membership;
  }

  /**
   * Factory method: Reconstitute Membership from event history
   *
   * @param events - Historical events for this aggregate
   * @returns Membership aggregate with replayed state
   */
  static fromEvents(events: MembershipEvent[]): Membership {
    if (events.length === 0) {
      throw new Error('Cannot reconstitute Membership from empty event list');
    }

    const firstEvent = events[0];
    const membership = new Membership(firstEvent.aggregateId);

    events.forEach((event) => membership.applyEvent(event));

    return membership;
  }

  /**
   * Apply an event to update aggregate state (event replay)
   *
   * @param event - Domain event to apply
   */
  protected applyEvent(event: MembershipEvent): void {
    switch (event.eventType) {
      case 'MemberJoinedWorkspace': {
        const payload = event.payload as MemberJoinedWorkspacePayload;
        this.state = {
          memberId: payload.memberId,
          workspaceId: payload.workspaceId,
          role: payload.role,
          joinedAt: payload.joinedAt,
        };
        break;
      }

      case 'MemberRoleChanged': {
        const payload = event.payload as MemberRoleChangedPayload;
        this.state = {
          ...this.state,
          role: payload.newRole,
        };
        break;
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = event;
        throw new Error(`Unhandled event type: ${(_exhaustive as any).eventType}`);
      }
    }
  }

  /**
   * Business behavior: Change member's role within the workspace
   *
   * @param newRole - New role to assign
   * @param causedByUser - User who initiated this change
   * @throws Error if trying to change to the same role
   */
  changeRole(newRole: Role, causedByUser: string): void {
    if (!this.state) {
      throw new Error('Cannot change role on uninitialized Membership');
    }

    if (this.state.role === newRole) {
      throw new Error(`Member already has role: ${newRole}`);
    }

    const payload: MemberRoleChangedPayload = {
      memberId: this.state.memberId,
      workspaceId: this.state.workspaceId,
      previousRole: this.state.role,
      newRole,
      changedAt: new Date().toISOString(),
    };

    const metadata: CausalityMetadata = {
      causedBy: this.getUncommittedEvents()[0]?.id || 'system',
      causedByUser,
      causedByAction: 'membership.changeRole',
      timestamp: new Date().toISOString(),
      blueprintId: this.getUncommittedEvents()[0]?.metadata?.blueprintId || '',
    };

    const event: MemberRoleChanged = {
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'Membership',
      eventType: 'MemberRoleChanged',
      payload,
      metadata,
      timestamp: metadata.timestamp,
    };

    this.raiseEvent(event);
  }

  // ========================================
  // Getters (State Access)
  // ========================================

  get memberId(): MemberId {
    return this.state?.memberId || ('' as MemberId);
  }

  get workspaceId(): WorkspaceId {
    return this.state?.workspaceId || ('' as WorkspaceId);
  }

  get role(): Role {
    return this.state?.role || ('' as Role);
  }

  get joinedAt(): string {
    return this.state?.joinedAt || '';
  }

  get isAdmin(): boolean {
    return this.state?.role === 'admin';
  }

  get isMember(): boolean {
    return this.state?.role === 'member';
  }

  get isGuest(): boolean {
    return this.state?.role === 'guest';
  }
}

// END OF FILE
