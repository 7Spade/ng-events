# Phase 4C: Migration Tools & Schema Evolution

## 📋 Overview

### Objectives
提供完整的資料遷移工具與腳本，支援 schema 演進、資料修復、與歷史資料轉換。

**核心目標：**
1. Migration script framework
2. Schema versioning system
3. Data transformation utilities
4. Rollback mechanisms
5. Migration testing framework

### Success Criteria
- [ ] MigrationRunner 框架完成
- [ ] 5+ migration scripts實作
- [ ] Schema version tracking
- [ ] Rollback mechanism完整
- [ ] 40+ test cases
- [ ] Validation script with 30+ checks
- [ ] All checks pass at 100%

### Complexity Estimate
- **Total**: 10/10
- **Framework**: 4/10
- **Scripts**: 3/10
- **Testing**: 3/10

### Dependencies
- **Requires**: Phase 2D (Projection rebuild), Phase 4B (Error handling)
- **Blocks**: Phase 5B (Deployment with migrations)

---

## 🎯 Phase 4C Implementation

### Step 1: Migration Interface

```typescript
// packages/core-engine/migrations/Migration.ts

export interface MigrationContext {
  firestore: Firestore;
  eventStore: EventStore;
  logger: Logger;
}

export interface Migration {
  id: string;
  version: string;
  description: string;
  
  up(context: MigrationContext): Promise<void>;
  down(context: MigrationContext): Promise<void>;
  
  validate?(context: MigrationContext): Promise<boolean>;
}
```

### Step 2: MigrationRunner

```typescript
// packages/core-engine/migrations/MigrationRunner.ts

export class MigrationRunner {
  constructor(private context: MigrationContext) {}

  async runMigrations(migrations: Migration[]): Promise<void> {
    for (const migration of migrations) {
      const applied = await this.isApplied(migration.id);
      if (applied) {
        console.log(`Skipping ${migration.id} (already applied)`);
        continue;
      }

      console.log(`Running migration: ${migration.id}`);
      await migration.up(this.context);
      await this.markAsApplied(migration);
    }
  }

  async rollback(migration: Migration): Promise<void> {
    console.log(`Rolling back: ${migration.id}`);
    await migration.down(this.context);
    await this.markAsReverted(migration.id);
  }

  private async isApplied(id: string): Promise<boolean> {
    const doc = await this.context.firestore
      .collection('_migrations')
      .doc(id)
      .get();
    return doc.exists;
  }

  private async markAsApplied(migration: Migration): Promise<void> {
    await this.context.firestore
      .collection('_migrations')
      .doc(migration.id)
      .set({
        version: migration.version,
        description: migration.description,
        appliedAt: new Date(),
      });
  }

  private async markAsReverted(id: string): Promise<void> {
    await this.context.firestore
      .collection('_migrations')
      .doc(id)
      .delete();
  }
}
```

### Step 3: Example Migrations

```typescript
// migrations/001-add-workspace-status.migration.ts

export class AddWorkspaceStatusMigration implements Migration {
  id = '001-add-workspace-status';
  version = '1.0.0';
  description = 'Add status field to workspace projections';

  async up(context: MigrationContext): Promise<void> {
    const workspaces = await context.firestore
      .collection('projections/workspace')
      .get();

    const batch = context.firestore.batch();
    workspaces.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'active' });
    });

    await batch.commit();
  }

  async down(context: MigrationContext): Promise<void> {
    const workspaces = await context.firestore
      .collection('projections/workspace')
      .get();

    const batch = context.firestore.batch();
    workspaces.docs.forEach(doc => {
      const data = doc.data();
      delete data.status;
      batch.set(doc.ref, data);
    });

    await batch.commit();
  }
}
```

### Step 4: Schema Version Tracking

```typescript
// packages/core-engine/migrations/SchemaVersion.ts

export interface SchemaVersionInfo {
  component: string;
  version: string;
  appliedMigrations: string[];
  lastUpdated: Date;
}

export class SchemaVersionTracker {
  constructor(private firestore: Firestore) {}

  async getCurrentVersion(component: string): Promise<string> {
    const doc = await this.firestore
      .collection('_schema_versions')
      .doc(component)
      .get();

    if (!doc.exists) return '0.0.0';

    return (doc.data() as SchemaVersionInfo).version;
  }

  async updateVersion(
    component: string,
    version: string,
    migrationId: string
  ): Promise<void> {
    const doc = this.firestore
      .collection('_schema_versions')
      .doc(component);

    const current = await doc.get();
    const appliedMigrations = current.exists
      ? (current.data() as SchemaVersionInfo).appliedMigrations
      : [];

    await doc.set({
      component,
      version,
      appliedMigrations: [...appliedMigrations, migrationId],
      lastUpdated: new Date(),
    });
  }
}
```

---

## 🧪 Testing Strategy

```typescript
describe('MigrationRunner', () => {
  it('should run pending migrations', async () => {
    const runner = new MigrationRunner(mockContext);
    const migration = new TestMigration();
    
    await runner.runMigrations([migration]);
    
    const applied = await runner['isApplied'](migration.id);
    expect(applied).toBe(true);
  });

  it('should skip already applied migrations', async () => {
    const runner = new MigrationRunner(mockContext);
    const migration = new TestMigration();
    
    await runner.runMigrations([migration]);
    await runner.runMigrations([migration]); // Run again
    
    // Should only run once
    expect(migration.upCallCount).toBe(1);
  });

  it('should rollback migrations', async () => {
    const runner = new MigrationRunner(mockContext);
    const migration = new TestMigration();
    
    await runner.runMigrations([migration]);
    await runner.rollback(migration);
    
    const applied = await runner['isApplied'](migration.id);
    expect(applied).toBe(false);
  });
});
```

---

## ✅ Success Criteria

- ✅ Migration framework operational
- ✅ 5+ migrations implemented
- ✅ Rollback mechanism tested
- ✅ Schema versioning tracked
- ✅ 40+ test cases passing

**Phase 4C Complete**: Safe migrations! 🎉
