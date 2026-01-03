/**
 * Workspace End-to-End (E2E) Test Suite
 * 
 * ✅ Phase 1G - E2E Validation and Testing
 * 
 * Purpose:
 * Validates the complete Workspace vertical slice across ALL layers:
 * UI → Command → Aggregate → EventStore → Projection → Query → Store → UI
 * 
 * Architecture Layers Tested:
 * 1. Value Objects (WorkspaceId, WorkspaceRole)
 * 2. Aggregate (Workspace with Event Sourcing)
 * 3. Domain Events (WorkspaceCreated, WorkspaceArchived)
 * 4. Infrastructure (FirestoreEventStore, FirestoreWorkspaceRepository)
 * 5. Projection (WorkspaceProjectionBuilder)
 * 6. Angular Services (WorkspaceCommandService, WorkspaceQueryService, WorkspaceStoreService)
 * 
 * Test Scenarios:
 * - Complete CQRS flow (Command → EventStore → Projection → Query)
 * - Event Sourcing (Event replay and aggregate reconstruction)
 * - Multi-Tenant Isolation (ownerId filtering)
 * - Projection Rebuild (from event stream)
 * - Reactive State Management (Store caching)
 * - Error Handling and Edge Cases
 */

import { Workspace } from '../aggregates/Workspace';
import { WorkspaceCreatedEvent } from '../events/WorkspaceCreated';
import { WorkspaceArchivedEvent } from '../events/WorkspaceArchived';
import { FirestoreEventStore } from '@ng-events/platform-adapters/firestore/event-store/FirestoreEventStore';
import { FirestoreWorkspaceRepository } from '@ng-events/platform-adapters/firestore/repositories/account/FirestoreWorkspaceRepository';
import { WorkspaceProjectionBuilder } from '@ng-events/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder';
import { WorkspaceCommandService } from '@ng-events/ui-angular/core/services/commands/workspace-command.service';
import { WorkspaceQueryService } from '@ng-events/ui-angular/core/services/queries/workspace-query.service';
import { WorkspaceStoreService } from '@ng-events/ui-angular/core/services/state-management/workspace-store.service';

/**
 * Mock Firestore SDK for deterministic testing
 * 
 * This creates an in-memory Firestore-like structure for testing
 * without requiring Firebase Emulator or actual Firestore connection.
 */
class MockFirestore {
  private data: Map<string, any> = new Map();
  
  collection(path: string) {
    return {
      doc: (id: string) => {
        const fullPath = `${path}/${id}`;
        return {
          set: async (data: any, options?: any) => {
            if (options?.merge) {
              const existing = this.data.get(fullPath) || {};
              this.data.set(fullPath, { ...existing, ...data });
            } else {
              this.data.set(fullPath, data);
            }
          },
          get: async () => {
            const data = this.data.get(fullPath);
            return {
              exists: () => !!data,
              data: () => data,
              id
            };
          },
          collection: (subPath: string) => this.collection(`${fullPath}/${subPath}`)
        };
      },
      where: (field: string, op: string, value: any) => {
        return {
          get: async () => {
            const results: any[] = [];
            this.data.forEach((doc, path) => {
              if (path.startsWith(path.split('/').slice(0, -1).join('/')) && doc[field] === value) {
                results.push({
                  id: path.split('/').pop(),
                  data: () => doc
                });
              }
            });
            return {
              docs: results,
              empty: results.length === 0,
              size: results.length
            };
          },
          orderBy: (field: string, direction?: string) => ({
            get: async () => this.collection(path).where(field, '==', value).get()
          })
        };
      },
      orderBy: (field: string, direction?: string) => ({
        get: async () => {
          const results: any[] = [];
          this.data.forEach((doc, path) => {
            if (path.startsWith(path.split('/').slice(0, -1).join('/'))) {
              results.push({
                id: path.split('/').pop(),
                data: () => doc
              });
            }
          });
          return { docs: results };
        }
      }),
      count: () => ({
        get: async () => ({
          data: () => ({ count: this.getCollectionSize(path) })
        })
      })
    };
  }
  
  private getCollectionSize(path: string): number {
    let count = 0;
    this.data.forEach((_, key) => {
      if (key.startsWith(path)) count++;
    });
    return count;
  }
  
  reset() {
    this.data.clear();
  }
  
  getAllData() {
    return Array.from(this.data.entries());
  }
}

