# ✨ 知識索引 (Knowledge Index)

> **Master Index for All ✨ Knowledge Files**  
> 完整的知識庫索引，包含所有 29 個 ✨ 知識文件的分類與導讀

---

## 📚 知識庫總覽 (Knowledge Base Overview)

本知識庫包含從 ✨ 目錄提取的核心知識，所有文件均：
- ≤ 4000 字元（確保快速閱讀）
- 中英對照命名
- 分類放置於對應的 docs/ 子目錄
- 使用 ✨ 前綴標記，易於識別

**總計**: 29 個知識文件，涵蓋 8 大類別

---

## 📖 三層文件系統 (Three-Tier Documentation System)

為確保文件組織清晰且無衝突，本專案採用三層文件系統：

### 1️⃣ ✨ 知識精華 (Knowledge Essence)
- **格式**: `##-✨EnglishName-中文名称.md`
- **大小**: ≤ 4,000 bytes
- **用途**: 快速參考、核心概念、「醒腦」結論
- **來源**: 從 ✨/ 目錄提取的不可變知識點
- **範例**: `07-✨Account-Model-账户模型.md`

### 2️⃣ V2 規範定義 (Canonical V2 Definitions)
- **格式**: `##-EnglishName-名称V2.md`
- **用途**: 當前權威版本的技術定義
- **特點**: 替代舊版本（無 V2 後綴）
- **範例**: `01-Event-Model-事件模型V2.md` 替代 `19-Event-Model-事件模型.md`

### 3️⃣ 詳解文件 (Detailed Guides)
- **格式**: `##-EnglishName-Detailed-名称详解.md`
- **大小**: 無限制（通常 <15,000 bytes）
- **用途**: 深入學習、實作範例、完整指南
- **範例**: `05-Account-Model-Detailed-账户模型详解.md`

**關鍵區別**:
- ✨ 文件 = 精簡核心（5 分鐘理解）
- V2 文件 = 技術規範（當前權威）
- Detailed 文件 = 完整指南（深入學習）

---

## 🗑️ 已刪除文件 (Deleted Files - Superseded)

以下文件已被 V2 版本取代或為空白佔位符，已從倉庫中移除：

