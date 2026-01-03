# Application Layer (Pure Domain Orchestration)

## Purpose

This layer provides **domain-agnostic orchestration abstractions** that sit between UI adapters (Angular) and domain aggregates. It ensures that business workflow logic is independent of any presentation framework.

## Responsibilities

✅ **CAN DO:**
- Define Command types (data structures for user intent)
- Define abstract CommandHandler interfaces (orchestration contracts)
- Define application-level Repository/EventStore interfaces
- Orchestrate calls to multiple aggregates (cross-aggregate workflows)

❌ **CANNOT DO:**
- Import Angular or any UI framework code
- Import Firebase SDK or platform-specific dependencies
- Contain actual SDK calls or data access implementation
- Include business rules (those belong in domain aggregates)

## Structure

```
application/
├── commands/        - Command DTOs (data structures only)
├── handlers/        - Abstract CommandHandler interfaces
├── interfaces/      - Application-level abstractions (Repository, UnitOfWork, etc.)
└── README.md        - This file
```

## Dependency Flow

```
UI Layer (Angular Services)
    ↓ depends on
Application Layer (Commands/Handlers) ← YOU ARE HERE
    ↓ depends on
Domain Layer (Aggregates/Events)
```

## Architecture Principle

**Angular can be completely replaced** without affecting this layer or domain logic. This layer defines "WHAT should happen" (orchestration), not "HOW it's implemented" (which is in platform-adapters).

## Phase 1.5 Note

All content in this directory is **SKELETON ONLY**:
- Interfaces and abstract classes define structure
- Method bodies throw NotImplementedError or are abstract
- NO actual implementation, NO SDK calls, NO business logic
