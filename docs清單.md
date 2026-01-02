00-知識提取索引.md
Deployment(部署指南).md
Documentation-Policy(文檔政策).md
Ng-Events-Architecture.md
Readme(讀我).md

00-index
00-Index(索引).md
01-Reading-Path(閱讀路徑).md
01-✨knowledge-Index-知识索引(知識索引).md
Navigation-Map(導航地圖).md
Quick-Reference(快速參考).md
Readme(讀我).md

01-vision
01-Problem-Statement(問題陳述).md
01-✨multi-Tenant-Vision-多租户愿景(Multi-Tenant Vision - 多租戶願景).md
02-System-Goals(系統目標).md
03-Non-Goals(非目標).md
Current-Status(現況).md
Readme(讀我).md

02-paradigm
01-System-Definition(系統定義).md
02-Why-Not-Crud(為何不用CRUD).md
03-Why-Not-Pure-Es(為何不用純ES).md
04-Core-Principles(核心原則).md
Core-Principles(核心原則).md
Readme(讀我).md
System-Definition(系統定義).md
Why-Not-Crud(為何不用CRUD).md
Why-Not-Pure-Es(為何不用純ES).md

03-architecture
01-Overview(概覽).md
01-✨core-Not-Angular-核心不属于angular(01-Core-Not-Angular-核心不属于Angular).md
01-✨架構分層問題(架構分層問題分析).md
02-✨authorization-Layers-权限分层(02-Authorization-Layers-权限分层).md
02-✨workspace設計(Workspace 設計原則).md
03-✨packages-Structure-目录结构(Packages - packages 目錄結構).md
03-✨模組掛載機制(模組掛載機制).md
04-Architecture-Rules(架構規則).md
04-✨Firebase-SDK-Separation-SDK分离.md
04-✨核心依賴鏈(核心依賴鏈設計).md
05-Authorization-Layers-Detailed-权限分层详解.md
05-✨核心依賴鏈-Part2(Module 對外 API 設計).md
06-✨event-Projection-Angular-Flow-事件投影流程(全流程總覽（一句話版）).md
07-Overview-Architecture-架构概述(系統概覽).md
09-Anti-Corruption-Layer-防腐层(目的).md
10-Data-Flow-数据流(資料流).md
11-Features-Layer-功能层(Features 層架構).md
12-Layering-Model-分层模型(分層模型).md
13-Responsibility-Boundaries-职责边界(職責邊界).md
14-Tech-Stack-技术栈(技術棧).md
Readme(讀我).md

04-core-model
01-Event-Model-事件模型V2.md
01-✨account核心概念(Account 的核心概念).md
02-Causality-Model-因果模型V2.md
02-✨邏輯容器角色(邏輯容器的角色定位).md
03-Determinism-确定性V2.md
03-✨account與entity區別(Account、Entity、Actor 的區別).md
04-Time-Model-时间模型V2.md
04-✨moduleregistry型別(ModuleRegistry 型別定義).md
05-Account-Model-Detailed-账户模型详解.md
05-✨event結構設計(Event 結構設計).md
06-Workspace-Model-Detailed-工作空间模型详解.md
06-✨eventstore設計-Part1(Event Store 設計).md
07-✨account-Model-账户模型(先給你一句「會醒腦」的結論).md
07-✨eventstore設計-Part2(Event Store 儲存策略).md
08-✨causality因果關係(Causality 因果關係).md
08-✨workspace-Concept-工作空间概念(先給結論（直接可用）).md
09-✨event-Essence-事件本质(一句話定義（請記）).md
10-✨event-Projection-Readmodel-事件投影读模型(先講結論（請記）).md
11-✨event-Store-Responsibility-事件存储职责(先給結論（請記）).md
12-✨correlation-Causation-关联与因果(先一句話理解（超重要）).md
13-✨logical-Container-逻辑容器(直接給結論（先鎮定）).md
14-✨business-Module-业务模块(結論先說清楚).md
15-✨workspace-Module-Account-Event-关系模型(一句話總結（先記）).md
16-✨naming-Principles-命名原则(🧭 全域命名總原則（請刻在牆上）).md
17-✨causality-Belongs-Where-因果归属(因果).md
Readme(讀我).md

05-process-layer
01-Saga-Process-Manager-Saga流程管理器(定義).md
02-State-Machine-状态机(狀態機).md
03-Compensation-补偿机制(補償).md
04-Idempotency-Exactly-Once-幂等性与恰好一次(冪等性與恰好一次).md
05-✨process-Manager-Pattern-流程管理器模式(🌉 什麼叫「跨 Aggregate 的因果流」).md
06-✨saga-Compensation-Saga补偿(先給你一行定心丸).md
07-✨saga-State-Machine-Saga状态机(心法先給你).md
08-✨Timeout-Handling-超时处理.md
Readme(讀我).md

