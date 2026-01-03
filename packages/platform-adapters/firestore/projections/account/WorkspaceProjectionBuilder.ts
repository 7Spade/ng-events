/**
 * Workspace Projection Builder
 * 
 * Transforms Workspace domain events into query-optimized read models.
 * 
 * Architecture:
 * - Events (Write) → ProjectionBuilder → Firestore Projection (Read)
 * - Projections are DERIVED from events, NOT the source of truth
 * - Projections can be rebuilt, deleted, and recreated from event history
 * 
 * Multi-Tenant Isolation:
 * - Uses ownerId (accountId) as isolation boundary for Workspace
 * - workspaceId is self-referencing (Workspace is the container)
 * 
 * Idempotency:
 * - Uses merge:true for all updates to ensure idempotent operations
 * - Same event replayed multiple times produces same projection state
 */

import { Firestore, doc, setDoc } from 'firebase/firestore';
import { ProjectionBuilder } from '@ng-events/core-engine/projection';
import type { DomainEvent } from '@ng-events/core-engine/projection';

/**
 * Workspace projection schema for Firestore
 * 
 * Path: projections/workspace/{workspaceId}
 * 
 * Purpose: Query-optimized read model for Workspace queries
 * - UI dashboard lists
 * - Account workspace selection
 * - Workspace status filters
 */
export interface WorkspaceProjectionSchema {
  /** Workspace ID (same as aggregateId) */
  id: string;
  /** Owner Account ID (multi-tenant boundary) */
  ownerId: string;
  /** Workspace status */
  status: 'initializing' | 'ready' | 'restricted' | 'archived';
  /** Created timestamp (ISO string) */
  createdAt: string;
  /** Archived timestamp (ISO string, optional) */
  archivedAt?: string;
  /** Projection version for conflict detection */
  version: number;
  /** Last event timestamp that updated this projection */
  lastEventAt: string;
}

/**
 * Workspace Projection Builder
 * 
 * Listens to Workspace events and maintains Firestore projections.
 * 
 * Event Handlers:
 * - WorkspaceCreated → Create projection with initial state
 * - WorkspaceArchived → Update status to 'archived'
 * 
 * @example
 * ```typescript
 * const builder = new WorkspaceProjectionBuilder(firestore);
 * await builder.handleEvent(workspaceCreatedEvent);
 * // → Creates projection at projections/workspace/{id}
 * ```
 */
export class WorkspaceProjectionBuilder implements ProjectionBuilder {
  constructor(private readonly db: Firestore) {
    if (!db) {
      throw new Error('Firestore instance is required');
    }
  }

  /**
   * Handle domain event and update projection
   * 
   * Dispatches to specific event handlers based on eventType.
   * Unknown events are logged but don't throw errors.
   * 
   * @param event - Domain event to handle
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    if (!event?.eventType) {
      console.warn('[WorkspaceProjectionBuilder] Event missing eventType', event);
      return;
    }

    switch (event.eventType) {
      case 'WorkspaceCreated':
        await this.handleWorkspaceCreated(event);
        break;
      case 'WorkspaceArchived':
        await this.handleWorkspaceArchived(event);
        break;
      default:
        // Log unknown events but don't fail
        // Projection builders are specialized - they ignore irrelevant events
        console.debug(
          `[WorkspaceProjectionBuilder] Ignoring event type: ${event.eventType}`
        );
    }
  }

  /**
   * Rebuild projection from event stream (optional)
   * 
   * Replays all events in order to reconstruct the projection.
   * Useful for fixing corrupted projections.
   * 
   * @param aggregateId - Workspace ID to rebuild
   * @param events - Complete event stream for the workspace
   */
  async rebuild(aggregateId: string, events: DomainEvent[]): Promise<void> {
    if (!aggregateId?.trim()) {
      throw new Error('Aggregate ID is required for rebuild');
    }

    if (!Array.isArray(events)) {
      throw new Error('Events must be an array');
    }

    // Sort events by timestamp to ensure correct order
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.metadata.timestamp).getTime() -
        new Date(b.metadata.timestamp).getTime()
    );

    // Replay all events in order
    for (const event of sortedEvents) {
      await this.handleEvent(event);
    }
  }

  /**
   * Handle WorkspaceCreated event
   * 
   * Creates initial projection with:
   * - id: workspaceId
   * - ownerId: accountId (multi-tenant boundary)
   * - status: from event payload
   * - createdAt: event timestamp
   * - version: 1
   * 
   * Uses merge:true for idempotency - safe to replay.
   * 
   * @param event - WorkspaceCreated domain event
   */
  private async handleWorkspaceCreated(event: DomainEvent): Promise<void> {
    // Validate event structure
    if (!event.aggregateId?.trim()) {
      console.error('[WorkspaceProjectionBuilder] Missing aggregateId in WorkspaceCreated');
      return;
    }

    if (!event.data?.accountId?.trim()) {
      console.error('[WorkspaceProjectionBuilder] Missing accountId in WorkspaceCreated data');
      return;
    }

    if (!event.data?.status) {
      console.error('[WorkspaceProjectionBuilder] Missing status in WorkspaceCreated data');
      return;
    }

    // Build projection document
    const projection: WorkspaceProjectionSchema = {
      id: event.aggregateId,
      ownerId: event.data.accountId,
      status: event.data.status,
      createdAt: event.metadata.timestamp,
      version: 1,
      lastEventAt: event.metadata.timestamp,
    };

    // Write to Firestore
    // Path: projections/workspace/{workspaceId}
    const projectionRef = doc(this.db, 'projections/workspace', event.aggregateId);

    try {
      await setDoc(projectionRef, projection, { merge: true });
    } catch (error) {
      console.error(
        '[WorkspaceProjectionBuilder] Failed to save WorkspaceCreated projection',
        error
      );
      throw error;
    }
  }

  /**
   * Handle WorkspaceArchived event
   * 
   * Updates projection:
   * - status: 'archived'
   * - archivedAt: event timestamp
   * - version: increment
   * - lastEventAt: event timestamp
   * 
   * Uses merge:true for idempotency - safe to replay.
   * 
   * @param event - WorkspaceArchived domain event
   */
  private async handleWorkspaceArchived(event: DomainEvent): Promise<void> {
    // Validate event structure
    if (!event.aggregateId?.trim()) {
      console.error('[WorkspaceProjectionBuilder] Missing aggregateId in WorkspaceArchived');
      return;
    }

    // Build update payload
    const update: Partial<WorkspaceProjectionSchema> = {
      status: 'archived',
      archivedAt: event.metadata.timestamp,
      lastEventAt: event.metadata.timestamp,
      // Note: version increment is handled by application logic
      // In production, consider using Firestore FieldValue.increment(1)
    };

    // Write to Firestore
    const projectionRef = doc(this.db, 'projections/workspace', event.aggregateId);

    try {
      await setDoc(projectionRef, update, { merge: true });
    } catch (error) {
      console.error(
        '[WorkspaceProjectionBuilder] Failed to save WorkspaceArchived projection',
        error
      );
      throw error;
    }
  }
}

// END OF FILE
