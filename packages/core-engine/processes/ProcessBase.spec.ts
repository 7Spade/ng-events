/**
 * ProcessBase Tests
 *
 * Test suite for Process Manager base class.
 * Validates lifecycle, state transitions, and command emission.
 *
 * 🔒 SKELETON ONLY - Phase 2A foundation
 */

import { ProcessBase } from './ProcessBase';
import { ProcessState } from './ProcessState';
import { ProcessCommand } from './ProcessCommand';
import { DomainEvent } from '../event-store';

/**
 * Concrete test process for testing ProcessBase
 */
class TestProcess extends ProcessBase<{ counter: number }> {
  protected async handleEvent(event: DomainEvent): Promise<void> {
    // Increment counter on event
    this.processState.counter += 1;

    // Emit test command
    if (event.eventType === 'TestEvent') {
      this.emitCommand({
        id: 'cmd-1',
        commandType: 'TestCommand',
        data: { value: this.processState.counter },
        metadata: event.metadata,
      });
    }
  }
}

describe('ProcessBase', () => {
  describe('Lifecycle Management', () => {
    it('should initialize with Pending state', () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });

      expect(process.getState()).toBe(ProcessState.Pending);
      expect(process.getProcessId()).toBe('proc-1');
      expect(process.getCorrelationId()).toBe('corr-1');
    });

    it('should transition from Pending to Running on start()', () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });

      process.start();

      expect(process.getState()).toBe(ProcessState.Running);
    });

    it('should throw error if start() called twice', () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();

      expect(() => process.start()).toThrow(/cannot start/);
    });

    it('should transition from Running to Completed on complete()', () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();

      process.complete();

      expect(process.getState()).toBe(ProcessState.Completed);
    });

    it('should transition from Running to Failed on fail()', () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();

      process.fail('test failure');

      expect(process.getState()).toBe(ProcessState.Failed);
    });
  });

  describe('Event Handling and Command Emission', () => {
    it('should handle events and emit commands via react()', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();

      const testEvent: DomainEvent = {
        id: 'evt-1',
        aggregateId: 'agg-1',
        aggregateType: 'Test',
        eventType: 'TestEvent',
        data: {},
        metadata: {
          causedBy: 'system',
          causedByUser: 'test-user',
          causedByAction: 'test.action',
          timestamp: new Date().toISOString(),
          blueprintId: 'bp-1',
        },
      };

      const commands = await process.react(testEvent);

      expect(commands).toHaveLength(1);
      expect(commands[0].commandType).toBe('TestCommand');
      expect(commands[0].data).toEqual({ value: 1 });
    });

    it('should throw error if react() called in terminal state', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();
      process.complete();

      const testEvent: DomainEvent = {
        id: 'evt-1',
        aggregateId: 'agg-1',
        aggregateType: 'Test',
        eventType: 'TestEvent',
        data: {},
        metadata: {
          causedBy: 'system',
          causedByUser: 'test-user',
          causedByAction: 'test.action',
          timestamp: new Date().toISOString(),
          blueprintId: 'bp-1',
        },
      };

      await expect(process.react(testEvent)).rejects.toThrow(/terminal state/);
    });
  });

  describe('Compensation Logic', () => {
    it('should transition from Running to Compensating on compensate()', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();

      await process.compensate();

      expect(process.getState()).toBe(ProcessState.Compensated);
    });

    it('should throw error if compensate() called in Completed state', async () => {
      const process = new TestProcess('proc-1', 'corr-1', { counter: 0 });
      process.start();
      process.complete();

      await expect(process.compensate()).rejects.toThrow(/cannot compensate/);
    });
  });
});

// END OF FILE
