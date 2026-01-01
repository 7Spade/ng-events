# System Configuration Guidelines (系統配置指南)

本目錄包含 **Causality-Driven Event-Sourced Process System** 的配置指南與使用場景說明。

---

## 📚 Documentation Files (文件清單)

| File | Purpose (用途) |
|------|---------------|
| [When-To-Use(適用場景).md](./When-To-Use(適用場景).md) | Scenarios where Event-Sourcing should be used<br>應該使用事件溯源的場景 |
| [When-Not-To-Use(不適用場景).md](./When-Not-To-Use(不適用場景).md) | Scenarios where Event-Sourcing should NOT be used<br>不應該使用事件溯源的場景 |
| [Optional-Features(可選功能).md](./Optional-Features(可選功能).md) | Optional features and capabilities<br>可選功能與能力 |
| [Suggested-Practices(建議實踐).md](./Suggested-Practices(建議實踐).md) | Recommended practices and patterns<br>建議的實踐與模式 |
| [Package-Guide(套件指南).md](./Package-Guide(套件指南).md) | Package organization and dependencies<br>套件組織與依賴管理 |
| [System-Overview(系統概覽).md](./System-Overview(系統概覽).md) | System architecture overview<br>系統架構概覽 |

---

## 🎯 Quick Decision Guide (快速決策指南)

### Should I Use Event-Sourcing? (我應該使用事件溯源嗎？)

**✅ YES** - Use Event-Sourcing when (適用於)：
- 需要完整的審計追蹤 (Full audit trail required)
- 業務事實不可否認 (Business facts must be immutable)
- 需要時間旅行與重播功能 (Time-travel and replay needed)
- 複雜的因果關係追蹤 (Complex causality tracking)

**❌ NO** - Don't use Event-Sourcing when (不適用於)：
- 簡單的 CRUD 操作 (Simple CRUD operations)
- 不需要歷史記錄 (No history tracking needed)
- 效能優先於審計 (Performance over audit)
- 團隊缺乏相關經驗 (Team lacks experience)

詳細場景請參考：
- [When-To-Use(適用場景).md](./When-To-Use(適用場景).md)
- [When-Not-To-Use(不適用場景).md](./When-Not-To-Use(不適用場景).md)

---

## 📋 Feature Checklist (功能檢查清單)

### Core Features (核心功能)
- ✅ Event Store (事件儲存)
- ✅ Event Replay (事件重播)
- ✅ Causality Tracking (因果追蹤)
- ✅ Multi-tenant Isolation (多租戶隔離)

### Optional Features (可選功能)
- 🔲 Snapshot Optimization (快照優化)
- 🔲 Event Versioning (事件版本控制)
- 🔲 CQRS Projections (CQRS 投影)
- 🔲 Saga Orchestration (Saga 編排)

詳細說明請參考 [Optional-Features(可選功能).md](./Optional-Features(可選功能).md)

---

## 🏗️ Architecture Integration (架構整合)

本配置指南與主要架構文件的關係：

```
docs/dev/
├── README.md                                    ← 主索引
├── Architecture-Guide(架構指南).md              ← 架構導覽
├── Architecture-Specification(架構規範).md      ← 詳細規範
└── system-config/                               ← 你在這裡
    ├── README.md
    ├── When-To-Use(適用場景).md
    ├── When-Not-To-Use(不適用場景).md
    ├── Optional-Features(可選功能).md
    ├── Suggested-Practices(建議實踐).md
    ├── Package-Guide(套件指南).md
    └── System-Overview(系統概覽).md
```

---

## 🚀 Getting Started (開始使用)

### Step 1: 評估適用性 (Evaluate Suitability)
1. 閱讀 [When-To-Use(適用場景).md](./When-To-Use(適用場景).md)
2. 閱讀 [When-Not-To-Use(不適用場景).md](./When-Not-To-Use(不適用場景).md)
3. 確認專案是否適合使用 Event-Sourcing

### Step 2: 了解系統架構 (Understand Architecture)
1. 閱讀 [System-Overview(系統概覽).md](./System-Overview(系統概覽).md)
2. 參考主架構文件 [Architecture-Specification(架構規範).md](../Architecture-Specification(架構規範).md)

### Step 3: 選擇功能集 (Select Features)
1. 確定必要的核心功能
2. 從 [Optional-Features(可選功能).md](./Optional-Features(可選功能).md) 選擇需要的功能
3. 參考 [Suggested-Practices(建議實踐).md](./Suggested-Practices(建議實踐).md) 了解最佳實踐

### Step 4: 組織套件 (Organize Packages)
1. 閱讀 [Package-Guide(套件指南).md](./Package-Guide(套件指南).md)
2. 依照建議組織 Core、Platform、SaaS 層

---

## 📞 Support (支援)

### 問題排查 (Troubleshooting)
- **Q: 不確定是否該用 Event-Sourcing？**
  - A: 參考 [When-To-Use(適用場景).md](./When-To-Use(適用場景).md) 的決策樹

- **Q: 如何組織套件結構？**
  - A: 參考 [Package-Guide(套件指南).md](./Package-Guide(套件指南).md)

- **Q: 有哪些最佳實踐？**
  - A: 參考 [Suggested-Practices(建議實踐).md](./Suggested-Practices(建議實踐).md)

---

**Last Updated (最後更新)**: 2026-01-01  
**Version (版本)**: 2.0  
**Status (狀態)**: ✅ Standardized (已標準化)
