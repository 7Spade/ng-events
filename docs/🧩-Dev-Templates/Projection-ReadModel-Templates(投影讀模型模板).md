# Projection & Read Model Templates (投影與讀模型模板)

本文檔提供投影和讀模型的標準模板，用於構建查詢優化的讀取層。

---

## 投影基礎結構 (Projection Base Structure)

### 標準投影介面

```typescript
/**
 * Base projection interface
 * 投影基礎介面
 */
export interface IProjection {
  /** 投影 ID */
  id: string;
  
  /** 聚合根 ID */
  aggregateId: string;
  
  /** Workspace ID (WHERE - 邏輯容器) */
  workspaceId: string;
  
  /** 多租戶邊界 (向後相容) */
  blueprintId: string;
  
  /** 最後更新時間 */
  lastUpdated: Timestamp;
  
  /** 版本號 */
  version: number;
}
```

### Account Summary (Account 摘要介面)

```typescript
/**
 * Account Summary
 * Account 摘要資訊 (用於投影)
 */
export interface AccountSummary {
  /** Account ID (WHO - 業務主體) */
  accountId: string;
  
  /** 顯示名稱 */
  displayName: string;
  
  /** 頭像 URL */
  avatar?: string;
  
  /** Account 類型 */
  type: 'individual' | 'organization' | 'bot';
}
```

---

## Task 投影範例 (Task Projection Examples)

### 1. Task List Projection (任務列表投影)

```typescript
/**
 * Task list projection for dashboard view
 * 用於儀表板的任務列表投影
 */
export class TaskListProjection implements IProjection {
  id: string;
  aggregateId: string;
  workspaceId: string;
  blueprintId: string;
  lastUpdated: Timestamp;
  version: number;

  // 投影資料
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignee: AccountSummary;  // Account (WHO) 而非 User
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Timestamp;
  createdByAccountId: string;  // WHO created
  completedAt?: Timestamp;
  tags: string[];

  constructor(data: Partial<TaskListProjection>) {
    Object.assign(this, data);
  }

  /**
   * Update from TaskCreated event
   */
  updateFromTaskCreated(event: TaskCreatedEvent): void {
    this.aggregateId = event.aggregateId;
    this.workspaceId = event.metadata.workspaceId;
    this.blueprintId = event.metadata.blueprintId;
    this.title = event.data.title;
    this.description = event.data.description;
    this.status = 'pending';
    this.createdAt = event.metadata.timestamp;
    this.createdByAccountId = event.metadata.actorAccountId;
    this.lastUpdated = Timestamp.now();
    this.version = 1;
  }

  /**
   * Update from TaskCompleted event
   */
  updateFromTaskCompleted(event: TaskCompletedEvent): void {
    this.status = 'completed';
    this.completedAt = event.metadata.timestamp;
    this.lastUpdated = Timestamp.now();
    this.version++;
  }

  /**
   * Update from TaskCancelled event
   */
  updateFromTaskCancelled(event: TaskCancelledEvent): void {
    this.status = 'cancelled';
    this.lastUpdated = Timestamp.now();
    this.version++;
  }
}
```

---

### 2. Task Detail Projection (任務詳情投影)