06-projection-decision
01-Projection-Principles-投影原则(投影原則).md
01-✨readmodel與projection(Read Model 與 Projection).md
02-Temporal-Queries-时间查询(時間查詢).md
03-Narrative-Layer-叙事层(敘事層).md
04-Causal-Graph-因果图(因果圖).md
05-Simulation-Engine-模拟引擎(模擬引擎).md
06-✨type-Definitions-类型定义(設計目標（先對齊）).md
07-✨code-Examples-代码示例(核心依賴鏈（先定錨）).md
08-Seven-Projections-七种投影.md
Readme(讀我).md

07-operability
01-Observability-可观测性(可觀測性).md
02-Failure-Handling-故障处理(失敗處理).md
03-Chaos-Replay-混沌重放(混沌工程與重播).md
04-Performance-Considerations-性能考虑(性能考量).md
05-Dev-Tools-开发工具(開發工具).md
README.md

08-governance
01-✨權限分層架構(權限分層架構).md
02-Schema-Evolution-模式演化(事件 Schema 演化).md
03-Policy-Enforcement-策略执行(政策強制執行).md
04-Security-Tamper-Evidence-安全防篡改(安全性與防篡改).md
05-Decision-Records-决策记录(決策記錄).md
Copilot-Processing.md
README.md

01-decision-records
Adr-0001-Event-Versioning-Strategy.md
Adr-0002-Eslint-Architecture-Enforcement.md
Adr-0003-Rbac-Authorization-System.md
Adr-0004-Contract-Versioning-Strategy.md
Adr-0005-Task-As-Single-Business-Entity.md
Adr-0006-Projection-Engine-Architecture.md
Adr-0007-Event-Sourcing-Anti-Patterns.md
Adr-0008-Event-Sourcing-Applicable-Scenarios.md
Adr-0009-Event-Sourcing-Optional-Features.md
Adr-0010-Angular-NgRx-Tech-Stack.md
Adr-0011-Event-Flow-Causality-Combination-Strategy.md
Adr-0012-Event-Sourcing-System-Tech-Selection.md
Adr-0013-Result-Pattern-Error-Handling.md
Adr-0014-Firebase-Infrastructure-Abstraction.md
Adr-0015-Testing-Strategy-Quality-Gates.md
Adr-0016-Signals-Vs-Rxjs-State-Management.md
Adr-0017-Event-Sourcing-References-Best-Practices.md
Adr-Template.md

09-anti-patterns
01-State-Leakage-状态泄露(反模式：狀態洩漏).md
02-God-Saga-上帝saga(反模式：上帝 Saga).md
03-Projection-As-Truth-投影作为真相(問題).md
04-Event-Overloading-事件过载(問題).md
05-Architecture-Guardrails-架构护栏(Anti-Patterns（架構反模式清單）).md
06-Event-Anti-Patterns-事件反模式.md
README.md

10-reference
01-Glossary-术语表(術語表).md
01-✨命名規範-Part1(全域命名規範).md
02-Comparisons-对比分析(對比).md
02-✨命名規範-Part2(命名規範與鐵律).md
03-Reading-Map-阅读指南(閱讀地圖).md
04-✨best-Practices-最佳实践(🌌 全流程文字版 Saga 狀態機圖).md
05-✨Advanced-Patterns-高级模式.md
06-✨Implementation-Guide-实施指南.md
07-✨Testing-Strategy-测试策略.md
08-Dependency-Injection-依赖注入(依賴注入策略).md
09-Extension-Scenarios-扩展场景(擴展場景).md

99-appendix
03-Historical-Notes-历史注记(歷史註記).md
04-✨Migration-Path-迁移路径.md

01-diagrams
extraction-roadmap.mmd
feature-extraction-map.mmd

02-examples
01-Minimal-Event-最小事件.md
02-Replay-Scenario-重放场景.md
route-guards-examples.ts

