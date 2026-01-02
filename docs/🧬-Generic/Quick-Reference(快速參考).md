# Quick Reference (快速參考)

**泛型模式速查指南 - 5 分鐘掌握核心概念**

## 🎯 核心泛型模式 (T/I/S)

```typescript
AggregateRoot<TEvent, TId, TState>
                │      │     │
                │      │     └─ State/Snapshot (聚合狀態)
                │      └─ ID/Identifier (聚合 ID)
                └─ Type/Event (事件型別)
```

## 📝 泛型縮寫速查表

| 縮寫 | 含義 | 使用場景 | 範例 |
|------|------|----------|------|
| **T** | Type/Event | 事件型別、通用型別 | `TEvent = AccountEvent` |
| **I** | ID/Identifier | 聚合 ID | `TId = string` |
| **S** | State/Snapshot | 聚合狀態 | `TState = AccountState` |
| **P** | Payload/Parameter | 事件負載 | `TPayload = { email, name }` |
| **E** | Element/Event | 集合元素 | `TElement = DomainEvent` |
| **K** | Key | 物件鍵 | `K extends keyof T` |
| **V** | Value | 物件值 | `V = T[K]` |
| **R** | Result/Return | 返回值 | `TReturn = Promise<void>` |
| **C** | Context/Config | 環境配置 | `TContext = AppContext` |
| **A** | Args/Array | 參數/陣列 | `TArgs = [string, number]` |
| **U** | Union/UpperBound | 聯合/上界 | `T extends U` |
| **M** | Map/Metadata | 映射/元資料 | `TMetadata = CausalityMetadata` |
| **X** | Exception/Extra | 異常/擴展 | `TExtra = { userId }` |
| **F** | Function/Factory | 函數/工廠 | `TFactory = () => T` |

## 🏗️ 常用模式速查

### 1. 定義聚合 (Aggregate)

```typescript
class Account extends AggregateRoot<
  AccountEvent,   // TEvent
  string,         // TId
  AccountState    // TState
> {
  readonly id: string;
  readonly type = 'Account';
  
  static create(params: CreateParams): Account { /* ... */ }
  static fromEvents(id: string, events: AccountEvent[]): Account { /* ... */ }
  protected applyEvent(event: AccountEvent): void { /* ... */ }
}
```

### 2. 定義事件 (Events)

```typescript
interface AccountCreated extends DomainEvent<
  AccountCreatedPayload,  // TPayload
  string,                 // TId
  CausalityMetadata      // TMetadata
> {
  eventType: 'AccountCreated';
  aggregateType: 'Account';
}

type AccountEvent = AccountCreated | AccountUpdated | AccountDeleted;
```

### 3. 定義倉儲 (Repository)

```typescript
interface AccountRepository extends Repository<Account> {
  findByEmail(email: string): Promise<Account | null>;
  findActive(): Promise<Account[]>;
}
```

### 4. 定義 Saga (Long Transaction)

```typescript
class WorkspaceCreationSaga extends Saga<
  WorkspaceSagaEvent,  // TEvent
  string,              // TAggregateId
  WorkspaceSagaState   // TState
> {
  async handleEvent(event: WorkspaceSagaEvent): Promise<void> { /* ... */ }
  protected applyEvent(event: WorkspaceSagaEvent): void { /* ... */ }
}
```

## 🔗 依賴流向圖

```
core-engine (泛型基礎)
    ↑
account-domain / saas-domain (領域實作)
    ↑
platform-adapters (Firestore, Auth)
    ↑
ui-angular (UI & 指令調度)
```

**規則**: 內層不依賴外層，外層可依賴內層

## ⚡ 事件流範例

```
AccountCreated
    ↓ (因果鏈)
WorkspaceCreated
    ↓
ModuleInitialized
    ↓
EntityCreated
```

每個事件包含 `causedBy` 指向父事件 ID

## 🎨 決策樹

**何時使用哪種泛型？**

```
需要定義聚合?
├─ Yes → AggregateRoot<TEvent, TId, TState>
│         └─ TEvent: 聚合的事件型別
│         └─ TId: 通常是 string
│         └─ TState: 聚合內部狀態
│
需要定義事件?
├─ Yes → DomainEvent<TPayload, TId, TMetadata>
│         └─ TPayload: 事件攜帶的資料
│         └─ TId: 聚合 ID 型別
│         └─ TMetadata: CausalityMetadata
│
需要查詢資料?
├─ Yes → Repository<TAggregate>
│         └─ TAggregate: 聚合型別
│
需要跨聚合協調?
└─ Yes → Saga<TEvent, TAggregateId, TState>
          └─ TEvent: Saga 處理的事件聯合
          └─ TAggregateId: Saga 實例 ID
          └─ TState: Saga 狀態
```

## 📋 快速檢查清單

**實作新聚合時**:
- [ ] 定義事件型別 (TEvent)
- [ ] 定義狀態型別 (TState)
- [ ] 實作 `applyEvent` 方法
- [ ] 創建工廠方法 (`create`, `fromEvents`)
- [ ] 私有建構子
- [ ] 包含因果元資料
- [ ] 編寫單元測試

**實作新事件時**:
- [ ] 定義負載型別 (Payload)
- [ ] 使用過去式命名
- [ ] 包含 `eventType` 和 `aggregateType`
- [ ] 添加到事件聯合型別
- [ ] 實作型別守衛
- [ ] 包含完整因果元資料

## 🚨 常見錯誤

| 錯誤 | 正確做法 |
|------|----------|
| ❌ 直接暴露 `state` | ✅ 使用 `protected state` + getter |
| ❌ 建構子中發起事件 | ✅ 工廠方法中發起事件 |
| ❌ 缺少因果元資料 | ✅ 包含 `causedBy`, `causedByUser`, `causedByAction` |
| ❌ 事件名稱用現在式 | ✅ 使用過去式 (`Created` 而非 `Create`) |
| ❌ 在 `applyEvent` 執行副作用 | ✅ `applyEvent` 只更新狀態 |

## 📚 完整文件連結

- **詳細實施計畫**: [泛型骨架實施計畫](../📌-plans/泛型骨架實施計畫.md)
- **縮寫清單**: [泛型縮寫清單](../泛型縮寫清單.md)
- **程式碼範本**:
  - [AggregateRoot Template](./AggregateRoot-Template.ts)
  - [DomainEvent Template](./DomainEvent-Template.ts)
  - [Repository Template](./Repository-Template.ts)
  - [Saga Template](./Saga-Template.ts)

## 💡 實用技巧

### 1. 型別推導
```typescript
// 讓 TypeScript 自動推導 TId
class Account extends AggregateRoot<
  AccountEvent,
  AccountEvent['aggregateId'],  // 自動推導為 string
  AccountState
> { }
```

### 2. 事件工廠模式
```typescript
function createAccountCreatedEvent(params: CreateParams): AccountCreated {
  return {
    id: generateEventId(),
    aggregateId: params.id,
    eventType: 'AccountCreated',
    aggregateType: 'Account',
    data: params,
    metadata: createCausalityMetadata(params),
  };
}
```

### 3. 記憶體倉儲測試
```typescript
class InMemoryAccountRepository implements AccountRepository {
  private store = new Map<string, AccountEvent[]>();
  
  async save(account: Account): Promise<void> {
    const events = account.getUncommittedEvents();
    this.store.set(account.id, events);
    account.clearUncommittedEvents();
  }
}
```

---

**更新日期**: 2026-01-02  
**版本**: 1.0.0  
**維護**: ng-events 核心團隊

// END OF FILE
