# Event Store 設計

> 來源：✨/✨✨✨✨✨✨✨✨✨✨✨✨✨.md (Part 1/2)

# 🧠 先給結論（請記）

> **Event Store 不是一般資料庫，  
> 是「歷史真相的唯一來源」。**  

所有狀態都能從 Event 重算 🔥

---

## 🔥 Event Store 的唯一職責

只做三件事：

1. **Append（只寫入，不修改）**  
2. **Read（依 Aggregate 讀取）**  
3. **Replay（重放事件流）**

❌ 不查詢、不統計、不做複雜條件  
✅ 只存、只讀、只重放

---

## 🧬 Event Store 的 TypeScript 介面

```ts
export interface EventStore {
  append(event: DomainEvent): Promise<void>;

  // 依 Aggregate 取得事件
  getEvents(
    aggregateId: string,
    fromVersion?: number
  ): Promise<DomainEvent[]>;

  // 重放事件流，可選篩選事件類型與 workspace
  replay(
    eventTypes?: string[],
    workspaceId?: string
  ): AsyncIterable<DomainEvent>;
}
````

👉 **介面簡單，威力無窮**

---

## 🧠 Aggregate 如何從 Event 重建

```ts
interface TaskState {
  taskId: string;
  status: 'open' | 'completed';
  title?: string;
  assigneeId?: string;
}

class TaskAggregate {
  private state: TaskState = { taskId: '', status: 'open' };
  private version: number = 0;

  static replayFrom(events: DomainEvent[]): TaskAggregate {
    const aggregate = new TaskAggregate();

    for (const event of events) {
      aggregate.apply(event);
      aggregate.version++;
    }

    return aggregate;
  }

  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'TaskCreated':
        this.state = { ...this.state, ...event.data };
        break;

      case 'TaskCompleted':
        this.state.status = 'completed';
        break;

      case 'TaskAssigned':
        this.state.assigneeId = event.data.assigneeId;
        break;
    }
  }

  getState() {
    return this.state;
  }

  getVersion() {
    return this.version;
  }
}
```

👉 **狀態 = Event 序列的函數，version 支援快照與並發控制**

---

## 🔥 Event Store 的威力

### 1️⃣ Time Travel

```ts
// 查任意時間點的狀態
const pastEvents = await eventStore.getEvents('task_123');
const targetEvents = pastEvents.filter(e => e.metadata.timestamp <= targetTime);
const pastState = TaskAggregate.replayFrom(targetEvents).getState();
```

👉 **歷史狀態隨時可重現**

---

### 2️⃣ Audit Trail

```ts
for await (const e of eventStore.replay()) {
  console.log(`${e.eventType} by ${e.metadata.causedByUser} at ${e.metadata.timestamp}`);
}
```

👉 **每個變化都有因果可查**

---

### 3️⃣ 隨時重建 Read Model

```ts
for await (const event of eventStore.replay()) {
  updateReadModel(event); // Projection 層負責
}
```

👉 **Read Model 壞了隨時可重建**

---

## ❌ 常見錯誤（會毀系統）

### ❌ 修改已存 Event

```ts
await eventStore.update(eventId, { ... }); // ❌ NO!!!
```

👉 **Event immutable，只能 append**

---

### ❌ 刪除 Event

```ts
await eventStore.delete(eventId); // ❌ NO!!!
```

👉 **要撤銷就發 Compensation Event**

```ts
TaskCompleted → TaskReopened
```

---

### ❌ 把 Event Store 當 Query DB

```ts
await eventStore.findTasksByStatus('completed'); // ❌ NO!!!
```

👉 **查詢請用 Read Model / Projection**
