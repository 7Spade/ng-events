/**
 * Workspace Command Service Tests - Part 2
 * 
 * Continuation of workspace-command.service-part-01.spec.ts
 * 
 * Test Coverage:
 * - markWorkspaceReady (3 tests)
 * - Error handling (5 tests)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkspaceCommandService } from './workspace-command.service';
import { WorkspaceRepository } from '@ng-events/account-domain/workspace/repositories/WorkspaceRepository';
import { Workspace } from '@ng-events/account-domain/workspace/aggregates/Workspace';

describe('WorkspaceCommandService - Part 2', () => {
  let service: WorkspaceCommandService;
  let mockRepository: jest.Mocked<WorkspaceRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn(),
      exists: jest.fn(),
      findByAccountId: jest.fn(),
      findReadyWorkspaces: jest.fn(),
      findByStatus: jest.fn(),
      findByAccountIdAndStatus: jest.fn()
    } as any;

    service = new WorkspaceCommandService(mockRepository);
  });

  describe('markWorkspaceReady()', () => {
    it('should mark workspace as ready', async () => {
      const workspaceId = 'ws-123';
      const mockWorkspace = Workspace.create('acc-456', 'initializing');
      mockRepository.load = jest.fn().mockResolvedValue(mockWorkspace);

      await service.markWorkspaceReady(workspaceId);

      expect(mockRepository.load).toHaveBeenCalledWith(workspaceId);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when workspace not found', async () => {
      mockRepository.load = jest.fn().mockResolvedValue(null);

      await expect(service.markWorkspaceReady('ws-nonexistent')).rejects.toThrow('Workspace not found');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty workspace ID', async () => {
      await expect(service.markWorkspaceReady('')).rejects.toThrow('Workspace ID is required');
      expect(mockRepository.load).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should log and re-throw errors from createWorkspace', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRepository.save = jest.fn().mockRejectedValue(new Error('Save failed'));

      await expect(service.createWorkspace('acc-456', 'ready')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating workspace:',
        expect.objectContaining({ accountId: 'acc-456', status: 'ready' })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and re-throw errors from archiveWorkspace', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRepository.load = jest.fn().mockRejectedValue(new Error('Load failed'));

      await expect(service.archiveWorkspace('ws-123')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error archiving workspace:',
        expect.objectContaining({ workspaceId: 'ws-123' })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and re-throw errors from markWorkspaceReady', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRepository.load = jest.fn().mockRejectedValue(new Error('Load failed'));

      await expect(service.markWorkspaceReady('ws-123')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error marking workspace ready:',
        expect.objectContaining({ workspaceId: 'ws-123' })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle repository save errors', async () => {
      const mockWorkspace = Workspace.create('acc-456', 'ready');
      mockRepository.load = jest.fn().mockResolvedValue(mockWorkspace);
      mockRepository.save = jest.fn().mockRejectedValue(new Error('Firestore error'));

      await expect(service.archiveWorkspace('ws-123')).rejects.toThrow('Firestore error');
    });

    it('should handle repository load errors', async () => {
      mockRepository.load = jest.fn().mockRejectedValue(new Error('Connection timeout'));

      await expect(service.archiveWorkspace('ws-123')).rejects.toThrow('Connection timeout');
    });
  });
});

// END OF FILE
