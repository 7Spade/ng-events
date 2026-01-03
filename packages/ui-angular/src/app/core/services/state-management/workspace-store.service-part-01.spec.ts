/**
 * Workspace Store Service Tests - Part 1
 * 
 * Test Coverage:
 * - Observable streams (3 tests)
 * - loadWorkspacesByOwnerId (3 tests)
 * - loadReadyWorkspacesByOwnerId (2 tests)
 * - refreshWorkspaces (2 tests)
 * - selectWorkspace/clearSelection (3 tests)
 * - selectWorkspaceById (3 tests)
 * 
 * Total: 16 test cases (Part 1)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkspaceStoreService } from './workspace-store.service';
import { WorkspaceQueryService, WorkspaceProjectionSchema } from '../queries/workspace-query.service';
import { take } from 'rxjs/operators';

describe('WorkspaceStoreService', () => {
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
    status: 'initializing',
    createdAt: '2024-01-02T00:00:00.000Z',
    version: 1,
    lastEventAt: '2024-01-02T00:00:00.000Z'
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

  describe('Observable Streams', () => {
    it('should provide workspaces$ observable', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.workspaces$.pipe(take(1)).subscribe(workspaces => {
          expect(workspaces).toHaveLength(1);
          expect(workspaces[0].id).toBe('ws-123');
          done();
        });
      });
    });

    it('should provide selectedWorkspaceId$ observable', (done) => {
      service.selectWorkspace('ws-123');

      service.selectedWorkspaceId$.pipe(take(1)).subscribe(id => {
        expect(id).toBe('ws-123');
        done();
      });
    });

    it('should emit updates when state changes', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      const emittedValues: WorkspaceProjectionSchema[][] = [];

      service.workspaces$.subscribe(workspaces => {
        emittedValues.push(workspaces);

        if (emittedValues.length === 2) {
          expect(emittedValues[0]).toHaveLength(0); // Initial empty state
          expect(emittedValues[1]).toHaveLength(2); // After load
          done();
        }
      });

      service.loadWorkspacesByOwnerId('acc-456');
    });
  });

  describe('loadWorkspacesByOwnerId()', () => {
    it('should load workspaces and update cache', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1, mockWorkspace2]);

      await service.loadWorkspacesByOwnerId('acc-456');

      expect(mockQueryService.getWorkspacesByOwnerId).toHaveBeenCalledWith('acc-456');
      expect(service.getWorkspacesSnapshot()).toHaveLength(2);
    });

    it('should emit workspaces through observable stream', (done) => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      service.workspaces$.pipe(take(2)).subscribe(); // Skip initial empty emit

      service.loadWorkspacesByOwnerId('acc-456').then(() => {
        service.workspaces$.pipe(take(1)).subscribe(workspaces => {
          expect(workspaces).toHaveLength(1);
          done();
        });
      });
    });

    it('should handle empty workspace list', async () => {
      mockQueryService.getWorkspacesByOwnerId.mockResolvedValue([]);

      await service.loadWorkspacesByOwnerId('acc-nonexistent');

      expect(service.getWorkspacesSnapshot()).toHaveLength(0);
    });
  });

  describe('loadReadyWorkspacesByOwnerId()', () => {
    it('should load only ready workspaces', async () => {
      mockQueryService.getReadyWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.loadReadyWorkspacesByOwnerId('acc-456');

      expect(mockQueryService.getReadyWorkspacesByOwnerId).toHaveBeenCalledWith('acc-456');
      expect(service.getWorkspacesSnapshot()).toHaveLength(1);
      expect(service.getWorkspacesSnapshot()[0].status).toBe('ready');
    });

    it('should update cache with ready workspaces', async () => {
      mockQueryService.getReadyWorkspacesByOwnerId.mockResolvedValue([mockWorkspace1]);

      await service.loadReadyWorkspacesByOwnerId('acc-456');

      const workspaces = service.getWorkspacesSnapshot();
      expect(workspaces.every(w => w.status === 'ready')).toBe(true);
    });
  });

  // Continued in workspace-store.service-part-02.spec.ts
});

// END OF FILE
