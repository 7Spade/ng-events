---

# 🧠 先一句話理解（超重要）

> **Correlation = 這一串是在「同一個故事」裡**
> **Causation = 這件事是「被哪一件事觸發」的**

---

## 1️⃣ 兩個欄位長什麼樣

```ts
DomainEvent {
  eventId: string;          // 自己是誰
  type: string;

  correlationId: string;    // 同一條故事線
  causedBy?: string;        // 上一個事件是誰生的我
}
```

---

## 2️⃣ 真實世界比喻（最好懂 💋）

### 🧩 Correlation（故事編號）

> 「使用者點了『完成任務』」

這個動作會引發：

* TaskCompleted
* PointsGranted
* NotificationSent

👉 **全部 correlationId 一樣**

---

### 🧬 Causation（血緣關係）

```txt
UserClickedComplete
   └── TaskCompleted
         └── PointsGranted
               └── NotificationSent
```

👉 每一個事件都知道：

> 「我是被誰生出來的」

---

## 3️⃣ 你系統中實際怎麼流 🔥

### 🎬 Step 1：UI 發出 Command

```ts
CompleteTaskCommand {
  taskId: 't-1',
  userId: 'u-123',
  correlationId: uuid()
}
```

> ⚠️ Command 本身不是 Event
> 它只是「想做什麼」

---

### 🎬 Step 2：Aggregate 產生第一個 Event

```ts
TaskCompleted {
  eventId: 'e-101',
  aggregateId: 't-1',

  correlationId: cmd.correlationId,
  causedBy: cmd.commandId
}
```

🫦 **第一顆事件**

* correlation：整條故事線
* causation：來自 command

---

### 🎬 Step 3：Policy / Process Manager 接手

```ts
if (event.type === 'TaskCompleted') {
  emit(new PointsGranted({
    causedBy: event.eventId,
    correlationId: event.correlationId
  }));
}
```

🔥 現在開始長出血緣關係了

---

## 4️⃣ 事件鍊實際長這樣（你會愛上）

```txt
Command: CompleteTask
  │
  ▼
Event e-1: TaskCompleted
  correlationId: C-777
  causedBy: cmd-1

Event e-2: PointsGranted
  correlationId: C-777
  causedBy: e-1

Event e-3: NotificationSent
  correlationId: C-777
  causedBy: e-2
```

---

## 5️⃣ 為什麼你「一定要」這樣做

### 🐞 Debug 時你會跪著感謝自己

* 一鍵追整條事件鏈
* 找出是哪個 policy 出包

### 🔁 Projection 可重播、可驗證

* 重播某 correlationId
* 測試整個流程是不是 deterministic

### 🤖 AI / Automation 超好餵

* AI 可以理解「行為脈絡」
* 不是單點事件亂猜

---

## 6️⃣ 放在哪？（這點很多人會錯）

### ✅ 屬於 **core-engine**

```txt
core-engine/
└── causality/
    ├── correlation.ts
    ├── causation.ts
    └── context.ts
```

```ts
export class CausalityContext {
  correlationId: string;
  causedBy?: string;
}
```

👉 **不是 Firebase 的事**
👉 **不是 Angular 的事**

---

## 7️⃣ 一句很騷但很準的總結 😏

> **Event 是「發生了什麼」**
> **Causation 是「誰害的」**
> **Correlation 是「這整齣戲的劇名」**
