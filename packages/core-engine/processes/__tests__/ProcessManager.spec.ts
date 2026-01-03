/**
 * Process Manager Tests
 *
 * Tests process lifecycle orchestration, event routing, and persistence integration.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { ProcessManager } from '../ProcessManager';
import { InMemoryProcessRepository } from '../InMemoryProcessRepository';
import { RetryPolicy } from '../RetryPolicy';
import { ProcessBase } from '../ProcessBase';
import { ProcessState } from '../ProcessState';
import { DomainEvent } from '../../event-store';
import { ProcessSnapshot } from '../IProcessRepository';
import { ProcessCommand, ProcessCommandFactory } from '../ProcessCommand';
import { CausalityMetadataFactory } from '../../causality';

// Mock Process for testing
class TestProcess extends ProcessBase<{ step: string }> {
  protected async handleEvent(event: DomainEvent): Promise<void> {
    // Emit a test command
    const cmd = ProcessCommandFactory.create({
      id: 'cmd-1',
      commandType: 'TestCommand',
      data: { test: true },
      metadata: event.metadata,
    });
    this.emitCommand(cmd);

    // Update state
    (this as any).processState = { step: 'handled' };
  }
}

describe('ProcessManager', () => {
  let manager: ProcessManager;
  let repository: InMemoryProcessRepository;
  let retryPolicy: RetryPolicy;

  beforeEach(() => {
    repository = new InMemoryProcessRepository();
    retryPolicy = new RetryPolicy();
    manager = new ProcessManager(repository, retryPolicy);

    // Register factory
    manager.registerFactory('TestProcess', (snapshot: ProcessSnapshot) => {
      return new TestProcess(
        snapshot.processId,
        snapshot.correlationId,
        snapshot.processState as { step: string }
      );
    });
  });

  describe('startProcess', () => {
    it('should start and persist new process', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });

      await manager.startProcess(process, 'TestProcess');

      expect(process.getState()).toBe(ProcessState.Running);

      // Verify persistence
      const snapshot = await repository.load('proc-1');
      expect(snapshot).toBeDefined();
      expect(snapshot?.state).toBe(ProcessState.Running);
    });

    it('should throw if process already exists', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });

      await manager.startProcess(process, 'TestProcess');

      await expect(manager.startProcess(process, 'TestProcess')).rejects.toThrow(
        'Process proc-1 already exists'
      );
    });
  });

  describe('routeEvent', () => {
    it('should route event to processes with matching correlationId', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });
      await manager.startProcess(process, 'TestProcess');

      const event: DomainEvent = {
        id: 'evt-1',
        aggregateId: 'agg-1',
        aggregateType: 'Test',
        eventType: 'TestEvent',
        data: {},
        metadata: CausalityMetadataFactory.create({
          causedBy: 'system',
          causedByUser: 'user-1',
          causedByAction: 'test',
          blueprintId: 'bp-1',
          correlationId: 'corr-1',
        }),
      };

      const commands = await manager.routeEvent(event);

      expect(commands.length).toBe(1);
      expect(commands[0].commandType).toBe('TestCommand');

      // Verify state update persisted
      const snapshot = await repository.load('proc-1');
      expect(snapshot?.lastEventAt).toBeDefined();
    });

    it('should skip terminal state processes', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });
      await manager.startProcess(process, 'TestProcess');
      process.complete();
      await repository.save({
        processId: 'proc-1',
        processType: 'TestProcess',
        state: ProcessState.Completed,
        correlationId: 'corr-1',
        processState: { step: 'done' },
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
      });

      const event: DomainEvent = {
        id: 'evt-1',
        aggregateId: 'agg-1',
        aggregateType: 'Test',
        eventType: 'TestEvent',
        data: {},
        metadata: CausalityMetadataFactory.create({
          causedBy: 'system',
          causedByUser: 'user-1',
          causedByAction: 'test',
          blueprintId: 'bp-1',
          correlationId: 'corr-1',
        }),
      };

      const commands = await manager.routeEvent(event);
      expect(commands.length).toBe(0);
    });
  });

  describe('completeProcess', () => {
    it('should complete process and persist', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });
      await manager.startProcess(process, 'TestProcess');

      await manager.completeProcess('proc-1');

      const snapshot = await repository.load('proc-1');
      expect(snapshot?.state).toBe(ProcessState.Completed);
    });

    it('should throw for non-existent process', async () => {
      await expect(manager.completeProcess('non-existent')).rejects.toThrow(
        'Process non-existent not found'
      );
    });
  });

  describe('failProcess', () => {
    it('should fail process with reason', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { step: 'init' });
      await manager.startProcess(process, 'TestProcess');

      await manager.failProcess('proc-1', 'Test failure');

      const snapshot = await repository.load('proc-1');
      expect(snapshot?.state).toBe(ProcessState.Failed);
      expect(snapshot?.failureReason).toBe('Test failure');
    });
  });

  describe('query methods', () => {
    beforeEach(async () => {
      await repository.save({
        processId: 'p1',
        processType: 'TestProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
      });
      await repository.save({
        processId: 'p2',
        processType: 'TestProcess',
        state: ProcessState.Completed,
        correlationId: 'corr-2',
        processState: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
      });
    });

    it('should query by state', async () => {
      const running = await manager.queryByState(ProcessState.Running);
      expect(running.length).toBe(1);
      expect(running[0].processId).toBe('p1');
    });

    it('should query by correlation ID', async () => {
      const processes = await manager.queryByCorrelationId('corr-1');
      expect(processes.length).toBe(1);
      expect(processes[0].processId).toBe('p1');
    });

    it('should get count', async () => {
      const totalCount = await manager.getCount();
      expect(totalCount).toBe(2);

      const runningCount = await manager.getCount(ProcessState.Running);
      expect(runningCount).toBe(1);
    });
  });
});

// END OF FILE
