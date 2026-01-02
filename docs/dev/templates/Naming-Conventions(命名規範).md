# Naming Conventions Template (命名規範模板)

## 概述 (Overview)

本文檔定義 Causality-Driven Event-Sourced Process System 中的命名規範，確保代碼一致性與可維護性。

**適用範圍 (Scope):**
- TypeScript/Angular 代碼
- 事件溯源 (Event-Sourcing)
- 因果驅動系統 (Causality-Driven)
- 多租戶 SaaS 平台

---

## 函數命名模板 (Function Naming Templates)

### 1. 事件處理函數 (Event Handlers)

**模式 (Pattern):**
```typescript
on{EventName}({aggregateType}: {AggregateType}): void
handle{EventName}Event(event: {EventName}Event): Promise<void>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
onTaskCreated(task: TaskAggregate): void { }
handleTaskCompletedEvent(event: TaskCompletedEvent): Promise<void> { }
onPaymentApproved(payment: PaymentAggregate): void { }

// ❌ BAD
taskCreated(t: any): void { }  // 缺少 on 前綴
processEvent(e: Event): void { }  // 不明確
```

---

### 2. 命令處理函數 (Command Handlers)

**模式 (Pattern):**
```typescript
execute{CommandName}Command(command: {CommandName}Command): Promise<Result>
handle{CommandName}(command: {CommandName}Command): Promise<{AggregateType}>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
executeCreateTaskCommand(command: CreateTaskCommand): Promise<Result> { }
handleApprovePayment(command: ApprovePaymentCommand): Promise<PaymentAggregate> { }

// ❌ BAD
createTask(data: any): Promise<any> { }  // 不明確是命令
doApproval(cmd: any): void { }  // 缺少類型
```

---

### 3. 查詢函數 (Query Functions)

**模式 (Pattern):**
```typescript
get{EntityName}By{Criteria}(criteria: {CriteriaType}): Promise<{EntityType}>
find{EntityName}({filters}): Promise<{EntityType}[]>
list{EntityName}sFor{Context}(contextId: string): Promise<{EntityType}[]>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
getTaskById(taskId: string): Promise<TaskAggregate> { }
findTasksByBlueprint(blueprintId: string): Promise<TaskAggregate[]> { }
listTasksForAccount(accountId: string): Promise<TaskProjection[]> { }
listTasksInWorkspace(workspaceId: string): Promise<TaskProjection[]> { }

// ❌ BAD
getTasks(): Promise<any[]> { }  // 缺少上下文
queryData(id: string): any { }  // 不明確
listTasksForUser(userId: string): any { }  // 應使用 accountId
```

---

### 4. 投影更新函數 (Projection Update Functions)

**模式 (Pattern):**
```typescript
update{ProjectionName}From{EventName}(event: {EventName}Event): Promise<void>
rebuild{ProjectionName}Projection(aggregateId: string): Promise<void>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
updateTaskListFromTaskCreated(event: TaskCreatedEvent): Promise<void> { }
rebuildPaymentSummaryProjection(paymentId: string): Promise<void> { }

// ❌ BAD
updateProjection(e: any): void { }  // 不明確
refreshView(id: string): any { }  // 缺少類型
```

---

### 5. 驗證函數 (Validation Functions)

**模式 (Pattern):**
```typescript
validate{EntityName}{Aspect}(entity: {EntityType}): ValidationResult
is{Condition}(value: {Type}): boolean
can{Action}({params}): boolean
```

**範例 (Examples):**
```typescript
// ✅ GOOD
validateTaskTitle(title: string): ValidationResult { }
isValidBlueprint(blueprintId: string): boolean { }
canApprovePayment(accountId: string, paymentId: string): boolean { }
hasAccessToWorkspace(accountId: string, workspaceId: string): boolean { }

// ❌ BAD
checkTask(t: any): boolean { }  // 不明確
valid(x: any): any { }  // 太泛化
canApprove(userId: string, id: string): boolean { }  // 應使用 accountId
```

---

### 6. 因果驗證函數 (Causality Validation Functions)

**模式 (Pattern):**
```typescript
validateCausality{Action}(event: DomainEvent): CausalityResult
checkCausalityChain(eventId: string): Promise<CausalityNode[]>
hasCausalDependency(sourceId: string, targetId: string): boolean
```

