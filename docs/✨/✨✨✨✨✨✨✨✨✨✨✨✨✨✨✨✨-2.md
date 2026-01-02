```
Event-Sourced + Causality Flow 🔄

💅 UI Angular
   │
   │  發起 Command
   ▼
🌐 AngularFire Adapter (前端)
   │
   │  查詢 Projection / AuthState
   ▼
💎 Core Engine (Aggregates / Projection / Causality)
   │
   │  處理事件 / 更新 Projection
   ▼
⚡ Firebase Admin Adapter (Functions)
   │
   │  EventStore / Projection / Notification / AI
   └─> 新事件回 Core Engine
       │
       ▼
💅 UI Angular 更新畫面
```

### 🔑 標註：

* 💅 UI Angular → 前端 Angular App / Facade
* 🌐 AngularFire Adapter → 前端讀取 Projection / Auth
* 💎 Core Engine → 純業務邏輯，Aggregate / Projection / Causality
* ⚡ Firebase Admin Adapter → 後端 Functions / Admin SDK / Notification / AI
* 🔄 循環 → Command → Aggregate → Projection → UI

---

```
🌟 Monorepo + Firebase + Event Flow 全景圖 🔄

💅 UI Angular Layer (Hosting)
┌───────────────────────────────┐
│ ui-angular/                   │
│ ├─ src/app/features/          │
│ │    ├─ task/                 │
│ │    └─ payment/              │
│ └─ adapters/core-engine.facade.ts
└───────────────────────────────┘
       │  發起 Command (Create/Assign/Complete)
       ▼
🌐 Platform Adapters - Frontend (AngularFire) 🌐
┌───────────────────────────────┐
│ platform-adapters/firebase/   │
│ └─ angular-fire/              │
│      ├─ TaskQueryAdapter      │
│      └─ AuthStateAdapter      │
└───────────────────────────────┘
       │ 查詢 Projection / AuthState
       ▼
💎 Core Engine / Domain Layer 💎
┌───────────────────────────────┐
│ core-engine/                  │
│ ├─ aggregates/                │
│ ├─ causality/                 │
│ ├─ event-store/               │
│ └─ projection/                │
└───────────────────────────────┘
       │ 處理事件 / 更新 Projection
       ▼
⚡ Platform Adapters - Backend / Functions ⚡
┌───────────────────────────────┐
│ platform-adapters/firebase/   │
│ └─ admin/                     │
│      ├─ EventStoreAdapter     │
│      └─ ProjectionAdapter     │
│ platform-adapters/auth/firebase-admin
│ platform-adapters/notification
│ platform-adapters/ai
└───────────────────────────────┘
       │ 產生新事件 → 回到 Core Engine / Projection 更新
       ▼
💅 UI Angular Layer 更新畫面
```

### 🔑 Package ↔ Build / Deploy 對應表

| Package                                    | Build / Deploy            | Notes                       |
| ------------------------------------------ | ------------------------- | --------------------------- |
| core-engine 💎                             | tsc → dist                | 純業務邏輯，無 SDK                 |
| saas-domain 🏢                             | tsc → dist                | 純 TS 業務模型                   |
| platform-adapters/admin ⚡                  | tsc → dist → Functions    | Firebase Admin SDK 後端處理事件   |
| platform-adapters/auth/firebase-admin ⚡    | tsc → dist → Functions    | SaaS 權限 / Role / Claim      |
| platform-adapters/notification ⚡           | tsc → dist → Functions    | FCM / Email                 |
| platform-adapters/ai ⚡                     | tsc → dist → Functions    | GenAI / Vertex AI           |
| platform-adapters/firebase/angular-fire 🌐 | ts → 隨前端打包                | 前端查詢 Projection / AuthState |
| platform-adapters/auth/angular-fire 🌐     | ts → 隨前端打包                | 前端登入狀態                      |
| ui-angular 💅                              | ng build → dist → Hosting | UI 前端，透過 facade 呼叫 adapters |

---

### 🔄 小結

1. UI 只跟 **facade + adapters** 互動
2. 所有業務邏輯都在 **core-engine + saas-domain**
3. Firebase Functions ⚡ 處理事件、通知、AI 等
4. 前端 AngularFire 🌐 查詢 Projection / AuthState
5. 事件循環清楚：Command → Aggregate → Projection → UI

---

```
💅 UI Angular
   │  發起 Command
   ▼
🌐 AngularFire Adapter (前端)
   │  查詢 Projection / Auth
   ▼
💎 Core Engine (Aggregates / Projection / Causality)
   │  處理事件 / 更新 Projection
   ▼
⚡ Firebase Admin Adapter (Functions)
   │  EventStore / Projection / Notification / AI
   └─> 新事件回 Core Engine
       │
       ▼
💅 UI Angular 更新畫面
```

### 🔑 標註：

* 💅 UI Angular → 前端 App / Facade
* 🌐 AngularFire Adapter → 前端讀取 Projection / Auth
* 💎 Core Engine → 純業務邏輯，Aggregate / Projection / Causality
* ⚡ Firebase Admin Adapter → 後端 Functions / Admin SDK / Notification / AI
* 🔄 循環 → Command → Aggregate → Projection → UI

---
