## Kernel Primitives（泛型核心速查）

🧭 摘要

- 核心抽象只描述事實流：Event、Causation/Correlation、Saga、Transition、Compensation、Command。
- 每個介面保持不可變、無副作用，可重播且不含業務語意。
- 邊界鐵律：引擎不知道任何 domain noun（Account / Workspace / Billing）。

### Table of Contents

- [Event（事件殼）](#event事件殼)
- [Causation / Correlation](#causation--correlation)
- [Saga State Machine](#saga-state-machine)
- [Saga Transition](#saga-transition)
- [Compensation](#compensation)
- [Command](#command)
- [End-to-End Flow](#end-to-end-flow)
- [Key Principle](#key-principle)
- [Invariants Checklist](#invariants-checklist)

### Event（事件殼）

```ts
export interface Event<
  TType extends string = string,
  TPayload = unknown
> {
  readonly eventId: string
  readonly type: TType
  readonly payload: TPayload
  readonly occurredAt: Date
  readonly causation?: Causation
  readonly correlationId?: CorrelationId
}
```

**不變量**

- `eventId` 唯一，事件不可變、可重播。
- `type` 是語意邊界，不抽象成 enum 或任意字串。
- `payload` 只放事實，不放決策。

### Causation / Correlation

```ts
export interface Causation {
  readonly eventId: string
  readonly type: string
}

export type CorrelationId = string
```

- 每個非起點事件需要 `causation`；流程共用 `correlationId`。
- Correlation 串故事線，Causation 表父子因果，兩者不可混用。

### Saga State Machine

```ts
export interface SagaContext {
  readonly sagaId: string
  readonly status: 'pending' | 'completed' | 'failed'
}

export interface Saga<
  TContext extends SagaContext,
  TEvent extends Event
> {
  readonly sagaType: string
  initialContext(event: TEvent): TContext
  transition(
    context: TContext,
    event: TEvent
  ): SagaTransition<TContext> | null
}
```

- Saga 是純反應器：看到事件 → 決定狀態怎麼變，不做 I/O、不 dispatch。

### Saga Transition

```ts
export interface SagaTransition<TContext> {
  readonly nextContext: TContext
  readonly commands?: readonly Command[]
}
```

- 狀態變化是事實；Command 是意圖，可能失敗。分離兩者才可重播。

### Compensation

```ts
export interface Compensation<TContext extends SagaContext> {
  when(context: TContext): boolean
  execute(context: TContext): Command[]
}
```

- 補償是事後反應，只依賴 `SagaContext`，不是 DB rollback，而是反向意圖。

### Command

```ts
export interface Command<
  TType extends string = string,
  TPayload = unknown
> {
  readonly type: TType
  readonly payload: TPayload
  readonly correlationId?: CorrelationId
  readonly causation?: Causation
}
```

- Event = 已發生；Command = 想發生。守住界線，系統才不會瘋。

### End-to-End Flow

```
Event
  ↓
Saga.transition(context, event)
  ↓
SagaTransition
  ├─ nextContext
  └─ Commands
        ↓
   （世界執行）
        ↓
   新 Event
```

閉環、可 replay、可 debug。

### Key Principle

> 泛型是為了「保護語意」，不是為了「抽掉語意」。

### Invariants Checklist

- [ ] 引擎層不帶任何業務語意、enum、Firebase 型別。
- [ ] 事件與命令使用 Correlation 串故事，Causation 連父子。
- [ ] Saga 純函數，Transition 不做 side effect，Compensation 只看 context。

// END OF FILE