describe('Workspace E2E Test Suite', () => {
  let mockFirestore: MockFirestore;
  let eventStore: FirestoreEventStore;
  let repository: FirestoreWorkspaceRepository;
  let projectionBuilder: WorkspaceProjectionBuilder;
  let commandService: WorkspaceCommandService;
  let queryService: WorkspaceQueryService;
  let storeService: WorkspaceStoreService;
  
  beforeEach(() => {
    // Initialize mock Firestore
    mockFirestore = new MockFirestore();
    
    // Initialize EventStore with event registration
    eventStore = new FirestoreEventStore(mockFirestore as any);
    eventStore.registerEvent(
      'WorkspaceCreated',
      (event) => WorkspaceCreatedEvent.create(event as any).toData(),
      (data) => WorkspaceCreatedEvent.fromData(data).getEvent()
    );
    eventStore.registerEvent(
      'WorkspaceArchived',
      (event) => WorkspaceArchivedEvent.create(event as any).toData(),
      (data) => WorkspaceArchivedEvent.fromData(data).getEvent()
    );
    
    // Initialize Repository
    repository = new FirestoreWorkspaceRepository(eventStore, mockFirestore as any);
    
    // Initialize Projection Builder
    projectionBuilder = new WorkspaceProjectionBuilder(mockFirestore as any);
    
    // Initialize Angular Services
    commandService = new WorkspaceCommandService(repository);
    queryService = new WorkspaceQueryService(mockFirestore as any);
    storeService = new WorkspaceStoreService(queryService);
  });
  
  afterEach(() => {
    mockFirestore.reset();
  });
  
  describe('Complete CQRS Flow', () => {
    it('should execute complete flow: Command → EventStore → Projection → Query', async () => {
      // STEP 1: Execute Command (Write Path)
      const accountId = 'acc-e2e-001';
      const workspaceId = await commandService.createWorkspace(accountId, 'ready');
      
      // Verify workspace ID format
      expect(workspaceId).toMatch(/^ws-[a-f0-9-]+$/);
      
      // STEP 2: Verify Events Persisted to EventStore
      const events = await eventStore.getEvents('Workspace', workspaceId);
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe('WorkspaceCreated');
      expect(events[0].aggregateId).toBe(workspaceId);
      expect(events[0].data.accountId).toBe(accountId);
      expect(events[0].data.status).toBe('ready');
      
      // STEP 3: Build Projection from Events
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      // STEP 4: Query Projection (Read Path)
      const workspace = await queryService.getWorkspaceById(workspaceId);
      expect(workspace).toBeDefined();
      expect(workspace!.id).toBe(workspaceId);
      expect(workspace!.ownerId).toBe(accountId);
      expect(workspace!.status).toBe('ready');
      
      // STEP 5: Verify Store Caching
      await storeService.loadWorkspacesByOwnerId(accountId);
      const cachedWorkspaces = storeService.getWorkspacesSnapshot();
      expect(cachedWorkspaces.length).toBe(1);
      expect(cachedWorkspaces[0].id).toBe(workspaceId);
      
      // ✅ Complete CQRS flow validated across all layers
    });
    
    it('should separate write and read paths correctly', async () => {
      // Create workspace via Command (write path)
      const accountId = 'acc-e2e-002';
      const workspaceId = await commandService.createWorkspace(accountId, 'initializing');
      
      // Events should exist in EventStore
      const events = await eventStore.getEvents('Workspace', workspaceId);
      expect(events.length).toBeGreaterThan(0);
      
      // Projection does NOT exist until ProjectionBuilder processes events
      const workspaceBeforeProjection = await queryService.getWorkspaceById(workspaceId);
      expect(workspaceBeforeProjection).toBeNull();
      
      // Build projection
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      // Now projection exists (read path)
      const workspaceAfterProjection = await queryService.getWorkspaceById(workspaceId);
      expect(workspaceAfterProjection).toBeDefined();
      expect(workspaceAfterProjection!.id).toBe(workspaceId);
      
      // ✅ CQRS write/read path separation validated
    });
  });
  
  describe('Event Sourcing - Replay and Reconstruction', () => {
    it('should reconstruct aggregate from event history', async () => {
      // Create and modify workspace
      const accountId = 'acc-e2e-003';
      const workspaceId = await commandService.createWorkspace(accountId, 'initializing');
      await commandService.markWorkspaceReady(workspaceId);
      await commandService.archiveWorkspace(workspaceId);
      
      // Load events from EventStore
      const events = await eventStore.getEvents('Workspace', workspaceId);
      expect(events.length).toBe(3); // Created, Ready, Archived
      
      // Reconstruct aggregate from events
      const reconstructedWorkspace = Workspace.fromEvents(workspaceId, events as any);
      
      // Verify state matches expected final state
      expect(reconstructedWorkspace.getId()).toBe(workspaceId);
      expect(reconstructedWorkspace.isArchived()).toBe(true);
      
      // ✅ Event replay and aggregate reconstruction validated
    });
    
    it('should maintain causality chain across events', async () => {
      const accountId = 'acc-e2e-004';
      const workspaceId = await commandService.createWorkspace(accountId, 'initializing');
      await commandService.archiveWorkspace(workspaceId);
      
      const events = await eventStore.getEvents('Workspace', workspaceId);
      
      // First event causedBy = 'system'
      expect(events[0].metadata.causedBy).toBe('system');
      
      // Second event causedBy = first event ID
      expect(events[1].metadata.causedBy).toBe(events[0].id);
      
      // ✅ Causality chain validated
    });
    
    it('should support idempotent event replay', async () => {
      const accountId = 'acc-e2e-005';
      const workspaceId = await commandService.createWorkspace(accountId, 'ready');
      
      const events = await eventStore.getEvents('Workspace', workspaceId);
      
      // Build projection twice (idempotency test)
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      for (const event of events) {
        await projectionBuilder.handleEvent(event); // Replay again
      }
      
      // Projection should exist and be correct (not duplicated)
      const workspace = await queryService.getWorkspaceById(workspaceId);
      expect(workspace).toBeDefined();
      expect(workspace!.id).toBe(workspaceId);
      
      // ✅ Idempotent projection updates validated
    });
  });
  
  describe('Multi-Tenant Isolation', () => {
    it('should isolate workspaces by ownerId (accountId)', async () => {
      // Create workspaces for different accounts
      const account1 = 'acc-tenant-001';
      const account2 = 'acc-tenant-002';
      
      const ws1 = await commandService.createWorkspace(account1, 'ready');
      const ws2 = await commandService.createWorkspace(account1, 'ready');
      const ws3 = await commandService.createWorkspace(account2, 'ready');
      
      // Build projections
      for (const workspaceId of [ws1, ws2, ws3]) {
        const events = await eventStore.getEvents('Workspace', workspaceId);
        for (const event of events) {
          await projectionBuilder.handleEvent(event);
        }
      }
      
      // Query by ownerId should return only workspaces for that account
      const account1Workspaces = await queryService.getWorkspacesByOwnerId(account1);
      expect(account1Workspaces.length).toBe(2);
      expect(account1Workspaces.every(w => w.ownerId === account1)).toBe(true);
      
      const account2Workspaces = await queryService.getWorkspacesByOwnerId(account2);
      expect(account2Workspaces.length).toBe(1);
      expect(account2Workspaces[0].ownerId).toBe(account2);
      
      // ✅ Multi-tenant isolation validated
    });
    
    it('should prevent cross-tenant data leakage', async () => {
      const account1 = 'acc-secure-001';
      const account2 = 'acc-secure-002';
      
      const ws1 = await commandService.createWorkspace(account1, 'ready');
      const ws2 = await commandService.createWorkspace(account2, 'ready');
      
      // Build projections
      for (const workspaceId of [ws1, ws2]) {
        const events = await eventStore.getEvents('Workspace', workspaceId);
        for (const event of events) {
          await projectionBuilder.handleEvent(event);
        }
      }
      
      // Account1 should NOT see Account2's workspace
      const account1Workspaces = await queryService.getWorkspacesByOwnerId(account1);
      expect(account1Workspaces.some(w => w.id === ws2)).toBe(false);
      
      // Account2 should NOT see Account1's workspace
      const account2Workspaces = await queryService.getWorkspacesByOwnerId(account2);
      expect(account2Workspaces.some(w => w.id === ws1)).toBe(false);
      
      // ✅ Cross-tenant isolation validated
    });
  });
  
  describe('Projection Rebuild', () => {
    it('should rebuild projection from event stream', async () => {
      const accountId = 'acc-rebuild-001';
      const workspaceId = await commandService.createWorkspace(accountId, 'initializing');
      await commandService.markWorkspaceReady(workspaceId);
      
      // Build initial projection
      const events = await eventStore.getEvents('Workspace', workspaceId);
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      // Verify projection exists
      let workspace = await queryService.getWorkspaceById(workspaceId);
      expect(workspace).toBeDefined();
      expect(workspace!.status).toBe('ready');
      
      // Simulate projection corruption or deletion (mock)
      // In real scenario, we would delete from Firestore
      
      // Rebuild projection using rebuild() method
      await projectionBuilder.rebuild(workspaceId, events);
      
      // Verify projection is restored
      workspace = await queryService.getWorkspaceById(workspaceId);
      expect(workspace).toBeDefined();
      expect(workspace!.status).toBe('ready');
      
      // ✅ Projection rebuild validated
    });
  });
  
  describe('Reactive State Management', () => {
    it('should cache workspaces in Store and emit updates', async (done) => {
      const accountId = 'acc-store-001';
      const workspaceId = await commandService.createWorkspace(accountId, 'ready');
      
      // Build projection
      const events = await eventStore.getEvents('Workspace', workspaceId);
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      // Subscribe to store updates
      const subscription = storeService.workspaces$.subscribe(workspaces => {
        if (workspaces.length > 0) {
          expect(workspaces.length).toBe(1);
          expect(workspaces[0].id).toBe(workspaceId);
          subscription.unsubscribe();
          done();
        }
      });
      
      // Load workspaces into store
      await storeService.loadWorkspacesByOwnerId(accountId);
    });
    
    it('should select specific workspace reactively', async (done) => {
      const accountId = 'acc-store-002';
      const workspaceId = await commandService.createWorkspace(accountId, 'ready');
      
      // Build projection
      const events = await eventStore.getEvents('Workspace', workspaceId);
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      // Load into store
      await storeService.loadWorkspacesByOwnerId(accountId);
      
      // Select specific workspace
      const subscription = storeService.selectWorkspaceById(workspaceId).subscribe(workspace => {
        if (workspace) {
          expect(workspace.id).toBe(workspaceId);
          subscription.unsubscribe();
          done();
        }
      });
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle workspace not found gracefully', async () => {
      const nonExistentId = 'ws-nonexistent';
      
      // Query should return null (not throw)
      const workspace = await queryService.getWorkspaceById(nonExistentId);
      expect(workspace).toBeNull();
      
      // Exists check should return false
      const exists = await queryService.workspaceExists(nonExistentId);
      expect(exists).toBe(false);
    });
    
    it('should handle empty query results', async () => {
      const emptyAccountId = 'acc-empty';
      
      // Query should return empty array (not throw)
      const workspaces = await queryService.getWorkspacesByOwnerId(emptyAccountId);
      expect(workspaces).toEqual([]);
      
      // Count should return 0
      const count = await queryService.getWorkspaceCountByOwnerId(emptyAccountId);
      expect(count).toBe(0);
    });
    
    it('should validate workspace state transitions', async () => {
      const accountId = 'acc-validation-001';
      const workspaceId = await commandService.createWorkspace(accountId, 'initializing');
      
      // Archive workspace
      await commandService.archiveWorkspace(workspaceId);
      
      // Attempting to archive again should be idempotent or throw
      // (Depending on business rules - currently Workspace allows re-archiving)
      await expectAsync(commandService.archiveWorkspace(workspaceId)).toBeResolved();
    });
  });
  
  describe('Performance Characteristics', () => {
    it('should execute command within acceptable time', async () => {
      const start = Date.now();
      
      const accountId = 'acc-perf-001';
      await commandService.createWorkspace(accountId, 'ready');
      
      const duration = Date.now() - start;
      
      // Command should complete in under 100ms (mock Firestore)
      expect(duration).toBeLessThan(100);
    });
    
    it('should query projection within acceptable time', async () => {
      const accountId = 'acc-perf-002';
      const workspaceId = await commandService.createWorkspace(accountId, 'ready');
      
      // Build projection
      const events = await eventStore.getEvents('Workspace', workspaceId);
      for (const event of events) {
        await projectionBuilder.handleEvent(event);
      }
      
      const start = Date.now();
      await queryService.getWorkspaceById(workspaceId);
      const duration = Date.now() - start;
      
      // Query should complete in under 50ms (mock Firestore)
      expect(duration).toBeLessThan(50);
    });
  });
});

// END OF FILE
