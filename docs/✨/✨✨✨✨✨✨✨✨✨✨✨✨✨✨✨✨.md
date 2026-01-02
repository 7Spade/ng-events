---

## 🧠 先給你一句**鐵律（請刻在牆上）**

> **核心永遠不知道 Angular 是什麼**
> **前端永遠不能碰 firebase-admin**

如果哪天有人違反 👉 架構直接打屁屁 🍑

---

## 一、兩套 Firebase SDK 的「身分證」

### 🔥 `@angular/fire`

👉 **前端 SDK（Client SDK 包裝）**

* 只能跑在 **瀏覽器 / Angular**
* 使用者身分（User Token）
* 權限靠 **Security Rules**
* ❌ 不能管理使用者
* ❌ 不能跨帳號
* ❌ 不能繞過規則

👉 適合：

* 查詢任務列表
* 建立使用者自己的 Task
* 即時畫面同步

---

### 🛠️ `firebase-admin`

👉 **後端 SDK（Server / Trusted）**

* 只能跑在 **Node.js（Cloud Run / Functions）**
* Service Account（上帝模式 👑）
* 無視 Security Rules
* 可管理使用者 / 權限 / 批次資料
* 可做事件投遞、Projection、AI pipeline

👉 適合：

* Event Store 寫入
* Projection 建立
* SaaS 權限判斷
* 系統級任務 / AI / 排程

---

## 二、核心要不要用 Firebase？

### ❌ 絕對不可以

```ts
// ❌ core-engine 裡出現這種東西 = 架構爆炸
import { Firestore } from '@angular/fire';
import { admin } from 'firebase-admin';
```

### ✅ 正確姿勢

核心只認得「抽象介面」👇

```ts
// core-engine/event-store/EventStore.ts
export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  load(streamId: string): Promise<DomainEvent[]>;
}
```

**誰實作？**
👉 platform-adapters

---

## 三、你現在這個結構「是對的」，只是要註解清楚 👀

我幫你改成**未來三年都不會混淆**的版本👇

```txt
packages/
├── core-engine/                     # 💎 純核心（零框架、零 Firebase）
│   ├── causality/                   # 因果鏈、Correlation / Causation
│   ├── event-store/                 # Event Store 抽象（interface only）
│   ├── aggregates/                  # Aggregate Root（業務規則）
│   ├── projection/                  # Read Model 定義（不是實作）
│   └── index.ts
│
├── saas-domain/                     # 🏢 SaaS 業務模型（純 TS）
│   ├── task/
│   ├── payment/
│   └── issue/
│
├── platform-adapters/               # 🔧 技術實作（唯一能碰 SDK 的地方）
│   ├── firebase/
│   │   ├── admin/                   # 🛠️【後端】firebase-admin
│   │   │   ├── event-store.adapter.ts   # 實作 EventStore（admin SDK）
│   │   │   ├── projection.adapter.ts    # Projection Builder
│   │   │   └── index.ts
│   │   │
│   │   └── angular-fire/             # 🌐【前端】@angular/fire
│   │       ├── task.query.adapter.ts # Read Model 查詢
│   │       ├── auth.adapter.ts       # 使用者登入狀態
│   │       └── index.ts
│   │
│   ├── auth/
│   │   ├── firebase-admin.adapter.ts # SaaS 權限 / Role / Claim
│   │   └── angular-fire.adapter.ts   # Client-side auth state
│   │
│   ├── notification/
│   │   ├── fcm.adapter.ts
│   │   └── email.adapter.ts
│   │
│   ├── analytics/
│   │   └── ga.adapter.ts
│   │
│   └── ai/
│       ├── genai.adapter.ts
│       └── vertex.adapter.ts
│
└── ui-angular/                      # 💅 Angular UI（只能碰 angular-fire）
    └── src/app/
        ├── features/
        │   ├── task/
        │   └── payment/
        └── adapters/
            └── core-engine.facade.ts # 用「Facade」呼叫核心
```

---

## 四、誰用誰？一句話速查表 🧾

| 位置                                      | 能用什麼           | 不能用什麼                |
| --------------------------------------- | -------------- | -------------------- |
| core-engine                             | TypeScript     | ❌ firebase / angular |
| saas-domain                             | TypeScript     | ❌ SDK                |
| platform-adapters/firebase/admin        | firebase-admin | ❌ @angular/fire      |
| platform-adapters/firebase/angular-fire | @angular/fire  | ❌ firebase-admin     |
| ui-angular                              | @angular/fire  | ❌ admin              |

---

## 五、一句讓你未來帶人超帥的話 😏

> **@angular/fire 是「使用者視角」**
> **firebase-admin 是「系統視角」**
> **核心只管「世界的規則」**