✨-Core-Ideas
0️⃣-Role-Split(角色分工先記住).md
1️⃣-Packages-Core-Engine(核心引擎Packages).md
1️⃣-Role-Split-Reminder(角色分工一定要記).md
1️⃣-System-Core-Structure(系統核心結構 Workspace-Module-Entity).md
1️⃣-Two-Fields-Shape(兩個欄位長什麼樣).md
1️⃣-Why-Need-Saga(為什麼需要Saga).md
7️⃣-SaaS-Workspace-Switcher-Design(SaaS-Workspace切換器設計).md
Causality-Placement(因果屬於哪裡).md
Who-Does-What-Where(「誰」在「哪裡」做事).md
✅-Conclusion-Clarified(結論先說清楚).md
✅-Packages-Stable-Boundaries(packages最終穩定版).md
🎯-Design-Goals(設計目標).md
🔁-Timeout-Retry-Dead-letter(TimeoutRetryDead-letter).md
🔁-Timeout-Retry-Dead-letter-Flow(流程).md
🔁-Timeout-Retry-Dead-letter-Numbered(標號版).md
🔁-Timeout-Retry-Dead-letter-Saga-Safety(TimeoutRetryDead-letterSaga防爆機制).md
🔑-Annotations-2(標註).md
🔑-Core-Principles-Mapping(核心原則與對照).md
🔖-Type-Definitions(型別).md
🔥-Event-Store-Responsibility(Event Store的唯一職責).md
🔥-Event-TypeScript-Structure(Event的正確TypeScript結構).md
🔥-Why-Read-Models(為什麼需要ReadModel).md
🔹-Timeout(Timeout).md
🧠-Conclusion-First-Ready-To-Use(先給結論).md
🧠-Conclusion-First-Stay-Calm(直接給結論).md
🧠-Iron-Law-0(先給你一句鐵律).md
🧠-Mind-Waking-Conclusion(會醒腦的結論).md
🧠-One-Line-Summary(一句話總結).md
🧠-One-Sentence-Takeaway(一句話結論).md
🧠-Principles-First(心法先給你).md
🧨-Top-Architecture-Issue(最大的不合理點).md

🌈-Roadmap
結構.md
開發順序.md

💋-Event-Flows
1️⃣-Create-Subtask-Event-Design(新增子任務事件設計).md
1️⃣-Event-Overlap-Check(事件覆蓋檢查).md
1️⃣-Field-Log-Event-Design(現場日誌事件設計).md
1️⃣-Issue-Event-Design(問題單事件設計).md
1️⃣-Issue-Event-Design-Alt(問題單事件設計).md
1️⃣-Task-Event-Design(任務事件設計).md
1️⃣-Task-Event-Design-Alt(任務事件設計).md
🌈-DAG-Structure-Guide(DAG結構說明).md

📊-analysis
task-hierarchy-capability-gap-analysis.md

📌-plans
context7-passive-copilot-optimization.md

📦-Project-Knowledge
00-專案結構索引.md
01-Event與Process核心.md
02-Task與Causality.md
03-名詞與語言邊界定義.md
04-Task生命週期.md
05-WBS與任務結構設計.md
06-Event-Sourced架構設計.md
07-事件命名與版本策略.md
08-Task多視圖架構.md
09-最小可運行系統定義.md
10-Task動態管理.md
11-階層化Task設計.md
12-Process流程系統.md
13-協作機制.md
14-驗收流程.md
15-合約財務結構.md
16-請款流程.md
17-平台層SaaS架構.md
18-架構分層與治理.md
19-反模式與禁止事項.md
20-系統整合實作.md
21-傳統產業考量.md
22-實作範例與最佳實踐.md
23-Angular技術選型.md
README.md

🗃️-Reference
Architecture-Guide(架構指南).md
Architecture-Specification(架構規範).md
Architecture-Summary(架構摘要).md
Architecture-Summary.md
CONFLICT-RESOLUTION(衝突解決).md
Constraints-Architecture-Layers(架構分層).md
Constraints-Causality-System(因果驅動系統).md
Constraints-Directory(目錄結構).md
Constraints-Implementation-Status(實作狀態).md
Constraints-Restructuring-Report(重組報告).md
Constraints-SaaS-Platform(多租戶平台).md
Constraints-Task-Domain(任務領域).md
Directory-Structure-Comparison(目錄結構比較).md
Directory-Tree-Structure(目錄樹結構).md
Directory-Structure-Comparison.md
FINAL-VERIFICATION(最終驗證).md
Implementation-Directory-Tree(實作目錄樹).md
Ng-Events-Architecture.md
README.md
Readme-Architecture.md
STANDARDIZATION-REPORT.md
Task-Hierarchy-Guide(任務階層指南).md

🤖-copilot
Copilot-Memory-Guide.md
Copilot-Memory-Quick-Reference.md
Copilot-Memory-Storage-Log.md

🧠-Event-Flows
✨0 0.md
✨0 1.md
✨0 2.md
✨0 3.md
✨0 4.md
✨0 5.md
✨0 6.md
✨0 7.md
✨0 7.png

🧩-Dev-Templates
Event-Command-Templates(事件命令模板).md
Interface-Method-Templates(介面方法模板).md
Multi-Tenant-Templates(多租戶模板).md
Naming-Conventions(命名規範).md
Projection-ReadModel-Templates(投影讀模型模板).md
README.md
Routing-Guard-Templates(路由守衛模板).md

🧰-Optional-Features
Optional-Features(可選功能).md
Package-Guide(套件指南).md
README.md
Suggested-Practices(建議實踐).md
System-Overview(系統概覽).md
When-Not-To-Use(不適用場景).md
When-To-Use(適用場景).md
