# Event & Command Templates (事件與命令模板)

本文檔提供事件溯源系統中事件與命令的標準模板。

---

## 領域事件模板 (Domain Event Templates)

### 基礎事件結構

```typescript
/**
 * Base domain event interface
 * 所有領域事件的基礎介面
 */
export interface DomainEvent<T = any> {
  /** 事件唯一 ID */
  id: string;
  
  /** 聚合根 ID */
  aggregateId: string;
  
  /** 聚合根類型 */
  aggregateType: string;
  
  /** 事件類型 */
  eventType: string;
  
  /** 事件資料 */
  data: T;
  
  /** 元數據 */
  metadata: EventMetadata;
}

/**
 * Event metadata
 * 事件元數據
 */
export interface EventMetadata {
  /** 因果來源事件 ID */
  causedBy: string;
  
  /** 觸發用戶 ID */
  causedByUser: string;
  
  /** 觸發動作 */
  causedByAction: string;
  
  /** 時間戳記 */
  timestamp: Timestamp;
  
  /** 多租戶邊界 (blueprintId) */
  blueprintId: string;
  
  /** 版本號 */
  version: number;
}
```

---

### Task 領域事件範例

```typescript
/**
 * Task created event
 * 任務建立事件
 */
export class TaskCreatedEvent implements DomainEvent<TaskCreatedData> {
  id: string;
  aggregateId: string;
  aggregateType = 'Task';
  eventType = 'TaskCreated';
  data: TaskCreatedData;
  metadata: EventMetadata;

  constructor(params: {
    taskId: string;
    title: string;
    description: string;
    assigneeId: string;
    blueprintId: string;
    causedByUser: string;
    causedBy?: string;
  }) {
    this.id = generateEventId();
    this.aggregateId = params.taskId;
    this.data = {
      title: params.title,
      description: params.description,
      assigneeId: params.assigneeId,
      status: 'pending',
      createdAt: Timestamp.now()
    };
    this.metadata = {
      causedBy: params.causedBy || 'USER_ACTION',
      causedByUser: params.causedByUser,
      causedByAction: 'CREATE_TASK',
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId,
      version: 1
    };
  }
}

export interface TaskCreatedData {
  title: string;
  description: string;
  assigneeId: string;
  status: string;
  createdAt: Timestamp;
}
```

---

### Task 狀態變更事件範例

```typescript
/**
 * Task completed event
 * 任務完成事件
 */
export class TaskCompletedEvent implements DomainEvent<TaskCompletedData> {
  id: string;
  aggregateId: string;
  aggregateType = 'Task';
  eventType = 'TaskCompleted';
  data: TaskCompletedData;
  metadata: EventMetadata;

  constructor(params: {
    taskId: string;
    completedBy: string;
    completionNote: string;
    blueprintId: string;
    causedByUser: string;
    causedBy: string;  // 父事件 ID
  }) {
    this.id = generateEventId();
    this.aggregateId = params.taskId;
    this.data = {
      previousStatus: 'in-progress',
      newStatus: 'completed',
      completedBy: params.completedBy,
      completionNote: params.completionNote,
      completedAt: Timestamp.now()
    };
    this.metadata = {
      causedBy: params.causedBy,
      causedByUser: params.causedByUser,
      causedByAction: 'COMPLETE_TASK',
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId,
      version: 1
    };
  }
}

export interface TaskCompletedData {
  previousStatus: string;
  newStatus: string;
  completedBy: string;
  completionNote: string;
  completedAt: Timestamp;
}
```

---

### Payment 領域事件範例

