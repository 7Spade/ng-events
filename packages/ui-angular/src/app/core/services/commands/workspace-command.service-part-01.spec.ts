/**
 * Workspace Command Service Tests - Part 1
 * 
 * Test Coverage:
 * - createWorkspace (5 tests)
 * - archiveWorkspace (5 tests)
 * - markWorkspaceReady (3 tests)
 * - Error handling (5 tests)
 * 
 * Total: 18 test cases
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkspaceCommandService } from './workspace-command.service';
import { WorkspaceRepository } from '@ng-events/account-domain/workspace/repositories/WorkspaceRepository';
import { Workspace } from '@ng-events/account-domain/workspace/aggregates/Workspace';

describe('WorkspaceCommandService', () => {
  let service: WorkspaceCommandService;
  let mockRepository: jest.Mocked<WorkspaceRepository>;

  beforeEach(() => {
    // Mock WorkspaceRepository
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

  describe('createWorkspace()', () => {
    it('should create workspace with valid inputs', async () => {
      const accountId = 'acc-456';
      const status = 'ready' as const;

      const workspaceId = await service.createWorkspace(accountId, status);

      expect(workspaceId).toBeDefined();
      expect(typeof workspaceId).toBe('string');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should call repository.save with created aggregate', async () => {
      const accountId = 'acc-456';
      const status = 'initializing' as const;

      await service.createWorkspace(accountId, status);

      expect(mockRepository.save).toHaveBeenCalled();
      const savedAggregate = (mockRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAggregate).toBeInstanceOf(Workspace);
    });

    it('should return valid workspace ID', async () => {
      const accountId = 'acc-456';
      const status = 'ready' as const;

      const workspaceId = await service.createWorkspace(accountId, status);

      // Workspace ID should be UUID format
      expect(workspaceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should throw error for empty account ID', async () => {
      await expect(service.createWorkspace('', 'ready')).rejects.toThrow('Account ID is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for missing status', async () => {
      await expect(service.createWorkspace('acc-456', null as any)).rejects.toThrow('Status is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('archiveWorkspace()', () => {
    it('should archive existing workspace', async () => {
      const workspaceId = 'ws-123';
      const mockWorkspace = Workspace.create('acc-456', 'ready');
      mockRepository.load = jest.fn().mockResolvedValue(mockWorkspace);

      await service.archiveWorkspace(workspaceId);

      expect(mockRepository.load).toHaveBeenCalledWith(workspaceId);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should call workspace.archive() method', async () => {
      const workspaceId = 'ws-123';
      const mockWorkspace = Workspace.create('acc-456', 'ready');
      const archiveSpy = jest.spyOn(mockWorkspace, 'archive');
      mockRepository.load = jest.fn().mockResolvedValue(mockWorkspace);

      await service.archiveWorkspace(workspaceId);

      expect(archiveSpy).toHaveBeenCalled();
    });

    it('should throw error when workspace not found', async () => {
      mockRepository.load = jest.fn().mockResolvedValue(null);

      await expect(service.archiveWorkspace('ws-nonexistent')).rejects.toThrow('Workspace not found');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty workspace ID', async () => {
      await expect(service.archiveWorkspace('')).rejects.toThrow('Workspace ID is required');
      expect(mockRepository.load).not.toHaveBeenCalled();
    });

    it('should save workspace after archiving', async () => {
      const workspaceId = 'ws-123';
      const mockWorkspace = Workspace.create('acc-456', 'ready');
      mockRepository.load = jest.fn().mockResolvedValue(mockWorkspace);

      await service.archiveWorkspace(workspaceId);

      const savedAggregate = (mockRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAggregate).toBeInstanceOf(Workspace);
    });
  });

  // Continued in workspace-command.service-part-02.spec.ts
});

// END OF FILE
