# Phase 5A: Developer Experience (DX)

## 📋 Overview

### Objectives
提供完整的開發者工具，包含 CLI 工具、code generators、測試工具、與文件生成器，提升開發效率與程式碼品質。

**核心目標:**
1. CLI tool for common operations
2. Code generators (aggregate, command, query)
3. Testing utilities and fixtures
4. Documentation generator
5. Local development setup

### Success Criteria
- [ ] CLI tool operational with 10+ commands
- [ ] Code generators for all patterns
- [ ] Testing utilities complete
- [ ] Documentation generator working
- [ ] 50+ test cases
- [ ] Validation script with 40+ checks

### Complexity Estimate
- **Total**: 12/10
- **CLI**: 4/10
- **Generators**: 4/10
- **Testing Tools**: 2/10
- **Documentation**: 2/10

---

## 🎯 Phase 5A Implementation

### Step 1: CLI Framework

```typescript
// packages/cli/src/index.ts

import { Command } from 'commander';

const program = new Command();

program
  .name('ng-events')
  .description('CLI tool for ng-events development')
  .version('1.0.0');

// Generate commands
program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate code from templates')
  .option('-p, --path <path>', 'Output path')
  .action(async (type, name, options) => {
    const generator = getGenerator(type);
    await generator.generate(name, options);
  });

// Validate commands
program
  .command('validate <phase>')
  .description('Validate phase implementation')
  .action(async (phase) => {
    const validator = new PhaseValidator(phase);
    await validator.run();
  });

// Migration commands
program
  .command('migrate')
  .description('Run pending migrations')
  .option('--dry-run', 'Preview migrations without applying')
  .action(async (options) => {
    const runner = new MigrationRunner();
    await runner.run(options);
  });

program.parse();
```

### Step 2: Code Generators

```typescript
// packages/cli/src/generators/AggregateGenerator.ts

export class AggregateGenerator {
  async generate(name: string, options: GeneratorOptions): Promise<void> {
    const className = pascalCase(name);
    const fileName = kebabCase(name);

    // Generate aggregate
    const aggregateContent = this.generateAggregate(className);
    await writeFile(`${options.path}/${fileName}.ts`, aggregateContent);

    // Generate tests
    const testContent = this.generateTests(className);
    await writeFile(`${options.path}/${fileName}.spec.ts`, testContent);

    // Generate events
    const eventsContent = this.generateEvents(className);
    await writeFile(`${options.path}/events/${fileName}-events.ts`, eventsContent);

    console.log(`✅ Generated aggregate: ${className}`);
  }

  private generateAggregate(className: string): string {
    return `
import { AggregateRoot } from '@ng-events/core-engine';

export class ${className} extends AggregateRoot {
  private constructor(
    id: string,
    private name: string
  ) {
    super(id, '${className.toLowerCase()}');
  }

  static create(name: string): ${className} {
    const id = generateId();
    const aggregate = new ${className}(id, name);
    
    aggregate.raiseEvent(new ${className}CreatedEvent({
      id,
      name,
    }));

    return aggregate;
  }

  static fromEvents(events: DomainEvent[]): ${className} {
    const aggregate = new ${className}('', '');
    events.forEach(event => aggregate.apply(event));
    return aggregate;
  }

  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case '${className}Created':
        this.applyCreated(event as ${className}CreatedEvent);
        break;
    }
  }

  private applyCreated(event: ${className}CreatedEvent): void {
    this.id = event.data.id;
    this.name = event.data.name;
  }

  getName(): string {
    return this.name;
  }
}
`;
  }

  private generateTests(className: string): string {
    return `
describe('${className}', () => {
  describe('create()', () => {
    it('should create aggregate with event', () => {
      const aggregate = ${className}.create('Test');
      
      expect(aggregate.getId()).toBeDefined();
      expect(aggregate.getName()).toBe('Test');
      expect(aggregate.getUncommittedEvents()).toHaveLength(1);
    });
  });

  describe('fromEvents()', () => {
    it('should reconstruct from events', () => {
      const events = [
        new ${className}CreatedEvent({
          id: 'test-id',
          name: 'Test',
        }),
      ];

      const aggregate = ${className}.fromEvents(events);

      expect(aggregate.getId()).toBe('test-id');
      expect(aggregate.getName()).toBe('Test');
      expect(aggregate.getUncommittedEvents()).toHaveLength(0);
    });
  });
});
`;
  }
}
```

