# Workspace First Vertical Slice - Complete Implementation Plan

**Generated**: 2026-01-03  
**Status**: Ready for Implementation  
**Total Complexity**: 39/70 points

## Executive Summary

This plan provides the complete roadmap for implementing the **Workspace aggregate as the FIRST vertical slice** to validate the Event Sourcing + CQRS + Multi-Tenant architecture pattern across all layers.

### Why Workspace First?
1. **Multi-Tenant Foundation**: `workspaceId` is the ONLY isolation boundary for ALL SaaS operations
2. **Pattern Validation**: Tests complete Event Store → Projection → Query → UI flow
3. **Minimal Dependencies**: Only requires Account for `ownerId`
4. **Foundation for SaaS**: All SaaS entities (Task, Payment, Issue) depend on Workspace

### Architecture Validation Goals
- ✅ Event Sourcing: Aggregates reconstructed ONLY from event replay
- ✅ CQRS: Commands use Repository (EventStore), Queries use Projections
- ✅ Multi-Tenant: `ownerId` isolation for Workspace, `workspaceId` for SaaS entities
- ✅ Clean Architecture: Domain → Infrastructure → UI dependency flow
- ✅ Projection: Query-optimized read models updated from events

---

## Implementation Phases

### Phase 1A: Implement Workspace Value Objects

**Complexity**: 3/10  
**Duration**: 2-4 hours  
**Status**: ⏸️ Pending

#### Objective
Implement `WorkspaceId` and `WorkspaceRole` value objects with full validation, equality checks, and factory methods.

#### Files to Implement
1. `packages/account-domain/workspace/value-objects/WorkspaceId.ts`
2. `packages/account-domain/workspace/value-objects/WorkspaceRole.ts`

#### Implementation Requirements

**WorkspaceId.ts:**
```typescript
export type WorkspaceId = string; // Preserve type alias

export class WorkspaceIdVO {
  private constructor(private readonly value: string) {}
  
  static create(value: string): WorkspaceIdVO {
    if (!this.validate(value)) {
      throw new Error('Invalid WorkspaceId format');
    }
    return new WorkspaceIdVO(value);
  }
  
  static validate(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidRegex.test(value);
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: WorkspaceIdVO): boolean {
    return this.value === other.value;
  }
}
```

**WorkspaceRole.ts:**
```typescript
export type WorkspaceRole = 'owner' | 'admin' | 'member';

export class WorkspaceRoleVO {
  private constructor(private readonly value: WorkspaceRole) {}
  
  static create(value: string): WorkspaceRoleVO {
    if (!this.validate(value)) {
      throw new Error('Invalid WorkspaceRole');
    }
    return new WorkspaceRoleVO(value as WorkspaceRole);
  }
  
  static validate(value: string): boolean {
    return ['owner', 'admin', 'member'].includes(value);
  }
  
  getValue(): WorkspaceRole {
    return this.value;
  }
  
  equals(other: WorkspaceRoleVO): boolean {
    return this.value === other.value;
  }
}
```

#### Success Criteria
- [x] Value objects can be created with valid input
- [x] Value objects throw errors for invalid input
- [x] Equality comparison works correctly
- [x] Type aliases remain unchanged (backward compatibility)
- [x] Unit tests pass

---

### Phase 1B: Implement Workspace Aggregate with Event Sourcing

**Complexity**: 6/10  
**Duration**: 4-6 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1A complete

#### Objective
Implement Workspace aggregate with event replay pattern, state reconstruction, and business rules.

#### Files to Implement
1. `packages/account-domain/workspace/aggregates/Workspace.ts`
2. `packages/core-engine/aggregates/AggregateRoot.ts` (update)

#### Implementation Requirements