**範例 (Examples):**
```typescript
// ✅ GOOD
validateCausalityForTaskCompletion(event: TaskCompletedEvent): CausalityResult { }
checkCausalityChain(eventId: string): Promise<CausalityNode[]> { }
hasCausalDependency(taskId: string, paymentId: string): boolean { }

// ❌ BAD
checkCausality(e: any): any { }  // 不明確
validateChain(id: string): any { }  // 缺少上下文
```

---

### 7. 多租戶過濾函數 (Multi-Tenant Filter Functions)

**模式 (Pattern):**
```typescript
filterByWorkspace(data: {Type}[], workspaceId: string): {Type}[]
scopeToWorkspace(query: Query, workspaceId: string): Query
filterByAccount(data: {Type}[], accountId: string): {Type}[]
ensureTenantIsolation(aggregateId: string, workspaceId: string): boolean
```

**範例 (Examples):**
```typescript
// ✅ GOOD
filterByWorkspace(tasks: TaskAggregate[], workspaceId: string): TaskAggregate[] { }
scopeToWorkspace(query: Query, workspaceId: string): Query { }
filterByAccount(payments: PaymentAggregate[], accountId: string): PaymentAggregate[] { }
ensureTenantIsolation(taskId: string, workspaceId: string): boolean { }

// ❌ BAD
filterData(d: any[], id: string): any[] { }  // 不明確
applyFilter(q: any, id: any): any { }  // 缺少類型
filterByBlueprint(tasks: any[], id: string): any[] { }  // 應使用 Workspace
scopeToOrganization(query: any, orgId: string): any { }  // 應使用 Workspace
```

---

### 8. Account/Workspace 相關函數 (Account/Workspace Functions)

**模式 (Pattern):**
```typescript
getAccountById(accountId: string): Promise<Account>
getWorkspaceById(workspaceId: string): Promise<Workspace>
getAccountWorkspaces(accountId: string): Promise<Workspace[]>
getWorkspaceMembers(workspaceId: string): Promise<AccountWorkspaceMembership[]>
hasWorkspaceAccess(accountId: string, workspaceId: string): Promise<boolean>
switchWorkspace(accountId: string, workspaceId: string): Promise<void>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
getAccountById(accountId: string): Promise<Account> { }
getAccountWorkspaces(accountId: string): Promise<Workspace[]> { }
getWorkspaceMembers(workspaceId: string): Promise<AccountWorkspaceMembership[]> { }
hasWorkspaceAccess(accountId: string, workspaceId: string): Promise<boolean> { }
addAccountToWorkspace(accountId: string, workspaceId: string, role: WorkspaceRole): Promise<void> { }

// ❌ BAD
getUser(id: string): any { }  // 應使用 Account
getUserOrganizations(id: string): any { }  // 應使用 AccountWorkspaces
getTeamMembers(id: string): any { }  // 應使用 WorkspaceMembers
checkAccess(userId: string, teamId: string): any { }  // 應使用 Account/Workspace
```


---

## 類別命名模板 (Class Naming Templates)

### 1. 聚合根 (Aggregates)

**模式 (Pattern):**
```typescript
{EntityName}Aggregate
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class TaskAggregate { }
export class PaymentAggregate { }
export class IssueAggregate { }

// ❌ BAD
export class Task { }  // 缺少 Aggregate 後綴
export class PaymentAgg { }  // 縮寫不清楚
```

---

### 2. 值對象 (Value Objects)

**模式 (Pattern):**
```typescript
{ConceptName}ValueObject 或 {ConceptName}
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class EmailAddress { }
export class MoneyAmount { }
export class TaskTitle { }

// ❌ BAD
export class Email { }  // 可能與服務混淆
export class Amount { }  // 太泛化
```

---

### 3. 事件 (Events)

**模式 (Pattern):**
```typescript
{EntityName}{PastTenseAction}Event
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class TaskCreatedEvent { }
export class PaymentApprovedEvent { }
export class IssueResolvedEvent { }

// ❌ BAD
export class TaskCreate { }  // 現在式，應用過去式
export class PaymentEvent { }  // 缺少動作
```

---

### 4. 命令 (Commands)

**模式 (Pattern):**
```typescript
{VerbInfinitive}{EntityName}Command
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class CreateTaskCommand { }
export class ApprovePaymentCommand { }
export class ResolveIssueCommand { }

// ❌ BAD
export class TaskCreate { }  // 順序錯誤
export class ApproveCommand { }  // 缺少實體名稱
```

---

### 5. 投影/讀模型 (Projections)

**模式 (Pattern):**
```typescript
{EntityName}{ViewType}Projection
{EntityName}ReadModel
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class TaskListProjection { }
export class PaymentSummaryProjection { }
export class TaskReadModel { }

// ❌ BAD
export class TaskView { }  // 不明確是投影
export class Payment { }  // 與聚合混淆
```

