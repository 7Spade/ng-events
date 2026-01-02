# Current Directory Structure (當前目錄結構)

> ⚠️ **IMPORTANT NOTE (重要提示)**: This document shows the **CURRENT ACTUAL** structure in the repository.
> For the **RECOMMENDED FUTURE** structure for Event-Sourcing implementation, see [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md)

---

## 📋 Overview (概覽)

This is the **actual current structure** of the ng-events project as it exists in the repository today.

**Current Status (當前狀態)**:
- ❌ Not yet implementing Event-Sourcing architecture
- ❌ Not yet implementing Causality-Driven system
- ✅ Based on ng-alain template structure
- ✅ Traditional Angular application structure

**To implement the Event-Sourcing system, you need to migrate to the structure described in:**
→ [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md)

---

## 🏗️ Current Actual Structure (當前實際結構)

```
src/app/
│
├── core/                                    # Core infrastructure services
│   ├── i18n/                               # Internationalization
│   ├── net/                                # HTTP interceptors & services
│   └── startup/                            # Application startup logic
│
├── layout/                                  # Layout components
│   ├── basic/                              # Basic layout (with sidebar)
│   ├── blank/                              # Blank layout
│   └── passport/                           # Login/Register layout
│
├── routes/                                  # Feature routes (all features)
│   ├── dashboard/                          # Dashboard views
│   │   ├── analysis/
│   │   ├── monitor/
│   │   ├── v1/
│   │   └── workplace/
│   │
│   ├── passport/                           # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── register-result/
│   │   └── lock/
│   │
│   ├── pro/                                # Pro features
│   │   ├── account/
│   │   ├── form/
│   │   ├── list/
│   │   ├── profile/
│   │   └── result/
│   │
│   ├── data-v/                             # Data visualization
│   │   └── relation/
│   │
│   ├── exception/                          # Error pages (403, 404, 500)
│   │
│   ├── extras/                             # Extra features
│   │   ├── helpcenter/
│   │   ├── poi/
│   │   └── settings/
│   │
│   ├── style/                              # Style showcase
│   │   ├── colors/
│   │   ├── gridmasonry/
│   │   └── typography/
│   │
│   ├── widgets/                            # Widget showcase
│   │
│   └── delon/                              # Delon component showcase
│       ├── acl/
│       ├── cache/
│       ├── downfile/
│       ├── form/
│       ├── guard/
│       ├── print/
│       ├── qr/
│       ├── st/
│       ├── util/
│       ├── xlsx/
│       └── zip/
│
└── shared/                                  # Shared components & utilities
    ├── cell-widget/                        # Cell widgets
    ├── json-schema/                        # JSON schema widgets
    ├── st-widget/                          # Simple Table widgets
    └── utils/                              # Utility functions
```

---

## 📊 Structure Comparison (結構比較)

| Aspect | Current Structure | Recommended Structure |
|--------|------------------|----------------------|
| **Architecture** | Traditional Angular (ng-alain) | Event-Sourcing + Causality-Driven |
| **Top-level folders** | core, layout, routes, shared | saas, platform, core |
| **Feature organization** | All features in `routes/` | Separated by layer (saas/platform/core) |
| **Event Sourcing** | ❌ Not implemented | ✅ Full implementation |
| **Causality Tracking** | ❌ Not implemented | ✅ DAG engine + validation |
| **Multi-tenant** | ❌ Not implemented | ✅ Blueprint-based isolation |
| **Domain Aggregates** | ❌ Not implemented | ✅ Task, Payment, Issue aggregates |
| **CQRS** | ❌ Not implemented | ✅ Commands + Projections |

---

## 🎯 Migration Path (遷移路徑)

To implement the Event-Sourcing Causality-Driven system, you need to:

### Step 1: Understand Target Structure
📖 Read: [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md)

### Step 2: Create New Structure
```bash
# Create new three-layer structure
mkdir -p src/app/saas/{task,payment,issue,blueprint}
mkdir -p src/app/platform/{auth,notification,analytics,adapter}
mkdir -p src/app/core/{causality,event-store,aggregate,projection}
```

### Step 3: Implement Core Layer First
- Event Store (event persistence to Firestore)
- Causality Engine (DAG validation)
- Base Aggregate classes
- Base Projection classes

### Step 4: Migrate Features
- Start with one feature (e.g., Task)
- Implement as Event-Sourced aggregate
- Create projections for read models
- Build UI on top of projections

### Step 5: Gradual Migration
- Keep existing `routes/` working during migration
- Migrate feature-by-feature
- Remove old structure once all features migrated

---

## 📚 Related Documentation (相關文檔)

- **Recommended Structure**: [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md) ← **USE THIS**
- **Architecture**: [Architecture-Specification(架構規範).md](./Architecture-Specification(架構規範).md)
- **Conflict Resolution**: [CONFLICT-RESOLUTION(衝突解決).md](./CONFLICT-RESOLUTION(衝突解決).md)
- **System Config**: [system-config/README.md](./system-config/README.md)

---

**Document Purpose (文檔目的)**: Show current actual structure (not recommended for Event-Sourcing)  
**Document Version (文檔版本)**: 2.0 (Updated to reflect actual repository structure)  
**Last Updated (最後更新)**: 2026-01-01  
**Status (狀態)**: ✅ Accurate (reflects current repo structure)

**⚠️ For Event-Sourcing implementation, use**: [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md)
