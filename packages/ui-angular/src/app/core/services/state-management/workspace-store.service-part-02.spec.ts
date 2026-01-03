/**
 * Workspace Store Service Tests - Part 2
 * 
 * Continuation of workspace-store.service-part-01.spec.ts
 * 
 * Test Coverage:
 * - refreshWorkspaces (2 tests)
 * - selectWorkspace/clearSelection (3 tests)
 * - selectWorkspaceById (3 tests)
 * - selectWorkspacesByStatus (2 tests)
 * - Snapshot methods (4 tests)
 * - Utility methods (3 tests)
 * 
 * Total: 17 test cases (Part 2)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkspaceStoreService } from './workspace-store.service';
import { WorkspaceQueryService, WorkspaceProjectionSchema } from '../queries/workspace-query.service';
import { take } from 'rxjs/operators';

describe('WorkspaceStoreService - Part 2', () => {
  let service: WorkspaceStoreService;
  let mockQueryService: jest.Mocked<WorkspaceQueryService>;

  const mockWorkspace1: WorkspaceProjectionSchema = {
    id: 'ws-123',
    ownerId: 'acc-456',
    status: 'ready',
    createdAt: '2024-01-01T00:00:00.000Z',
    version: 1,
    lastEventAt: '2024-01-01T00:00:00.000Z'
  };

  const mockWorkspace2: WorkspaceProjectionSchema = {
    id: 'ws-789',
    ownerId: 'acc-456',
    status: 'archived',
    createdAt: '2024-01-02T00:00:00.000Z',
    archivedAt: '2024-01-03T00:00:00.000Z',
    version: 2,
    lastEventAt: '2024-01-03T00:00:00.000Z'
  };

  beforeEach(() => {
    mockQueryService = {
      getWorkspacesByOwnerId: jest.fn(),
      getReadyWorkspacesByOwnerId: jest.fn(),
      getWorkspaceById: jest.fn(),
      getWorkspacesByStatus: jest.fn(),
      getWorkspacesByOwnerIdAndStatus: jest.fn(),
      getWorkspaceCountByOwnerId: jest.fn(),
      workspaceExists: jest.fn()
    } as any;

    service = new WorkspaceStoreService(mockQueryService);
  });

  describe('refreshWorkspaces()', () => {
    it('should reload workspaces from query service', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.refreshWorkspaces('acc-456');

      expect(mockQueryService.getWorkspacesByOwnerId).toHaveBeenCalledWith('acc-456');
    });

    it('should update cache with fresh data', async () => {
      mockQueryService.getWorkspacesByOwnerId
        .mockResolvedValueOnce([mockWorkspace1])
        .mockResolvedValueOnce([mockWorkspace1, mockWorkspace2]);

      await service.loadWorkspacesByOwnerId('acc-456');
      expect(service.getWorkspacesSnapshot()).toHaveLength(1);

      await service.refreshWorkspaces('acc-456');
      expect(service.getWorkspacesSnapshot()).toHaveLength(2);
    });
  });

  describe('selectWorkspace() and clearSelection()', () => {
    it('should set selected workspace ID', (done) => {
      service.selectWorkspace('ws-123');

      service.selectedWorkspaceId$.pipe(take(1)).subscribe(id => {
        expect(id).toBe('ws-123');
        done();
      });
    });

    it('should update selected workspace ID', (done) => {
      service.selectWorkspace('ws-123');
      service.selectWorkspace('ws-789');

      service.selectedWorkspaceId$.pipe(take(1)).subscribe(id => {
        expect(id).toBe('ws-789');
        done();
      });
    });

    it('should clear selected workspace ID', (done) => {
      service.selectWorkspace('ws-123');
      service.clearSelection();

      service.selectedWorkspaceId$.pipe(take(1)).subscribe(id => {
        expect(id).toBeNull();
        done();
      });
    });
  });

  describe('selectWorkspaceById()', () => {
    it('should return observable of specific workspace', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.selectWorkspaceById('ws-123').pipe(take(1)).subscribe(workspace => {
          expect(workspace).not.toBeNull();
          expect(workspace?.id).toBe('ws-123');
          done();
        });
      });
    });

    it('should return null when workspace not in cache', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.selectWorkspaceById('ws-nonexistent').pipe(take(1)).subscribe(workspace => {
          expect(workspace).toBeNull();
          done();
        });
      });
    });

    it('should emit updates when cache changes', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      const emissions: Array<WorkspaceProjectionSchema | null> = [];

      service.selectWorkspaceById('ws-123').subscribe(workspace => {
        emissions.push(workspace);

        if (emissions.length === 2) {
          expect(emissions[0]).toBeNull(); // Before load
          expect(emissions[1]?.id).toBe('ws-123'); // After load
          done();
        }
      });

      service.loadWorkspacesByOwnerId('acc-456');
    });
  });

  describe('selectWorkspacesByStatus()', () => {
    it('should filter workspaces by status', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.selectWorkspacesByStatus('ready').pipe(take(1)).subscribe(workspaces => {
          expect(workspaces).toHaveLength(1);
          expect(workspaces[0].status).toBe('ready');
          done();
        });
      });
    });

    it('should return empty array when no matches', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.selectWorkspacesByStatus('archived').pipe(take(1)).subscribe(workspaces => {
          expect(workspaces).toHaveLength(0);
          done();
        });
      });
    });
  });

  describe('Snapshot Methods', () => {
    it('should get workspaces snapshot', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.loadWorkspacesByOwnerId('acc-456');
      const snapshot = service.getWorkspacesSnapshot();

      expect(snapshot).toHaveLength(1);
      expect(snapshot[0].id).toBe('ws-123');
    });

    it('should get selected workspace ID snapshot', () => {
      service.selectWorkspace('ws-123');
      const snapshot = service.getSelectedWorkspaceIdSnapshot();

      expect(snapshot).toBe('ws-123');
    });

    it('should get workspace by ID snapshot', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      await service.loadWorkspacesByOwnerId('acc-456');
      const workspace = service.getWorkspaceByIdSnapshot('ws-789');

      expect(workspace).not.toBeNull();
      expect(workspace?.id).toBe('ws-789');
    });

    it('should return null for non-existent workspace snapshot', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.loadWorkspacesByOwnerId('acc-456');
      const workspace = service.getWorkspaceByIdSnapshot('ws-nonexistent');

      expect(workspace).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should check if workspace exists in cache', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.loadWorkspacesByOwnerId('acc-456');

      expect(service.hasWorkspace('ws-123')).toBe(true);
      expect(service.hasWorkspace('ws-nonexistent')).toBe(false);
    });

    it('should get workspace count', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      await service.loadWorkspacesByOwnerId('acc-456');

      expect(service.getWorkspaceCount()).toBe(2);
    });

    it('should clear cache', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      await service.loadWorkspacesByOwnerId('acc-456');
      service.selectWorkspace('ws-123');

      service.clear();

      expect(service.getWorkspacesSnapshot()).toHaveLength(0);
      expect(service.getSelectedWorkspaceIdSnapshot()).toBeNull();
    });
  });
});

// END OF FILE
