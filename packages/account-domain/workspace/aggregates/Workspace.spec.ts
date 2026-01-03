import { Workspace, WorkspaceState, WorkspaceEvent } from './Workspace';
import { WorkspaceId } from '../value-objects/WorkspaceId';
import { AccountId } from '../../account/value-objects/AccountId';
import { WorkspaceCreated } from '../events/WorkspaceCreated';
import { WorkspaceArchived } from '../events/WorkspaceArchived';

describe('Workspace Aggregate', () => {
  const testWorkspaceId: WorkspaceId = '123e4567-e89b-12d3-a456-426614174000';
  const testAccountId: AccountId = '987e6543-e21b-43d2-b654-321098765432';
  const testUserId = 'user-123';
  const testBlueprintId = testAccountId;

  describe('create()', () => {
    it('should create a new workspace with valid parameters', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace).toBeDefined();
      expect(workspace.id).toBe(testWorkspaceId);
      expect(workspace.accountId).toBe(testAccountId);
      expect(workspace.status).toBe('initializing');
      expect(workspace.createdAt).toBeDefined();
      expect(workspace.isInitializing).toBe(true);
      expect(workspace.isArchived).toBe(false);
      expect(workspace.isReady).toBe(false);
    });

    it('should create workspace with custom status', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        status: 'ready',
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.status).toBe('ready');
      expect(workspace.isReady).toBe(true);
    });

    it('should raise WorkspaceCreated event', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const uncommittedEvents = workspace.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(1);
      expect(uncommittedEvents[0].eventType).toBe('WorkspaceCreated');
      expect(uncommittedEvents[0].aggregateId).toBe(testWorkspaceId);
      expect(uncommittedEvents[0].aggregateType).toBe('Workspace');
      expect(uncommittedEvents[0].data.accountId).toBe(testAccountId);
    });

    it('should set causality metadata correctly', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const event = workspace.getUncommittedEvents()[0] as WorkspaceCreated;
      expect(event.metadata.causedByUser).toBe(testUserId);
      expect(event.metadata.causedByAction).toBe('workspace.create');
      expect(event.metadata.blueprintId).toBe(testBlueprintId);
      expect(event.metadata.timestamp).toBeDefined();
    });
  });

  describe('fromEvents()', () => {
    it('should reconstruct workspace from WorkspaceCreated event', () => {
      const events: WorkspaceEvent[] = [
        {
          id: 'event-1',
          aggregateId: testWorkspaceId,
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: testAccountId,
            status: 'initializing',
          },
          metadata: {
            causedBy: 'system',
            causedByUser: testUserId,
            causedByAction: 'workspace.create',
            blueprintId: testBlueprintId,
            timestamp: '2026-01-03T12:00:00.000Z',
          },
        } as WorkspaceCreated,
      ];

      const workspace = Workspace.fromEvents(testWorkspaceId, events);

      expect(workspace.id).toBe(testWorkspaceId);
      expect(workspace.accountId).toBe(testAccountId);
      expect(workspace.status).toBe('initializing');
      expect(workspace.createdAt).toBe('2026-01-03T12:00:00.000Z');
      expect(workspace.isInitializing).toBe(true);
    });

    it('should reconstruct workspace from multiple events', () => {
      const events: WorkspaceEvent[] = [
        {
          id: 'event-1',
          aggregateId: testWorkspaceId,
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: testAccountId,
            status: 'initializing',
          },
          metadata: {
            causedBy: 'system',
            causedByUser: testUserId,
            causedByAction: 'workspace.create',
            blueprintId: testBlueprintId,
            timestamp: '2026-01-03T12:00:00.000Z',
          },
        } as WorkspaceCreated,
        {
          id: 'event-2',
          aggregateId: testWorkspaceId,
          aggregateType: 'Workspace',
          eventType: 'WorkspaceArchived',
          data: {
            previousStatus: 'initializing',
            reason: 'Test archival',
          },
          metadata: {
            causedBy: 'event-1',
            causedByUser: testUserId,
            causedByAction: 'workspace.archive',
            blueprintId: testBlueprintId,
            timestamp: '2026-01-03T13:00:00.000Z',
          },
        } as WorkspaceArchived,
      ];

      const workspace = Workspace.fromEvents(testWorkspaceId, events);

      expect(workspace.id).toBe(testWorkspaceId);
      expect(workspace.status).toBe('archived');
      expect(workspace.isArchived).toBe(true);
      expect(workspace.isInitializing).toBe(false);
    });

    it('should not add events to uncommitted events when replaying', () => {
      const events: WorkspaceEvent[] = [
        {
          id: 'event-1',
          aggregateId: testWorkspaceId,
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: testAccountId,
            status: 'initializing',
          },
          metadata: {
            causedBy: 'system',
            causedByUser: testUserId,
            causedByAction: 'workspace.create',
            blueprintId: testBlueprintId,
            timestamp: '2026-01-03T12:00:00.000Z',
          },
        } as WorkspaceCreated,
      ];

      const workspace = Workspace.fromEvents(testWorkspaceId, events);
      const uncommittedEvents = workspace.getUncommittedEvents();

      expect(uncommittedEvents).toHaveLength(0);
    });
  });

  describe('archive()', () => {
    it('should archive an initializing workspace', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      workspace.clearUncommittedEvents(); // Clear create event
      workspace.archive({
        archivedBy: testUserId,
        reason: 'Test archival',
        blueprintId: testBlueprintId,
      });

      expect(workspace.isArchived).toBe(true);
      expect(workspace.status).toBe('archived');

      const uncommittedEvents = workspace.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(1);
      expect(uncommittedEvents[0].eventType).toBe('WorkspaceArchived');
    });

    it('should archive a ready workspace', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        status: 'ready',
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      workspace.clearUncommittedEvents();
      workspace.archive({
        archivedBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.isArchived).toBe(true);
    });

    it('should throw error when archiving already archived workspace', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      workspace.archive({
        archivedBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(() => {
        workspace.archive({
          archivedBy: testUserId,
          blueprintId: testBlueprintId,
        });
      }).toThrow('Workspace is already archived');
    });

    it('should throw error when archiving uninitialized workspace', () => {
      const workspace = Workspace.fromEvents(testWorkspaceId, []);

      expect(() => {
        workspace.archive({
          archivedBy: testUserId,
          blueprintId: testBlueprintId,
        });
      }).toThrow('Cannot archive uninitialized workspace');
    });

    it('should include reason in WorkspaceArchived event', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      workspace.clearUncommittedEvents();
      workspace.archive({
        archivedBy: testUserId,
        reason: 'Business closed',
        blueprintId: testBlueprintId,
      });

      const event = workspace.getUncommittedEvents()[0] as WorkspaceArchived;
      expect(event.data.reason).toBe('Business closed');
      expect(event.data.previousStatus).toBe('initializing');
    });
  });

  describe('markReady()', () => {
    it('should throw error when not implemented', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(() => {
        workspace.markReady({
          readyBy: testUserId,
          blueprintId: testBlueprintId,
        });
      }).toThrow('WorkspaceReady event not yet implemented');
    });

    it('should throw error for uninitialized workspace', () => {
      const workspace = Workspace.fromEvents(testWorkspaceId, []);

      expect(() => {
        workspace.markReady({
          readyBy: testUserId,
          blueprintId: testBlueprintId,
        });
      }).toThrow('Cannot mark uninitialized workspace as ready');
    });

    it('should throw error for non-initializing workspace', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        status: 'ready',
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(() => {
        workspace.markReady({
          readyBy: testUserId,
          blueprintId: testBlueprintId,
        });
      }).toThrow('Cannot mark workspace as ready from status: ready');
    });
  });

  describe('State Getters', () => {
    it('should return undefined for uninitialized workspace', () => {
      const workspace = Workspace.fromEvents(testWorkspaceId, []);

      expect(workspace.accountId).toBeUndefined();
      expect(workspace.status).toBeUndefined();
      expect(workspace.createdAt).toBeUndefined();
      expect(workspace.isReady).toBe(false);
      expect(workspace.isArchived).toBe(false);
      expect(workspace.isInitializing).toBe(false);
    });

    it('should return correct values for initialized workspace', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        status: 'ready',
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.accountId).toBe(testAccountId);
      expect(workspace.status).toBe('ready');
      expect(workspace.createdAt).toBeDefined();
      expect(workspace.isReady).toBe(true);
      expect(workspace.isArchived).toBe(false);
      expect(workspace.isInitializing).toBe(false);
    });
  });

  describe('Event Sourcing Pattern', () => {
    it('should maintain uncommitted events correctly', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.getUncommittedEvents()).toHaveLength(1);

      workspace.archive({
        archivedBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.getUncommittedEvents()).toHaveLength(2);
    });

    it('should clear uncommitted events', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.getUncommittedEvents()).toHaveLength(1);

      workspace.clearUncommittedEvents();

      expect(workspace.getUncommittedEvents()).toHaveLength(0);
    });

    it('should return copy of uncommitted events array', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const events1 = workspace.getUncommittedEvents();
      const events2 = workspace.getUncommittedEvents();

      expect(events1).not.toBe(events2); // Different array instances
      expect(events1).toEqual(events2); // But same content
    });
  });

  describe('Causality Chain', () => {
    it('should link archive event to create event', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const createEvent = workspace.getUncommittedEvents()[0];

      workspace.archive({
        archivedBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const archiveEvent = workspace.getUncommittedEvents()[1] as WorkspaceArchived;

      expect(archiveEvent.metadata.causedBy).toBe(createEvent.id);
    });

    it('should use system as causedBy for first event', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      const event = workspace.getUncommittedEvents()[0] as WorkspaceCreated;

      expect(event.metadata.causedBy).toBe('system');
    });
  });

  describe('Type Safety', () => {
    it('should have correct aggregate type', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.type).toBe('Workspace');
    });

    it('should have correct aggregate id', () => {
      const workspace = Workspace.create({
        id: testWorkspaceId,
        accountId: testAccountId,
        createdBy: testUserId,
        blueprintId: testBlueprintId,
      });

      expect(workspace.id).toBe(testWorkspaceId);
    });
  });
});

// END OF FILE
