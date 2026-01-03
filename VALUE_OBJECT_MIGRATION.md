# Value Object Pattern (Future Migration)

## Current State
Currently, all Value Objects in the domain layer are simple TypeScript type aliases:

```typescript
export type AccountId = string;
export type AccountStatus = 'active' | 'suspended' | 'closed';
```

## Future Pattern (Class-Based Value Objects)

Value Objects should eventually be migrated to classes with factory methods and validation:

```typescript
/**
 * Example: AccountId as Value Object Class
 */
export class AccountId {
  private constructor(private readonly value: string) {}

  /**
   * Factory method - Create AccountId with validation
   */
  static create(value: string): AccountId {
    if (!value || value.trim().length === 0) {
      throw new Error('AccountId cannot be empty');
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('AccountId must contain only alphanumeric characters, hyphens, and underscores');
    }
    return new AccountId(value);
  }

  /**
   * Validate AccountId format
   */
  validate(): boolean {
    return this.value.length > 0 && /^[a-zA-Z0-9-_]+$/.test(this.value);
  }

  /**
   * Get underlying value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compare with another AccountId
   */
  equals(other: AccountId): boolean {
    return this.value === other.value;
  }
}
```

## Migration Strategy

1. **Keep existing type aliases** for backward compatibility
2. **Create new class-based VOs** alongside type aliases
3. **Gradually migrate aggregates** to use new VOs
4. **Update tests** to cover validation logic
5. **Remove type aliases** once migration is complete

## Benefits of Class-Based Value Objects

- ✅ **Validation**: Enforce business rules at VO creation
- ✅ **Encapsulation**: Hide internal representation
- ✅ **Immutability**: Prevent accidental mutation
- ✅ **Equality**: Proper value-based comparison
- ✅ **Type Safety**: Stronger compile-time guarantees

## Example VOs to Migrate

### Account Domain
- AccountId
- AccountStatus
- WorkspaceId
- WorkspaceRole
- MemberId
- Role
- ModuleId
- ModuleStatus
- Capability

### SaaS Domain
- TaskId
- TaskStatus
- Priority
- PaymentId
- PaymentStatus
- Amount
- IssueId
- IssueStatus
- Severity

## Notes

- This is a **structural improvement** for future phases
- Current type aliases are **functional** for skeleton phase
- Migration should happen during **implementation phase**, not skeleton phase
- Requires updating Aggregate constructors and factories

// END OF FILE
