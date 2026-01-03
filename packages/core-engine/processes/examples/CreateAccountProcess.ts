/**
 * Create Account Process
 *
 * Orchestrates account creation workflow across multiple aggregates.
 *
 * Workflow:
 * 1. AccountCreated event → Create initial Workspace
 * 2. WorkspaceCreated event → Assign Owner role
 * 3. MembershipCreated event → Complete process
 *
 * Compensation:
 * - Delete workspace if created
 * - Revoke membership if assigned
 * - Mark account as inactive
 *
 * 🔒 SKELETON ONLY - Phase 2A example
 */

import { DomainEvent } from '../../event-store';
import { CausalityMetadataFactory } from '../../causality';
import { ProcessBase } from '../ProcessBase';
import { ProcessCommand, ProcessCommandFactory } from '../ProcessCommand';
import { generateId } from '../../utils/id-generator';

/**
 * Process state for account creation workflow
 */
interface CreateAccountProcessState {
  accountId?: string;
  workspaceId?: string;
  membershipId?: string;
  stepCompleted: Set<string>;
}

/**
 * Create Account Process
 *
 * Orchestrates multi-aggregate account creation workflow.
 */
export class CreateAccountProcess extends ProcessBase<CreateAccountProcessState> {
  /**
   * Create a new CreateAccountProcess
   *
   * @param processId - Unique process identifier
   * @param correlationId - Correlation ID for tracking
   * @returns CreateAccountProcess instance
   */
  static create(processId: string, correlationId: string): CreateAccountProcess {
    const initialState: CreateAccountProcessState = {
      stepCompleted: new Set(),
    };

    return new CreateAccountProcess(processId, correlationId, initialState);
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
      case 'AccountCreated':
        await this.handleAccountCreated(event);
        break;

      case 'WorkspaceCreated':
        await this.handleWorkspaceCreated(event);
        break;

      case 'MembershipCreated':
        await this.handleMembershipCreated(event);
        break;

      default:
        // Ignore unrelated events
        break;
    }
  }

  /**
   * Handle AccountCreated event
   *
   * Step 1: Trigger workspace creation
   *
   * @param event - AccountCreated event
   */
  private async handleAccountCreated(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('account')) {
      return; // Idempotent - already handled
    }

    // Extract account ID from event
    this.processState.accountId = event.aggregateId;

    // Emit CreateWorkspace command
    const createWorkspaceCommand = ProcessCommandFactory.create({
      id: generateId(),
      commandType: 'CreateWorkspace',
      data: {
        accountId: this.processState.accountId,
        status: 'initializing',
      },
      metadata: CausalityMetadataFactory.create({
        causedBy: event.id,
        causedByUser: event.metadata.causedByUser,
        causedByAction: 'process.createAccount.createWorkspace',
        blueprintId: event.metadata.blueprintId,
        correlationId: this.correlationId,
      }),
    });

    this.emitCommand(createWorkspaceCommand);
    this.processState.stepCompleted.add('account');
  }

  /**
   * Handle WorkspaceCreated event
   *
   * Step 2: Trigger membership assignment
   *
   * @param event - WorkspaceCreated event
   */
  private async handleWorkspaceCreated(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('workspace')) {
      return; // Idempotent
    }

    // Store workspace ID
    this.processState.workspaceId = event.aggregateId;

    // Emit CreateMembership command
    const createMembershipCommand = ProcessCommandFactory.create({
      id: generateId(),
      commandType: 'CreateMembership',
      data: {
        accountId: this.processState.accountId,
        workspaceId: this.processState.workspaceId,
        role: 'Owner',
      },
      metadata: CausalityMetadataFactory.create({
        causedBy: event.id,
        causedByUser: event.metadata.causedByUser,
        causedByAction: 'process.createAccount.createMembership',
        blueprintId: event.metadata.blueprintId,
        correlationId: this.correlationId,
      }),
    });

    this.emitCommand(createMembershipCommand);
    this.processState.stepCompleted.add('workspace');
  }

  /**
   * Handle MembershipCreated event
   *
   * Step 3: Complete the process
   *
   * @param event - MembershipCreated event
   */
  private async handleMembershipCreated(event: DomainEvent): Promise<void> {
    if (this.processState.stepCompleted.has('membership')) {
      return; // Idempotent
    }

    // Store membership ID
    this.processState.membershipId = event.aggregateId;
    this.processState.stepCompleted.add('membership');

    // All steps complete - mark process as done
    this.complete();
  }

  /**
   * Compensate the process (rollback)
   *
   * Reverses all completed steps in reverse order.
   */
  protected async onCompensate(): Promise<void> {
    // Compensation order: Membership → Workspace → Account

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
          causedByAction: 'process.createAccount.compensate.deleteMembership',
          blueprintId: this.processState.accountId || 'unknown',
          correlationId: this.correlationId,
        }),
      });

      this.emitCommand(deleteMembershipCommand);
    }

    if (this.processState.workspaceId) {
      // Emit ArchiveWorkspace command
      const archiveWorkspaceCommand = ProcessCommandFactory.create({
        id: generateId(),
        commandType: 'ArchiveWorkspace',
        data: {
          workspaceId: this.processState.workspaceId,
        },
        metadata: CausalityMetadataFactory.create({
          causedBy: this.processId,
          causedByUser: 'system',
          causedByAction: 'process.createAccount.compensate.archiveWorkspace',
          blueprintId: this.processState.accountId || 'unknown',
          correlationId: this.correlationId,
        }),
      });

      this.emitCommand(archiveWorkspaceCommand);
    }

    // Note: We typically don't delete the Account itself
    // Instead mark it as inactive or failed creation
  }
}

// END OF FILE
