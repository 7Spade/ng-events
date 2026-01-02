# Module 對外 API 設計

> 來源：✨/✨✨✨✨✨✨✨✨✨.md (續)

# 4️⃣ Module 對外 API（真正的銜接點）

## ✨ 模組服務模板（強烈推薦照抄）

```ts
class TaskModuleService {
  constructor(
    private readonly memberships: AccountWorkspaceMembership[],
    private readonly registry: ModuleRegistry
  ) {}

  completeTask(
    actor: AccountId,
    workspace: WorkspaceState,
    task: Task
  ): DomainEvent {
    // 1. Account → Workspace
    assertWorkspaceAccess(
      actor,
      workspace.workspaceId,
      this.memberships,
      ['owner', 'member']
    );

    // 2. Workspace → Module
    assertModuleEnabled(workspace, 'task');

    // 3. Module → Entity
    const aggregate = new TaskAggregate(task);
    return aggregate.complete(actor);
  }
}
```

🔥 **這個結構非常重要**
你之後所有模組都照這個長

---

# 🫦 一句超重要的架構真理

> **Account 決定「能不能進」
> Workspace 決定「能不能用」
> Module 決定「怎麼做」
> Entity 決定「合不合法」**