```typescript
/**
 * Task detail projection for detail view
 * 用於詳情頁的任務投影
 */
export class TaskDetailProjection implements IProjection {
  id: string;
  aggregateId: string;
  workspaceId: string;
  blueprintId: string;
  lastUpdated: Timestamp;
  version: number;

  // 基本資訊
  title: string;
  description: string;
  status: string;
  priority: string;
  
  // 人員資訊 (Account, not User)
  assignee: AccountSummary;
  reporter: AccountSummary;
  createdByAccountId: string;
  
  // 時間資訊
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  dueDate?: Date;
  
  // 關聯資訊
  parentTaskId?: string;
  childTaskIds: string[];
  linkedIssueIds: string[];
  linkedPaymentIds: string[];
  
  // 活動歷史
  activities: TaskActivity[];
  
  // 附件
  attachments: Attachment[];
  
  // 標籤
  tags: string[];

  constructor(data: Partial<TaskDetailProjection>) {
    Object.assign(this, data);
    this.activities = [];
    this.attachments = [];
    this.childTaskIds = [];
    this.linkedIssueIds = [];
    this.linkedPaymentIds = [];
    this.tags = [];
  }

  /**
   * Update from any task event
   */
  updateFromEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'TaskCreated':
        this.handleTaskCreated(event as TaskCreatedEvent);
        break;
      case 'TaskUpdated':
        this.handleTaskUpdated(event as TaskUpdatedEvent);
        break;
      case 'TaskCompleted':
        this.handleTaskCompleted(event as TaskCompletedEvent);
        break;
      case 'TaskCommented':
        this.handleTaskCommented(event as TaskCommentedEvent);
        break;
    }
    
    this.lastUpdated = Timestamp.now();
    this.version++;
  }

  private handleTaskCreated(event: TaskCreatedEvent): void {
    this.aggregateId = event.aggregateId;
    this.blueprintId = event.metadata.blueprintId;
    this.title = event.data.title;
    this.description = event.data.description;
    this.status = 'pending';
    this.createdAt = event.metadata.timestamp;
    
    this.activities.push({
      type: 'created',
      actorAccountId: event.metadata.actorAccountId,
      timestamp: event.metadata.timestamp,
      description: 'Task created'
    });
  }

  private handleTaskCompleted(event: TaskCompletedEvent): void {
    this.status = 'completed';
    this.completedAt = event.metadata.timestamp;
    
    this.activities.push({
      type: 'completed',
      actorAccountId: event.metadata.actorAccountId,
      timestamp: event.metadata.timestamp,
      description: `Task completed: ${event.data.completionNote}`
    });
  }
}

interface TaskActivity {
  type: string;
  actorAccountId: string;  // WHO performed this activity
  timestamp: Timestamp;
  description: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Timestamp;
}
```

---

## Payment 投影範例 (Payment Projection Examples)

### 1. Payment Summary Projection (支付摘要投影)

```typescript
/**
 * Payment summary projection for list view
 * 用於列表的支付摘要投影
 */
export class PaymentSummaryProjection implements IProjection {
  id: string;
  aggregateId: string;
  blueprintId: string;
  lastUpdated: Timestamp;
  version: number;

  // 支付資訊
  paymentNumber: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  
  // 關聯任務
  taskId: string;
  taskTitle: string;
  
  // 收款人
  payee: {
    id: string;
    name: string;
  };
  
  // 時間
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  paidAt?: Timestamp;

  constructor(data: Partial<PaymentSummaryProjection>) {
    Object.assign(this, data);
  }

  updateFromPaymentCreated(event: PaymentCreatedEvent): void {
    this.aggregateId = event.aggregateId;
    this.blueprintId = event.metadata.blueprintId;
    this.paymentNumber = event.data.paymentNumber;
    this.amount = event.data.amount;
    this.currency = event.data.currency;
    this.status = 'pending';
    this.taskId = event.data.taskId;
    this.createdAt = event.metadata.timestamp;
    this.lastUpdated = Timestamp.now();
    this.version = 1;
  }

  updateFromPaymentApproved(event: PaymentApprovedEvent): void {
    this.status = 'approved';
    this.approvedAt = event.metadata.timestamp;
    this.lastUpdated = Timestamp.now();
    this.version++;
  }

  updateFromPaymentPaid(event: PaymentPaidEvent): void {
    this.status = 'paid';
    this.paidAt = event.metadata.timestamp;
    this.lastUpdated = Timestamp.now();
    this.version++;
  }
}
```

---

## 投影儲存庫實作 (Projection Repository Implementation)

### Firestore 投影儲存庫

```typescript
/**
 * Firestore projection repository
 * Firestore 投影儲存庫實作
 */
export class FirestoreProjectionRepository<T extends IProjection> {
  constructor(
    private firestore: Firestore,
    private collectionName: string
  ) {}

  /**
   * Save projection
   */
  async save(projection: T): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, projection.id);
    await setDoc(docRef, this.toFirestore(projection));
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return this.fromFirestore(snapshot);
  }

  /**
   * Find by blueprint (multi-tenant)
   */
  async findByBlueprint(blueprintId: string): Promise<T[]> {
    const q = query(
      collection(this.firestore, this.collectionName),
      where('blueprintId', '==', blueprintId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.fromFirestore(doc));
  }

  /**
   * Query with filters
   */
  async query(filters: ProjectionQuery): Promise<T[]> {
    let q = query(
      collection(this.firestore, this.collectionName),
      where('blueprintId', '==', filters.blueprintId)
    );

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.assigneeId) {
      q = query(q, where('assignee.id', '==', filters.assigneeId));
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.fromFirestore(doc));
  }

  /**
   * Delete projection
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private toFirestore(projection: T): any {
    return {
      ...projection,
      lastUpdated: serverTimestamp()
    };
  }

  private fromFirestore(snapshot: DocumentSnapshot): T {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data
    } as T;
  }
}

interface ProjectionQuery {
  blueprintId: string;
  status?: string;
  assigneeId?: string;
  limit?: number;
}
```

