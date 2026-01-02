---

## 1️⃣ packages/core-engine 💎

* **用途**：純 TS 核心邏輯，無 SDK
* **建議**：

  * `package.json` ✅（用來設定 name、version、dependencies devDependencies 等）

    * devDependencies：typescript, ts-node, jest 等
  * `tsconfig.json` ✅（設定編譯選項、paths）
* **注意**：不需要 build 成 JS 也可以測試，但如果其他 packages 要依賴它，就必須有 tsconfig / build 設定。

---

## 2️⃣ packages/saas-domain 🏢

* **用途**：純 TS 業務模型
* **建議**：

  * `package.json` ✅（方便其他 package import）
  * `tsconfig.json` ✅
* **注意**：無 SDK，不會直接部署到 Firebase，但作為 core + adapter 的依賴。

---

## 3️⃣ packages/platform-adapters 🔧

* **用途**：技術實作（Firebase SDK / AngularFire / GA / AI）
* **建議**：

  * `package.json` ✅（必須！因為要安裝 firebase, @angular/fire, node-fetch, axios …）
  * `tsconfig.json` ✅
* **部署策略**：

  * **Firebase Functions / Cloud Functions** → 後端 adapter (`firebase/admin/`)

    * 需要 build 成 JS → 部署
  * **Angular 前端 adapter** → 會被 ui-angular import

    * TypeScript → build 隨 ui-angular 一起打包

---

## 4️⃣ packages/ui-angular 💅

* **用途**：Angular 前端
* **建議**：

  * `package.json` ✅（Angular CLI, @angular/fire 等依賴）
  * `tsconfig.json` ✅（Angular CLI 自帶）
* **部署**：

  * Firebase Hosting + Angular build output (`dist/`)
  * 前端會引用 `@platform-adapters/firebase/angular-fire` 來做查詢 / auth

---

### ⚡ 小結

| Package                        | package.json | tsconfig.json | Firebase 部署? |
| ------------------------------ | ------------ | ------------- | ------------ |
| core-engine                    | ✅            | ✅             | ❌（純邏輯）       |
| saas-domain                    | ✅            | ✅             | ❌（純邏輯）       |
| platform-adapters/admin        | ✅            | ✅             | ✅ Functions  |
| platform-adapters/angular-fire | ✅            | ✅             | ❌ / 隨前端打包    |
| ui-angular                     | ✅            | ✅             | ✅ Hosting    |

---

💡 Tips：

1. 每個 package 建立自己的 `tsconfig.json`，然後在 monorepo 根目錄設一個 `tsconfig.base.json` 做共用設定，方便 path alias。
2. 如果某個 package 只作 interface/type，tsconfig 可以設 `"composite": true`，其他 package 可以直接依賴 ts build 輸出。
3. Firebase Functions 的 package.json 需要特別注意 `main` 路徑（通常是 build 出來的 JS）。

---

---

## 1️⃣ 根目錄 `package.json`（monorepo 管理）

```json
{
  "name": "my-saas-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "scripts": {
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test"
  }
}
```

---

