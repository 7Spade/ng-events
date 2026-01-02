# System Configuration Guidelines (系統配置指南)

> **Purpose (目的)**: 提供 **Causality-Driven Event-Sourced Process System** 的配置指南與使用決策

---

## 📚 Documentation Files (文件清單)

| Category | File | Purpose (用途) |
|----------|------|---------------|
| **Decision** | [When-To-Use(適用場景).md](./When-To-Use(適用場景).md) | ✅ When to use Event-Sourcing<br>何時使用事件溯源 |
| **Decision** | [When-Not-To-Use(不適用場景).md](./When-Not-To-Use(不適用場景).md) | ❌ When NOT to use Event-Sourcing<br>何時不使用事件溯源 |
| **Overview** | [System-Overview(系統概覽).md](./System-Overview(系統概覽).md) | 📋 System architecture overview<br>系統架構概覽 |
| **Features** | [Optional-Features(可選功能).md](./Optional-Features(可選功能).md) | 🔧 Optional features and capabilities<br>可選功能與能力 |
| **Practices** | [Suggested-Practices(建議實踐).md](./Suggested-Practices(建議實踐).md) | 💡 Recommended practices and patterns<br>建議的實踐與模式 |
| **Packages** | [Package-Guide(套件指南).md](./Package-Guide(套件指南).md) | 📦 Dependencies and package organization<br>依賴套件與組織管理 |

---

## 🎯 Quick Decision Matrix (快速決策矩陣)

### Should I Use Event-Sourcing? (我應該使用事件溯源嗎？)

| Scenario (場景) | Use ES? | Reference |
|----------------|---------|-----------|
| ✅ Full audit trail required (需要完整審計追蹤) | **YES** | [When-To-Use](./When-To-Use(適用場景).md) |
| ✅ Immutable business facts (不可變業務事實) | **YES** | [When-To-Use](./When-To-Use(適用場景).md) |
| ✅ Time-travel & replay needed (時間旅行與重播) | **YES** | [When-To-Use](./When-To-Use(適用場景).md) |
| ✅ Complex causality tracking (複雜因果追蹤) | **YES** | [When-To-Use](./When-To-Use(適用場景).md) |
| ❌ Simple CRUD operations (簡單 CRUD) | **NO** | [When-Not-To-Use](./When-Not-To-Use(不適用場景).md) |
| ❌ No history tracking needed (不需歷史) | **NO** | [When-Not-To-Use](./When-Not-To-Use(不適用場景).md) |
| ❌ Performance over audit (效能優先) | **NO** | [When-Not-To-Use](./When-Not-To-Use(不適用場景).md) |
| ❌ Team lacks experience (團隊缺乏經驗) | **NO** | [When-Not-To-Use](./When-Not-To-Use(不適用場景).md) |

---

## 📋 Feature Checklist (功能檢查清單)

| Feature | Type | Status | Reference |
|---------|------|--------|-----------|
| Event Store | Core | ✅ Required | [System-Overview](./System-Overview(系統概覽).md) |
| Event Replay | Core | ✅ Required | [System-Overview](./System-Overview(系統概覽).md) |
| Causality Tracking | Core | ✅ Required | [System-Overview](./System-Overview(系統概覽).md) |
| Multi-tenant Isolation | Core | ✅ Required | [System-Overview](./System-Overview(系統概覽).md) |
| Snapshot Optimization | Optional | 🔲 Optional | [Optional-Features](./Optional-Features(可選功能).md) |
| Event Versioning | Optional | 🔲 Optional | [Optional-Features](./Optional-Features(可選功能).md) |
| CQRS Projections | Optional | 🔲 Optional | [Optional-Features](./Optional-Features(可選功能).md) |
| Saga Orchestration | Optional | 🔲 Optional | [Optional-Features](./Optional-Features(可選功能).md) |

---

## 🏗️ Documentation Hierarchy (文檔層級)

```
docs/dev/
├── 📖 README.md                                       ← Master Index
├── 🏗️ Architecture-Guide(架構指南).md                 ← Start Here
├── 📋 Architecture-Specification(架構規範).md          ← Detailed Spec
├── 🌳 Implementation-Directory-Tree(實作目錄樹).md     ← Directory Structure
│
└── 📂 system-config/                                  ← You Are Here
    ├── README.md                                      ← This File
    ├── When-To-Use(適用場景).md                        ← Decision Guide
    ├── When-Not-To-Use(不適用場景).md                  ← Decision Guide
    ├── System-Overview(系統概覽).md                    ← Overview
    ├── Optional-Features(可選功能).md                  ← Features
    ├── Suggested-Practices(建議實踐).md                ← Best Practices
    └── Package-Guide(套件指南).md                      ← Dependencies
```

---

## 🚀 Getting Started Guide (開始使用指南)

### Step 1: Decision (決策) - 10 minutes
**Objective**: Determine if Event-Sourcing fits your project

| Action | Document | Time |
|--------|----------|------|
| ✅ Review use cases | [When-To-Use(適用場景).md](./When-To-Use(適用場景).md) | 5 min |
| ❌ Review anti-patterns | [When-Not-To-Use(不適用場景).md](./When-Not-To-Use(不適用場景).md) | 5 min |

### Step 2: Architecture (架構) - 30 minutes
**Objective**: Understand system design

| Action | Document | Time |
|--------|----------|------|
| 📋 Read overview | [System-Overview(系統概覽).md](./System-Overview(系統概覽).md) | 10 min |
| 🏗️ Study architecture | [Architecture-Specification(架構規範).md](../Architecture-Specification(架構規範).md) | 15 min |
| 🌳 Review directory tree | [Implementation-Directory-Tree(實作目錄樹).md](../Implementation-Directory-Tree(實作目錄樹).md) | 5 min |

### Step 3: Planning (規劃) - 20 minutes
**Objective**: Select features and best practices

| Action | Document | Time |
|--------|----------|------|
| 🔧 Choose features | [Optional-Features(可選功能).md](./Optional-Features(可選功能).md) | 10 min |
| 💡 Review practices | [Suggested-Practices(建議實踐).md](./Suggested-Practices(建議實踐).md) | 10 min |

### Step 4: Setup (設置) - 15 minutes
**Objective**: Organize dependencies

| Action | Document | Time |
|--------|----------|------|
| 📦 Install packages | [Package-Guide(套件指南).md](./Package-Guide(套件指南).md) | 15 min |

**Total Time**: ~75 minutes to full understanding

---

## 💡 Quick Reference (快速參考)

| Question | Answer | Reference |
|----------|--------|-----------|
| Should I use ES? | Check decision matrix | [Above](#-quick-decision-matrix-快速決策矩陣) |
| What's the architecture? | 3-layer: SaaS → Platform → Core | [System-Overview](./System-Overview(系統概覽).md) |
| What packages needed? | NgRx, RxJS, Firebase | [Package-Guide](./Package-Guide(套件指南).md) |
| What are best practices? | Event-first, immutable, testable | [Suggested-Practices](./Suggested-Practices(建議實踐).md) |
| Directory structure? | See implementation tree | [Implementation-Directory-Tree](../Implementation-Directory-Tree(實作目錄樹).md) |

---

**Last Updated (最後更新)**: 2026-01-01  
**Version (版本)**: 2.0  
**Status (狀態)**: ✅ Standardized (已標準化)