```typescript
/**
 * Payment approved event
 * 支付批准事件
 */
export class PaymentApprovedEvent implements DomainEvent<PaymentApprovedData> {
  id: string;
  aggregateId: string;
  aggregateType = 'Payment';
  eventType = 'PaymentApproved';
  data: PaymentApprovedData;
  metadata: EventMetadata;

  constructor(params: {
    paymentId: string;
    approvedBy: string;
    approvalNote: string;
    blueprintId: string;
    causedByUser: string;
    causedBy: string;  // 例如：TaskCompletedEvent.id
  }) {
    this.id = generateEventId();
    this.aggregateId = params.paymentId;
    this.data = {
      approvedBy: params.approvedBy,
      approvalNote: params.approvalNote,
      approvedAt: Timestamp.now(),
      previousStatus: 'pending',
      newStatus: 'approved'
    };
    this.metadata = {
      causedBy: params.causedBy,
      causedByUser: params.causedByUser,
      causedByAction: 'APPROVE_PAYMENT',
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId,
      version: 1
    };
  }
}

export interface PaymentApprovedData {
  approvedBy: string;
  approvalNote: string;
  approvedAt: Timestamp;
  previousStatus: string;
  newStatus: string;
}
```

---

## 命令模板 (Command Templates)

### 基礎命令結構

```typescript
/**
 * Base command interface
 * 所有命令的基礎介面
 */
export interface Command {
  /** 命令 ID */
  commandId: string;
  
  /** 命令類型 */
  commandType: string;
  
  /** 多租戶邊界 */
  blueprintId: string;
  
  /** 觸發用戶 */
  issuedBy: string;
  
  /** 發出時間 */
  issuedAt: Timestamp;
}
```

---

### Task 命令範例

```typescript
/**
 * Create task command
 * 建立任務命令
 */
export class CreateTaskCommand implements Command {
  commandId: string;
  commandType = 'CreateTask';
  blueprintId: string;
  issuedBy: string;
  issuedAt: Timestamp;

  // 命令資料
  title: string;
  description: string;
  assigneeId: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';

  constructor(params: {
    title: string;
    description: string;
    assigneeId: string;
    blueprintId: string;
    issuedBy: string;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high';
  }) {
    this.commandId = generateCommandId();
    this.blueprintId = params.blueprintId;
    this.issuedBy = params.issuedBy;
    this.issuedAt = Timestamp.now();
    this.title = params.title;
    this.description = params.description;
    this.assigneeId = params.assigneeId;
    this.dueDate = params.dueDate;
    this.priority = params.priority || 'medium';
  }
}
```

---

### Task 狀態變更命令範例

```typescript
/**
 * Complete task command
 * 完成任務命令
 */
export class CompleteTaskCommand implements Command {
  commandId: string;
  commandType = 'CompleteTask';
  blueprintId: string;
  issuedBy: string;
  issuedAt: Timestamp;

  // 命令資料
  taskId: string;
  completionNote: string;
  causedBy?: string;  // 可選：父事件 ID

  constructor(params: {
    taskId: string;
    completionNote: string;
    blueprintId: string;
    issuedBy: string;
    causedBy?: string;
  }) {
    this.commandId = generateCommandId();
    this.blueprintId = params.blueprintId;
    this.issuedBy = params.issuedBy;
    this.issuedAt = Timestamp.now();
    this.taskId = params.taskId;
    this.completionNote = params.completionNote;
    this.causedBy = params.causedBy;
  }
}
```

---

### Payment 命令範例

```typescript
/**
 * Approve payment command
 * 批准支付命令
 */
export class ApprovePaymentCommand implements Command {
  commandId: string;
  commandType = 'ApprovePayment';
  blueprintId: string;
  issuedBy: string;
  issuedAt: Timestamp;

  // 命令資料
  paymentId: string;
  approvalNote: string;
  causedBy: string;  // 必須：觸發此命令的事件 ID

  constructor(params: {
    paymentId: string;
    approvalNote: string;
    blueprintId: string;
    issuedBy: string;
    causedBy: string;
  }) {
    this.commandId = generateCommandId();
    this.blueprintId = params.blueprintId;
    this.issuedBy = params.issuedBy;
    this.issuedAt = Timestamp.now();
    this.paymentId = params.paymentId;
    this.approvalNote = params.approvalNote;
    this.causedBy = params.causedBy;
  }
}
```

---

## 因果鏈範例 (Causality Chain Example)