### Step 3: Testing Utilities

```typescript
// packages/testing/src/fixtures/AggregateFixtures.ts

export class AggregateFixtures {
  static createWorkspace(overrides?: Partial<WorkspaceData>): Workspace {
    return Workspace.create(
      overrides?.name || 'Test Workspace',
      overrides?.ownerId || 'owner-123'
    );
  }

  static createTask(overrides?: Partial<TaskData>): Task {
    return Task.create(
      overrides?.workspaceId || 'ws-123',
      overrides?.title || 'Test Task',
      overrides?.assignedTo
    );
  }

  static createMembership(overrides?: Partial<MembershipData>): Membership {
    return Membership.create(
      overrides?.workspaceId || 'ws-123',
      overrides?.userId || 'user-123',
      overrides?.role || 'Member'
    );
  }
}

// packages/testing/src/mocks/RepositoryMocks.ts

export class MockWorkspaceRepository implements WorkspaceRepository {
  private aggregates = new Map<string, Workspace>();

  async save(aggregate: Workspace): Promise<void> {
    this.aggregates.set(aggregate.getId(), aggregate);
    aggregate.clearUncommittedEvents();
  }

  async load(id: string): Promise<Workspace> {
    const aggregate = this.aggregates.get(id);
    if (!aggregate) {
      throw new Error(`Workspace not found: ${id}`);
    }
    return aggregate;
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    return Array.from(this.aggregates.values())
      .filter(w => w.getOwnerId() === ownerId);
  }

  reset(): void {
    this.aggregates.clear();
  }
}
```

### Step 4: Documentation Generator

```typescript
// packages/cli/src/generators/DocumentationGenerator.ts

export class DocumentationGenerator {
  async generate(options: DocGeneratorOptions): Promise<void> {
    const aggregates = await this.scanAggregates(options.sourcePath);
    
    // Generate aggregate docs
    for (const aggregate of aggregates) {
      const doc = this.generateAggregateDoc(aggregate);
      await writeFile(`${options.outputPath}/${aggregate.name}.md`, doc);
    }

    // Generate index
    const indexDoc = this.generateIndexDoc(aggregates);
    await writeFile(`${options.outputPath}/INDEX.md`, indexDoc);

    console.log(`✅ Generated documentation for ${aggregates.length} aggregates`);
  }

  private generateAggregateDoc(aggregate: AggregateMetadata): string {
    return `
# ${aggregate.name} Aggregate

## Overview
${aggregate.description || 'No description provided'}

## Properties
${aggregate.properties.map(p => `- **${p.name}**: ${p.type}`).join('
')}

## Methods
${aggregate.methods.map(m => `- **${m.name}(${m.params})**: ${m.returnType}`).join('
')}

## Events
${aggregate.events.map(e => `- **${e.name}**: ${e.description}`).join('
')}

## Usage Example

\`\`\`typescript
const ${aggregate.name.toLowerCase()} = ${aggregate.name}.create(/* params */);
\`\`\`
`;
  }
}
```

---

## 🧪 Testing Strategy

```typescript
describe('CLI', () => {
  it('should generate aggregate with all files', async () => {
    await cli.run(['generate', 'aggregate', 'Product']);

    expect(fs.existsSync('product.ts')).toBe(true);
    expect(fs.existsSync('product.spec.ts')).toBe(true);
    expect(fs.existsSync('events/product-events.ts')).toBe(true);
  });

  it('should run validation script', async () => {
    const result = await cli.run(['validate', '1A']);
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('✅');
  });
});

describe('AggregateFixtures', () => {
  it('should create test workspace', () => {
    const workspace = AggregateFixtures.createWorkspace();
    
    expect(workspace.getName()).toBe('Test Workspace');
    expect(workspace.getOwnerId()).toBe('owner-123');
  });

  it('should create with overrides', () => {
    const workspace = AggregateFixtures.createWorkspace({
      name: 'Custom Name',
    });
    
    expect(workspace.getName()).toBe('Custom Name');
  });
});
```

---

## ✅ Success Criteria

- ✅ CLI tool with 10+ commands
- ✅ Code generators operational
- ✅ Testing utilities complete
- ✅ Documentation generator working
- ✅ 50+ test cases passing

**Phase 5A Complete**: Excellent DX! 🎉