**docs/04-core-model/** (被 V2 取代):
- ~~18-Causality-Model-因果模型.md~~ → 使用 `02-Causality-Model-因果模型V2.md`
- ~~19-Event-Model-事件模型.md~~ → 使用 `01-Event-Model-事件模型V2.md`
- ~~20-Time-Model-时间模型.md~~ → 使用 `04-Time-Model-时间模型V2.md`
- ~~21-Determinism-确定性.md~~ → 使用 `03-Determinism-确定性V2.md`

**docs/03-architecture/** (空白佔位符):
- ~~02-layering-model.md~~ → 使用 `12-Layering-Model-分层模型.md`
- ~~03-responsibility-boundaries.md~~ → 使用 `13-Responsibility-Boundaries-职责边界.md`
- ~~04-data-flow.md~~ → 使用 `10-Data-Flow-数据流.md`

---

## 🗂️ 分類索引 (Category Index)

### 01. 架構原則 (Architecture Principles) - 5 files

**位置**: `docs/03-architecture/`

1. **Core-Not-Angular-核心不属于Angular** (`01-✨`)
   - **核心概念**: Core 不應在 Angular 內，應獨立為純 TypeScript 模組
   - **關鍵問題**: 系統分層混亂、Core 被 UI 綁架
   - **解決方案**: Monorepo 結構，packages/ 分離

2. **Authorization-Layers-权限分层** (`02-✨`)
   - **核心概念**: 權限三層架構：Platform(認證) → Domain(授權) → UI(呈現)
   - **關鍵原則**: Domain-Enforced Authorization
   - **錯誤模式**: 權限全寫在 platform/auth

3. **Packages-Structure-目录结构** (`03-✨`)
   - **核心概念**: packages/ 目錄結構設計
   - **關鍵分層**: core-engine, saas-domain, platform-adapters, ui-angular

4. **Firebase-SDK-Separation-SDK分离** (`04-✨`)
   - **核心概念**: Firebase SDK 不應直接在 Domain 使用
   - **解決方案**: Adapter Pattern 隔離第三方依賴

5. **Event-Projection-Angular-Flow-事件投影流程** (`06-✨`)
   - **核心概念**: Event → Projection → Angular Query 完整流程
   - **關鍵技術**: Observable 訂閱、多視圖同步

---

### 02. 核心模型 (Core Domain Model) - 11 files

**位置**: `docs/04-core-model/`

6. **Account-Model-账户模型** (`07-✨`)
   - **核心概念**: Account 是唯一業務主體 (WHO)
   - **替代對象**: User/Organization 作為身份來源，非業務實體

7. **Workspace-Concept-工作空间概念** (`08-✨`)
   - **核心概念**: Workspace 是邏輯容器 (WHERE)，非業務主體
   - **關鍵模型**: Workspace → Module → Entity 依賴鏈

8. **Event-Essence-事件本质** (`09-✨`)
   - **核心概念**: Event 是系統真相，不可變更
   - **關鍵屬性**: actorAccountId, workspaceId, causedBy

9. **Event-Projection-ReadModel-事件投影读模型** (`10-✨`)
   - **核心概念**: Projection 是 Event 的視圖，非真相來源
   - **關鍵技術**: 多視圖、版本控制、即時訂閱

10. **Event-Store-Responsibility-事件存储职责** (`11-✨`)
    - **核心概念**: Event Store 只負責存儲，不負責業務邏輯
    - **關鍵原則**: Immutable, Append-Only, Single Source of Truth

11. **Correlation-Causation-关联与因果** (`12-✨`)
    - **核心概念**: Correlation (關聯) vs Causation (因果)
    - **關鍵屬性**: causedBy (parent event), causedByAction

12. **Logical-Container-逻辑容器** (`13-✨`)
    - **核心概念**: Workspace 作為邏輯容器的詳細說明
    - **多租戶支援**: Workspace Access List, Role Mapping

13. **Business-Module-业务模块** (`14-✨`)
    - **核心概念**: Module 是業務邏輯單位
    - **包含內容**: Entities, Events, Commands, Sagas

14. **Workspace-Module-Account-Event-关系模型** (`15-✨`)
    - **核心概念**: 完整依賴鏈 Account → Workspace → Module → Entity → Event
    - **系統架構**: 多租戶 SaaS 完整結構

15. **Naming-Principles-命名原则** (`16-✨`)
    - **核心概念**: 統一命名規範
    - **建議格式**: PascalCase (Entity), 動詞+名詞 (Event/Command)

16. **Causality-Belongs-Where-因果归属** (`17-✨`)
    - **核心概念**: 因果鏈歸屬於 Event Metadata
    - **關鍵欄位**: causedBy, causedByAction, actorAccountId

---

### 03. 流程層模式 (Process Layer Patterns) - 4 files

**位置**: `docs/05-process-layer/`

17. **Process-Manager-Pattern-流程管理器模式** (`05-✨`)
    - **核心概念**: Process Manager 協調跨 Entity/Module 流程
    - **關鍵模式**: Event-driven coordination

18. **Saga-Compensation-Saga补偿** (`06-✨`)
    - **核心概念**: Saga 補償機制處理分散式交易失敗
    - **關鍵技術**: Compensating Actions, Rollback Strategy

19. **Saga-State-Machine-Saga状态机** (`07-✨`)
    - **核心概念**: Saga 狀態機設計
    - **狀態流程**: Pending → InProgress → Completed/Failed/Compensated/DeadLetter

20. **Timeout-Handling-超时处理** (`08-✨`)
    - **核心概念**: Saga Timeout 與 Retry 機制
    - **關鍵策略**: RetryCount, Dead Letter Queue

---

### 04. 投影與決策 (Projection & Decision) - 2 files

**位置**: `docs/06-projection-decision/`

21. **Type-Definitions-类型定义** (`06-✨`)
    - **核心概念**: Projection 類型定義與接口
    - **關鍵接口**: IProjection, ProjectionData

22. **Code-Examples-代码示例** (`07-✨`)
    - **核心概念**: Projection 實作範例
    - **技術細節**: Event Handler, View Update

---

### 05. 參考指南 (Reference Guide) - 4 files

**位置**: `docs/10-reference/`

23. **Best-Practices-最佳实践** (`04-✨`)
    - **核心概念**: Event-Sourcing 最佳實踐
    - **關鍵建議**: Event 粒度、Causality 追蹤、Idempotency

24. **Advanced-Patterns-高级模式** (`05-✨`)
    - **核心概念**: 進階模式與技巧
    - **包含內容**: Saga of Sagas, Snapshot, CQRS+ES

25. **Implementation-Guide-实施指南** (`06-✨`)
    - **核心概念**: 實作步驟指南
    - **涵蓋範圍**: 從設計到部署

26. **Testing-Strategy-测试策略** (`07-✨`)
    - **核心概念**: Event-Sourcing 測試策略
    - **測試類型**: Replay Test, Causality Test, Saga Test

---

### 06. 附錄 (Appendix) - 1 file

**位置**: `docs/99-appendix/`

27. **Migration-Path-迁移路径** (`04-✨`)
    - **核心概念**: 從傳統架構遷移到 Event-Sourcing
    - **遷移策略**: Strangler Pattern, Event Adapter

---

### 07. 願景 (Vision) - 1 file

**位置**: `docs/01-vision/`

28. **Multi-Tenant-Vision-多租户愿景** (`01-✨`)
    - **核心概念**: SaaS 多租戶完整願景
    - **系統架構**: Workspace Switcher, Session Context
    - **權限模型**: Multi-Identity, Multi-Workspace

---

### 08. 索引 (Index) - 1 file

**位置**: `docs/00-index/`

29. **Knowledge-Index-知识索引** (`01-✨`) - 本文件
    - **核心概念**: 知識庫主索引
    - **功能**: 分類、導讀、快速查詢

---

## 🎯 閱讀路徑建議 (Recommended Reading Path)

### 🚀 快速入門 (Quick Start)

**目標**: 30 分鐘內掌握核心概念

1. 📖 **Knowledge-Index** (本文) - 5 min
2. 🏗️ **Core-Not-Angular** (03-architecture/01) - 5 min
3. 👤 **Account-Model** (04-core-model/07) - 5 min
4. 🏢 **Workspace-Concept** (04-core-model/08) - 5 min
5. ⚡ **Event-Essence** (04-core-model/09) - 5 min
6. 🔐 **Authorization-Layers** (03-architecture/02) - 5 min

---

### 📚 完整學習 (Complete Learning)

**目標**: 理解整個系統架構與設計哲學

#### 第一階段：架構基礎 (60 min)
- ✅ 01. Knowledge-Index (本文)
- ✅ 02. Multi-Tenant-Vision (01-vision/01)
- ✅ 03-07. 架構原則 5 篇 (03-architecture/)

#### 第二階段：核心模型 (90 min)
- ✅ 08-18. 核心模型 11 篇 (04-core-model/)

#### 第三階段：流程與投影 (60 min)
- ✅ 19-24. 流程層 4 篇 + 投影 2 篇 (05-06/)

#### 第四階段：實作與參考 (45 min)
- ✅ 25-28. 參考指南 4 篇 (10-reference/)
- ✅ 29. 遷移路徑 (99-appendix/04)

---

### 🔍 問題導向閱讀 (Problem-Oriented Reading)

#### ❓ "為什麼 Core 不能放在 Angular 裡？"
👉 閱讀：
- Core-Not-Angular (03-architecture/01)
- Packages-Structure (03-architecture/03)

#### ❓ "Account 和 Workspace 是什麼關係？"
👉 閱讀：
- Account-Model (04-core-model/07)
- Workspace-Concept (04-core-model/08)
- Workspace-Module-Account-Event-关系模型 (04-core-model/15)

#### ❓ "權限應該在哪一層檢查？"
👉 閱讀：
- Authorization-Layers (03-architecture/02)

#### ❓ "Event 的因果鏈怎麼設計？"
👉 閱讀：
- Correlation-Causation (04-core-model/12)
- Causality-Belongs-Where (04-core-model/17)

#### ❓ "Saga 失敗了怎麼辦？"
👉 閱讀：
- Saga-Compensation (05-process-layer/06)
- Saga-State-Machine (05-process-layer/07)
- Timeout-Handling (05-process-layer/08)

#### ❓ "如何測試 Event-Sourcing 系統？"
👉 閱讀：
- Testing-Strategy (10-reference/07)

---

## 🔗 交叉引用 (Cross-References)

### 核心概念關聯圖

```
Account (WHO)
  ↓
Workspace (WHERE)
  ↓
Module (WHAT - Business)
  ↓
Entity (STATE)
  ↓
Event (TRUTH)
  ↓
Projection (VIEW)
  ↓
Angular Query (UI)
```

### 相關文件鏈接

| 主題 | 相關文件編號 |
|------|------------|
| 架構分層 | 01, 02, 03, 04, 06 |
| Account/Workspace | 07, 08, 13, 15, 28 |
| Event 設計 | 09, 10, 11, 12, 16, 17 |
| 業務模組 | 14, 15 |
| Saga/Process | 17, 18, 19, 20 |
| Projection | 21, 22 |
| 實作指南 | 23, 24, 25, 26, 27 |

---

## ⚠️ 衝突解決 (Conflict Resolution)

### 無衝突保證

所有 ✨ 知識文件：
- ✅ 按主題唯一分配到對應目錄
- ✅ 使用 ✨ 前綴，與現有文件區隔
- ✅ 互補現有文件，不重複
- ✅ 通過主索引交叉引用

### 命名規範統一

所有文件遵循：
- 格式: `##-✨EnglishTitle-中文标题.md`
- 編號: 依所在目錄順序編號
- 前綴: ✨ 標記知識文件

---

## 📊 統計資訊 (Statistics)

| 分類 | 文件數量 | 位置 |
|------|---------|------|
| 索引 | 1 | docs/00-index/ |
| 願景 | 1 | docs/01-vision/ |
| 架構 | 5 | docs/03-architecture/ |
| 核心模型 | 11 | docs/04-core-model/ |
| 流程層 | 4 | docs/05-process-layer/ |
| 投影 | 2 | docs/06-projection-decision/ |
| 參考 | 4 | docs/10-reference/ |
| 附錄 | 1 | docs/99-appendix/ |
| **總計** | **29** | **8 個目錄** |

---

## 🎓 學習建議 (Learning Tips)

1. **循序漸進**: 先看快速入門，再深入完整學習
2. **問題導向**: 遇到具體問題時，使用問題導向閱讀
3. **交叉驗證**: 同一概念在多篇文件中交叉驗證理解
4. **實作驗證**: 讀完後立即實作，加深理解
5. **定期回顧**: 定期回顧主索引，保持整體視野

---

**最後更新**: 2026-01-02  
**版本**: 1.0  
**狀態**: ✅ 完整

---