```typescript
/**
 * 完整因果鏈範例
 * Example: Task → Payment → Issue
 */

// Step 1: 用戶建立任務
const taskCreatedEvent = new TaskCreatedEvent({
  taskId: 'task-001',
  title: '完成設計稿',
  description: '設計新功能的 UI',
  assigneeId: 'user-001',
  blueprintId: 'blueprint-001',
  causedByUser: 'user-admin',
  causedBy: 'USER_ACTION'  // 根事件
});

// Step 2: 任務完成，觸發支付請求
const taskCompletedEvent = new TaskCompletedEvent({
  taskId: 'task-001',
  completedBy: 'user-001',
  completionNote: '已完成所有設計稿',
  blueprintId: 'blueprint-001',
  causedByUser: 'user-001',
  causedBy: taskCreatedEvent.id  // 指向父事件
});

// Step 3: 基於任務完成，批准支付
const approvePaymentCommand = new ApprovePaymentCommand({
  paymentId: 'payment-001',
  approvalNote: '設計稿已驗收',
  blueprintId: 'blueprint-001',
  issuedBy: 'user-admin',
  causedBy: taskCompletedEvent.id  // 因果鏈
});

// Step 4: 支付批准事件
const paymentApprovedEvent = new PaymentApprovedEvent({
  paymentId: 'payment-001',
  approvedBy: 'user-admin',
  approvalNote: '設計稿已驗收',
  blueprintId: 'blueprint-001',
  causedByUser: 'user-admin',
  causedBy: taskCompletedEvent.id  // 因果鏈
});

/**
 * 因果鏈視覺化:
 * 
 * taskCreatedEvent (根)
 *   └─> taskCompletedEvent
 *         └─> paymentApprovedEvent
 */
```

---

## 事件與命令驗證 (Validation)

### 事件驗證器

```typescript
export class EventValidator {
  /**
   * 驗證事件結構
   */
  static validateEvent(event: DomainEvent): ValidationResult {
    const errors: string[] = [];

    if (!event.id) errors.push('Event ID is required');
    if (!event.aggregateId) errors.push('Aggregate ID is required');
    if (!event.eventType) errors.push('Event type is required');
    if (!event.metadata?.blueprintId) errors.push('Blueprint ID is required');
    if (!event.metadata?.causedByUser) errors.push('CausedByUser is required');
    if (!event.metadata?.causedBy) errors.push('CausedBy is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證因果關係
   */
  static validateCausality(event: DomainEvent): CausalityResult {
    // 檢查 causedBy 是否存在於事件庫
    // 檢查是否有循環依賴
    // 檢查 blueprintId 是否一致
    return {
      isValid: true,
      causalChain: []
    };
  }
}
```

### 命令驗證器

```typescript
export class CommandValidator {
  /**
   * 驗證命令結構
   */
  static validateCommand(command: Command): ValidationResult {
    const errors: string[] = [];

    if (!command.commandId) errors.push('Command ID is required');
    if (!command.blueprintId) errors.push('Blueprint ID is required');
    if (!command.issuedBy) errors.push('IssuedBy is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證業務規則
   */
  static validateBusinessRules(command: Command): ValidationResult {
    // 具體業務規則驗證
    return { isValid: true, errors: [] };
  }
}
```

---

## 最佳實踐

### ✅ DO
- 明確的因果元數據 (causedBy, causedByUser)
- 不可變事件（只能新增，不能修改）
- 完整的類型定義
- 版本控制
- 多租戶隔離 (blueprintId)

### ❌ DON'T
- 修改已發布的事件
- 遺漏 blueprintId
- 缺少因果鏈資訊
- 使用可變狀態
- 忽略驗證

---

## 檢查清單

- [ ] 事件包含完整元數據
- [ ] 命令包含 blueprintId
- [ ] 因果鏈正確設定
- [ ] 使用過去式命名事件
- [ ] 使用不定式命名命令
- [ ] 驗證邏輯完整
- [ ] 不可變結構
- [ ] 類型安全

---

**版本**: 1.0 | **更新**: 2026-01-01
