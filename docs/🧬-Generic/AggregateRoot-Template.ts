/**
 * AggregateRoot Template
 * 
 * 使用此範本創建新的聚合根 (Aggregate Root)
 * 遵循 T/I/S 泛型模式: <TEvent, TId, TState>
 * 
 * 使用步驟:
 * 1. 複製此檔案並重新命名 (例: Account.ts, Workspace.ts)
 * 2. 替換所有 XXX 為你的聚合名稱
 * 3. 定義事件型別 (TEvent)
 * 4. 定義狀態型別 (TState)
 * 5. 實作 applyEvent 方法
 * 6. 添加領域行為方法
 */

import { AggregateRoot, DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

// ============================================================================
// 型別定義 (Type Definitions)
// ============================================================================

/**
 * XXX 聚合狀態 (使用 S = State)
 */
export interface XXXState {
  id: string;
  // TODO: 添加狀態屬性
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

/**
 * XXX 事件負載型別 (使用 P = Payload)
 */
export interface XXXCreatedPayload {
  // TODO: 添加創建所需的屬性
}

export interface XXXUpdatedPayload {
  // TODO: 添加更新的屬性
}

/**
 * XXX 具體事件型別
 */
export interface XXXCreated extends DomainEvent<
  XXXCreatedPayload,    // TPayload
  string,               // TId
  CausalityMetadata    // TMetadata
> {
  eventType: 'XXXCreated';
  aggregateType: 'XXX';
}

export interface XXXUpdated extends DomainEvent<
  XXXUpdatedPayload,
  string,
  CausalityMetadata
> {
  eventType: 'XXXUpdated';
  aggregateType: 'XXX';
}

/**
 * XXX 事件聯合型別 (使用 U = Union)
 */
export type XXXEvent = XXXCreated | XXXUpdated;

// ============================================================================
// 聚合根實作 (Aggregate Root Implementation)
// ============================================================================

/**
 * XXX 聚合根
 * 
 * 使用 T/I/S 泛型模式:
 * - T (TEvent) = XXXEvent
 * - I (TId) = string
 * - S (TState) = XXXState
 */
export class XXX extends AggregateRoot<
  XXXEvent,    // TEvent - 事件型別
  string,      // TId - ID 型別
  XXXState     // TState - 狀態型別
> {
  // ========================================================================
  // 必要屬性 (Required Properties)
  // ========================================================================

  /**
   * 聚合識別符 (必須實作)
   */
  readonly id: string;

  /**
   * 聚合型別名稱 (必須實作)
   */
  readonly type = 'XXX';

  // ========================================================================
  // 建構子與工廠方法 (Constructor & Factory Methods)
  // ========================================================================

  /**
   * 私有建構子 - 強制使用工廠方法
   * 
   * ⚠️ 不要在建構子中執行業務邏輯或發起事件
   */
  private constructor(id: string) {
    super();
    this.id = id;
  }

  /**
   * 工廠方法 - 創建新聚合
   * 
   * @param params - 創建參數
   * @returns 新的 XXX 聚合實例
   * 
   * 使用範例:
   * ```typescript
   * const xxx = XXX.create({
   *   id: 'xxx-123',
   *   // TODO: 添加其他參數
   * });
   * ```
   */
  static create(params: {
    id: string;
    // TODO: 添加創建所需的參數
  }): XXX {
    const xxx = new XXX(params.id);

    // 發起領域事件
    xxx.raiseEvent({
      id: generateEventId(),
      aggregateId: params.id,
      aggregateType: 'XXX',
      eventType: 'XXXCreated',
      data: {
        // TODO: 映射參數到事件負載
      },
      metadata: createCausalityMetadata({
        causedBy: 'system',
        causedByUser: params.id,
        causedByAction: 'xxx.create',
        timestamp: Timestamp.now(),
        blueprintId: getCurrentBlueprintId(),
      }),
    });

    return xxx;
  }

  /**
   * 從事件重建 - 事件溯源模式
   * 
   * @param id - 聚合 ID
   * @param events - 歷史事件列表
   * @returns 重建的 XXX 聚合實例
   * 
   * 使用範例:
   * ```typescript
   * const events = await eventStore.load('xxx-123');
   * const xxx = XXX.fromEvents('xxx-123', events);
   * ```
   */
  static fromEvents(id: string, events: XXXEvent[]): XXX {
    const xxx = new XXX(id);
    xxx.replay(events);
    return xxx;
  }

  // ========================================================================
  // 事件處理 (Event Handling)
  // ========================================================================

  /**
   * 應用事件邏輯 (必須實作)
   * 
   * ⚠️ 此方法必須是純函數，只更新狀態，不執行副作用
   * 
   * @param event - 要應用的事件
   */
  protected applyEvent(event: XXXEvent): void {
    switch (event.eventType) {
      case 'XXXCreated':
        this.applyXXXCreated(event);
        break;
      case 'XXXUpdated':
        this.applyXXXUpdated(event);
        break;
      default:
        // TypeScript 會在此處檢查窮盡性
        const _exhaustive: never = event;
        throw new Error(`Unhandled event type: ${(_exhaustive as XXXEvent).eventType}`);
    }
  }

  /**
   * 應用 XXXCreated 事件
   */
  private applyXXXCreated(event: XXXCreated): void {
    this.state = {
      id: event.aggregateId,
      // TODO: 從事件負載初始化狀態
      createdAt: event.metadata.timestamp,
      updatedAt: event.metadata.timestamp,
      isActive: true,
    };
  }

  /**
   * 應用 XXXUpdated 事件
   */
  private applyXXXUpdated(event: XXXUpdated): void {
    if (!this.state) {
      throw new Error('Cannot update: XXX state not initialized');
    }

    this.state = {
      ...this.state,
      // TODO: 從事件負載更新狀態
      updatedAt: event.metadata.timestamp,
    };
  }

  // ========================================================================
  // 領域行為方法 (Domain Behavior Methods)
  // ========================================================================

  /**
   * 更新 XXX
   * 
   * @param params - 更新參數
   * 
   * 使用範例:
   * ```typescript
   * xxx.update({
   *   // TODO: 添加更新參數
   * });
   * await repository.save(xxx);
   * ```
   */
  update(params: {
    // TODO: 添加更新參數
  }): void {
    // 1. 驗證業務規則
    this.ensureActive();
    // TODO: 添加其他業務規則驗證

    // 2. 發起領域事件
    this.raiseEvent({
      id: generateEventId(),
      aggregateId: this.id,
      aggregateType: 'XXX',
      eventType: 'XXXUpdated',
      data: params,
      metadata: createCausalityMetadata({
        causedBy: this.getLastEventId(),
        causedByUser: this.getUserId(),
        causedByAction: 'xxx.update',
        timestamp: Timestamp.now(),
        blueprintId: getCurrentBlueprintId(),
      }),
    });
  }

  // ========================================================================
  // Getter 方法 - 只讀訪問 (Getter Methods - Read-Only Access)
  // ========================================================================

  /**
   * 是否為活躍狀態
   */
  get isActive(): boolean {
    return this.state?.isActive ?? false;
  }

  // TODO: 添加其他 getter 方法

  // ========================================================================
  // 私有輔助方法 (Private Helper Methods)
  // ========================================================================

  /**
   * 確保聚合處於活躍狀態
   * 
   * @throws {Error} 如果聚合未活躍
   */
  private ensureActive(): void {
    if (!this.isActive) {
      throw new Error(`XXX ${this.id} is not active`);
    }
  }

  /**
   * 獲取最後一個事件 ID
   */
  private getLastEventId(): string {
    const events = this.getUncommittedEvents();
    return events.length > 0 ? events[events.length - 1].id : 'system';
  }

  /**
   * 獲取當前用戶 ID
   */
  private getUserId(): string {
    // TODO: 從上下文獲取用戶 ID
    return 'current-user-id';
  }
}

// ============================================================================
// 輔助函數 (Helper Functions)
// ============================================================================

/**
 * 生成事件 ID
 */
function generateEventId(): string {
  // TODO: 實作事件 ID 生成邏輯
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 創建因果元資料
 */
function createCausalityMetadata(params: {
  causedBy: string;
  causedByUser: string;
  causedByAction: string;
  timestamp?: Timestamp;
  blueprintId?: string;
}): CausalityMetadata {
  return {
    causedBy: params.causedBy,
    causedByUser: params.causedByUser,
    causedByAction: params.causedByAction,
    timestamp: params.timestamp || Timestamp.now(),
    blueprintId: params.blueprintId || getCurrentBlueprintId(),
  };
}

/**
 * 獲取當前 Blueprint ID
 */
function getCurrentBlueprintId(): string {
  // TODO: 從上下文獲取 Blueprint ID
  return 'default-blueprint';
}

/**
 * Timestamp 型別（根據實際專案調整）
 */
interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

namespace Timestamp {
  export function now(): Timestamp {
    const now = Date.now();
    return {
      seconds: Math.floor(now / 1000),
      nanoseconds: (now % 1000) * 1000000,
    };
  }
}

// ============================================================================
// 使用檢查清單 (Usage Checklist)
// ============================================================================

/**
 * 完成實施後，請確認以下項目:
 * 
 * - [ ] 替換所有 XXX 為實際聚合名稱
 * - [ ] 定義完整的事件型別 (XXXEvent)
 * - [ ] 定義狀態型別 (XXXState)
 * - [ ] 實作所有事件處理方法
 * - [ ] 添加領域行為方法
 * - [ ] 實作業務規則驗證
 * - [ ] 添加必要的 getter 方法
 * - [ ] 包含完整的因果元資料
 * - [ ] 編寫單元測試
 * - [ ] 更新文件和導航
 */

// END OF FILE
