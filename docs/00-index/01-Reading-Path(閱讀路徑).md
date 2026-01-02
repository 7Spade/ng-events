# 閱讀路徑 (Reading Path)

> 根據不同角色和目標，提供建議的文件閱讀順序

---

## 🎯 依角色推薦路徑

### 👨‍💻 新手開發者 (New Developer)

**目標**: 快速理解系統核心概念並開始開發 (總計約 60 分鐘)

1. [問題陳述](../01-vision/01-Problem-Statement(問題陳述).md) (10 分鐘)
2. [系統定義](../02-paradigm/01-System-Definition(系統定義).md) (15 分鐘) ⭐
3. [核心原則](../02-paradigm/04-Core-Principles(核心原則).md) (15 分鐘)
4. [Packages 架構](../../packages/README.md) (10 分鐘) ⭐
5. [反模式清單](../09-anti-patterns/05-Architecture-Guardrails-架构护栏.md) (10 分鐘)

→ 然後參考 [快速開始指南](../../QUICK-START.md) 開始開發

---

### 💅 前端開發者 (Frontend Developer)

1. [系統定義](../02-paradigm/01-System-Definition(系統定義).md)
2. [Packages 架構](../../packages/README.md) - 理解依賴規則
3. [Angular UI README](../../packages/ui-angular/README.md)
4. [路由守衛模板](../🧩-Dev-Templates/Routing-Guard-Templates(路由守衛模板).md)
5. [投影原則](../06-projection-decision/01-Projection-Principles-投影原则.md)

---

### 🔧 後端開發者 (Backend Developer)

1. [系統定義](../02-paradigm/01-System-Definition(系統定義).md)
2. [事件模型 V2](../04-core-model/01-Event-Model-事件模型V2.md) ⭐
3. [因果模型 V2](../04-core-model/02-Causality-Model-因果模型V2.md)
4. [Core Engine](../../packages/core-engine/README.md)
5. [Saga 流程管理器](../05-process-layer/01-Saga-Process-Manager-Saga流程管理器.md)

---

### 🏛️ 架構師 (Architect)

1. [問題陳述](../01-vision/01-Problem-Statement(問題陳述).md)
2. [系統目標](../01-vision/02-System-Goals(系統目標).md)
3. [核心原則](../02-paradigm/04-Core-Principles(核心原則).md)
4. [架構概覽](../03-architecture/01-Overview(概覽).md)
5. [分層模型](../03-architecture/12-Layering-Model-分层模型.md)
6. [決策記錄 (ADR)](../08-governance/01-decision-records/)
7. [反模式](../09-anti-patterns/) - 全部閱讀

---

## 📚 依主題推薦

### Event Sourcing 基礎
1. [為何不是 CRUD](../02-paradigm/02-Why-Not-Crud(為何不用CRUD).md)
2. [事件模型 V2](../04-core-model/01-Event-Model-事件模型V2.md)
3. [確定性 V2](../04-core-model/03-Determinism-确定性V2.md)

### Causality Tracking
1. [因果模型 V2](../04-core-model/02-Causality-Model-因果模型V2.md)
2. [時間模型 V2](../04-core-model/04-Time-Model-时间模型V2.md)
3. [因果圖](../06-projection-decision/04-Causal-Graph-因果图.md)

### 多租戶 SaaS
1. [Account 模型詳解](../04-core-model/05-Account-Model-Detailed-账户模型详解.md)
2. [Workspace 模型詳解](../04-core-model/06-Workspace-Model-Detailed-工作空间模型详解.md)
3. [多租戶模板](../🧩-Dev-Templates/Multi-Tenant-Templates(多租戶模板).md)

---

## 🔗 其他資源

- [完整文件索引](../../FILE-INDEX.md) - 所有文件列表
- [導航地圖](Navigation-Map(導航地圖).md) - 文件導航
- [快速開始](../../QUICK-START.md) - 5 分鐘入門

**最後更新**: 2026-01-02