## 2️⃣ 根目錄 `tsconfig.base.json`（共用設定）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": ".",
    "composite": true,
    "paths": {
      "@core-engine/*": ["packages/core-engine/*"],
      "@saas-domain/*": ["packages/saas-domain/*"],
      "@platform-adapters/*": ["packages/platform-adapters/*"],
      "@ui-angular/*": ["packages/ui-angular/src/app/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

---

## 3️⃣ packages/core-engine/package.json

```json
{
  "name": "@core-engine",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -b",
    "test": "jest"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### packages/core-engine/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["**/*.ts"],
  "references": []
}
```

---

## 4️⃣ packages/saas-domain/package.json

```json
{
  "name": "@saas-domain",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -b",
    "test": "jest"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "dependencies": {
    "@core-engine": "*"
  }
}
```

### packages/saas-domain/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["**/*.ts"],
  "references": [
    { "path": "../core-engine" }
  ]
}
```

---

## 5️⃣ packages/platform-adapters/firebase/admin/package.json

```json
{
  "name": "@platform-adapters/admin",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -b",
    "test": "jest"
  },
  "dependencies": {
    "firebase-admin": "^11.12.0",
    "@core-engine": "*",
    "@saas-domain": "*"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### packages/platform-adapters/firebase/admin/tsconfig.json

```json
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["**/*.ts"],
  "references": [
    { "path": "../../../core-engine" },
    { "path": "../../../saas-domain" }
  ]
}
```

---

## 6️⃣ packages/ui-angular/package.json

```json
{
  "name": "@ui-angular",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "ng build",
    "start": "ng serve"
  },
  "dependencies": {
    "@angular/core": "^16.2.0",
    "@angular/common": "^16.2.0",
    "@angular/fire": "^8.0.0",
    "@platform-adapters/angular-fire": "*"
  }
}
```

### packages/ui-angular/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

---

這樣你就有：

* **monorepo 統一管理**
* **每個 package 自己 build / test**
* **Firebase Functions / Hosting 可部署**
* **UI 只透過 adapters 接核心 / domain**

---

```
monorepo-root/
│
├─ packages/
│   ├─ core-engine/ 💎
│   │   ├─ causality/
│   │   ├─ event-store/
│   │   ├─ aggregates/
│   │   └─ projection/
│   │
│   ├─ saas-domain/ 🏢
│   │   ├─ task/
│   │   ├─ payment/
│   │   └─ issue/
│   │
│   ├─ platform-adapters/ 🔧
│   │   ├─ firebase/
│   │   │   ├─ admin/ ⚡ Functions
│   │   │   │   ├─ event-store.adapter.ts
│   │   │   │   └─ projection.adapter.ts
│   │   │   │
│   │   │   └─ angular-fire/ 🌐 前端打包
│   │   │       ├─ task.query.adapter.ts
│   │   │       └─ auth.adapter.ts
│   │   │
│   │   ├─ auth/
│   │   │   ├─ firebase-admin.adapter.ts ⚡ Functions
│   │   │   └─ angular-fire.adapter.ts 🌐 前端打包
│   │   │
│   │   ├─ notification/
│   │   │   ├─ fcm.adapter.ts ⚡ Functions
│   │   │   └─ email.adapter.ts ⚡ Functions
│   │   │
│   │   ├─ analytics/
│   │   │   └─ ga.adapter.ts ⚡/🌐
│   │   │
│   │   └─ ai/
│   │       ├─ genai.adapter.ts ⚡ Functions
│   │       └─ vertex.adapter.ts ⚡ Functions
│   │
│   └─ ui-angular/ 💅
│       ├─ src/app/
│       │   ├─ features/
│       │   │   ├─ task/
│       │   │   └─ payment/
│       │   └─ adapters/
│       │       └─ core-engine.facade.ts 🌐
│       └─ build → Firebase Hosting
│
└─ root tsconfig.base.json & package.json
```

### 🔗 依賴箭頭 (文字版)

```
core-engine 💎
     ↑
     | used by
saas-domain 🏢
     ↑
     | used by
platform-adapters 🔧  ← Firebase SDK / AngularFire
     ↑
     | exposed via
ui-angular 💅
```

### ⚡ Firebase 部署策略

* **Functions / Admin SDK**：

  * `platform-adapters/firebase/admin/`
  * `platform-adapters/auth/firebase-admin.adapter.ts`
  * `platform-adapters/notification/*.ts`
  * `platform-adapters/ai/*.ts`
* **Hosting / 前端 Angular**：

  * `ui-angular/` build → Firebase Hosting
  * `platform-adapters/firebase/angular-fire/` + `auth/angular-fire.adapter.ts` → 打包給前端使用

---

這個圖可以直接讓你知道：

1. **哪些 package 真正部署到 Firebase Functions**
2. **哪些只是被打包進前端**
3. **UI 只能透過 facade + adapters 呼叫核心 / domain**

---

```
Event Flow / Causality Flow 💫

[Firebase Functions / Admin SDK ⚡]
platform-adapters/firebase/admin/
│
│  EventStore Adapter
│  Projection Adapter
│
├─ TaskCreatedEvent ──▶ Aggregate (core-engine/aggregates/task.ts)
│                        │
│                        └─更新 Projection (core-engine/projection/task-read.model.ts)
│
├─ TaskAssignedEvent ─▶ Aggregate (core-engine/aggregates/task.ts)
│                        │
│                        └─更新 Projection
│
└─ TaskCompletedEvent ─▶ Aggregate
                         │
                         └─更新 Projection

[Read Model / Query Layer 🌐]
platform-adapters/firebase/angular-fire/
│
├─ TaskQueryAdapter ──▶ 讀取 Projection
│
└─ AuthStateAdapter ──▶ 提供使用者登入狀態

[UI Angular 💅]
ui-angular/src/app/
│
└─ core-engine.facade.ts
     │
     ├─ 使用 TaskQueryAdapter 查詢任務列表
     ├─ 使用 AuthStateAdapter 判斷使用者權限
     └─ 發起 Command → Firebase Functions
           └─ 觸發新事件 → 再回到 Event Flow
```

### 🔗 小結：

1. **事件從 Functions 發出**（⚡ 後端 SDK）
2. **Aggregate 處理業務規則**（💎 core-engine）
3. **Projection 更新 Read Model**（💎 core-engine/projection）
4. **前端透過 AngularFire 查詢 Read Model**（🌐 adapter）
5. **UI 只跟 Facade 接口互動**（💅 ui-angular）
6. **UI 發起命令** → 再回到 Functions 觸發新事件 → 循環 🔄

---

```
💎 Core Engine / Domain Layer
┌───────────────────────────┐
│ core-engine/              │
│  ├─ aggregates/           │
│  ├─ causality/            │
│  ├─ event-store/          │
│  └─ projection/           │
└───────────────────────────┘
           ▲
           │ used by
           │
🏢 SaaS Domain Layer
┌───────────────────────────┐
│ saas-domain/              │
│  ├─ task/                 │
│  ├─ payment/              │
│  └─ issue/                │
└───────────────────────────┘
           ▲
           │ used by
           │
🔧 Platform Adapters Layer
┌───────────────────────────┐
│ platform-adapters/        │
│  ├─ firebase/             │
│  │   ├─ admin/ ⚡Functions │
│  │   │    ├─ EventStore   │
│  │   │    └─ Projection   │
│  │   └─ angular-fire/ 🌐  │
│  │        ├─ TaskQuery    │
│  │        └─ AuthState    │
│  ├─ auth/                 │
│  │   ├─ firebase-admin ⚡  │
│  │   └─ angular-fire 🌐    │
│  ├─ notification/ ⚡       │
│  ├─ analytics/ ⚡/🌐        │
│  └─ ai/ ⚡                 │
└───────────────────────────┘
           ▲
           │ exposed via
           │
💅 UI Angular Layer
┌───────────────────────────┐
│ ui-angular/               │
│  ├─ src/app/features/     │
│  │    ├─ task/            │
│  │    └─ payment/         │
│  └─ adapters/             │
│       └─ core-engine.facade.ts
└───────────────────────────┘

-------------------------------------------------
Event / Command Flow 🔄

UI Angular 💅
   │  發起 Command (Create/Assign/Complete Task)
   ▼
Platform Adapters 🔧
   │  接收 Command → Firebase Admin SDK ⚡
   ▼
Core Engine 💎
   │  Aggregate 處理業務規則
   │  更新 Projection
   ▼
Platform Adapters 🌐
   │  AngularFire 查詢 Projection / AuthState
   ▼
UI Angular 💅
   │  更新畫面 / Observable State
   └─ 循環 🔄
```

### 🔑 特點：

1. **清楚分層**：Core → Domain → Adapter → UI
2. **Firebase Functions 部署清楚**：⚡ 標記
3. **前端打包 / AngularFire 使用**：🌐 標記
4. **事件 / command 流向一目了然**：🔄 循環
5. **Facade Pattern**：UI 只和 facade 接口互動

---

```
┌───────────────────────────┐
│ Package                     │ Build / Deploy             │ Notes
├────────────────────────────┼───────────────────────────┼─────────────────────────────
│ core-engine 💎             │ tsc → dist                │ 純業務邏輯，無 SDK，給 domain / adapters 引用
│ saas-domain 🏢             │ tsc → dist                │ 純 TS 業務模型，無 SDK
│ platform-adapters/admin ⚡  │ tsc → dist → Functions    │ Firebase Admin SDK，部署到 Cloud Functions
│ platform-adapters/auth/firebase-admin ⚡ │ tsc → dist → Functions    │ SaaS 權限 / Role / Claim
│ platform-adapters/notification ⚡ │ tsc → dist → Functions    │ FCM / Email
│ platform-adapters/ai ⚡      │ tsc → dist → Functions    │ GenAI / Vertex AI
│ platform-adapters/firebase/angular-fire 🌐 │ ts → 隨前端打包        │ 前端查詢 Projection / AuthState
│ platform-adapters/auth/angular-fire 🌐 │ ts → 隨前端打包        │ 前端登入狀態
│ ui-angular 💅               │ ng build → dist → Hosting │ 前端 Angular App，透過 facade 呼叫 adapters
└───────────────────────────┘
```

### 🔑 部署策略小結

1. **Functions / Admin SDK** ⚡：

   * 後端事件處理、Aggregate、Projection 更新
   * 部署到 Firebase Functions
2. **前端 Angular** 💅：

   * Hosting 部署
   * 透過 AngularFire / adapters 存取 Projection、AuthState
3. **Core / Domain Layer** 💎🏢：

   * 不直接部署
   * 被 Functions 或前端打包使用
   * 測試 / build → dist

---

```
Event-Sourced + Causality-Driven Flow 🔄

💅 UI Angular Layer (Hosting)
┌───────────────────────────────┐
│ ui-angular/                   │
│ ├─ src/app/features/          │
│ │    ├─ task/                 │
│ │    └─ payment/              │
│ └─ adapters/core-engine.facade.ts
└───────────────────────────────┘
       │  發起 Command (Create/Assign/Complete Task)
       ▼
🌐 Platform Adapters - Frontend
┌───────────────────────────────┐
│ platform-adapters/firebase/   │
│ └─ angular-fire/ 🌐           │
│      ├─ TaskQueryAdapter      │
│      └─ AuthStateAdapter      │
└───────────────────────────────┘
       │ 查詢 Projection / AuthState
       ▼
💎 Core Engine / Domain Layer
┌───────────────────────────────┐
│ core-engine/ 💎               │
│ ├─ aggregates/                │
│ ├─ causality/                 │
│ ├─ event-store/               │
│ └─ projection/                │
└───────────────────────────────┘
       │ 處理事件 / 更新 Projection
       ▼
⚡ Platform Adapters - Backend / Functions
┌───────────────────────────────┐
│ platform-adapters/firebase/   │
│ └─ admin/ ⚡                  │
│      ├─ EventStoreAdapter     │
│      └─ ProjectionAdapter     │
│ platform-adapters/auth/firebase-admin ⚡
│ platform-adapters/notification ⚡
│ platform-adapters/ai ⚡
└───────────────────────────────┘
       │ 產生新事件 → 回到 Core Engine / Projection 更新
       ▼
💅 UI Angular Layer (畫面更新)
```

### 🔑 說明：

1. **💎 Core Engine** → 純業務邏輯，無 SDK
2. **🏢 SaaS Domain** → 純 TS model，沒放圖，直接給 Core / Adapter 使用
3. **🔧 Platform Adapters**

   * ⚡ Functions → 後端處理事件、發送通知、AI call
   * 🌐 前端 AngularFire → 查詢 Projection / AuthState
4. **💅 UI Angular** → 只透過 `facade` 與 adapters 互動
5. **事件循環**：UI 發起 Command → Functions 處理 → 更新 Projection → 前端查詢 → UI 更新 🔄

---