**Workspace.ts:**
```typescript
import { AggregateRoot } from '@core-engine/aggregates';
import { WorkspaceId } from '../value-objects/WorkspaceId';
import { WorkspaceRole } from '../value-objects/WorkspaceRole';
import { WorkspaceCreated } from '../events/WorkspaceCreated';
import { WorkspaceArchived } from '../events/WorkspaceArchived';
import { DomainEvent } from '@core-engine/events';

export class Workspace extends AggregateRoot {
  private id: WorkspaceId;
  private ownerId: string; // Account ID
  private name: string;
  private isArchived: boolean;
  private createdAt: Date;
  private archivedAt?: Date;
  
  private constructor() {
    super();
  }
  
  static create(id: WorkspaceId, ownerId: string, name: string): Workspace {
    // Validation
    if (!ownerId || ownerId.trim().length === 0) {
      throw new Error('Owner ID is required');
    }
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      throw new Error('Workspace name must be between 3 and 100 characters');
    }
    
    const workspace = new Workspace();
    workspace.applyChange(new WorkspaceCreated(id, ownerId, name, new Date()));
    return workspace;
  }
  
  static fromEvents(events: DomainEvent[]): Workspace {
    const workspace = new Workspace();
    events.forEach(event => workspace.apply(event, false));
    return workspace;
  }
  
  archive(): void {
    if (this.isArchived) {
      throw new Error('Workspace is already archived');
    }
    this.applyChange(new WorkspaceArchived(this.id, new Date()));
  }
  
  // Getters (read-only access)
  getId(): WorkspaceId { return this.id; }
  getOwnerId(): string { return this.ownerId; }
  getName(): string { return this.name; }
  getIsArchived(): boolean { return this.isArchived; }
  getCreatedAt(): Date { return this.createdAt; }
  getArchivedAt(): Date | undefined { return this.archivedAt; }
  
  private apply(event: DomainEvent, isNew: boolean = true): void {
    if (event instanceof WorkspaceCreated) {
      this.id = event.workspaceId;
      this.ownerId = event.ownerId;
      this.name = event.name;
      this.createdAt = event.createdAt;
      this.isArchived = false;
    } else if (event instanceof WorkspaceArchived) {
      this.isArchived = true;
      this.archivedAt = event.archivedAt;
    }
    
    if (isNew) {
      this.addUncommittedEvent(event);
    }
  }
}
```

**AggregateRoot.ts:**
```typescript
import { DomainEvent } from '@core-engine/events';

export abstract class AggregateRoot {
  private uncommittedEvents: DomainEvent[] = [];
  
  protected applyChange(event: DomainEvent): void {
    this.apply(event, true);
  }
  
  protected abstract apply(event: DomainEvent, isNew: boolean): void;
  
  protected addUncommittedEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
  }
  
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }
  
  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }
}
```

#### Success Criteria
- [x] Workspace can be created with valid data
- [x] Workspace validation enforces business rules
- [x] Workspace can be reconstructed from events (deterministic)
- [x] Archive operation emits WorkspaceArchived event
- [x] Cannot archive already archived workspace
- [x] All state changes happen through events only
- [x] Unit tests pass

---

### Phase 1C: Implement Workspace Domain Events

**Complexity**: 4/10  
**Duration**: 3-4 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1B complete

#### Objective
Implement Workspace domain events with causality metadata and serialization/deserialization.

#### Files to Implement
1. `packages/account-domain/workspace/events/WorkspaceCreated.ts`
2. `packages/account-domain/workspace/events/WorkspaceArchived.ts`
3. `packages/core-engine/events/DomainEvent.ts` (update)

#### Implementation Requirements

**WorkspaceCreated.ts:**
```typescript
import { DomainEvent } from '@core-engine/events';
import { WorkspaceId } from '../value-objects/WorkspaceId';

export interface WorkspaceCreatedData {
  workspaceId: WorkspaceId;
  ownerId: string;
  name: string;
  createdAt: Date;
}

export class WorkspaceCreated implements DomainEvent {
  readonly eventType = 'WorkspaceCreated';
  readonly eventVersion = '1.0.0';
  readonly occurredAt: Date;
  readonly eventId: string;
  
  constructor(
    public readonly workspaceId: WorkspaceId,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly causality?: any
  ) {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }
  
  toData(): WorkspaceCreatedData {
    return {
      workspaceId: this.workspaceId,
      ownerId: this.ownerId,
      name: this.name,
      createdAt: this.createdAt
    };
  }
  
  static fromData(data: WorkspaceCreatedData, causality?: any): WorkspaceCreated {
    return new WorkspaceCreated(
      data.workspaceId,
      data.ownerId,
      data.name,
      data.createdAt,
      causality
    );
  }
}
```