---

### 6. 服務 (Services)

**模式 (Pattern):**
```typescript
{DomainConcept}Service
{DomainConcept}DomainService  // 領域服務
{DomainConcept}ApplicationService  // 應用服務
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export class CausalityValidationService { }
export class TaskDomainService { }
export class PaymentApplicationService { }

// ❌ BAD
export class TaskSvc { }  // 縮寫不清楚
export class Service { }  // 太泛化
```

---

### 7. 儲存庫 (Repositories)

**模式 (Pattern):**
```typescript
{EntityName}Repository
I{EntityName}Repository  // 介面
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export interface ITaskRepository { }
export class TaskRepository implements ITaskRepository { }

// ❌ BAD
export class TaskRepo { }  // 縮寫不清楚
export class TaskData { }  // 不明確
```

---

## 變數命名模板 (Variable Naming Templates)

### 1. 布林值 (Booleans)

**模式 (Pattern):**
```typescript
is{Condition}
has{Property}
can{Action}
should{Action}
```

**範例 (Examples):**
```typescript
// ✅ GOOD
const isActive: boolean = true;
const hasPermission: boolean = false;
const canApprove: boolean = true;
const shouldNotify: boolean = false;

// ❌ BAD
const active: boolean = true;  // 不明確
const permission: boolean = false;  // 不明確
```

---

### 2. 集合 (Collections)

**模式 (Pattern):**
```typescript
{entityName}s  // 複數
{entityName}List
{entityName}Map
{entityName}Set
```

**範例 (Examples):**
```typescript
// ✅ GOOD
const tasks: TaskAggregate[] = [];
const taskList: TaskAggregate[] = [];
const taskMap: Map<string, TaskAggregate> = new Map();

// ❌ BAD
const taskArray: any[] = [];  // 使用 any
const data: any[] = [];  // 不明確
```

---

### 3. 事件/命令變數 (Event/Command Variables)

**模式 (Pattern):**
```typescript
{action}{Entity}Event
{action}{Entity}Command
```

**範例 (Examples):**
```typescript
// ✅ GOOD
const taskCreatedEvent: TaskCreatedEvent = { };
const approvePaymentCommand: ApprovePaymentCommand = { };

// ❌ BAD
const event: any = { };  // 不明確
const cmd: any = { };  // 縮寫不清楚
```

---

## 介面命名模板 (Interface Naming Templates)

### 1. 儲存庫介面 (Repository Interfaces)

**模式 (Pattern):**
```typescript
I{EntityName}Repository
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export interface ITaskRepository {
  save(task: TaskAggregate): Promise<void>;
  findById(id: string): Promise<TaskAggregate | null>;
  findByBlueprint(blueprintId: string): Promise<TaskAggregate[]>;
}

// ❌ BAD
export interface TaskRepo { }  // 縮寫不清楚
export interface Repository { }  // 太泛化
```

---

### 2. 服務介面 (Service Interfaces)

**模式 (Pattern):**
```typescript
I{DomainConcept}Service
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export interface ICausalityValidationService {
  validate(event: DomainEvent): CausalityResult;
  checkChain(eventId: string): Promise<CausalityNode[]>;
}

// ❌ BAD
export interface CausalitySvc { }  // 縮寫不清楚
export interface Validator { }  // 不明確
```

---

### 3. 事件處理器介面 (Event Handler Interfaces)

**模式 (Pattern):**
```typescript
I{EventName}Handler
IEventHandler<{EventType}>
```

**範例 (Examples):**
```typescript
// ✅ GOOD
export interface ITaskCreatedEventHandler {
  handle(event: TaskCreatedEvent): Promise<void>;
}

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// ❌ BAD
export interface Handler { }  // 太泛化
export interface EventProc { }  // 縮寫不清楚
```

---

## 檔案命名模板 (File Naming Templates)

### 1. 聚合根檔案 (Aggregate Files)

**模式 (Pattern):**
```
{entity-name}.aggregate.ts
```

**範例 (Examples):**
```
✅ task.aggregate.ts
✅ payment.aggregate.ts
❌ TaskAggregate.ts  // 不使用 PascalCase 檔名
❌ task.ts  // 缺少類型後綴
```

---

### 2. 事件檔案 (Event Files)

**模式 (Pattern):**
```
{entity-name}-{action}.event.ts
{entity-name}.events.ts  // 多個事件
```

