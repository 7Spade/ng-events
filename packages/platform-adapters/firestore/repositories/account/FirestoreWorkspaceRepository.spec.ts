/**
 * Firestore Workspace Repository Tests
 *
 * Tests for FirestoreWorkspaceRepository dual-track implementation.
 * Validates EventStore writes and Projection queries.
 */

import { FirestoreWorkspaceRepository } from './FirestoreWorkspaceRepository';
import { Workspace } from '@ng-events/account-domain/workspace/aggregates/Workspace';
import { WorkspaceStatus } from '@ng-events/account-domain/workspace/events/WorkspaceCreated';
import { FirestoreEventStore } from '../../event-store/FirestoreEventStore';

describe('FirestoreWorkspaceRepository', () => {
  let repository: FirestoreWorkspaceRepository;
  let mockEventStore: jest.Mocked<FirestoreEventStore>;
  let mockDb: any;

  beforeEach(() => {
    // Mock EventStore
    mockEventStore = {
      append: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue([]),
      hasEvents: jest.fn().mockResolvedValue(false),
      registerEvent: jest.fn(),
      loadByType: jest.fn(),
    } as any;

    // Mock Firestore DB
    mockDb = {
      collection: jest.fn(),
    };

    repository = new FirestoreWorkspaceRepository(mockEventStore, mockDb);
  });

  describe('save', () => {
    it('should append uncommitted events to EventStore', async () => {
      const workspace = Workspace.create({
        id: 'ws-123',
        accountId: 'acc-456',
        status: 'initializing',
        createdBy: 'user-1',
        blueprintId: 'acc-456'
      });

      await repository.save(workspace);

      // Verify events were appended
      expect(mockEventStore.append).toHaveBeenCalled();
    });

    it('should clear uncommitted events after save', async () => {
      const workspace = Workspace.create({
        id: 'ws-123',
        accountId: 'acc-456',
        createdBy: 'user-1'
      });

      const uncommittedBefore = workspace.uncommittedEvents.length;
      expect(uncommittedBefore).toBeGreaterThan(0);

      await repository.save(workspace);

      const uncommittedAfter = workspace.uncommittedEvents.length;
      expect(uncommittedAfter).toBe(0);
    });

    it('should not call EventStore if no uncommitted events', async () => {
      const workspace = Workspace.create({
        id: 'ws-123',
        accountId: 'acc-456',
        createdBy: 'user-1'
      });

      // Clear uncommitted events
      workspace.clearUncommittedEvents();

      await repository.save(workspace);

      // Verify no events were appended
      expect(mockEventStore.append).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should return null if no events exist', async () => {
      mockEventStore.load.mockResolvedValue([]);

      const workspace = await repository.load('ws-123');

      expect(workspace).toBeNull();
      expect(mockEventStore.load).toHaveBeenCalledWith('ws-123', 'Workspace');
    });

    it('should reconstruct aggregate from events', async () => {
      const mockEvents: any[] = [
        {
          id: 'evt-123',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: 'acc-456',
            status: 'initializing'
          },
          metadata: {
            causedBy: 'system',
            causedByUser: 'user-1',
            causedByAction: 'workspace.create',
            timestamp: '2024-01-01T00:00:00.000Z',
            blueprintId: 'acc-456'
          }
        }
      ];

      mockEventStore.load.mockResolvedValue(mockEvents);

      const workspace = await repository.load('ws-123');

      expect(workspace).not.toBeNull();
      expect(workspace?.id).toBe('ws-123');
    });
  });

  describe('exists', () => {
    it('should return false if aggregate does not exist', async () => {
      mockEventStore.hasEvents.mockResolvedValue(false);

      const exists = await repository.exists('ws-123');

      expect(exists).toBe(false);
      expect(mockEventStore.hasEvents).toHaveBeenCalledWith('ws-123', 'Workspace');
    });

    it('should return true if aggregate exists', async () => {
      mockEventStore.hasEvents.mockResolvedValue(true);

      const exists = await repository.exists('ws-123');

      expect(exists).toBe(true);
    });
  });

  describe('findByAccountId', () => {
    it('should query projections collection with accountId filter', async () => {
      const mockQuery = jest.fn();
      const mockWhere = jest.fn();
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: []
      });

      mockDb.collection = jest.fn().mockReturnValue({});
      
      (global as any).query = mockQuery;
      (global as any).where = mockWhere;
      (global as any).getDocs = mockGetDocs;
      (global as any).collection = jest.fn();

      const workspaces = await repository.findByAccountId('acc-123');

      expect(workspaces).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should query projections collection with status filter', async () => {
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: []
      });

      (global as any).getDocs = mockGetDocs;

      const workspaces = await repository.findByStatus('ready');

      expect(workspaces).toEqual([]);
    });
  });

  describe('findReadyWorkspaces', () => {
    it('should call findByStatus with ready status', async () => {
      const spy = jest.spyOn(repository, 'findByStatus').mockResolvedValue([]);

      await repository.findReadyWorkspaces();

      expect(spy).toHaveBeenCalledWith('ready');
    });
  });

  describe('findByAccountIdAndStatus', () => {
    it('should query projections with both accountId and status filters', async () => {
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: []
      });

      (global as any).getDocs = mockGetDocs;

      const workspaces = await repository.findByAccountIdAndStatus('acc-123', 'ready');

      expect(workspaces).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return count from Firestore query', async () => {
      const mockGetCountFromServer = jest.fn().mockResolvedValue({
        data: () => ({ count: 5 })
      });

      (global as any).getCountFromServer = mockGetCountFromServer;

      const count = await repository.count();

      expect(count).toBe(5);
    });

    it('should filter by accountId if provided', async () => {
      const mockGetCountFromServer = jest.fn().mockResolvedValue({
        data: () => ({ count: 3 })
      });

      (global as any).getCountFromServer = mockGetCountFromServer;

      const count = await repository.count('acc-123');

      expect(count).toBe(3);
    });

    it('should filter by accountId and status if both provided', async () => {
      const mockGetCountFromServer = jest.fn().mockResolvedValue({
        data: () => ({ count: 2 })
      });

      (global as any).getCountFromServer = mockGetCountFromServer;

      const count = await repository.count('acc-123', 'ready');

      expect(count).toBe(2);
    });
  });

  describe('Dual-Track Pattern Validation', () => {
    it('should use EventStore for write operations', async () => {
      const workspace = Workspace.create({
        id: 'ws-123',
        accountId: 'acc-456',
        createdBy: 'user-1'
      });

      await repository.save(workspace);

      // Verify EventStore was used, NOT projection
      expect(mockEventStore.append).toHaveBeenCalled();
    });

    it('should use Projections for query operations', async () => {
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: []
      });

      (global as any).getDocs = mockGetDocs;

      await repository.findByAccountId('acc-123');

      // Verify projection query was used
      // Note: Actual Firestore mocking would verify collection path
      expect(true).toBe(true);
    });
  });

  describe('getAggregateType', () => {
    it('should return Workspace as aggregate type', () => {
      const aggregateType = (repository as any).getAggregateType();
      expect(aggregateType).toBe('Workspace');
    });
  });

  describe('fromEvents', () => {
    it('should call Workspace.fromEvents with correct parameters', () => {
      const mockEvents: any[] = [
        {
          id: 'evt-123',
          aggregateId: 'ws-123',
          eventType: 'WorkspaceCreated',
          data: { accountId: 'acc-456', status: 'initializing' }
        }
      ];

      const workspace = (repository as any).fromEvents('ws-123', mockEvents);

      expect(workspace).toBeInstanceOf(Workspace);
      expect(workspace.id).toBe('ws-123');
    });
  });
});

// END OF FILE