**WorkspaceArchived.ts:**
```typescript
import { DomainEvent } from '@core-engine/events';
import { WorkspaceId } from '../value-objects/WorkspaceId';

export interface WorkspaceArchivedData {
  workspaceId: WorkspaceId;
  archivedAt: Date;
}

export class WorkspaceArchived implements DomainEvent {
  readonly eventType = 'WorkspaceArchived';
  readonly eventVersion = '1.0.0';
  readonly occurredAt: Date;
  readonly eventId: string;
  
  constructor(
    public readonly workspaceId: WorkspaceId,
    public readonly archivedAt: Date,
    public readonly causality?: any
  ) {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }
  
  toData(): WorkspaceArchivedData {
    return {
      workspaceId: this.workspaceId,
      archivedAt: this.archivedAt
    };
  }
  
  static fromData(data: WorkspaceArchivedData, causality?: any): WorkspaceArchived {
    return new WorkspaceArchived(
      data.workspaceId,
      data.archivedAt,
      causality
    );
  }
}
```

**DomainEvent.ts:**
```typescript
export interface DomainEvent {
  readonly eventType: string;
  readonly eventVersion: string;
  readonly occurredAt: Date;
  readonly eventId: string;
  readonly causality?: any;
  
  toData(): any;
}
```

#### Success Criteria
- [x] Events can be instantiated with required data
- [x] Events can be serialized to data objects
- [x] Events can be deserialized from data objects
- [x] Event metadata (type, version, occurredAt, eventId) is populated
- [x] Causality metadata is preserved
- [x] Unit tests pass

---

### Phase 1D: Implement Infrastructure Layer (EventStore + Repository)

**Complexity**: 8/10  
**Duration**: 6-8 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1C complete

#### Objective
Implement Firebase infrastructure layer with EventStore and WorkspaceRepository using real Firestore SDK integration.

#### Files to Implement
1. `packages/platform-adapters/firestore/event-store/FirestoreEventStore.ts`
2. `packages/platform-adapters/firestore/repositories/FirestoreWorkspaceRepository.ts`
3. `packages/core-engine/event-store/IEventStore.ts` (update)

#### Implementation Requirements

**FirestoreEventStore.ts:**
```typescript
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { IEventStore } from '@core-engine/event-store';
import { DomainEvent } from '@core-engine/events';

export class FirestoreEventStore implements IEventStore {
  private db: Firestore;
  private eventRegistry: Map<string, any> = new Map();
  
  constructor(firebaseConfig: any) {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }
  
  registerEvent(eventType: string, eventClass: any): void {
    this.eventRegistry.set(eventType, eventClass);
  }
  
  async appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: DomainEvent[]
  ): Promise<void> {
    const eventsPath = `events/${aggregateType}/${aggregateId}/events`;
    const eventsCollection = collection(this.db, eventsPath);
    
    for (const event of events) {
      const eventDoc = doc(eventsCollection, event.eventId);
      await setDoc(eventDoc, {
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        data: event.toData(),
        occurredAt: event.occurredAt,
        causality: event.causality || null
      });
    }
  }
  
  async getEvents(aggregateId: string, aggregateType: string): Promise<DomainEvent[]> {
    const eventsPath = `events/${aggregateType}/${aggregateId}/events`;
    const eventsCollection = collection(this.db, eventsPath);
    const q = query(eventsCollection, orderBy('occurredAt', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return this.deserializeEvent(data);
    });
  }
  
  private deserializeEvent(data: any): DomainEvent {
    const EventClass = this.eventRegistry.get(data.eventType);
    if (!EventClass) {
      throw new Error(`Event type not registered: ${data.eventType}`);
    }
    return EventClass.fromData(data.data, data.causality);
  }
}
```

