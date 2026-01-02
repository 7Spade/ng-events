# Read Model 與 Projection

> 來源：✨/✨✨✨✨✨✨✨✨✨✨✨✨.md

# 🧠 先講結論（請記）  

> **Event 是寫，Projection 是讀。  
> 寫的世界不管讀的世界怎麼長。**  

這就是 CQRS 的靈魂 💎

---

## 🔥 為什麼需要 Read Model？  

因為 Aggregate 不是給你查的 😾  

```ts
// ❌ 不要這樣用 Aggregate
TaskAggregate.findByAssignee('acc_123')
TaskAggregate.countByStatus('completed')
````

Aggregate 只負責：

* 接受指令 (Command)
* 驗證規則 (Business Rules)
* 產生 Event

**查詢是 Projection 的責任** ✅

---

## 🧩 正確的流程（請照這個）

```
Command → Aggregate → Event
                        ↓
                   Projection
                        ↓
                   Read Model
```

👉 **寫跟讀完全分開**

---

## 🧬 Projection 的正確寫法

### 1️⃣ 定義 Read Model Schema

```ts
interface TaskReadModel {
  taskId: string;
  workspaceId: string;
  title: string;
  status: 'open' | 'completed';
  assigneeAccountId?: string;
  updatedAt: number;
}
```

👉 **專門為查詢設計，不管 Aggregate 怎麼長**

---

### 2️⃣ Event Handler（監聽 Event）

```ts
class TaskProjection {
  constructor(private db: Db) {}

  handleTaskCreated(event: TaskCreatedEvent) {
    this.db.tasks.insert({
      taskId: event.taskId,
      workspaceId: event.metadata.workspaceId,
      title: event.data.title,
      status: 'open',
      updatedAt: event.metadata.timestamp,
    });
  }

  handleTaskCompleted(event: TaskCompletedEvent) {
    this.db.tasks.update(
      { taskId: event.taskId },
      { 
        status: 'completed',
        updatedAt: event.metadata.timestamp,
      }
    );
  }
}
```

👉 **每個 Event 都更新 Read Model，EventHandler 屬於 Projection Service，不碰 Aggregate**

---

### 3️⃣ Query API（讀取用）

```ts
class TaskQueryService {
  constructor(private db: Db) {}

  findByWorkspace(workspaceId: string): TaskReadModel[] {
    return this.db.tasks.find({ workspaceId });
  }
  
  findByAssignee(accountId: string): TaskReadModel[] {
    return this.db.tasks.find({ assigneeAccountId: accountId });
  }
}
```

👉 **查詢只打 Read Model，不碰 Aggregate**

---

## 🧠 Projection 的鐵律

### 1️⃣ Projection 是「純計算」

* 不能發 Event
* 不能呼叫 Aggregate
* 不能做業務判斷

👉 **只能：Event → Read Model**

---

### 2️⃣ Projection 可以重建

```ts
function rebuildTaskProjection(db: Db, eventStore: EventStore) {
  db.tasks.clear();
  eventStore.replayAll('Task')  // replay 某個 Aggregate 或類別的所有事件
    .forEach(event => applyProjection(event));
}
```

👉 **Read Model 壞了？Replay 就好** 😌

---

### 3️⃣ Projection 可以有多個

```ts
TaskListProjection      // 列表查詢
TaskStatsProjection     // 統計數據
TaskHistoryProjection   // 歷史變更
```

👉 **同一份 Event，不同視角的 Read Model**

---

## ❌ 常見錯誤（會搞死自己）

### ❌ 在 Projection 裡做驗證

```ts
on(TaskCompleted, (event) => {
  if (task.status === 'completed') {
    throw new Error('已完成');  // NO!!!
  }
})
```

👉 **Event 已發生，不該在這驗證**

---

### ❌ Projection 直接改 Aggregate

```ts
on(TaskAssigned, (event) => {
  aggregate.state.assignee = event.assignee;  // NO!!!
})
```

👉 **Projection 不碰 Aggregate，只碰 Read Model**

---

## 🧠 一句話總結

> **Aggregate 管真理，
> Projection 管方便。**

寫跟讀分開，Event-Sourcing 才會性感 😼
