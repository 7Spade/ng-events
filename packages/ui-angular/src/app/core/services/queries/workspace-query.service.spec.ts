/**
 * Workspace Query Service Tests
 * 
 * Test Coverage:
 * - getWorkspaceById (3 tests)
 * - getWorkspacesByOwnerId (3 tests)
 * - getWorkspacesByStatus (3 tests)
 * - getWorkspacesByOwnerIdAndStatus (3 tests)
 * - getReadyWorkspacesByOwnerId (2 tests)
 * - getWorkspaceCountByOwnerId (2 tests)
 * - workspaceExists (2 tests)
 * - Error handling (3 tests)
 * 
 * Total: 21 test cases
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkspaceQueryService, WorkspaceProjectionSchema } from './workspace-query.service';
import { Firestore, collection, doc, getDoc, query, where, getDocs, getCountFromServer } from '@angular/fire/firestore';

describe('WorkspaceQueryService', () => {
  let service: WorkspaceQueryService;
  let mockFirestore: jest.Mocked<Firestore>;

  const mockWorkspaceProjection: WorkspaceProjectionSchema = {
    id: 'ws-123',
    ownerId: 'acc-456',
    status: 'ready',
    createdAt: '2024-01-01T00:00:00.000Z',
    version: 1,
    lastEventAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    // Mock Firestore
    mockFirestore = {
      // Add minimal Firestore mocks needed
    } as any;

    service = new WorkspaceQueryService(mockFirestore);
  });

  describe('getWorkspaceById()', () => {
    it('should get workspace by id when found', async () => {
      // Mock getDoc to return existing document
      const mockDocSnap = {
        exists: () => true,
        data: () => mockWorkspaceProjection
      };
      (getDoc as jest.Mock) = jest.fn().mockResolvedValue(mockDocSnap);

      const result = await service.getWorkspaceById('ws-123');

      expect(result).toEqual(mockWorkspaceProjection);
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return null when workspace not found', async () => {
      // Mock getDoc to return non-existing document
      const mockDocSnap = {
        exists: () => false
      };
      (getDoc as jest.Mock) = jest.fn().mockResolvedValue(mockDocSnap);

      const result = await service.getWorkspaceById('ws-nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error on Firestore failure', async () => {
      // Mock getDoc to throw error
      (getDoc as jest.Mock) = jest.fn().mockRejectedValue(new Error('Firestore error'));

      await expect(service.getWorkspaceById('ws-123')).rejects.toThrow('Firestore error');
    });
  });

  describe('getWorkspacesByOwnerId()', () => {
    it('should return workspaces for owner', async () => {
      // Mock getDocs to return workspace documents
      const mockDocs = [
        { data: () => mockWorkspaceProjection },
        { data: () => ({ ...mockWorkspaceProjection, id: 'ws-456' }) }
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getWorkspacesByOwnerId('acc-456');

      expect(result).toHaveLength(2);
      expect(result[0].ownerId).toBe('acc-456');
    });

    it('should return empty array when no workspaces found', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getWorkspacesByOwnerId('acc-nonexistent');

      expect(result).toEqual([]);
    });

    it('should apply ownerId filter in query', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      await service.getWorkspacesByOwnerId('acc-456');

      // Verify query with where clause was called
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('ownerId', '==', 'acc-456');
    });
  });

  describe('getWorkspacesByStatus()', () => {
    it('should get workspaces by status', async () => {
      const mockDocs = [
        { data: () => mockWorkspaceProjection },
        { data: () => ({ ...mockWorkspaceProjection, id: 'ws-789', status: 'ready' }) }
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getWorkspacesByStatus('ready');

      expect(result).toHaveLength(2);
      expect(result.every(w => w.status === 'ready')).toBe(true);
    });

    it('should apply status filter in query', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      await service.getWorkspacesByStatus('archived');

      expect(where).toHaveBeenCalledWith('status', '==', 'archived');
    });

    it('should handle all status types', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const statuses: Array<WorkspaceProjectionSchema['status']> = [
        'initializing', 'ready', 'restricted', 'archived'
      ];

      for (const status of statuses) {
        await service.getWorkspacesByStatus(status);
        expect(where).toHaveBeenCalledWith('status', '==', status);
      }
    });
  });

  describe('getWorkspacesByOwnerIdAndStatus()', () => {
    it('should apply both ownerId and status filters', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      await service.getWorkspacesByOwnerIdAndStatus('acc-456', 'ready');

      expect(where).toHaveBeenCalledWith('ownerId', '==', 'acc-456');
      expect(where).toHaveBeenCalledWith('status', '==', 'ready');
    });

    it('should return filtered workspaces', async () => {
      const mockDocs = [
        { data: () => mockWorkspaceProjection }
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getWorkspacesByOwnerIdAndStatus('acc-456', 'ready');

      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe('acc-456');
      expect(result[0].status).toBe('ready');
    });

    it('should return empty array when no matches', async () => {
      const mockQuerySnapshot = { docs: [] };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getWorkspacesByOwnerIdAndStatus('acc-nonexistent', 'archived');

      expect(result).toEqual([]);
    });
  });

  describe('getReadyWorkspacesByOwnerId()', () => {
    it('should delegate to getWorkspacesByOwnerIdAndStatus with ready status', async () => {
      const mockDocs = [{ data: () => mockWorkspaceProjection }];
      const mockQuerySnapshot = { docs: mockDocs };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getReadyWorkspacesByOwnerId('acc-456');

      expect(result).toHaveLength(1);
      expect(where).toHaveBeenCalledWith('status', '==', 'ready');
    });

    it('should return only ready workspaces', async () => {
      const mockDocs = [
        { data: () => mockWorkspaceProjection },
        { data: () => ({ ...mockWorkspaceProjection, id: 'ws-789' }) }
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      (getDocs as jest.Mock) = jest.fn().mockResolvedValue(mockQuerySnapshot);

      const result = await service.getReadyWorkspacesByOwnerId('acc-456');

      expect(result.every(w => w.status === 'ready')).toBe(true);
    });
  });

  describe('getWorkspaceCountByOwnerId()', () => {
    it('should return workspace count for owner', async () => {
      const mockSnapshot = {
        data: () => ({ count: 5 })
      };
      (getCountFromServer as jest.Mock) = jest.fn().mockResolvedValue(mockSnapshot);

      const count = await service.getWorkspaceCountByOwnerId('acc-456');

      expect(count).toBe(5);
      expect(where).toHaveBeenCalledWith('ownerId', '==', 'acc-456');
    });

    it('should return 0 when no workspaces found', async () => {
      const mockSnapshot = {
        data: () => ({ count: 0 })
      };
      (getCountFromServer as jest.Mock) = jest.fn().mockResolvedValue(mockSnapshot);

      const count = await service.getWorkspaceCountByOwnerId('acc-nonexistent');

      expect(count).toBe(0);
    });
  });

  describe('workspaceExists()', () => {
    it('should return true when workspace exists', async () => {
      const mockDocSnap = { exists: () => true };
      (getDoc as jest.Mock) = jest.fn().mockResolvedValue(mockDocSnap);

      const exists = await service.workspaceExists('ws-123');

      expect(exists).toBe(true);
    });

    it('should return false when workspace does not exist', async () => {
      const mockDocSnap = { exists: () => false };
      (getDoc as jest.Mock) = jest.fn().mockResolvedValue(mockDocSnap);

      const exists = await service.workspaceExists('ws-nonexistent');

      expect(exists).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should log and re-throw errors from getWorkspaceById', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDoc as jest.Mock) = jest.fn().mockRejectedValue(new Error('Firestore error'));

      await expect(service.getWorkspaceById('ws-123')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting workspace by ID:',
        expect.objectContaining({ workspaceId: 'ws-123' })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and re-throw errors from getWorkspacesByOwnerId', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock) = jest.fn().mockRejectedValue(new Error('Query error'));

      await expect(service.getWorkspacesByOwnerId('acc-456')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting workspaces by owner ID:',
        expect.objectContaining({ ownerId: 'acc-456' })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and re-throw errors from workspaceExists', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDoc as jest.Mock) = jest.fn().mockRejectedValue(new Error('Access denied'));

      await expect(service.workspaceExists('ws-123')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error checking workspace existence:',
        expect.objectContaining({ workspaceId: 'ws-123' })
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

// END OF FILE