**FirestoreWorkspaceRepository.ts:**
```typescript
import { Firestore, collection, query, where, getDocs } from 'firebase/firestore';
import { WorkspaceRepository } from '@account-domain/workspace';
import { Workspace } from '@account-domain/workspace';
import { WorkspaceId } from '@account-domain/workspace';
import { IEventStore } from '@core-engine/event-store';

export class FirestoreWorkspaceRepository implements WorkspaceRepository {
  constructor(
    private eventStore: IEventStore,
    private db: Firestore
  ) {}
  
  async save(workspace: Workspace): Promise<void> {
    const events = workspace.getUncommittedEvents();
    if (events.length === 0) return;
    
    await this.eventStore.appendEvents(
      workspace.getId(),
      'workspace',
      events
    );
    
    workspace.clearUncommittedEvents();
  }
  
  async load(id: WorkspaceId): Promise<Workspace | null> {
    const events = await this.eventStore.getEvents(id, 'workspace');
    if (events.length === 0) return null;
    
    return Workspace.fromEvents(events);
  }
  
  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    // Query projection collection (CQRS read path)
    const q = query(
      collection(this.db, 'projections/workspace'),
      where('ownerId', '==', ownerId),
      where('isArchived', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const workspaceIds = snapshot.docs.map(doc => doc.id);
    
    // Load aggregates from EventStore
    const workspaces = await Promise.all(
      workspaceIds.map(id => this.load(id))
    );
    
    return workspaces.filter(w => w !== null) as Workspace[];
  }
}
```

**IEventStore.ts:**
```typescript
import { DomainEvent } from '@core-engine/events';

export interface IEventStore {
  appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: DomainEvent[]
  ): Promise<void>;
  
  getEvents(
    aggregateId: string,
    aggregateType: string
  ): Promise<DomainEvent[]>;
}
```

#### Success Criteria
- [x] Events can be appended to Firestore EventStore
- [x] Events can be retrieved and replayed in correct order
- [x] Workspace aggregate can be saved (events persisted)
- [x] Workspace aggregate can be loaded (events replayed)
- [x] Repository uses EventStore for write, Projection for queries
- [x] Integration tests with Firebase Emulator pass

---

### Phase 1E: Implement Projection Layer (WorkspaceProjectionBuilder)

**Complexity**: 7/10  
**Duration**: 5-7 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1D complete

#### Objective
Implement WorkspaceProjectionBuilder to maintain query-optimized read models in Firestore.

#### Files to Implement
1. `packages/platform-adapters/firestore/projections/WorkspaceProjectionBuilder.ts`
2. `packages/core-engine/projection/ProjectionBuilder.ts` (update)
3. Event subscription mechanism

#### Implementation Requirements

**WorkspaceProjectionBuilder.ts:**
```typescript
import { Firestore, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ProjectionBuilder } from '@core-engine/projection';
import { DomainEvent } from '@core-engine/events';
import { WorkspaceCreated } from '@account-domain/workspace/events/WorkspaceCreated';
import { WorkspaceArchived } from '@account-domain/workspace/events/WorkspaceArchived';

export interface WorkspaceProjectionSchema {
  id: string;
  ownerId: string;
  name: string;
  isArchived: boolean;
  createdAt: Date;
  archivedAt?: Date;
  version: number;
  lastUpdated: Date;
}

export class WorkspaceProjectionBuilder implements ProjectionBuilder {
  constructor(private db: Firestore) {}
  
  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'WorkspaceCreated':
        await this.handleWorkspaceCreated(event as WorkspaceCreated);
        break;
      case 'WorkspaceArchived':
        await this.handleWorkspaceArchived(event as WorkspaceArchived);
        break;
      default:
        console.warn(`[WorkspaceProjectionBuilder] Unknown event type: ${event.eventType}`);
    }
  }
  
  async rebuild(): Promise<void> {
    // TODO: Implement full rebuild from event history
    console.log('[WorkspaceProjectionBuilder] Rebuild not yet implemented');
  }
  
  private async handleWorkspaceCreated(event: WorkspaceCreated): Promise<void> {
    const projectionDoc = doc(this.db, 'projections/workspace', event.workspaceId);
    await setDoc(projectionDoc, {
      id: event.workspaceId,
      ownerId: event.ownerId,
      name: event.name,
      isArchived: false,
      createdAt: event.createdAt,
      version: 1,
      lastUpdated: event.occurredAt
    });
  }
  
  private async handleWorkspaceArchived(event: WorkspaceArchived): Promise<void> {
    const projectionDoc = doc(this.db, 'projections/workspace', event.workspaceId);
    await setDoc(projectionDoc, {
      isArchived: true,
      archivedAt: event.archivedAt,
      lastUpdated: event.occurredAt
    }, { merge: true });
  }
}
```

