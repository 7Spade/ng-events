/**
 * Saga Template
 * 
 * 使用此範本實作 Saga（跨聚合協調器）
 * 遵循 Saga<TEvent, TAggregateId, TState> 泛型模式
 * 
 * 使用步驟:
 * 1. 複製此檔案並重新命名 (例: WorkspaceCreationSaga.ts, PaymentProcessSaga.ts)
 * 2. 替換所有 XXX 為你的 Saga 名稱
 * 3. 定義 Saga 狀態型別
 * 4. 實作事件處理邏輯
 * 5. 添加補償邏輯（錯誤處理）
 */

import { Saga, DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

// ============================================================================
// 泛型說明 (Generic Explanation)
// ============================================================================

/**
 * Saga 泛型參數:
 * 
 * Saga<TEvent, TAggregateId, TState>
 * 
 * - TEvent: Saga 處理的事件型別聯合
 * - TAggregateId: Saga 實例的唯一識別符型別
 * - TState: Saga 的內部狀態型別
 * 
 * Saga 用途:
 * - 協調多個聚合的長交易流程
 * - 實作跨聚合的業務流程
 * - 處理分散式交易的補償邏輯
 * 
 * 範例場景:
 * - 工作區創建流程：Account → Workspace → Module → Entity
 * - 訂單處理流程：Order → Payment → Inventory → Shipping
 * - 用戶註冊流程：User → Verification → Welcome Email → Initial Setup
 */

// ============================================================================
// Saga 狀態型別 (Saga State Type)
// ============================================================================

/**
 * XXX Saga 狀態 (使用 S = State)
 * 
 * 記錄 Saga 執行過程中的狀態資訊
 */
export interface XXXSagaState {
  // Saga 識別符
  id: string;
  
  // 流程狀態
  status: 'started' | 'in-progress' | 'completed' | 'failed' | 'compensating' | 'compensated';
  
  // 當前步驟
  currentStep: XXXSagaStep;
  
  // 已完成步驟
  completedSteps: XXXSagaStep[];
  
  // 步驟結果資料
  stepResults: {
    [K in XXXSagaStep]?: any;
  };
  
  // 錯誤資訊
  error?: {
    step: XXXSagaStep;
    message: string;
    timestamp: Timestamp;
  };
  
  // 時間戳
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

/**
 * Saga 步驟定義
 */
export type XXXSagaStep =
  | 'step1'
  | 'step2'
  | 'step3'
  // TODO: 添加更多步驟
  | 'completed';

// ============================================================================
// Saga 事件型別 (Saga Event Types)
// ============================================================================

/**
 * XXX Saga 處理的事件聯合型別 (使用 U = Union)
 * 
 * 包含觸發 Saga 和 Saga 需要處理的所有事件
 */
export type XXXSagaEvent =
  // 觸發事件（啟動 Saga）
  | SomeTriggerEvent
  // 步驟完成事件
  | Step1CompletedEvent
  | Step2CompletedEvent
  | Step3CompletedEvent
  // 錯誤事件
  | StepFailedEvent;

// ============================================================================
// Saga 實作 (Saga Implementation)
// ============================================================================

/**
 * XXX Saga
 * 
 * 協調 XXX 流程，處理跨聚合的長交易
 * 
 * 使用範例:
 * ```typescript
 * const saga = new XXXSaga('saga-123');
 * await saga.handleEvent(triggerEvent);
 * await saga.handleEvent(step1CompletedEvent);
 * // ...
 * ```
 */
export class XXXSaga extends Saga<
  XXXSagaEvent,      // TEvent - 處理的事件型別
  string,            // TAggregateId - Saga ID 型別
  XXXSagaState      // TState - Saga 狀態型別
> {
  // ========================================================================
  // 必要屬性 (Required Properties)
  // ========================================================================

  /**
   * Saga 識別符
   */
  readonly id: string;

  /**
   * Saga 型別名稱
   */
  readonly type = 'XXXSaga';

  // ========================================================================
  // 依賴注入 (Dependency Injection)
  // ========================================================================

  /**
   * 建構子 - 注入必要的倉儲和服務
   * 
   * @param id - Saga ID
   * @param dependencies - 依賴的倉儲和服務
   */
  constructor(
    id: string,
    private dependencies: {
      // TODO: 注入需要的倉儲
      // repository1: Repository1;
      // repository2: Repository2;
      // eventBus: EventBus;
    }
  ) {
    super();
    this.id = id;
  }

  // ========================================================================
  // 事件處理 (Event Handling)
  // ========================================================================

  /**
   * 處理事件（必須實作）
   * 
   * @param event - 要處理的事件
   */
  async handleEvent(event: XXXSagaEvent): Promise<void> {
    // 應用事件到狀態
    this.applyEvent(event);

    // 根據事件型別執行對應邏輯
    switch (event.eventType) {
      case 'SomeTriggerEvent':
        await this.handleTriggerEvent(event as SomeTriggerEvent);
        break;
      
      case 'Step1CompletedEvent':
        await this.handleStep1Completed(event as Step1CompletedEvent);
        break;
      
      case 'Step2CompletedEvent':
        await this.handleStep2Completed(event as Step2CompletedEvent);
        break;
      
      case 'StepFailedEvent':
        await this.handleStepFailed(event as StepFailedEvent);
        break;
      
      default:
        // TypeScript 窮盡性檢查
        const _exhaustive: never = event;
        throw new Error(`Unhandled event type: ${(_exhaustive as XXXSagaEvent).eventType}`);
    }
  }

  /**
   * 應用事件到狀態（必須實作）
   * 
   * ⚠️ 此方法必須是純函數，只更新狀態
   * 
   * @param event - 要應用的事件
   */
  protected applyEvent(event: XXXSagaEvent): void {
    switch (event.eventType) {
      case 'SomeTriggerEvent':
        this.applySagaStarted(event as SomeTriggerEvent);
        break;
      
      case 'Step1CompletedEvent':
        this.applyStep1Completed(event as Step1CompletedEvent);
        break;
      
      // TODO: 處理其他事件
    }
  }

  // ========================================================================
  // 具體事件處理器 (Specific Event Handlers)
  // ========================================================================

  /**
   * 處理觸發事件 - 啟動 Saga
   */
  private async handleTriggerEvent(event: SomeTriggerEvent): Promise<void> {
    console.log(`[XXXSaga] Started for ${this.id}`);

    try {
      // 執行第一步
      await this.executeStep1(event);
    } catch (error) {
      await this.handleError('step1', error);
    }
  }

  /**
   * 處理步驟 1 完成
   */
  private async handleStep1Completed(event: Step1CompletedEvent): Promise<void> {
    console.log(`[XXXSaga] Step 1 completed for ${this.id}`);

    try {
      // 執行第二步
      await this.executeStep2(event);
    } catch (error) {
      await this.handleError('step2', error);
    }
  }

  /**
   * 處理步驟 2 完成
   */
  private async handleStep2Completed(event: Step2CompletedEvent): Promise<void> {
    console.log(`[XXXSaga] Step 2 completed for ${this.id}`);

    try {
      // 執行第三步
      await this.executeStep3(event);
    } catch (error) {
      await this.handleError('step3', error);
    }
  }

  /**
   * 處理步驟失敗
   */
  private async handleStepFailed(event: StepFailedEvent): Promise<void> {
    console.error(`[XXXSaga] Step failed:`, event.data);

    // 執行補償邏輯
    await this.compensate();
  }

  // ========================================================================
  // 步驟執行邏輯 (Step Execution Logic)
  // ========================================================================

  /**
   * 執行步驟 1
   */
  private async executeStep1(triggerEvent: SomeTriggerEvent): Promise<void> {
    // TODO: 實作步驟 1 的業務邏輯
    // 範例：創建聚合、發起指令等
    
    // const aggregate = await this.dependencies.repository1.load(id);
    // aggregate.performAction(params);
    // await this.dependencies.repository1.save(aggregate);
  }

  /**
   * 執行步驟 2
   */
  private async executeStep2(step1Event: Step1CompletedEvent): Promise<void> {
    // TODO: 實作步驟 2 的業務邏輯
  }

  /**
   * 執行步驟 3
   */
  private async executeStep3(step2Event: Step2CompletedEvent): Promise<void> {
    // TODO: 實作步驟 3 的業務邏輯
  }

  // ========================================================================
  // 狀態更新方法 (State Update Methods)
  // ========================================================================

  /**
   * 應用 Saga 啟動事件
   */
  private applySagaStarted(event: SomeTriggerEvent): void {
    this.state = {
      id: this.id,
      status: 'started',
      currentStep: 'step1',
      completedSteps: [],
      stepResults: {},
      startedAt: event.metadata.timestamp,
    };
  }

  /**
   * 應用步驟 1 完成
   */
  private applyStep1Completed(event: Step1CompletedEvent): void {
    if (!this.state) {
      throw new Error('Saga state not initialized');
    }

    this.state = {
      ...this.state,
      status: 'in-progress',
      currentStep: 'step2',
      completedSteps: [...this.state.completedSteps, 'step1'],
      stepResults: {
        ...this.state.stepResults,
        step1: event.data,
      },
    };
  }

  // TODO: 添加其他狀態更新方法

  // ========================================================================
  // 錯誤處理與補償 (Error Handling & Compensation)
  // ========================================================================

  /**
   * 處理錯誤
   * 
   * @param step - 失敗的步驟
   * @param error - 錯誤物件
   */
  private async handleError(step: XXXSagaStep, error: any): Promise<void> {
    console.error(`[XXXSaga] Error in ${step}:`, error);

    if (!this.state) {
      throw new Error('Saga state not initialized');
    }

    this.state = {
      ...this.state,
      status: 'failed',
      error: {
        step,
        message: error.message || 'Unknown error',
        timestamp: Timestamp.now(),
      },
    };

    // 觸發補償流程
    await this.compensate();
  }

  /**
   * 執行補償邏輯（回滾）
   * 
   * 按照與執行相反的順序回滾已完成的步驟
   */
  private async compensate(): Promise<void> {
    if (!this.state) {
      return;
    }

    console.log(`[XXXSaga] Starting compensation for ${this.id}`);
    this.state.status = 'compensating';

    // 按相反順序回滾已完成的步驟
    const stepsToCompensate = [...this.state.completedSteps].reverse();

    for (const step of stepsToCompensate) {
      try {
        await this.compensateStep(step);
      } catch (error) {
        console.error(`[XXXSaga] Compensation failed for ${step}:`, error);
        // 補償失敗需要人工介入
        throw new Error(`Compensation failed at ${step}: ${error.message}`);
      }
    }

    this.state.status = 'compensated';
    console.log(`[XXXSaga] Compensation completed for ${this.id}`);
  }

  /**
   * 補償單一步驟
   * 
   * @param step - 要補償的步驟
   */
  private async compensateStep(step: XXXSagaStep): Promise<void> {
    switch (step) {
      case 'step1':
        await this.compensateStep1();
        break;
      case 'step2':
        await this.compensateStep2();
        break;
      case 'step3':
        await this.compensateStep3();
        break;
      // TODO: 添加其他步驟的補償邏輯
    }
  }

  /**
   * 補償步驟 1
   */
  private async compensateStep1(): Promise<void> {
    // TODO: 實作步驟 1 的補償邏輯
    // 範例：刪除創建的聚合、回滾狀態變更等
  }

  /**
   * 補償步驟 2
   */
  private async compensateStep2(): Promise<void> {
    // TODO: 實作步驟 2 的補償邏輯
  }

  /**
   * 補償步驟 3
   */
  private async compensateStep3(): Promise<void> {
    // TODO: 實作步驟 3 的補償邏輯
  }

  // ========================================================================
  // Getter 方法 (Getter Methods)
  // ========================================================================

  /**
   * 是否完成
   */
  get isCompleted(): boolean {
    return this.state?.status === 'completed';
  }

  /**
   * 是否失敗
   */
  get isFailed(): boolean {
    return this.state?.status === 'failed';
  }

  /**
   * 是否正在補償
   */
  get isCompensating(): boolean {
    return this.state?.status === 'compensating' || this.state?.status === 'compensated';
  }
}

// ============================================================================
// Saga 管理器 (Saga Manager)
// ============================================================================

/**
 * XXX Saga 管理器
 * 
 * 負責創建、啟動和追蹤 Saga 實例
 */
export class XXXSagaManager {
  private activeSagas = new Map<string, XXXSaga>();

  constructor(
    private dependencies: {
      // 注入必要的倉儲和服務
    }
  ) {}

  /**
   * 啟動新的 Saga
   */
  async startSaga(sagaId: string, triggerEvent: SomeTriggerEvent): Promise<XXXSaga> {
    const saga = new XXXSaga(sagaId, this.dependencies);
    this.activeSagas.set(sagaId, saga);
    
    await saga.handleEvent(triggerEvent);
    
    return saga;
  }

  /**
   * 處理事件 - 路由到對應的 Saga
   */
  async handleEvent(event: XXXSagaEvent): Promise<void> {
    const saga = this.activeSagas.get(event.aggregateId);
    
    if (!saga) {
      console.warn(`No active saga found for ${event.aggregateId}`);
      return;
    }

    await saga.handleEvent(event);

    // 如果 Saga 完成或失敗，清理
    if (saga.isCompleted || (saga.isFailed && !saga.isCompensating)) {
      this.activeSagas.delete(event.aggregateId);
    }
  }
}

// ============================================================================
// 使用檢查清單 (Usage Checklist)
// ============================================================================

/**
 * 完成實施後，請確認以下項目:
 * 
 * - [ ] 替換所有 XXX 為實際 Saga 名稱
 * - [ ] 定義 Saga 狀態型別
 * - [ ] 定義 Saga 步驟型別
 * - [ ] 定義 Saga 處理的事件聯合型別
 * - [ ] 實作所有步驟執行邏輯
 * - [ ] 實作所有狀態更新方法
 * - [ ] 實作完整的錯誤處理
 * - [ ] 實作所有步驟的補償邏輯
 * - [ ] 測試正常流程
 * - [ ] 測試錯誤和補償流程
 * - [ ] 添加日誌和監控
 * - [ ] 編寫單元測試
 * - [ ] 編寫整合測試
 * - [ ] 更新文件
 */

// END OF FILE
