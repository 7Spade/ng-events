## 引擎要泛型、語意要具體（決策指南）

🧭 摘要

- 可以泛型的：Event 殼、Causation/Correlation、Saga、Transition、Compensation。
- 不該泛型的：事件名稱、業務語意、決策規則（policy）。
- 思路：引擎像 Angular 核心抽象；語意放在外層 Domain 爽寫。

### Table of Contents

- [泛型殼 vs 語意魂](#泛型殼-vs-語意魂)
- [Saga 與 Context 泛型化](#saga-與-context-泛型化)
- [Transition / Compensation](#transition--compensation)
- [實例：Workspace Provisioning](#實例workspace-provisioning)
- [為什麼不能全泛型](#為什麼不能全泛型)
- [架構外觀](#架構外觀)
- [收尾](#收尾)

### 泛型殼 vs 語意魂

```ts
export interface Event<TType extends string, TPayload> {
  eventId: string
  type: TType
  payload: TPayload
  occurredAt: Date
  causation?: { eventId: string; type: string }
  correlationId?: string
}
```

**Domain 事件示例**

```ts
type TaskCompleted = Event<'TaskCompleted', {
  taskId: string
  completedBy: string
}>
```

✅ TS 幫你鎖死 payload，Event Store / Bus 不需知道業務。  
❌ 事件名稱不可抽成 enum 或任意字串。

### Saga 與 Context 泛型化

```ts
export interface SagaContext {
  sagaId: string
  status: 'pending' | 'completed' | 'failed'
}

export interface Saga<
  TContext extends SagaContext,
  TEvent extends Event<string, any>
> {
  readonly sagaType: string
  initialContext(event: TEvent): TContext
  transition(
    context: TContext,
    event: TEvent
  ): SagaTransition<TContext> | null
}
```

核心：Saga 是純狀態機，只決定「看到事件 → 狀態怎麼變」。  
No I/O, no DB, no dispatch。

### Transition / Compensation

```ts
export interface SagaTransition<TContext> {
  nextContext: TContext
  commands?: Command[]
}

export interface Compensation<TContext> {
  when(context: TContext): boolean
  execute(context: TContext): Command[]
}
```

- Transition 分離「事實」與「意圖」，才可重播。  
- Compensation 只看 Context，發出反向意圖，不是 rollback DB。

### 實例：Workspace Provisioning

```ts
interface WorkspaceSagaContext extends SagaContext {
  workspaceId: string
  moduleProvisioned: boolean
  billingCreated: boolean
}

class WorkspaceProvisionSaga
  implements Saga<WorkspaceSagaContext, Event<string, any>> {
  sagaType = 'WorkspaceProvision'
  initialContext(event: WorkspaceCreated): WorkspaceSagaContext {
    return {
      sagaId: event.correlationId!,
      status: 'pending',
      workspaceId: event.payload.workspaceId,
      moduleProvisioned: false,
      billingCreated: false
    }
  }
  transition(ctx, event) {
    if (event.type === 'ModulesProvisioned') {
      return { nextContext: { ...ctx, moduleProvisioned: true } }
    }
    if (event.type === 'BillingCreationFailed') {
      return {
        nextContext: { ...ctx, status: 'failed' },
        commands: [rollbackModules(ctx.workspaceId)]
      }
    }
    return null
  }
}
```

引擎只做三件事：丟事件進 Saga → 拿回 Transition → 發 Command。  
引擎不懂業務，但業務跑得飛起來。

### 為什麼不能全泛型

- `Event<'SOMETHING_HAPPENED', any>` 會回到 string-based hell。  
- Saga 只剩流程、沒有語意，Debug 想揍自己。  
- 事件名稱 = 語言邊界，必須具體。

### 架構外觀

```
packages/
├─ core-engine/          ← 泛型引擎（冷、無語意）
├─ saas-domain/          ← 業務事件、Aggregate、Saga 實作
├─ platform-adapters/    ← Firebase / PubSub / Scheduler
├─ ui-angular/           ← Projection / Query / View
```

👉 結構不用推倒，只是責任更清楚；可加一層 Router 做事件 → Saga 訂閱映射。

### 收尾

你正在做「Causality-aware Workflow Engine」。

> 泛型是骨架，事件是語言，Saga 是節奏。

三個分開，系統就會跳舞。💃🕺

// END OF FILE
