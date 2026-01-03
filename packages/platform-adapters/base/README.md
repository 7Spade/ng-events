# Platform Adapters - Base Abstractions

## 🎯 Purpose

This directory contains **interface definitions** (contracts) that define what Core-Engine expects from platform adapters.

## 🏗️ Clean Architecture Principle

```
┌─────────────────────────────────────┐
│       Core-Engine (Domain)          │
│                                     │
│  Depends on: base/* (abstractions)  │
└──────────────┬──────────────────────┘
               │ (depends on)
               ↓
┌─────────────────────────────────────┐
│    Platform-Adapters/base/          │
│                                     │
│  Defines: Interface contracts       │
│  - AdapterLifecycle                 │
│  - RepositoryAdapterCapability      │
└──────────────┬──────────────────────┘
               │ (implemented by)
               ↓
┌─────────────────────────────────────┐
│  Platform-Adapters/firebase/        │
│  Platform-Adapters/auth/            │
│  Platform-Adapters/ai/              │
│                                     │
│  Implements: Concrete adapters      │
└─────────────────────────────────────┘
```

### Dependency Rule

> **Core depends on abstractions, Platform implements abstractions**

- ✅ `core-engine` imports from `@platform-adapters/base`
- ✅ `platform-adapters/firebase` implements `AdapterLifecycle`
- ❌ `core-engine` NEVER imports from `@platform-adapters/firebase`

## 📁 Files

### `AdapterLifecycle.ts`

**Previously**: `IAdapter.ts` (deprecated)

Base lifecycle interface for all adapters:
- `initialize(config)` - Setup adapter with configuration
- `healthCheck()` - Verify connectivity
- `dispose()` - Clean up resources
- `getName()` - Adapter identification

### `RepositoryAdapterCapability.ts`

**Previously**: `IRepositoryAdapter.ts` (deprecated)

Extended interface for repository adapters:
- Extends `AdapterLifecycle`
- Adds transaction management (begin/commit/rollback)
- Adds query execution capabilities
- Adds connection status checking

## 🔄 Migration from Old Names

| Old Name (Deprecated)      | New Name (Current)              | Status    |
|---------------------------|---------------------------------|-----------|
| `IAdapter`                | `AdapterLifecycle`              | ✅ Active |
| `IRepositoryAdapter`      | `RepositoryAdapterCapability`   | ✅ Active |

### Migration Example

```typescript
// ❌ Old (deprecated)
import { IAdapter } from '@platform-adapters/IAdapter';

// ✅ New (recommended)
import { AdapterLifecycle } from '@platform-adapters/base';

// ❌ Old (deprecated)
import { IRepositoryAdapter } from '@platform-adapters/IRepositoryAdapter';

// ✅ New (recommended)
import { RepositoryAdapterCapability } from '@platform-adapters/base';
```

## 🎓 Why This Matters

### Before (Architectural Violation)

```typescript
// ❌ Platform-Adapters defining requirements
packages/platform-adapters/
├── IAdapter.ts              // Interface in wrong layer
├── IRepositoryAdapter.ts    // Interface in wrong layer
└── firebase/
    └── FirestoreAdapter.ts  // Implementation
```

**Problem**: Platform layer was defining contracts that Core should depend on. This violates Clean Architecture's Dependency Rule.

### After (Clean Architecture)

```typescript
// ✅ Clean separation of concerns
packages/platform-adapters/
├── base/                         // Abstraction layer
│   ├── AdapterLifecycle.ts      // Contract definition
│   └── RepositoryAdapterCapability.ts
└── firebase/                     // Implementation layer
    └── FirestoreAdapter.ts      // Implements base contracts
```

**Benefit**: 
- Core-Engine depends on abstractions (base/)
- Platform implementations depend on same abstractions
- Dependency flows inward (Dependency Inversion Principle)

## 📚 Related Documentation

- [Clean Architecture Principles](/docs/✨-Core-Ideas/🧨-Top-Architecture-Issue(最大的不合理點).md)
- [Platform Adapters Overview](/packages/platform-adapters/README.md)
- [Core-Engine Abstractions](/packages/core-engine/README.md)

## 🚀 Next Steps (Phase 1G)

After Phase 1F completion, Phase 1G will include:
- E2E validation of adapter contracts
- Integration tests for adapter lifecycle
- Documentation of adapter implementation patterns
- Migration guide for existing adapter implementations

## 📝 Notes

- **DO NOT** add platform-specific implementations here
- **DO** add new adapter capability interfaces here
- **DO** follow existing naming patterns (no "I" prefix)
- **DO** document why each capability exists in JSDoc

---

**Last Updated**: 2026-01-03 (Phase 1F → Phase 1G transition)  
**Architectural Decision**: Move adapter contracts to base/ subfolder for Clean Architecture compliance
