# 快速開始指南 (Quick Start Guide)

> 5 分鐘內讓您了解 ng-events 並開始開發

---

## 🎯 第一步：理解核心概念 (5 分鐘閱讀)

### ng-events 是什麼？

一個**因果驅動的事件溯源系統** (Causality-Driven Event-Sourced System)，用於建立：

- ✅ 完整審計追蹤的 SaaS 任務管理平台
- ✅ 可重播、可模擬、可時間旅行的業務系統
- ✅ 多租戶隔離的企業級應用

### 三個核心理念

1. **Event = Fact (事件即事實)**
   - 事件描述已經發生的事，不可變更
   - 所有業務操作都產生事件
   - 例: `TaskCreated`, `TaskCompleted`, `PaymentProcessed`

2. **State = Derived (狀態即衍生)**
   - 當前狀態從事件序列重播得出
   - 狀態可以隨時丟棄並重建
   - 事件是唯一的真實來源

3. **Causality = Explicit (因果必明確)**
   - 每個事件都記錄「誰」「何時」「為何」觸發
   - 可追蹤完整的因果鏈
   - 支援分散式事件協調

### 必讀文件（選一個開始）

- **概念入門** → [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md) (5 分鐘)
- **為什麼不用 CRUD** → [Why Not CRUD](docs/02-paradigm/02-Why-Not-Crud(為何不用CRUD).md) (3 分鐘)
- **避坑指南** → [反模式](docs/09-anti-patterns/05-Architecture-Guardrails-架构护栏.md) (5 分鐘)

---

## 💻 第二步：了解程式碼結構 (10 分鐘)

### Packages 架構

```
packages/
├── core-engine/        💎 Pure TypeScript 核心 (不依賴任何框架)
├── saas-domain/        🏢 業務領域模型 (Pure TypeScript)
├── platform-adapters/  🔧 Firebase 適配器 (唯一可碰 SDK 的地方)
└── ui-angular/        💅 Angular UI (位於 src/app)
```

### 依賴規則（絕對不能違反）

```
ui-angular → platform-adapters → saas-domain → core-engine
  (Angular)    (Firebase SDK)      (Domain)      (Pure TS)
     ❌ firebase-admin               ❌ Any SDK     ❌ Any SDK
     ✅ @angular/fire
```

### 重要規則

- ❌ `core-engine` 絕對不能 import Angular 或 Firebase
- ❌ `saas-domain` 絕對不能 import Angular 或 Firebase
- ❌ `ui-angular` 絕對不能 import `firebase-admin`
- ✅ 只有 `platform-adapters` 可以碰 SDK

**必讀** → [Packages README](packages/README.md) (完整架構說明)

---

## 🔧 第三步：環境設定 (15 分鐘)

### 前置需求

```bash
# 確認版本
node --version  # 需要 >= 20.x
npm --version   # 需要 >= 10.x
```

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/7Spade/ng-events.git
cd ng-events

# 2. 安裝依賴 (使用 yarn)
yarn install

# 3. 設定 Firebase (如果需要)
# 複製 .env.example 為 .env
# 填入 Firebase 設定

# 4. 啟動開發伺服器
npm run start
# 或
yarn start
```

### 驗證安裝

```bash
# 執行測試
npm run test

# 執行 Lint
npm run lint

