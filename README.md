# ng-events

> **Causality-Driven Event-Sourced Process System**  
> 因果驅動的事件溯源流程系統

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 專案簡介 (Project Overview)

ng-events 是一個基於 Event Sourcing 和 Causality Tracking 的 SaaS 任務管理平台。系統以「事件即事實」為核心理念，透過完整的因果追蹤，實現：

- ✅ 完整的審計追蹤 (Complete Audit Trail)
- ✅ 時間旅行查詢 (Temporal Queries)
- ✅ 確定性重播 (Deterministic Replay)
- ✅ 多租戶隔離 (Multi-Tenant Isolation)
- ✅ 分散式事件協調 (Distributed Event Coordination)

## 🚀 快速開始 (Quick Start)

### 新手開發者 (New Developers)

1. **了解系統概念** → [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md)
2. **閱讀架構文件** → [架構概覽](docs/03-architecture/01-Overview(概覽).md)
3. **查看程式碼結構** → [Packages 架構](packages/README.md)
4. **開始開發** → [開發指南](Contributing(貢獻指南).md)

### 快速導航 (Quick Navigation)

- 📋 [完整文件索引](FILE-INDEX.md) - 所有文件的完整清單
- 📖 [文件導航地圖](docs/00-index/Navigation-Map(導航地圖).md) - 依角色分類的導航
- 🏗️ [Packages 說明](packages/README.md) - 程式碼結構與依賴關係
- 🤝 [貢獻指南](Contributing(貢獻指南).md) - 如何參與開發

## 📦 專案結構 (Project Structure)

```
ng-events/
├── packages/              # 程式碼套件
│   ├── core-engine/      # 核心引擎 (Pure TypeScript)
│   ├── saas-domain/      # SaaS 業務領域
│   ├── platform-adapters/# 平台適配器 (Firebase, etc.)
│   └── ui-angular/       # Angular UI (in src/app)
├── docs/                  # 完整文件
│   ├── 00-index/         # 索引與導航
│   ├── 01-vision/        # 願景與目標
│   ├── 02-paradigm/      # 系統範式 ⭐
│   ├── 03-architecture/  # 架構設計
│   ├── 04-core-model/    # 核心模型
│   ├── 05-process-layer/ # 流程層
│   ├── 06-projection-decision/ # 投影與決策
│   ├── 07-operability/   # 可運維性
│   ├── 08-governance/    # 治理
│   ├── 09-anti-patterns/ # 反模式 ⚠️
│   └── 10-reference/     # 參考資料
└── src/                   # Angular 應用程式碼

⭐ 必讀文件
⚠️ 避坑指南
```

## 🧠 核心概念 (Core Concepts)

### Event = Fact (事件即事實)
事件描述**已經發生**的事情，不可變更，永久保存。

### State = Derived (狀態即衍生)
所有狀態都從事件重播得出，狀態不是真實來源。

### Causality = Explicit (因果必明確)
每個事件都明確記錄其成因、觸發者、所屬流程。

### Replay = Deterministic (重播即確定)
相同的事件序列，必然產生相同的狀態。

## 🛠️ 技術棧 (Tech Stack)

- **前端**: Angular 19+ with Signals
- **核心**: Pure TypeScript (Framework Agnostic)
- **後端**: Firebase (Firestore, Functions, Auth)
- **狀態管理**: Event Sourcing + CQRS
- **建置工具**: Nx Monorepo

## 📚 重要文件 (Key Documents)

### 必讀 (Must Read)
- [系統定義](docs/02-paradigm/01-System-Definition(系統定義).md) - 理解系統核心
- [核心原則](docs/02-paradigm/04-Core-Principles(核心原則).md) - 不可妥協的鐵律
- [反模式清單](docs/09-anti-patterns/05-Architecture-Guardrails-架构护栏.md) - 避免常見錯誤

### 開發者指南 (Developer Guide)
- [Packages 架構](packages/README.md) - 理解程式碼結構
- [事件模型](docs/04-core-model/01-Event-Model-事件模型V2.md) - 事件設計
- [因果模型](docs/04-core-model/02-Causality-Model-因果模型V2.md) - 追蹤因果關係

### 架構文件 (Architecture)
- [架構概覽](docs/03-architecture/01-Overview(概覽).md) - 系統架構
- [分層模型](docs/03-architecture/12-Layering-Model-分层模型.md) - 分層設計
- [資料流](docs/03-architecture/10-Data-Flow-数据流.md) - 資料流向

## 🤝 參與貢獻 (Contributing)

我們歡迎各種形式的貢獻！請先閱讀：

1. [貢獻指南](Contributing(貢獻指南).md)
2. [開發規範](docs/02-paradigm/04-Core-Principles(核心原則).md)
3. [反模式](docs/09-anti-patterns/) - 了解什麼不該做

## 📄 授權 (License)

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🔗 相關連結 (Links)

- [文件首頁](docs/Readme(讀我).md)
- [文件完整清單](docs清單.md)
- [知識提取索引](docs/00-知識提取索引.md)
- [GitHub Copilot 記憶指南](docs/🤖-copilot/Copilot-Memory-Guide.md)

---

**最後更新**: 2026-01-02  
**維護者**: ng-events Team
