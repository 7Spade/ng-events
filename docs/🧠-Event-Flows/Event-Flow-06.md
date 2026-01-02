---

# 🔐 一、Admin-only Projection Rebuild 流程

## 🎯 核心原則（請先定錨）

> **Rebuild 是「基礎設施級權力」
> 不屬於 Domain
> 不屬於 UI
> 只屬於 Admin / Ops**

所以它一定要同時滿足：

* 🔒 不可被一般使用者觸發
* 🧾 有 Audit Log
* 🔁 可重跑、可中斷、可恢復
* ❌ 永遠不從前端直接呼叫

---

## 🧱 架構分層（非常重要）

```txt
platform-adapters/
└── firebase/
    └── admin/
        ├── rebuild/
        │   ├── rebuild-workspace.ts
        │   ├── rebuild-account.ts
        │   └── rebuild-all.ts
        ├── cli/
        │   └── rebuild.ts
        └── audit/
            └── rebuild-log.ts
```

👉 **Rebuild 是 Infra，不是 Domain**

---

## 🔑 觸發方式（只選一種就好）

### ✅ 最推薦：Node CLI（Firebase Admin SDK）

```bash
node rebuild.js workspace ws_456
node rebuild.js account acc_123
node rebuild.js all
```

✔ 不暴露 API
✔ 不依賴 Auth
✔ Ops / Dev 專用
✔ 最安全

---

## 🧠 Rebuild 核心流程（標準化）

### ① 驗證 Admin 身分（硬編或 IAM）

```ts
assert(process.env.REBUILD_SECRET === input.secret);
```

或：

```ts
assert(currentServiceAccount.hasRole('rebuild-admin'));
```

👉 **不要相信 Firebase Auth claims**
👉 Rebuild ≠ 使用者行為

---

### ② 建立 Rebuild Job（可觀測）

📍 `/admin-jobs/{jobId}`

```json
{
  "jobId": "rebuild_ws_456",
  "type": "RebuildWorkspace",
  "targetId": "ws_456",
  "status": "running",
  "startedAt": "2026-01-02T15:00:00Z"
}
```

👉 UI / Ops 可以看進度
👉 出事不會慌

---

### ③ 清除舊 Projection（只清 Result）

```ts
delete /workspaces/ws_456
delete /modules/ws_456_*
delete /memberships/ws_456_*
delete /tasks where workspaceId == ws_456 (optional)
```

⚠️ **永遠不動 Event Store**

---

### ④ Replay Events（核心）

```ts
events = loadEvents({
  aggregateId: ws_456
});

for (event of events) {
  upcast(event);
  applyProjection(event);
}
```

👉 **apply = 純函數**
👉 **寫入 = idempotent**

---

### ⑤ 標記完成 / 失敗

```json
{
  "status": "completed",
  "completedAt": "2026-01-02T15:02:10Z"
}
```

或：

```json
{
  "status": "failed",
  "error": "InvalidEventVersion"
}
```

---

## 🧾 Audit Log（不能少）

📍 `/admin-audit/{auditId}`

```json
{
  "action": "RebuildWorkspace",
  "targetId": "ws_456",
  "triggeredBy": "service-account",
  "timestamp": "2026-01-02T15:00:00Z"
}
```

👉 這是你未來救命用的 😌

---

# 🧬 二、Event Versioning / Upcasting（重點中的重點）

這一段我會幫你**定一個「不後悔模型」**。

---

## 🎯 為什麼一定要 Versioning？

因為你一定會遇到：

* event payload 改欄位
* 命名修正
* 新需求補資料
* 老事件要能 replay

👉 **沒有版本 = 不敢 replay**

---

## 🧱 Event 基本格式（請照這個）

```ts
interface DomainEvent {
  eventId: string;
  type: string;
  version: number;
  payload: unknown;
  occurredAt: string;
  causationId?: string;
  correlationId?: string;
}
```

👉 **version 是 event 自己的**
👉 不是 schema version
👉 不是 app version

---

## 📌 範例：WorkspaceCreated v1 → v2

### v1（舊）

```json
{
  "type": "WorkspaceCreated",
  "version": 1,
  "payload": {
    "workspaceId": "ws_456",
    "accountId": "acc_123"
  }
}
```

### v2（新）

```json
{
  "type": "WorkspaceCreated",
  "version": 2,
  "payload": {
    "workspaceId": "ws_456",
    "accountId": "acc_123",
    "createdBy": "user_1"
  }
}
```

---

## 🔁 Upcaster 設計（關鍵）

> **Upcast = 把舊事件「翻譯」成新語言**

```ts
function upcast(event: DomainEvent): DomainEvent {
  if (event.type === 'WorkspaceCreated' && event.version === 1) {
    return {
      ...event,
      version: 2,
      payload: {
        ...event.payload,
        createdBy: 'system'
      }
    };
  }

  return event;
}
```

🔥 重點規則：

* ❌ 不修改 Event Store
* ❌ 不補寫回
* ✅ 只在 Replay / Projection 時轉換

---

## 🧠 Upcaster 結構（可維護）

```txt
event-upcasters/
├── workspace-created.upcaster.ts
├── account-created.upcaster.ts
└── index.ts
```

```ts
export function upcast(event: DomainEvent): DomainEvent {
  return workspaceUpcaster(
    accountUpcaster(event)
  );
}
```

👉 像 middleware
👉 可疊加
👉 可測試

---

## 🧪 Upcasting 測試（一定要）

```ts
it('upcasts WorkspaceCreated v1 → v2', () => {
  const v1 = { type: 'WorkspaceCreated', version: 1, payload: {...} };
  const v2 = upcast(v1);

  expect(v2.version).toBe(2);
  expect(v2.payload.createdBy).toBeDefined();
});
```

👉 **Replay 的穩定性 = 你的膽量**

---

## 🧷 最後一句（這是金句）

> **Admin Rebuild 是「後悔藥」
> Event Versioning 是「時間機器」
> 兩個都有，你才敢往前走**

你現在這套系統已經是：

* 真正可營運
* 真正可進化
* 真正不怕歷史包袱
