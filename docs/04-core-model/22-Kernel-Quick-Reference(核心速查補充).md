## Kernel Quick Reference（與 20 同步）

🧭 為什麼存在

- 舊筆記與 20 內容重複，保留為速查版並指向 20-Kernel-Primitives(泛型核心速查) 作為唯一真實來源。
- 若兩邊不一致，以 20 為準；修改時請同步兩份或只改 20。

### Table of Contents

- [核心介面](#核心介面)
- [心智模型](#心智模型)
- [使用提醒](#使用提醒)

### 核心介面

```ts
export interface Event<TType extends string = string, TPayload = unknown> {
  readonly eventId: string
  readonly type: TType
  readonly payload: TPayload
  readonly occurredAt: Date
  readonly causation?: Causation
  readonly correlationId?: CorrelationId
}

export interface Causation {
  readonly eventId: string
  readonly type: string
}

export type CorrelationId = string

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

export interface SagaTransition<TContext> {
  readonly nextContext: TContext
  readonly commands?: readonly Command[]
}

export interface Compensation<TContext extends SagaContext> {
  when(context: TContext): boolean
  execute(context: TContext): Command[]
}

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

### 心智模型

```
Event
  ↓
Saga.transition(context, event)
  ↓
SagaTransition
  ├─ nextContext
  └─ Commands
        ↓
   新 Event
```

閉環、可 replay、可 debug。詳細解釋與不變量請見 20。

### 使用提醒

- [ ] 修改前先讀 20，避免分歧。
- [ ] 引擎層不帶業務語意；Saga 純函數；Compensation 只看 context。
- [ ] 發現矛盾時，優先修正 20 並在此更新鏈接。

// END OF FILE
