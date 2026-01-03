# Value Object Pattern Migration

## Overview

This document tracks the migration from type aliases to class-based Value Objects across all domain packages. Each Value Object now has both a type alias (for compatibility) and a class skeleton (for future implementation).

## Current State (Phase 1.5: Skeleton Complete)

All Value Objects now exist in **dual form**:
1. **Type Alias** - Original, currently used by aggregates (e.g., `export type AccountId = string;`)
2. **Class Skeleton** - New class with `create()`, `validate()`, `getValue()`, and `equals()` methods (all throw "Not implemented")

## Value Object Inventory

### Account Domain

#### Account Aggregate (`packages/account-domain/account/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `AccountId.ts` | `AccountId` | `AccountIdVO` | Unique identifier for Account aggregate |
| `AccountStatus.ts` | `AccountStatus` | `AccountStatusVO` | Account lifecycle state ('active' \| 'suspended' \| 'closed') |

#### Workspace Aggregate (`packages/account-domain/workspace/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `WorkspaceId.ts` | `WorkspaceId` | `WorkspaceIdVO` | Unique identifier for Workspace aggregate (multi-tenant boundary) |
| `WorkspaceRole.ts` | `WorkspaceRole` | `WorkspaceRoleVO` | Workspace-level role ('Owner' \| 'Admin' \| 'Member' \| 'Viewer') |

#### Membership Aggregate (`packages/account-domain/membership/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `MemberId.ts` | `MemberId` | `MemberIdVO` | User identity inside a workspace |
| `Role.ts` | `Role` | `RoleVO` | Membership role within workspace ('Owner' \| 'Admin' \| 'Member' \| 'Viewer') |

#### ModuleRegistry Aggregate (`packages/account-domain/module-registry/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `ModuleId.ts` | `ModuleId` | `ModuleIdVO` | Identifies a capability module within workspace |
| `ModuleStatus.ts` | `ModuleStatus` | `ModuleStatusVO` | Module availability ('enabled' \| 'disabled') |
| `Capability.ts` | `Capability` | `CapabilityVO` | Module capability exposed to workspace |

### SaaS Domain

#### Task Aggregate (`packages/saas-domain/task/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `TaskId.ts` | `TaskId` | `TaskIdVO` | Unique identifier for Task aggregate |
| `TaskStatus.ts` | `TaskStatus` | `TaskStatusVO` | Task state ('pending' \| 'in_progress' \| 'completed' \| 'cancelled') |
| `TaskPriority.ts` | `TaskPriority` | `TaskPriorityVO` | Task priority level ('low' \| 'medium' \| 'high' \| 'urgent') |

#### Payment Aggregate (`packages/saas-domain/payment/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `PaymentId.ts` | `PaymentId` | `PaymentIdVO` | Unique identifier for Payment aggregate |
| `PaymentStatus.ts` | `PaymentStatus` | `PaymentStatusVO` | Payment state ('pending' \| 'processed' \| 'refunded' \| 'failed') |
| `Currency.ts` | `Currency` | `CurrencyVO` | ISO 4217 currency codes ('USD' \| 'EUR' \| 'GBP' \| 'JPY' \| 'CNY' \| 'TWD') |

#### Issue Aggregate (`packages/saas-domain/issue/value-objects/`)
| File | Type Alias | Class Skeleton | Purpose |
|------|------------|----------------|---------|
| `IssueId.ts` | `IssueId` | `IssueIdVO` | Unique identifier for Issue aggregate |
| `IssueType.ts` | `IssueType` | `IssueTypeVO` | Issue classification ('bug' \| 'feature' \| 'enhancement' \| 'task') |
| `IssuePriority.ts` | `IssuePriority` | `IssuePriorityVO` | Issue priority ('low' \| 'medium' \| 'high' \| 'critical') |
| `IssueStatus.ts` | `IssueStatus` | `IssueStatusVO` | Issue state ('open' \| 'in_progress' \| 'closed' \| 'reopened') |

## Class Skeleton Pattern

All VO classes follow this consistent pattern:

```typescript
/**
 * Example Value Object Class Skeleton
 */
export class ExampleVO {
  readonly value: ExampleType;

  private constructor(value: ExampleType) {
    this.value = value;
  }

  /**
   * Factory method to create instance with validation
   * @param value - The raw value
   * @returns ExampleVO instance
   */
  static create(value: ExampleType): ExampleVO {
    // TODO: Implement validation logic
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the value
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The underlying value
   */
  getValue(): ExampleType {
    return this.value;
  }

  /**
   * Checks equality with another instance
   * @param other - Another ExampleVO instance
   * @returns true if values are equal
   */
  equals(other: ExampleVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
```

## Migration Strategy (Future Implementation Phases)

### Phase 1: Current State ✅
- [x] Type aliases exist and are used by all aggregates
- [x] Class skeletons created alongside type aliases
- [x] All 19 Value Objects documented

### Phase 2: Implementation (Future)
- [ ] Implement `create()` factory methods with validation logic
- [ ] Implement `validate()` business rules
- [ ] Implement `getValue()` accessor
- [ ] Implement `equals()` value comparison

### Phase 3: Aggregate Migration (Future)
- [ ] Update Aggregate constructors to accept VO classes
- [ ] Update Aggregate factory methods (`create()`, `fromEvents()`)
- [ ] Update Event handlers to use VO classes
- [ ] Add comprehensive VO unit tests

### Phase 4: Cleanup (Future)
- [ ] Remove type aliases once all aggregates migrated
- [ ] Update all imports to use VO classes
- [ ] Verify no remaining type alias usage

## Benefits of Class-Based Value Objects

- ✅ **Validation**: Enforce business rules at VO creation time
- ✅ **Encapsulation**: Hide internal representation, expose only behavior
- ✅ **Immutability**: Private constructor + readonly fields prevent mutation
- ✅ **Equality**: Proper value-based comparison via `equals()`
- ✅ **Type Safety**: Stronger compile-time guarantees than primitives
- ✅ **Domain Language**: VO classes express domain concepts explicitly

## Implementation Guidelines (Future)

### Validation Rules Examples

**String IDs (AccountId, WorkspaceId, TaskId, etc.)**
- Non-empty string
- Valid format (alphanumeric, UUID, etc.)
- Length constraints if applicable

**Enum-like VOs (Status, Priority, Role, etc.)**
- Value must be one of allowed literals
- Case-sensitive validation
- No custom values accepted

**Currency VO**
- Must be valid ISO 4217 code
- Limited to supported currencies
- Uppercase validation

### Equality Implementation

```typescript
equals(other: AccountIdVO): boolean {
  if (!(other instanceof AccountIdVO)) {
    return false;
  }
  return this.value === other.value;
}
```

### Factory Method Pattern

```typescript
static create(value: string): AccountIdVO {
  if (!value || value.trim().length === 0) {
    throw new Error('AccountId cannot be empty');
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    throw new Error('AccountId format invalid');
  }
  return new AccountIdVO(value);
}
```

## Notes

- **Skeleton Only**: All VO classes currently throw "Not implemented - skeleton only"
- **Type Aliases Preserved**: Aggregates continue using type aliases for now
- **No Breaking Changes**: Dual existence ensures backward compatibility
- **Future Migration**: Actual implementation deferred to implementation phases
- **Multi-Tenant Boundary**: WorkspaceId is the ONLY isolation condition for SaaS operations

## Total Value Objects: 19

- **Account Domain**: 9 VOs across 4 aggregates
- **SaaS Domain**: 10 VOs across 3 aggregates

// END OF FILE
