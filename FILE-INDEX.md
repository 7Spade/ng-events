# 文件索引 (File Index)

> 完整的 ng-events 專案文件索引 - 讓您第一時間找到需要的文件

最後更新: 2026-01-02

---

## 📋 目錄 (Table of Contents)

- [快速導航](#快速導航-quick-navigation)
- [入門指南](#入門指南-getting-started)
- [核心文件](#核心文件-core-documentation)
- [程式碼套件](#程式碼套件-code-packages)
- [開發指南](#開發指南-development-guides)
- [參考資料](#參考資料-reference-materials)
- [工具與模板](#工具與模板-tools--templates)

---

## 🚀 快速導航 (Quick Navigation)

### 我是... (I am a...)

#### 新手開發者 (New Developer)
**第一步**: [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md)  
**第二步**: [為何不是 CRUD](docs/02-paradigm/02-Why-Not-Crud(為何不用CRUD).md)  
**第三步**: [Packages 架構](packages/README.md)  
**第四步**: [反模式](docs/09-anti-patterns/05-Architecture-Guardrails-架构护栏.md)

#### 前端開發者 (Frontend Developer)
→ [Angular UI 架構](packages/ui-angular/README.md)  
→ [路由守衛範例](docs/02-examples/route-guards-examples.ts)  
→ [UI 開發模板](docs/🧩-Dev-Templates/)

#### 後端開發者 (Backend Developer)
→ [Core Engine](packages/core-engine/README.md)  
→ [Platform Adapters](packages/platform-adapters/README.md)  
→ [事件模型](docs/04-core-model/01-Event-Model-事件模型V2.md)

#### 架構師 (Architect)
→ [架構概覽](docs/03-architecture/01-Overview(概覽).md)  
→ [決策記錄 (ADR)](docs/08-governance/01-decision-records/)  
→ [治理文件](docs/08-governance/)

---

## 📖 入門指南 (Getting Started)

### 專案概述
- [README](README.md) - 專案介紹與快速開始
- [貢獻指南](Contributing(貢獻指南).md) - 如何參與開發
- [專案結構說明](docs/Readme(讀我).md) - 文件結構總覽

### 核心概念理解
1. [問題陳述](docs/01-vision/01-Problem-Statement(問題陳述).md) - 我們要解決什麼問題
2. [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md) - 系統核心概念
3. [核心原則](docs/02-paradigm/04-Core-Principles(核心原則).md) - 不可妥協的鐵律

### 快速參考
- [導航地圖](docs/00-index/Navigation-Map(導航地圖).md) - 依角色分類的文件導航
- [快速參考](docs/00-index/Quick-Reference(快速參考).md) - 常用參考資訊
- [閱讀路徑](docs/00-index/01-Reading-Path(閱讀路徑).md) - 建議閱讀順序

---

## 📚 核心文件 (Core Documentation)

### 00-index/ - 索引與導航
- [總索引](docs/00-index/00-Index(索引).md) - 文件總覽
- [知識索引](docs/00-index/01-Knowledge-Index(知識索引).md) - 知識點索引
- [閱讀路徑](docs/00-index/01-Reading-Path(閱讀路徑).md) - 建議閱讀順序
- [導航地圖](docs/00-index/Navigation-Map(導航地圖).md) - 依角色分類
- [快速參考](docs/00-index/Quick-Reference(快速參考).md) - 常用資訊

### 01-vision/ - 願景與目標
- [問題陳述](docs/01-vision/01-Problem-Statement(問題陳述).md) - 要解決的問題
- [系統目標](docs/01-vision/02-System-Goals(系統目標).md) - 想達成什麼
- [非目標](docs/01-vision/03-Non-Goals(非目標).md) - 明確不做什麼
- [現況](docs/01-vision/Current-Status(現況).md) - 當前實作狀態

### 02-paradigm/ - 系統範式 ⭐ 必讀
- [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md) - **從這裡開始**
- [為何不是 CRUD](docs/02-paradigm/02-Why-Not-Crud(為何不用CRUD).md)
- [為何不是純 Event Sourcing](docs/02-paradigm/03-Why-Not-Pure-Es(為何不用純ES).md)
- [核心原則](docs/02-paradigm/04-Core-Principles(核心原則).md) - 不可妥協的鐵律

### 03-architecture/ - 架構設計
- [架構概覽](docs/03-architecture/01-Overview(概覽).md) - 系統架構總覽
- [架構規則](docs/03-architecture/04-Architecture-Rules(架構規則).md) - 架構約束
- [權限分層詳解](docs/03-architecture/05-Authorization-Layers-Detailed-权限分层详解.md)
- [反腐層](docs/03-architecture/09-Anti-Corruption-Layer-防腐层.md)
- [資料流](docs/03-architecture/10-Data-Flow-数据流.md)
- [Features 層架構](docs/03-architecture/11-Features-Layer-功能层.md)
- [分層模型](docs/03-architecture/12-Layering-Model-分层模型.md)
- [職責邊界](docs/03-architecture/13-Responsibility-Boundaries-职责边界.md)
- [技術棧](docs/03-architecture/14-Tech-Stack-技术栈.md)

### 04-core-model/ - 核心模型
- [事件模型 V2](docs/04-core-model/01-Event-Model-事件模型V2.md)
- [因果模型 V2](docs/04-core-model/02-Causality-Model-因果模型V2.md)
- [確定性 V2](docs/04-core-model/03-Determinism-确定性V2.md)
- [時間模型 V2](docs/04-core-model/04-Time-Model-时间模型V2.md)
- [Account 模型詳解](docs/04-core-model/05-Account-Model-Detailed-账户模型详解.md)
- [Workspace 模型詳解](docs/04-core-model/06-Workspace-Model-Detailed-工作空间模型详解.md)

### 05-process-layer/ - 流程層
- [Saga 流程管理器](docs/05-process-layer/01-Saga-Process-Manager-Saga流程管理器.md)
- [狀態機](docs/05-process-layer/02-State-Machine-状态机.md)
- [補償機制](docs/05-process-layer/03-Compensation-补偿机制.md)
- [冪等性與恰好一次](docs/05-process-layer/04-Idempotency-Exactly-Once-幂等性与恰好一次.md)

### 06-projection-decision/ - 投影與決策
- [投影原則](docs/06-projection-decision/01-Projection-Principles-投影原则.md)
- [時間查詢](docs/06-projection-decision/02-Temporal-Queries-时间查询.md)
- [敘事層](docs/06-projection-decision/03-Narrative-Layer-叙事层.md)
- [因果圖](docs/06-projection-decision/04-Causal-Graph-因果图.md)
- [模擬引擎](docs/06-projection-decision/05-Simulation-Engine-模拟引擎.md)
- [七種投影](docs/06-projection-decision/08-Seven-Projections-七种投影.md)

### 07-operability/ - 可運維性
- [可觀測性](docs/07-operability/01-Observability-可观测性.md)
- [失敗處理](docs/07-operability/02-Failure-Handling-故障处理.md)
- [混沌重播](docs/07-operability/03-Chaos-Replay-混沌重放.md)
- [性能考量](docs/07-operability/04-Performance-Considerations-性能考虑.md)
- [開發工具](docs/07-operability/05-Dev-Tools-开发工具.md)

### 08-governance/ - 治理
- [決策記錄 (ADR)](docs/08-governance/01-decision-records/) - 架構決策記錄
- [Schema 演化](docs/08-governance/02-Schema-Evolution-模式演化.md)
- [政策執行](docs/08-governance/03-Policy-Enforcement-策略执行.md)
- [安全與防篡改](docs/08-governance/04-Security-Tamper-Evidence-安全防篡改.md)
- [決策記錄](docs/08-governance/05-Decision-Records-决策记录.md)

### 09-anti-patterns/ - 反模式 ⚠️ 避坑指南
- [狀態洩漏](docs/09-anti-patterns/01-State-Leakage-状态泄露.md)
- [上帝 Saga](docs/09-anti-patterns/02-God-Saga-上帝saga.md)
- [投影作為真相](docs/09-anti-patterns/03-Projection-As-Truth-投影作为真相.md)
- [事件過載](docs/09-anti-patterns/04-Event-Overloading-事件过载.md)
- [架構護欄](docs/09-anti-patterns/05-Architecture-Guardrails-架构护栏.md) - 反模式清單
- [事件反模式](docs/09-anti-patterns/06-Event-Anti-Patterns-事件反模式.md)

### 10-reference/ - 參考資料
- [術語表](docs/10-reference/01-Glossary-术语表.md)
- [對比分析](docs/10-reference/02-Comparisons-对比分析.md)
- [閱讀地圖](docs/10-reference/03-Reading-Map-阅读指南.md)
- [依賴注入](docs/10-reference/08-Dependency-Injection-依赖注入.md)
- [擴展場景](docs/10-reference/09-Extension-Scenarios-扩展场景.md)

---

## 💻 程式碼套件 (Code Packages)

### packages/ - 程式碼組織
- [Packages 總覽](packages/README.md) - **必讀**: 架構與依賴規則
- [Core Engine](packages/core-engine/README.md) - 純 TypeScript 核心
- [SaaS Domain](packages/saas-domain/README.md) - 業務領域模型
- [Platform Adapters](packages/platform-adapters/README.md) - Firebase 適配器
- [UI Angular](packages/ui-angular/README.md) - Angular 前端

### 依賴規則 (重要)
```
ui-angular → platform-adapters → saas-domain → core-engine
  (Angular)    (Firebase)         (Domain)      (Pure TS)
```

---

## 🛠️ 開發指南 (Development Guides)

### 開發模板
- [事件命令模板](docs/🧩-Dev-Templates/Event-Command-Templates(事件命令模板).md)
- [介面方法模板](docs/🧩-Dev-Templates/Interface-Method-Templates(介面方法模板).md)
- [多租戶模板](docs/🧩-Dev-Templates/Multi-Tenant-Templates(多租戶模板).md)
- [命名規範](docs/🧩-Dev-Templates/Naming-Conventions(命名規範).md)
- [投影讀模型模板](docs/🧩-Dev-Templates/Projection-ReadModel-Templates(投影讀模型模板).md)
- [路由守衛模板](docs/🧩-Dev-Templates/Routing-Guard-Templates(路由守衛模板).md)

### 專案知識庫
- [專案結構索引](docs/📦-Project-Knowledge/00-專案結構索引.md)
- [Event 與 Process 核心](docs/📦-Project-Knowledge/01-Event與Process核心.md)
- [Task 與 Causality](docs/📦-Project-Knowledge/02-Task與Causality.md)
- [名詞與語言邊界定義](docs/📦-Project-Knowledge/03-名詞與語言邊界定義.md)
- [完整列表...](docs/📦-Project-Knowledge/README.md)

### 可選功能
- [可選功能總覽](docs/🧰-Optional-Features/Optional-Features(可選功能).md)
- [套件指南](docs/🧰-Optional-Features/Package-Guide(套件指南).md)
- [建議實踐](docs/🧰-Optional-Features/Suggested-Practices(建議實踐).md)
- [適用場景](docs/🧰-Optional-Features/When-To-Use(適用場景).md)
- [不適用場景](docs/🧰-Optional-Features/When-Not-To-Use(不適用場景).md)

---

## 📖 參考資料 (Reference Materials)

### 架構參考
- [架構指南](docs/🗃️-Reference/Architecture-Guide(架構指南).md)
- [架構規範](docs/🗃️-Reference/Architecture-Specification(架構規範).md)
- [架構摘要](docs/🗃️-Reference/Architecture-Summary(架構摘要).md)
- [目錄結構比較](docs/🗃️-Reference/Directory-Structure-Comparison(目錄結構比較).md)

### 約束文件
- [架構分層](docs/🗃️-Reference/Constraints-Architecture-Layers(架構分層).md)
- [因果驅動系統](docs/🗃️-Reference/Constraints-Causality-System(因果驅動系統).md)
- [目錄結構](docs/🗃️-Reference/Constraints-Directory(目錄結構).md)
- [多租戶平台](docs/🗃️-Reference/Constraints-SaaS-Platform(多租戶平台).md)
- [任務領域](docs/🗃️-Reference/Constraints-Task-Domain(任務領域).md)

### GitHub Copilot
- [記憶使用指南](docs/🤖-copilot/Copilot-Memory-Guide.md)
- [快速參考](docs/🤖-copilot/Copilot-Memory-Quick-Reference.md)
- [儲存記錄](docs/🤖-copilot/Copilot-Memory-Storage-Log.md)

---

## 🔧 工具與模板 (Tools & Templates)

### 決策記錄 (ADR)
- [ADR 模板](docs/08-governance/01-decision-records/Adr-Template.md)
- [所有 ADR](docs/08-governance/01-decision-records/) - 完整決策記錄

### 範例
- [最小事件](docs/99-appendix/02-examples/01-Minimal-Event-最小事件.md)
- [重播場景](docs/99-appendix/02-examples/02-Replay-Scenario-重放场景.md)
- [路由守衛範例](docs/99-appendix/02-examples/route-guards-examples.ts)

### 圖表
- [提取路線圖](docs/99-appendix/01-diagrams/extraction-roadmap.mmd)
- [功能提取地圖](docs/99-appendix/01-diagrams/feature-extraction-map.mmd)

---

## 📊 其他資源 (Additional Resources)

### 頂層文件
- [文檔政策](docs/Documentation-Policy(文檔政策).md)
- [部署指南](docs/Deployment(部署指南).md)
- [架構文件](docs/Ng-Events-Architecture.md)
- [知識提取索引](docs/00-知識提取索引.md)
- [文件清單](docs清單.md)

### GitHub 設定
- [Copilot 指令](/.github/copilot-instructions.md)
- [所有程式碼指令](/.github/all‑code.instructions.md)
- [Copilot 資源指南](/.github/COPILOT_RESOURCES_GUIDE.md)
- [Copilot 資源摘要](/.github/COPILOT_RESOURCES_SUMMARY.md)

---

## 🔍 搜尋技巧 (Search Tips)

### 找不到文件？試試這些關鍵字：

- **事件 (Event)** → `04-core-model/` 或 `Event` 開頭的文件
- **Saga / 流程** → `05-process-layer/`
- **投影 (Projection)** → `06-projection-decision/`
- **反模式** → `09-anti-patterns/`
- **範例** → `02-examples/` 或 `Dev-Templates/`
- **決策** → `08-governance/01-decision-records/`
- **架構** → `03-architecture/` 或 `Reference/`

### 常見問題快速連結

- **為什麼用 Event Sourcing?** → [02-Why-Not-Crud](docs/02-paradigm/02-Why-Not-Crud(為何不用CRUD).md)
- **如何設計事件?** → [Event-Model](docs/04-core-model/01-Event-Model-事件模型V2.md)
- **如何避免錯誤?** → [Anti-Patterns](docs/09-anti-patterns/)
- **如何組織程式碼?** → [Packages README](packages/README.md)
- **如何部署?** → [Deployment](docs/Deployment(部署指南).md)

---

**提示**: 使用 `Ctrl+F` (或 `Cmd+F`) 搜尋本文件可快速定位所需資訊

**維護**: 如發現連結失效或遺漏文件，請提交 Issue 或 PR

**最後更新**: 2026-01-02
