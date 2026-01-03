/**
 * Timeout Monitor Tests
 *
 * Tests timeout detection, auto-fail, and auto-compensate functionality.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { TimeoutMonitor } from '../TimeoutMonitor';
import { ProcessManager } from '../ProcessManager';
import { InMemoryProcessRepository } from '../InMemoryProcessRepository';
import { ProcessState } from '../ProcessState';
import { ProcessSnapshot } from '../IProcessRepository';

describe('TimeoutMonitor', () => {
  let monitor: TimeoutMonitor;
  let repository: InMemoryProcessRepository;
  let processManager: ProcessManager;

  beforeEach(() => {
    repository = new InMemoryProcessRepository();
    processManager = new ProcessManager(repository);
    monitor = new TimeoutMonitor(repository, processManager, {
      timeoutMs: 5000, // 5 seconds for testing
      checkIntervalMs: 1000, // 1 second check interval
      autoFail: true,
      autoCompensate: false,
    });
  });

  afterEach(() => {
    monitor.stop();
  });

  describe('checkTimeouts', () => {
    it('should detect stale processes', async () => {
      const now = Date.now();
      const tenSecondsAgo = new Date(now - 10000);

      // Create stale process
      await repository.save({
        processId: 'stale-1',
        processType: 'TestProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: {},
        createdAt: tenSecondsAgo,
        updatedAt: new Date(),
        lastEventAt: tenSecondsAgo,
        retryCount: 0,
      });

      const staleProcesses = await monitor.checkTimeouts();
      expect(staleProcesses.length).toBe(1);
      expect(staleProcesses[0].processId).toBe('stale-1');
    });

    it('should auto-fail stale processes when configured', async () => {
      const now = Date.now();
      const tenSecondsAgo = new Date(now - 10000);

      await repository.save({
        processId: 'stale-1',
        processType: 'TestProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: {},
        createdAt: tenSecondsAgo,
        updatedAt: new Date(),
        lastEventAt: tenSecondsAgo,
        retryCount: 0,
      });

      await monitor.checkTimeouts();

      const snapshot = await repository.load('stale-1');
      expect(snapshot?.state).toBe(ProcessState.Failed);
      expect(snapshot?.failureReason).toContain('Process timeout');
    });

    it('should not fail recent processes', async () => {
      const now = Date.now();
      const oneSecondAgo = new Date(now - 1000);

      await repository.save({
        processId: 'recent-1',
        processType: 'TestProcess',
        state: ProcessState.Running,
        correlationId: 'corr-1',
        processState: {},
        createdAt: oneSecondAgo,
        updatedAt: new Date(),
        lastEventAt: oneSecondAgo,
        retryCount: 0,
      });

      const staleProcesses = await monitor.checkTimeouts();
      expect(staleProcesses.length).toBe(0);

      const snapshot = await repository.load('recent-1');
      expect(snapshot?.state).toBe(ProcessState.Running);
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const defaultMonitor = new TimeoutMonitor(repository, processManager);
      const config = defaultMonitor.getConfig();

      expect(config.timeoutMs).toBe(300000); // 5 minutes
      expect(config.checkIntervalMs).toBe(60000); // 1 minute
      expect(config.autoFail).toBe(true);
      expect(config.autoCompensate).toBe(false);
    });

    it('should accept custom configuration', () => {
      const customMonitor = new TimeoutMonitor(repository, processManager, {
        timeoutMs: 10000,
        checkIntervalMs: 2000,
        autoFail: false,
        autoCompensate: true,
      });

      const config = customMonitor.getConfig();
      expect(config.timeoutMs).toBe(10000);
      expect(config.checkIntervalMs).toBe(2000);
      expect(config.autoFail).toBe(false);
      expect(config.autoCompensate).toBe(true);
    });

    it('should allow runtime configuration', () => {
      monitor.configure({
        timeoutMs: 15000,
        autoFail: false,
      });

      const config = monitor.getConfig();
      expect(config.timeoutMs).toBe(15000);
      expect(config.autoFail).toBe(false);
      // Other values unchanged
      expect(config.checkIntervalMs).toBe(1000);
    });
  });

  describe('start and stop', () => {
    it('should start monitoring', () => {
      expect(monitor.isMonitoring()).toBe(false);

      monitor.start();

      expect(monitor.isMonitoring()).toBe(true);
    });

    it('should stop monitoring', () => {
      monitor.start();
      expect(monitor.isMonitoring()).toBe(true);

      monitor.stop();

      expect(monitor.isMonitoring()).toBe(false);
    });

    it('should not start if already running', () => {
      monitor.start();
      const firstStart = monitor.isMonitoring();

      monitor.start(); // Second start should be no-op

      expect(monitor.isMonitoring()).toBe(firstStart);
    });

    it('should not stop if not running', () => {
      expect(monitor.isMonitoring()).toBe(false);

      monitor.stop(); // Should not throw

      expect(monitor.isMonitoring()).toBe(false);
    });
  });
});

// END OF FILE