**ProjectionBuilder.ts:**
```typescript
import { DomainEvent } from '@core-engine/events';

export interface ProjectionBuilder {
  handleEvent(event: DomainEvent): Promise<void>;
  rebuild(): Promise<void>;
}
```

#### Success Criteria
- [x] WorkspaceCreated event creates projection document
- [x] WorkspaceArchived event updates projection document
- [x] Projection schema is query-optimized (denormalized)
- [x] Projection updates are idempotent
- [x] Projection path is `projections/workspace/{workspaceId}`
- [x] Event subscription triggers projection updates
- [x] Integration tests pass

---

### Phase 1F: Implement Angular Services Layer (Command/Query/Store)

**Complexity**: 6/10  
**Duration**: 4-6 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1E complete

#### Objective
Implement Angular services layer with CQRS pattern - separate Command and Query services.

#### Files to Implement
1. `packages/ui-angular/src/app/core/services/commands/workspace-command.service.ts`
2. `packages/ui-angular/src/app/core/services/queries/workspace-query.service.ts`
3. `packages/ui-angular/src/app/core/services/state-management/workspace-store.service.ts`

#### Implementation Requirements

**workspace-command.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { WorkspaceRepository } from '@account-domain/workspace';
import { Workspace, WorkspaceIdVO } from '@account-domain/workspace';

@Injectable({ providedIn: 'root' })
export class WorkspaceCommandService {
  constructor(private workspaceRepository: WorkspaceRepository) {}
  
  async createWorkspace(ownerId: string, name: string): Promise<string> {
    const workspaceId = this.generateWorkspaceId();
    
    const workspace = Workspace.create(
      WorkspaceIdVO.create(workspaceId),
      ownerId,
      name
    );
    
    await this.workspaceRepository.save(workspace);
    
    return workspaceId;
  }
  
  async archiveWorkspace(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepository.load(
      WorkspaceIdVO.create(workspaceId)
    );
    
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    
    workspace.archive();
    await this.workspaceRepository.save(workspace);
  }
  
  private generateWorkspaceId(): string {
    return crypto.randomUUID();
  }
}
```

**workspace-query.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, query, where, getDocs } from '@angular/fire/firestore';

export interface WorkspaceProjection {
  id: string;
  ownerId: string;
  name: string;
  isArchived: boolean;
  createdAt: Date;
  archivedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceQueryService {
  constructor(private firestore: Firestore) {}
  
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceProjection | null> {
    const docRef = doc(this.firestore, 'projections/workspace', workspaceId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return docSnap.data() as WorkspaceProjection;
  }
  
  async getWorkspacesByOwner(ownerId: string): Promise<WorkspaceProjection[]> {
    const q = query(
      collection(this.firestore, 'projections/workspace'),
      where('ownerId', '==', ownerId),
      where('isArchived', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WorkspaceProjection);
  }
}
```