# 建置專案
npm run build
```

---

## 📚 第四步：開發工作流程

### 我要... (常見任務)

#### 1. 新增一個事件

1. 閱讀 [事件模型](docs/04-core-model/01-Event-Model-事件模型V2.md)
2. 參考 [事件命令模板](docs/🧩-Dev-Templates/Event-Command-Templates(事件命令模板).md)
3. 在 `packages/saas-domain/` 定義事件
4. 在 `packages/core-engine/` 實作 Event Store

#### 2. 建立一個 Aggregate

1. 閱讀 [核心原則](docs/02-paradigm/04-Core-Principles(核心原則).md)
2. 在 `packages/saas-domain/` 建立 Aggregate
3. 實作 `applyEvent()` 方法
4. 加入單元測試

#### 3. 建立一個投影 (Read Model)

1. 閱讀 [投影原則](docs/06-projection-decision/01-Projection-Principles-投影原则.md)
2. 參考 [投影讀模型模板](docs/🧩-Dev-Templates/Projection-ReadModel-Templates(投影讀模型模板).md)
3. 在 `packages/platform-adapters/` 實作查詢
4. 在 `packages/ui-angular/` 使用

#### 4. 建立一個 Saga

1. 閱讀 [Saga 流程管理器](docs/05-process-layer/01-Saga-Process-Manager-Saga流程管理器.md)
2. 定義狀態機
3. 實作補償邏輯
4. 加入整合測試

---

## ⚠️ 第五步：避免常見錯誤

### 絕對不要做的事

1. **❌ 直接修改狀態**
   ```typescript
   // ❌ 錯誤
   task.status = 'completed';
   
   // ✅ 正確
   const event = new TaskCompleted(task.id);
   task.applyEvent(event);
   ```

2. **❌ 在 core-engine 使用 Firebase**
   ```typescript
   // ❌ 錯誤 (在 core-engine/)
   import { Firestore } from '@angular/fire/firestore';
   
   // ✅ 正確 (在 platform-adapters/)
   import { Firestore } from '@angular/fire/firestore';
   ```

3. **❌ 事件使用現在式命名**
   ```typescript
   // ❌ 錯誤
   class TaskComplete { }
   
   // ✅ 正確 (過去式)
   class TaskCompleted { }
   ```

4. **❌ 在投影中放業務邏輯**
   ```typescript
   // ❌ 錯誤 (Read Model 有業務邏輯)
   projection.calculateTotalCost();
   
   // ✅ 正確 (業務邏輯在 Aggregate)
   aggregate.calculateTotalCost();
   ```

### 必讀避坑指南

- [反模式清單](docs/09-anti-patterns/05-Architecture-Guardrails-架构护栏.md)
- [狀態洩漏](docs/09-anti-patterns/01-State-Leakage-状态泄露.md)
- [事件過載](docs/09-anti-patterns/04-Event-Overloading-事件过载.md)

---

## 🧪 第六步：測試

### 測試策略

```bash
# 單元測試 (Aggregate, Value Object)
npm run test:unit

# 整合測試 (Saga, Projection)
npm run test:integration

# E2E 測試
npm run test:e2e
```

### 測試模板

```typescript
// Aggregate 測試範例
describe('TaskAggregate', () => {
  it('should emit TaskCreated event when creating task', () => {
    const aggregate = TaskAggregate.create({ title: 'Test' });
    const events = aggregate.getUncommittedEvents();
    
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(TaskCreated);
  });
});
```

---

## 📖 延伸閱讀

### 依角色推薦

#### 前端開發者
1. [Angular UI 架構](packages/ui-angular/README.md)
2. [路由守衛模板](docs/🧩-Dev-Templates/Routing-Guard-Templates(路由守衛模板).md)
3. [多租戶模板](docs/🧩-Dev-Templates/Multi-Tenant-Templates(多租戶模板).md)

#### 後端開發者
1. [泛型骨架實施計畫](docs/📌-plans/泛型骨架實施計畫.md) ⭐ **必讀**
2. [Core Engine](packages/core-engine/README.md)
3. [Platform Adapters](packages/platform-adapters/README.md)
4. [因果模型](docs/04-core-model/02-Causality-Model-因果模型V2.md)
5. [泛型 Quick Reference](docs/🧬-Generic/Quick-Reference(快速參考).md)

#### 架構師
1. [泛型骨架實施計畫](docs/📌-plans/泛型骨架實施計畫.md) ⭐ **必讀**
2. [架構概覽](docs/03-architecture/01-Overview(概覽).md)
3. [決策記錄](docs/08-governance/01-decision-records/)
4. [分層模型](docs/03-architecture/12-Layering-Model-分层模型.md)

### 完整索引

→ [完整文件索引](FILE-INDEX.md) - 所有文件的詳細清單

---

## 🆘 獲取協助

### 常見問題

**Q: 事件和命令有什麼差別？**  
A: 事件是過去式（已發生），命令是意圖（要做）。閱讀 [事件模型](docs/04-core-model/01-Event-Model-事件模型V2.md)

**Q: 如何實作新的聚合 (Aggregate)？**  
A: 使用 T/I/S 泛型模式，參考 [泛型骨架實施計畫](docs/📌-plans/泛型骨架實施計畫.md) 和 [AggregateRoot Template](docs/🧬-Generic/AggregateRoot-Template.ts)

**Q: 為什麼不能在 core-engine 用 Firebase?**  
A: 核心必須與框架無關，才能重用。閱讀 [Packages 架構](packages/README.md)

**Q: 如何追蹤事件因果關係?**  
A: 每個事件包含 `causedBy` metadata。閱讀 [因果模型](docs/04-core-model/02-Causality-Model-因果模型V2.md)

### 更多資源

- [貢獻指南](Contributing(貢獻指南).md)
- [完整文件索引](FILE-INDEX.md)
- [GitHub Issues](https://github.com/7Spade/ng-events/issues)

---

**下一步**: 選擇一個任務開始開發！建議從閱讀 [反模式](docs/09-anti-patterns/) 開始，避免常見錯誤。

**最後更新**: 2026-01-02