**範例 (Examples):**
```
✅ task-created.event.ts
✅ payment-approved.event.ts
✅ task.events.ts  // 包含多個 Task 事件
❌ TaskCreated.ts  // 不使用 PascalCase 檔名
❌ event.ts  // 不明確
```

---

### 3. 命令檔案 (Command Files)

**模式 (Pattern):**
```
{action}-{entity-name}.command.ts
{entity-name}.commands.ts  // 多個命令
```

**範例 (Examples):**
```
✅ create-task.command.ts
✅ approve-payment.command.ts
✅ task.commands.ts  // 包含多個 Task 命令
❌ CreateTask.ts  // 不使用 PascalCase 檔名
❌ command.ts  // 不明確
```

---

### 4. 投影檔案 (Projection Files)

**模式 (Pattern):**
```
{entity-name}-{view-type}.projection.ts
{entity-name}.read-model.ts
```

**範例 (Examples):**
```
✅ task-list.projection.ts
✅ payment-summary.projection.ts
✅ task.read-model.ts
❌ TaskView.ts  // 不使用 PascalCase 檔名
❌ projection.ts  // 不明確
```

---

### 5. 服務檔案 (Service Files)

**模式 (Pattern):**
```
{concept-name}.service.ts
{concept-name}.domain-service.ts
{concept-name}.application-service.ts
```

**範例 (Examples):**
```
✅ causality-validation.service.ts
✅ task.domain-service.ts
✅ payment.application-service.ts
❌ Service.ts  // 不明確
❌ TaskSvc.ts  // 縮寫不清楚
```

---

## 最佳實踐 (Best Practices)

### ✅ DO (建議做法)

1. **使用完整單字**，避免縮寫
2. **使用 camelCase** 命名變數和函數
3. **使用 PascalCase** 命名類別和介面
4. **使用 kebab-case** 命名檔案
5. **明確的前綴/後綴** 表達意圖（is, has, can, on, handle）
6. **一致的命名模式** 貫穿整個專案
7. **有意義的名稱** 反映業務概念

### ❌ DON'T (避免做法)

1. ❌ 使用縮寫（Svc, Repo, Cmd）
2. ❌ 使用 `any` 類型
3. ❌ 使用泛化名稱（data, item, value）
4. ❌ 混合命名風格
5. ❌ 使用匈牙利命名法（strName, intCount）
6. ❌ 過度簡化（e, t, p）
7. ❌ 缺少類型後綴（aggregate, event, command）

---

## 多租戶命名模板 (Multi-Tenant Naming Templates)

### 租戶類型 (Tenant Types)

```typescript
// ✅ GOOD - 清晰的租戶類型
export enum TenantType {
  ACCOUNT = 'account',      // 個人/用戶/組織/BOT 統一為 account
  TEAM = 'team',            // 組織內的團隊
  PARTNER = 'partner',      // 組織外的夥伴
  COLLABORATOR = 'collaborator'  // 協作者
}

// 變數命名
const accountId: string = '...';     // 帳戶 ID
const teamId: string = '...';        // 團隊 ID
const partnerId: string = '...';     // 夥伴 ID
const collaboratorId: string = '...'; // 協作者 ID
```

### 多租戶函數 (Multi-Tenant Functions)

```typescript
// ✅ GOOD
filterTasksByAccount(tasks: TaskAggregate[], accountId: string): TaskAggregate[]
scopeToTeam(query: Query, teamId: string): Query
grantPartnerAccess(resourceId: string, partnerId: string): Promise<void>
addCollaborator(projectId: string, collaboratorId: string): Promise<void>

// ❌ BAD
filterByTenant(t: any[], id: string): any[]  // 不明確租戶類型
```

---

## 檢查清單 (Checklist)

使用此檢查清單確保命名一致性：

- [ ] 函數名稱使用動詞開頭
- [ ] 類別名稱使用名詞
- [ ] 布林值使用 is/has/can/should 前綴
- [ ] 事件使用過去式動詞
- [ ] 命令使用不定式動詞
- [ ] 檔案使用 kebab-case
- [ ] 類別使用 PascalCase
- [ ] 變數使用 camelCase
- [ ] 避免縮寫
- [ ] 明確的類型後綴（Aggregate, Event, Command, Projection）
- [ ] 多租戶變數包含租戶類型（Account, Team, Partner, Collaborator）

---

**版本 (Version)**: 1.0  
**最後更新 (Last Updated)**: 2026-01-01  
**維護者 (Maintainer)**: Architecture Team
