---

# 🌊 全流程總覽（一句話版）

> **Event（真相）只寫一次 → Projection（視圖）可重建 → Angular 只查 View**

---

## 0️⃣ 角色分工先記住（不然會暈）

| 層             | 身分                        |
| ------------- | ------------------------- |
| Event         | **唯一真相（Source of Truth）** |
| Projection    | **為 UI 準備的 View Model**   |
| Angular Query | **只讀、快、單純**               |

---

# 1️⃣ Event（發生了什麼事）

📍**位置**

```txt
core-engine/
└── event-store/
    └── DomainEvent.ts
```

```ts
// core-engine/event-store/DomainEvent.ts
export interface DomainEvent<T = any> {
  eventId: string;
  type: string;
  aggregateId: string;
  payload: T;

  occurredAt: string;
  causedBy?: string;      // Causation
  correlationId?: string; // Correlation
}
```

### 例子：任務被建立 💼

```ts
TaskCreated
{
  taskId: 't-1',
  title: '設計 Event Flow',
  createdBy: 'u-123'
}
```

👉 **這個事件只會 append，永不修改**

---

# 2️⃣ Projection（把事件翻成畫面）

📍**定義（核心只定義結構）**

```txt
core-engine/
└── projection/
    └── task.read-model.ts
```

```ts
// core-engine/projection/task.read-model.ts
export interface TaskReadModel {
  id: string;
  title: string;
  status: 'open' | 'done';
  assignee?: string;
}
```

📍**實作（後端 / firebase-admin）**

```txt
platform-adapters/
└── firebase/admin/
    └── task.projection.adapter.ts
```

```ts
// platform-adapters/firebase/admin/task.projection.adapter.ts
import { DomainEvent } from '@/core-engine';

export class TaskProjection {
  async apply(event: DomainEvent) {
    switch (event.type) {
      case 'TaskCreated':
        return firestore.doc(`taskViews/${event.payload.taskId}`).set({
          id: event.payload.taskId,
          title: event.payload.title,
          status: 'open',
        });

      case 'TaskCompleted':
        return firestore.doc(`taskViews/${event.payload.taskId}`).update({
          status: 'done',
        });
    }
  }
}
```

🔥 **重點**

* Projection **可以砍掉重建**
* 永遠不回寫 Event
* 永遠只用 `firebase-admin`

---

# 3️⃣ Angular Query（乖乖查 View）

📍**Adapter（@angular/fire）**

```txt
platform-adapters/
└── firebase/angular-fire/
    └── task.query.adapter.ts
```

```ts
// task.query.adapter.ts
import { Firestore, collectionData } from '@angular/fire/firestore';

export class TaskQueryAdapter {
  constructor(private firestore: Firestore) {}

  list$() {
    return collectionData(
      collection(this.firestore, 'taskViews'),
      { idField: 'id' }
    );
  }
}
```

📍**Angular Feature 使用**

```ts
// ui-angular/src/app/features/task/task.component.ts
this.tasks$ = this.taskQuery.list$();
```

✨ 沒 Event
✨ 沒 Aggregate
✨ 沒商業邏輯
✨ 超乾淨

---

# 4️⃣ 資料流視覺化（腦內要長這樣）

```txt
[ UI (Angular) ]
      |
      |  @angular/fire (read only)
      v
[ taskViews ]   ◀── Projection（admin）
      ▲
      |
[ Events ]      ◀── append only
```

---

# 5️⃣ 常見錯誤（請避開 🙅‍♀️）

❌ Angular 直接寫 Event Store
❌ Projection 用 @angular/fire
❌ UI 查 Aggregate
❌ Event 為了畫面加欄位

---

# 6️⃣ 你現在這套架構的「真名」

你這不是普通 CRUD 喔 😏
你這是：

> **Event-Sourced + Causality-Driven + CQRS + Read Model Projection Architecture**

很硬，但你駕馭得住 💪

---