---

## 投影更新服務 (Projection Update Service)

### 事件驅動投影更新

```typescript
/**
 * Projection updater service
 * 投影更新服務
 */
export class ProjectionUpdaterService {
  constructor(
    private taskListRepo: FirestoreProjectionRepository<TaskListProjection>,
    private taskDetailRepo: FirestoreProjectionRepository<TaskDetailProjection>
  ) {}

  /**
   * Handle domain event and update projections
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    switch (event.aggregateType) {
      case 'Task':
        await this.updateTaskProjections(event);
        break;
      case 'Payment':
        await this.updatePaymentProjections(event);
        break;
    }
  }

  private async updateTaskProjections(event: DomainEvent): Promise<void> {
    // Update list projection
    await this.updateTaskListProjection(event);
    
    // Update detail projection
    await this.updateTaskDetailProjection(event);
  }

  private async updateTaskListProjection(event: DomainEvent): Promise<void> {
    let projection = await this.taskListRepo.findById(event.aggregateId);
    
    if (!projection) {
      projection = new TaskListProjection({ id: event.aggregateId });
    }

    // Update projection based on event type
    switch (event.eventType) {
      case 'TaskCreated':
        projection.updateFromTaskCreated(event as TaskCreatedEvent);
        break;
      case 'TaskCompleted':
        projection.updateFromTaskCompleted(event as TaskCompletedEvent);
        break;
    }

    await this.taskListRepo.save(projection);
  }

  private async updateTaskDetailProjection(event: DomainEvent): Promise<void> {
    let projection = await this.taskDetailRepo.findById(event.aggregateId);
    
    if (!projection) {
      projection = new TaskDetailProjection({ id: event.aggregateId });
    }

    projection.updateFromEvent(event);
    await this.taskDetailRepo.save(projection);
  }
}
```

---

## 投影重建 (Projection Rebuild)

### 從事件流重建投影

```typescript
/**
 * Projection rebuilder
 * 投影重建器
 */
export class ProjectionRebuilder {
  constructor(
    private eventStore: IEventStoreRepository,
    private projectionUpdater: ProjectionUpdaterService
  ) {}

  /**
   * Rebuild projection from event stream
   */
  async rebuildProjection(aggregateId: string): Promise<void> {
    // 獲取所有事件
    const events = await this.eventStore.getEventsForAggregate(aggregateId);
    
    // 按順序重播事件
    for (const event of events.sort((a, b) => 
      a.metadata.version - b.metadata.version
    )) {
      await this.projectionUpdater.handleEvent(event);
    }
  }

  /**
   * Rebuild all projections for a blueprint
   */
  async rebuildAllProjections(blueprintId: string): Promise<void> {
    const events = await this.eventStore.getEventsByBlueprint(blueprintId);
    
    // 按聚合根分組
    const eventsByAggregate = this.groupEventsByAggregate(events);
    
    // 重建每個聚合根的投影
    for (const [aggregateId, aggregateEvents] of eventsByAggregate) {
      for (const event of aggregateEvents.sort((a, b) => 
        a.metadata.version - b.metadata.version
      )) {
        await this.projectionUpdater.handleEvent(event);
      }
    }
  }

  private groupEventsByAggregate(events: DomainEvent[]): Map<string, DomainEvent[]> {
    const grouped = new Map<string, DomainEvent[]>();
    
    for (const event of events) {
      const existing = grouped.get(event.aggregateId) || [];
      existing.push(event);
      grouped.set(event.aggregateId, existing);
    }
    
    return grouped;
  }
}
```

---

## 最佳實踐

### ✅ DO
- 一個投影對應一個查詢需求
- 事件驅動更新投影
- 支援投影重建
- 多租戶隔離
- 版本控制
- 最佳化查詢效能

### ❌ DON'T
- 在投影中包含業務邏輯
- 直接修改聚合根
- 忽略版本號
- 缺少 blueprintId 過濾
- 投影過於複雜

---

## 檢查清單

- [ ] 投影包含 blueprintId
- [ ] 實作 IProjection 介面
- [ ] 支援事件更新
- [ ] 支援重建功能
- [ ] 優化查詢效能
- [ ] 版本控制
- [ ] 多租戶隔離
- [ ] 錯誤處理

---

**版本**: 1.0 | **更新**: 2026-01-01
