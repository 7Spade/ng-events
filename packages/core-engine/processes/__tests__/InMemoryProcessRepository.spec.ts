/**
 * In-Memory Process Repository Tests
 *
 * Tests persistence, queries, and state management.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { InMemoryProcessRepository } from '../InMemoryProcessRepository';
import { ProcessState } from '../ProcessState';
import { ProcessSnapshot } from '../IProcessRepository';

describe('InMemoryProcessRepository', () => {
  let repository: InMemoryProcessRepository;

  beforeEach(() => {
    repository = new InMemoryProcessRepository();
  });

  describe('save and load', () => {
    it('should save and load process snapshot', async () => {
      const snapshot: ProcessSnapshot = {
        processId: 'process-1',
        processType: 'CreateAccountProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: { step: 'createAccount' },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        retryCount: 0,
      };

      await repository.save(snapshot);
      const loaded = await repository.load('process-1');

      expect(loaded).toBeDefined();
      expect(loaded?.processId).toBe('process-1');
      expect(loaded?.processType).toBe('CreateAccountProcess');
      expect(loaded?.state).toBe(ProcessState.Running);
      expect(loaded?.correlationId).toBe('corr-1');
      expect(loaded?.retryCount).toBe(0);
    });

    it('should return null for non-existent process', async () => {
      const loaded = await repository.load('non-existent');
      expect(loaded).toBeNull();
    });

    it('should update existing process on save', async () => {
      const snapshot: ProcessSnapshot = {
        processId: 'process-1',
        processType: 'CreateAccountProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: { step: 'createAccount' },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        retryCount: 0,
      };

      await repository.save(snapshot);

      // Update state
      snapshot.state = ProcessState.Completed;
      snapshot.retryCount = 1;
      await repository.save(snapshot);

      const loaded = await repository.load('process-1');
      expect(loaded?.state).toBe(ProcessState.Completed);
      expect(loaded?.retryCount).toBe(1);
    });

    it('should return defensive copy on load', async () => {
      const snapshot: ProcessSnapshot = {
        processId: 'process-1',
        processType: 'CreateAccountProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: { step: 'createAccount' },
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
      };

      await repository.save(snapshot);
      const loaded1 = await repository.load('process-1');
      const loaded2 = await repository.load('process-1');

      // Different objects
      expect(loaded1).not.toBe(loaded2);
      expect(loaded1).toEqual(loaded2);
    });
  });

  describe('delete', () => {
    it('should delete process snapshot', async () => {
      const snapshot: ProcessSnapshot = {
        processId: 'process-1',
        processType: 'CreateAccountProcess',
        state: ProcessState.Completed,
        correlationId: 'corr-1',
        processState: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
      };

      await repository.save(snapshot);
      expect(await repository.load('process-1')).toBeDefined();

      await repository.delete('process-1');
      expect(await repository.load('process-1')).toBeNull();
    });

    it('should handle deleting non-existent process gracefully', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('findByState', () => {
    beforeEach(async () => {
      // Create test data
      await repository.save(createSnapshot('p1', ProcessState.Running));
      await repository.save(createSnapshot('p2', ProcessState.Running));
      await repository.save(createSnapshot('p3', ProcessState.Completed));
      await repository.save(createSnapshot('p4', ProcessState.Failed));
    });

    it('should find processes by state', async () => {
      const running = await repository.findByState(ProcessState.Running);
      expect(running.length).toBe(2);
      expect(running.map((s) => s.processId).sort()).toEqual(['p1', 'p2']);

      const completed = await repository.findByState(ProcessState.Completed);
      expect(completed.length).toBe(1);
      expect(completed[0].processId).toBe('p3');
    });

    it('should return empty array for state with no matches', async () => {
      const compensating = await repository.findByState(ProcessState.Compensating);
      expect(compensating).toEqual([]);
    });
  });

  describe('findByCorrelationId', () => {
    beforeEach(async () => {
      await repository.save(createSnapshot('p1', ProcessState.Running, 'corr-1'));
      await repository.save(createSnapshot('p2', ProcessState.Running, 'corr-1'));
      await repository.save(createSnapshot('p3', ProcessState.Completed, 'corr-2'));
    });

    it('should find processes by correlation ID', async () => {
      const corr1Processes = await repository.findByCorrelationId('corr-1');
      expect(corr1Processes.length).toBe(2);
      expect(corr1Processes.map((s) => s.processId).sort()).toEqual(['p1', 'p2']);

      const corr2Processes = await repository.findByCorrelationId('corr-2');
      expect(corr2Processes.length).toBe(1);
      expect(corr2Processes[0].processId).toBe('p3');
    });

    it('should return empty array for unknown correlation ID', async () => {
      const processes = await repository.findByCorrelationId('unknown');
      expect(processes).toEqual([]);
    });
  });

  describe('findStale', () => {
    it('should find stale processes based on timeout', async () => {
      const now = Date.now();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
      const oneMinuteAgo = new Date(now - 1 * 60 * 1000);

      // Stale process (no events for 5 minutes)
      await repository.save({
        ...createSnapshot('p1', ProcessState.Running),
        lastEventAt: fiveMinutesAgo,
      });

      // Recent process (event 1 minute ago)
      await repository.save({
        ...createSnapshot('p2', ProcessState.Running),
        lastEventAt: oneMinuteAgo,
      });

      // Completed process (should be excluded even if old)
      await repository.save({
        ...createSnapshot('p3', ProcessState.Completed),
        lastEventAt: fiveMinutesAgo,
      });

      // Find processes with 2 minute timeout
      const stale = await repository.findStale(2 * 60 * 1000);

      expect(stale.length).toBe(1);
      expect(stale[0].processId).toBe('p1');
    });

    it('should use createdAt if lastEventAt is missing', async () => {
      const now = Date.now();
      const tenMinutesAgo = new Date(now - 10 * 60 * 1000);

      await repository.save({
        processId: 'p1',
        processType: 'TestProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: {},
        createdAt: tenMinutesAgo,
        updatedAt: new Date(),
        retryCount: 0,
        // No lastEventAt
      });

      const stale = await repository.findStale(5 * 60 * 1000);
      expect(stale.length).toBe(1);
      expect(stale[0].processId).toBe('p1');
    });

    it('should exclude terminal states from stale search', async () => {
      const now = Date.now();
      const tenMinutesAgo = new Date(now - 10 * 60 * 1000);

      await repository.save({
        ...createSnapshot('p1', ProcessState.Completed),
        lastEventAt: tenMinutesAgo,
      });
      await repository.save({
        ...createSnapshot('p2', ProcessState.Failed),
        lastEventAt: tenMinutesAgo,
      });
      await repository.save({
        ...createSnapshot('p3', ProcessState.Compensated),
        lastEventAt: tenMinutesAgo,
      });

      const stale = await repository.findStale(5 * 60 * 1000);
      expect(stale).toEqual([]);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await repository.save(createSnapshot('p1', ProcessState.Running));
      await repository.save(createSnapshot('p2', ProcessState.Running));
      await repository.save(createSnapshot('p3', ProcessState.Completed));
    });

    it('should count all processes when state not specified', async () => {
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should count processes by state', async () => {
      const runningCount = await repository.count(ProcessState.Running);
      expect(runningCount).toBe(2);

      const completedCount = await repository.count(ProcessState.Completed);
      expect(completedCount).toBe(1);

      const failedCount = await repository.count(ProcessState.Failed);
      expect(failedCount).toBe(0);
    });
  });

  describe('testing utilities', () => {
    it('should clear all processes', async () => {
      await repository.save(createSnapshot('p1', ProcessState.Running));
      await repository.save(createSnapshot('p2', ProcessState.Completed));

      expect(await repository.count()).toBe(2);

      repository.clear();

      expect(await repository.count()).toBe(0);
      expect(await repository.load('p1')).toBeNull();
    });

    it('should get all processes', async () => {
      await repository.save(createSnapshot('p1', ProcessState.Running));
      await repository.save(createSnapshot('p2', ProcessState.Completed));

      const all = repository.getAll();
      expect(all.length).toBe(2);
      expect(all.map((s) => s.processId).sort()).toEqual(['p1', 'p2']);
    });
  });
});

// Helper function
function createSnapshot(
  processId: string,
  state: ProcessState,
  correlationId: string = 'default-corr'
): ProcessSnapshot {
  return {
    processId,
    processType: 'TestProcess',
    state,
    correlationId,
    processState: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    retryCount: 0,
  };
}

// END OF FILE
