/**
 * Join Workspace Process
 *
 * Orchestrates member joining workflow across multiple aggregates.
 *
 * Workflow:
 * 1. InvitationAccepted event → Create Membership
 * 2. MembershipCreated event → Notify team
 * 3. NotificationSent event → Complete process
 *
 * Compensation:
 * - Delete membership if created
 * - Revoke invitation
 * - Send cancellation notification
 *
 * 🔒 SKELETON ONLY - Phase 2A example
 */

import { DomainEvent } from '../../event-store';
import { CausalityMetadataFactory } from '../../causality';
import { ProcessBase } from '../ProcessBase';
import { ProcessCommand, ProcessCommandFactory } from '../ProcessCommand';
import { generateId } from '../../utils/id-generator';

/**
 * Process state for join workspace workflow
 */
interface JoinWorkspaceProcessState {
  invitationId?: string;
  accountId?: string;
  workspaceId?: string;
  membershipId?: string;
  notificationId?: string;
  stepCompleted: Set<string>;
}

/**
 * Join Workspace Process
 *
 * Orchestrates multi-aggregate member joining workflow.
 */
export class JoinWorkspaceProcess extends ProcessBase<JoinWorkspaceProcessState> {
  /**
   * Create a new JoinWorkspaceProcess
   *
   * @param processId - Unique process identifier
   * @param correlationId - Correlation ID for tracking
   * @returns JoinWorkspaceProcess instance
   */
  static create(processId: string, correlationId: string): JoinWorkspaceProcess {
    const initialState: JoinWorkspaceProcessState = {
      stepCompleted: new Set(),
    };

    return new JoinWorkspaceProcess(processId, correlationId, initialState);
  }

  /**
   * Handle domain events
   *
   * Routes events to specific handlers.
   *
   * @param event - Domain event to handle
   */
  protected async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'InvitationAccepted':
        await this.handleInvitationAccepted(event);
        break;

      case 'MembershipCreated':
        await this.handleMembershipCreated(event);
        break;

      case 'NotificationSent':
        await this.handleNotificationSent(event);
        break;

      default:
        // Ignore unrelated events
        break;
    }
  }

  /**
   * Handle InvitationAccepted event
   *
   * Step 1: Trigger membership creation
   *
   * @param event - InvitationAccepted event
   */
  private async handleInvitationAccepted(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('invitation')) {
      return; // Idempotent - already handled
    }

    // Extract data from event
    this.processState.invitationId = event.aggregateId;
    this.processState.accountId = (event.data as any).accountId;
    this.processState.workspaceId = (event.data as any).workspaceId;

    // Emit CreateMembership command
    const createMembershipCommand = ProcessCommandFactory.create({
      id: generateId(),
      commandType: 'CreateMembership',
      data: {
        accountId: this.processState.accountId,
        workspaceId: this.processState.workspaceId,
        role: (event.data as any).role || 'Member',
      },
      metadata: CausalityMetadataFactory.create({
        causedBy: event.id,
        causedByUser: event.metadata.causedByUser,
        causedByAction: 'process.joinWorkspace.createMembership',
        blueprintId: event.metadata.blueprintId,
        correlationId: this.correlationId,
      }),
    });

    this.emitCommand(createMembershipCommand);
    this.processState.stepCompleted.add('invitation');
  }

  /**
   * Handle MembershipCreated event
   *
   * Step 2: Trigger team notification
   *
   * @param event - MembershipCreated event
   */
  private async handleMembershipCreated(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('membership')) {
      return; // Idempotent
    }

    // Store membership ID
    this.processState.membershipId = event.aggregateId;

    // Emit SendNotification command
    const sendNotificationCommand = ProcessCommandFactory.create({
      id: generateId(),
      commandType: 'SendNotification',
      data: {
        recipientType: 'workspace',
        recipientId: this.processState.workspaceId,
        message: `New member ${this.processState.accountId} joined`,
        type: 'member_joined',
      },
      metadata: CausalityMetadataFactory.create({
        causedBy: event.id,
        causedByUser: event.metadata.causedByUser,
        causedByAction: 'process.joinWorkspace.notifyTeam',
        blueprintId: event.metadata.blueprintId,
        correlationId: this.correlationId,
      }),
    });

    this.emitCommand(sendNotificationCommand);
    this.processState.stepCompleted.add('membership');
  }

  /**
   * Handle NotificationSent event
   *
   * Step 3: Complete the process
   *
   * @param event - NotificationSent event
   */
  private async handleNotificationSent(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('notification')) {
      return; // Idempotent
    }

    // Store notification ID
    this.processState.notificationId = event.aggregateId;
    this.processState.stepCompleted.add('notification');

    // All steps complete - mark process as done
    this.complete();
  }

  /**
   * Compensate the process (rollback)
   *
   * Reverses all completed steps in reverse order.
   */
  protected async onCompensate(): Promise<void> {
    // Compensation order: Notification → Membership → Invitation

    if (this.processState.notificationId) {
      // Emit CancelNotification command
      const cancelNotificationCommand = ProcessCommandFactory.create({
        id: generateId(),
        commandType: 'CancelNotification',
        data: {
          notificationId: this.processState.notificationId,
        },
        metadata: CausalityMetadataFactory.create({
          causedBy: this.processId,
          causedByUser: 'system',
          causedByAction: 'process.joinWorkspace.compensate.cancelNotification',
          blueprintId: this.processState.workspaceId || 'unknown',
          correlationId: this.correlationId,
        }),
      });

      this.emitCommand(cancelNotificationCommand);
    }

    if (this.processState.membershipId) {
      // Emit DeleteMembership command
      const deleteMembershipCommand = ProcessCommandFactory.create({
        id: generateId(),
        commandType: 'DeleteMembership',
        data: {
          membershipId: this.processState.membershipId,
        },
        metadata: CausalityMetadataFactory.create({
          causedBy: this.processId,
          causedByUser: 'system',
          causedByAction: 'process.joinWorkspace.compensate.deleteMembership',
          blueprintId: this.processState.workspaceId || 'unknown',
          correlationId: this.correlationId,
        }),
      });

      this.emitCommand(deleteMembershipCommand);
    }

    // Note: Typically we mark invitation as failed rather than deleting
  }
}

// END OF FILE
