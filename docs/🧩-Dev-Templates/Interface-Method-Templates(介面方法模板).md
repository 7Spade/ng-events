# Interface & Method Templates (介面與方法模板)

本文檔提供標準介面與方法模板，用於 Causality-Driven Event-Sourced Process System 開發。

---

## 儲存庫介面 (Repository Interfaces)

### 標準聚合根儲存庫

```typescript
export interface I{EntityName}Repository {
  save(aggregate: {EntityName}Aggregate): Promise<void>;
  findById(id: string): Promise<{EntityName}Aggregate | null>;
  findByBlueprint(blueprintId: string): Promise<{EntityName}Aggregate[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### 事件儲存庫

```typescript
export interface IEventStoreRepository {
  append(event: DomainEvent): Promise<void>;
  getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]>;
  getEventsFromVersion(aggregateId: string, fromVersion: number): Promise<DomainEvent[]>;
  getEventsByCausality(causedBy: string): Promise<DomainEvent[]>;
  getEventsByBlueprint(blueprintId: string): Promise<DomainEvent[]>;
}
```

---

## 服務介面 (Service Interfaces)

### 領域服務

```typescript
export interface I{DomainConcept}DomainService {
  execute{Operation}(params: {OperationParams}): Promise<{ResultType}>;
  validate{Aspect}(entity: {EntityType}): ValidationResult;
  can{Action}(params: {RuleParams}): boolean;
}
```

### 應用服務

```typescript
export interface I{Feature}ApplicationService {
  handle{UseCase}(command: {UseCase}Command): Promise<{ResultType}>;
  query{ViewType}(query: {ViewType}Query): Promise<{ViewType}Result>;
}
```

### 因果驗證服務

```typescript
export interface ICausalityValidationService {
  validateCausality(event: DomainEvent): CausalityResult;
  checkCausalityChain(eventId: string): Promise<CausalityNode[]>;
  hasCircularDependency(sourceId: string, targetId: string): boolean;
  buildCausalityDAG(blueprintId: string): Promise<CausalityDAG>;
}
```

---

## 事件處理器介面 (Event Handler Interfaces)

### 單一事件處理器

```typescript
export interface I{EventName}Handler {
  handle(event: {EventName}Event): Promise<void>;
}
```

### 泛型事件處理器

```typescript
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
  canHandle(eventType: string): boolean;
}
```

### 事件總線

```typescript
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void;
  unsubscribe<T extends DomainEvent>(eventType: string, handler: IEventHandler<T>): void;
}
```

---

## 命令處理器介面 (Command Handler Interfaces)

### 單一命令處理器

```typescript
export interface I{CommandName}Handler {
  execute(command: {CommandName}Command): Promise<{ResultType}>;
  validate(command: {CommandName}Command): ValidationResult;
}
```

### 泛型命令處理器

```typescript
export interface ICommandHandler<TCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
  validate(command: TCommand): ValidationResult;
}
```

---

## 投影介面 (Projection Interfaces)

### 讀模型投影

```typescript
export interface I{ViewType}Projection {
  updateFrom{EventName}(event: {EventName}Event): Promise<void>;
  rebuild(aggregateId: string): Promise<void>;
  query(query: {ViewType}Query): Promise<{ViewType}Result>;
}
```

### 投影儲存庫

```typescript
export interface I{ViewType}ProjectionRepository {
  save(projection: {ViewType}Projection): Promise<void>;
  findById(id: string): Promise<{ViewType}Projection | null>;
  findByBlueprint(blueprintId: string): Promise<{ViewType}Projection[]>;
  delete(id: string): Promise<void>;
}
```

---

## 多租戶介面 (Multi-Tenant Interfaces)

### 租戶隔離服務

```typescript
export interface ITenantIsolationService {
  validateAccess(tenantId: string, resourceId: string): Promise<boolean>;
  filterByTenant<T extends { blueprintId: string }>(entities: T[], tenantId: string): T[];
  scopeToTenant(query: Query, tenantId: string): Query;
}
```

### 多租戶儲存庫擴展

```typescript
export interface IMultiTenantRepository<T> {
  findByAccount(accountId: string): Promise<T[]>;
  findByTeam(teamId: string): Promise<T[]>;
  findByPartner(partnerId: string): Promise<T[]>;
  findByCollaborator(collaboratorId: string): Promise<T[]>;
}
```

---

## 最佳實踐

### ✅ DO
- 明確的 JSDoc 註解
- Promise 返回類型
- 泛型類型提高複用性
- 明確錯誤處理
- 多租戶隔離

### ❌ DON'T  
- 使用 any 類型
- 混合同步與非同步
- 缺少註解
- 過度複雜介面
- 不一致命名

---

**版本**: 1.0 | **更新**: 2026-01-01