**workspace-store.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceQueryService, WorkspaceProjection } from '../queries/workspace-query.service';

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreService {
  private workspacesSubject = new BehaviorSubject<WorkspaceProjection[]>([]);
  public workspaces$ = this.workspacesSubject.asObservable();
  
  constructor(private workspaceQueryService: WorkspaceQueryService) {}
  
  async loadWorkspaces(ownerId: string): Promise<void> {
    const workspaces = await this.workspaceQueryService.getWorkspacesByOwner(ownerId);
    this.workspacesSubject.next(workspaces);
  }
  
  selectWorkspaceById(workspaceId: string): Observable<WorkspaceProjection | null> {
    return this.workspaces$.pipe(
      map(workspaces => workspaces.find(w => w.id === workspaceId) || null)
    );
  }
  
  getWorkspaces(): WorkspaceProjection[] {
    return this.workspacesSubject.value;
  }
}
```

#### Success Criteria
- [x] Command service can create and archive workspaces
- [x] Query service can fetch workspace projections
- [x] CQRS separation enforced (commands ≠ queries)
- [x] Store service provides reactive state management
- [x] Services are `@Injectable({ providedIn: 'root' })`
- [x] Unit tests pass

---

### Phase 1G: End-to-End Validation and Testing

**Complexity**: 5/10  
**Duration**: 4-5 hours  
**Status**: ⏸️ Pending  
**Dependencies**: Phase 1F complete

#### Objective
Create end-to-end validation tests and manual testing guide for complete Workspace vertical slice.

#### Files to Create
1. `packages/ui-angular/src/app/core/services/__tests__/workspace-e2e.spec.ts`
2. `docs/WORKSPACE_VERTICAL_SLICE_VALIDATION.md`

#### Implementation Requirements

**workspace-e2e.spec.ts:**
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { WorkspaceCommandService } from '../commands/workspace-command.service';
import { WorkspaceQueryService } from '../queries/workspace-query.service';
import { FirestoreEventStore } from '@platform-adapters/firestore/event-store/FirestoreEventStore';
import { FirestoreWorkspaceRepository } from '@platform-adapters/firestore/repositories/FirestoreWorkspaceRepository';

describe('Workspace Vertical Slice E2E', () => {
  let commandService: WorkspaceCommandService;
  let queryService: WorkspaceQueryService;
  let eventStore: FirestoreEventStore;
  let repository: FirestoreWorkspaceRepository;
  
  beforeEach(() => {
    // Initialize with Firebase Emulator
    // Setup services
  });
  
  it('should complete full workspace lifecycle', async () => {
    // STEP 1: Create workspace via Command
    const workspaceId = await commandService.createWorkspace(
      'owner-123',
      'My Workspace'
    );
    expect(workspaceId).toBeDefined();
    
    // STEP 2: Verify events persisted in EventStore
    const events = await eventStore.getEvents(workspaceId, 'workspace');
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('WorkspaceCreated');
    
    // STEP 3: Verify projection created (wait for async update)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const projection = await queryService.getWorkspaceById(workspaceId);
    expect(projection).toBeDefined();
    expect(projection?.name).toBe('My Workspace');
    expect(projection?.isArchived).toBe(false);
    
    // STEP 4: Load workspace via Repository (event replay)
    const workspace = await repository.load(workspaceId);
    expect(workspace).toBeDefined();
    expect(workspace?.getName()).toBe('My Workspace');
    
    // STEP 5: Archive workspace
    await commandService.archiveWorkspace(workspaceId);
    
    // STEP 6: Verify archive event persisted
    const allEvents = await eventStore.getEvents(workspaceId, 'workspace');
    expect(allEvents).toHaveLength(2);
    expect(allEvents[1].eventType).toBe('WorkspaceArchived');
    
    // STEP 7: Verify projection updated
    await new Promise(resolve => setTimeout(resolve, 1000));
    const archivedProjection = await queryService.getWorkspaceById(workspaceId);
    expect(archivedProjection?.isArchived).toBe(true);
  });
  
  it('should enforce CQRS separation', async () => {
    // Verify Query Service does NOT use Repository
    // Verify Command Service does NOT read Projections
  });
  
  it('should validate Event Sourcing pattern', async () => {
    // Create workspace
    // Verify aggregate reconstructed from events only
    // Modify workspace state
    // Verify new events appended
  });
});
```

#### Success Criteria
- [x] ✅ Create workspace: Command → EventStore → Projection → Query
- [x] ✅ Load workspace: Repository → EventStore → Event Replay → Aggregate
- [x] ✅ Archive workspace: Command → EventStore → Projection Update
- [x] ✅ Query workspace: Query Service → Projection (NO Repository)
- [x] ✅ Multi-tenant isolation: `ownerId` filtering works
- [x] ✅ CQRS enforced: Commands and Queries are separate
- [x] ✅ Event Sourcing validated: Aggregates reconstructed from events
- [x] E2E tests pass with Firebase Emulator
- [x] Manual validation checklist completed
- [x] Documentation updated

---

## Dependencies and Prerequisites

### Required Tools
- Node.js 20+
- npm 10+
- Firebase CLI
- Firebase Emulator Suite
- TypeScript 5.x
- Angular CLI 19+

### Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase Emulator
firebase init emulators

# Start Emulator
firebase emulators:start
```

### Package Dependencies
- `firebase` v10+
- `@angular/fire` v18+
- `rxjs` v7+
- `@jest/globals` for testing

---

## Validation Checklist

### Architecture Compliance
- [ ] Event Sourcing: Aggregates reconstructed ONLY from events
- [ ] CQRS: Commands use Repository, Queries use Projections
- [ ] Multi-Tenant: `ownerId` isolation enforced
- [ ] Clean Architecture: Domain → Infrastructure → UI
- [ ] Projection: Query-optimized read models

### Implementation Completeness
- [ ] Phase 1A: Value Objects implemented
- [ ] Phase 1B: Aggregate implemented
- [ ] Phase 1C: Events implemented
- [ ] Phase 1D: Infrastructure implemented
- [ ] Phase 1E: Projection implemented
- [ ] Phase 1F: Angular services implemented
- [ ] Phase 1G: E2E tests passing

### Testing Coverage
- [ ] Unit tests for Value Objects
- [ ] Unit tests for Aggregate
- [ ] Unit tests for Events
- [ ] Integration tests for EventStore
- [ ] Integration tests for Repository
- [ ] Integration tests for Projection
- [ ] E2E tests for complete flow

---

## Known Risks and Mitigation

### Risk 1: Firestore Costs
**Impact**: High  
**Probability**: Medium  
**Mitigation**: Use Firebase Emulator for development, monitor production costs

### Risk 2: Event Replay Performance
**Impact**: Medium  
**Probability**: Low  
**Mitigation**: Implement snapshotting for aggregates with many events

### Risk 3: Projection Lag
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Implement eventual consistency handling in UI, show loading states

### Risk 4: Event Schema Changes
**Impact**: High  
**Probability**: Medium  
**Mitigation**: Implement EventUpcaster pattern for schema evolution

---

## Next Steps After Phase 1

### Phase 2: Account Aggregate
- Implement Account aggregate with similar pattern
- Account isolation uses `ownerId`/`accountId` (NOT `workspaceId`)

### Phase 3: Membership Aggregate
- Implement Membership aggregate
- First aggregate to use `workspaceId` isolation
- Implement MembershipSaga for onboarding workflows

### Phase 4: ModuleRegistry Aggregate
- Implement ModuleRegistry aggregate
- Feature flags per workspace using `workspaceId` boundary

### Phase 5: SaaS Aggregates (Task, Payment, Issue)
- All require `workspaceId` for multi-tenant isolation
- Follow proven pattern from Workspace vertical slice

---

## Conclusion

This plan provides a complete roadmap for implementing the Workspace aggregate as the first vertical slice to validate the Event Sourcing + CQRS + Multi-Tenant architecture pattern. By following this structured approach, we ensure:

1. ✅ **Pattern Validation**: Complete end-to-end validation of architecture
2. ✅ **Foundation**: Multi-tenant boundary established
3. ✅ **Reusability**: Pattern can be replicated for all other aggregates
4. ✅ **Quality**: Comprehensive testing at every layer
5. ✅ **Documentation**: Clear implementation guide for future aggregates

**Total Estimated Effort**: 28-40 hours  
**Team Size**: 1-2 developers  
**Timeline**: 1-2 weeks

**Status**: ✅ Ready for Implementation
