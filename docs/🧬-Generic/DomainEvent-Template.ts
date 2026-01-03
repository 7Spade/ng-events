/**
 * DomainEvent Template
 * 
 * 使用此範本定義領域事件 (Domain Events)
 * 遵循 DomainEvent<TPayload, TId, TMetadata> 泛型模式
 * 
 * 使用步驟:
 * 1. 複製此檔案並重新命名 (例: AccountEvent.ts, TaskEvent.ts)
 * 2. 替換所有 XXX 為你的聚合名稱
 * 3. 定義事件負載型別 (Payload)
 * 4. 定義具體事件介面
 * 5. 創建事件聯合型別
 */

import { DomainEvent, CausalityMetadata } from '@ng-events/core-engine';

// ============================================================================
// 泛型說明 (Generic Explanation)
// ============================================================================

/**
 * DomainEvent 泛型參數:
 * 
 * DomainEvent<TPayload, TId, TMetadata>
 * 
 * - TPayload (P): Event data/payload type - 事件攜帶的資料型別
 * - TId (I): Aggregate ID type - 聚合 ID 型別 (通常是 string)
 * - TMetadata (M): Event metadata type - 事件元資料型別 (CausalityMetadata)
 */

// ============================================================================
// 事件負載型別 (Event Payload Types)
// ============================================================================

/**
 * XXXCreated 事件負載 (使用 P = Payload)
 * 
 * 包含創建 XXX 所需的所有資料
 */
export interface XXXCreatedPayload {
  // TODO: 添加創建所需的屬性
  // 範例:
  // name: string;
  // description?: string;
}

/**
 * XXXUpdated 事件負載
 * 
 * 包含更新 XXX 的部分或全部屬性
 */
export interface XXXUpdatedPayload {
  // TODO: 添加可更新的屬性
  // 範例:
  // name?: string;
  // description?: string;
}

/**
 * XXXDeleted 事件負載
 * 
 * 通常為空或包含刪除原因
 */
export interface XXXDeletedPayload {
  reason?: string;
  deletedBy?: string;
}

// ============================================================================
// 具體事件型別 (Concrete Event Types)
// ============================================================================

/**
 * XXXCreated 事件
 * 
 * 當新的 XXX 被創建時發起
 * 
 * 使用範例:
 * ```typescript
 * const event: XXXCreated = {
 *   id: 'evt-123',
 *   aggregateId: 'xxx-456',
 *   aggregateType: 'XXX',
 *   eventType: 'XXXCreated',
 *   data: {
 *     // 負載資料
 *   },
 *   metadata: {
 *     causedBy: 'system',
 *     causedByUser: 'user-123',
 *     causedByAction: 'xxx.create',
 *     timestamp: Timestamp.now(),
 *     blueprintId: 'bp-789',
 *   },
 * };
 * ```
 */
export interface XXXCreated extends DomainEvent<
  XXXCreatedPayload,    // TPayload - 事件負載型別
  string,               // TId - 聚合 ID 型別
  CausalityMetadata    // TMetadata - 元資料型別
> {
  /**
   * 事件型別標識符
   * 
   * ⚠️ 必須與介面名稱一致
   */
  eventType: 'XXXCreated';

  /**
   * 聚合型別標識符
   * 
   * ⚠️ 必須與聚合類別名稱一致
   */
  aggregateType: 'XXX';
}

/**
 * XXXUpdated 事件
 * 
 * 當 XXX 的屬性被更新時發起
 */
export interface XXXUpdated extends DomainEvent<
  XXXUpdatedPayload,
  string,
  CausalityMetadata
> {
  eventType: 'XXXUpdated';
  aggregateType: 'XXX';
}

/**
 * XXXDeleted 事件
 * 
 * 當 XXX 被刪除時發起
 */
export interface XXXDeleted extends DomainEvent<
  XXXDeletedPayload,
  string,
  CausalityMetadata
> {
  eventType: 'XXXDeleted';
  aggregateType: 'XXX';
}

// TODO: 添加其他領域事件
// 範例:
// - XXXActivated
// - XXXDeactivated
// - XXXPublished
// - XXXArchived

// ============================================================================
// 事件聯合型別 (Event Union Type)
// ============================================================================

/**
 * XXX 事件聯合型別 (使用 U = Union)
 * 
 * 包含所有 XXX 相關的事件
 * 
 * ⚠️ 當添加新事件時，必須更新此聯合型別
 */
export type XXXEvent =
  | XXXCreated
  | XXXUpdated
  | XXXDeleted;
  // TODO: 添加其他事件型別

// ============================================================================
// 事件工廠函數 (Event Factory Functions)
// ============================================================================

/**
 * 事件建構參數
 */
interface CreateXXXEventParams<TPayload> {
  aggregateId: string;
  data: TPayload;
  causedBy?: string;
  causedByUser?: string;
  causedByAction: string;
  blueprintId?: string;
}

/**
 * 創建 XXXCreated 事件
 * 
 * @param params - 事件參數
 * @returns XXXCreated 事件實例
 * 
 * 使用範例:
 * ```typescript
 * const event = createXXXCreatedEvent({
 *   aggregateId: 'xxx-123',
 *   data: { name: 'Test XXX' },
 *   causedByUser: 'user-456',
 *   causedByAction: 'xxx.create',
 * });
 * ```
 */
export function createXXXCreatedEvent(
  params: CreateXXXEventParams<XXXCreatedPayload>
): XXXCreated {
  return {
    id: generateEventId(),
    aggregateId: params.aggregateId,
    aggregateType: 'XXX',
    eventType: 'XXXCreated',
    data: params.data,
    metadata: {
      causedBy: params.causedBy || 'system',
      causedByUser: params.causedByUser || 'system',
      causedByAction: params.causedByAction,
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId || getCurrentBlueprintId(),
    },
  };
}

/**
 * 創建 XXXUpdated 事件
 */
export function createXXXUpdatedEvent(
  params: CreateXXXEventParams<XXXUpdatedPayload>
): XXXUpdated {
  return {
    id: generateEventId(),
    aggregateId: params.aggregateId,
    aggregateType: 'XXX',
    eventType: 'XXXUpdated',
    data: params.data,
    metadata: {
      causedBy: params.causedBy || 'system',
      causedByUser: params.causedByUser || 'system',
      causedByAction: params.causedByAction,
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId || getCurrentBlueprintId(),
    },
  };
}

/**
 * 創建 XXXDeleted 事件
 */
export function createXXXDeletedEvent(
  params: CreateXXXEventParams<XXXDeletedPayload>
): XXXDeleted {
  return {
    id: generateEventId(),
    aggregateId: params.aggregateId,
    aggregateType: 'XXX',
    eventType: 'XXXDeleted',
    data: params.data,
    metadata: {
      causedBy: params.causedBy || 'system',
      causedByUser: params.causedByUser || 'system',
      causedByAction: params.causedByAction,
      timestamp: Timestamp.now(),
      blueprintId: params.blueprintId || getCurrentBlueprintId(),
    },
  };
}

// ============================================================================
// 事件型別守衛 (Event Type Guards)
// ============================================================================

/**
 * 檢查是否為 XXXCreated 事件
 * 
 * @param event - 要檢查的事件
 * @returns 是否為 XXXCreated 事件
 * 
 * 使用範例:
 * ```typescript
 * if (isXXXCreated(event)) {
 *   // TypeScript 知道 event.data 是 XXXCreatedPayload
 *   console.log(event.data.name);
 * }
 * ```
 */
export function isXXXCreated(event: DomainEvent): event is XXXCreated {
  return event.eventType === 'XXXCreated' && event.aggregateType === 'XXX';
}

/**
 * 檢查是否為 XXXUpdated 事件
 */
export function isXXXUpdated(event: DomainEvent): event is XXXUpdated {
  return event.eventType === 'XXXUpdated' && event.aggregateType === 'XXX';
}

/**
 * 檢查是否為 XXXDeleted 事件
 */
export function isXXXDeleted(event: DomainEvent): event is XXXDeleted {
  return event.eventType === 'XXXDeleted' && event.aggregateType === 'XXX';
}

/**
 * 檢查是否為任何 XXX 事件
 */
export function isXXXEvent(event: DomainEvent): event is XXXEvent {
  return event.aggregateType === 'XXX';
}

// ============================================================================
// 輔助函數 (Helper Functions)
// ============================================================================

/**
 * 生成事件 ID
 */
function generateEventId(): string {
  // TODO: 實作事件 ID 生成邏輯
  // 範例: 使用 UUID 或組合式 ID
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
// 事件命名規範 (Event Naming Conventions)
// ============================================================================

/**
 * 事件命名最佳實踐:
 * 
 * ✅ 使用過去式動詞
 *    - XXXCreated (not XXXCreate)
 *    - PaymentProcessed (not PaymentProcess)
 *    - OrderShipped (not OrderShip)
 * 
 * ✅ 明確語意
 *    - WorkspaceInvitationSent (not InviteSent)
 *    - TaskAssignedToUser (not TaskAssigned)
 * 
 * ✅ 領域語言
 *    - 使用領域專家使用的術語
 *    - 保持與 Ubiquitous Language 一致
 * 
 * ❌ 避免通用名稱
 *    - Updated (too generic)
 *    - Changed (not specific)
 *    - Modified (ambiguous)
 * 
 * ❌ 避免技術術語
 *    - DatabaseRecordInserted (implementation detail)
 *    - HttpRequestSent (technical concern)
 */

// ============================================================================
// 因果元資料最佳實踐 (Causality Metadata Best Practices)
// ============================================================================

/**
 * 因果元資料欄位說明:
 * 
 * - causedBy: 觸發此事件的父事件 ID
 *   - 'system': 系統自動觸發
 *   - 'evt-xxx': 由其他事件觸發
 * 
 * - causedByUser: 執行操作的用戶 ID
 *   - 用於審計追蹤
 *   - 權限檢查
 * 
 * - causedByAction: 執行的動作名稱
 *   - 格式: 'aggregate.action'
 *   - 範例: 'account.create', 'task.assign', 'payment.process'
 * 
 * - timestamp: 事件發生時間
 *   - 使用 Firestore Timestamp 或 ISO 8601
 *   - 必須準確記錄事件順序
 * 
 * - blueprintId: 多租戶邊界識別符
 *   - 確保資料隔離
 *   - 用於查詢過濾
 */

// ============================================================================
// 使用檢查清單 (Usage Checklist)
// ============================================================================

/**
 * 完成實施後，請確認以下項目:
 * 
 * - [ ] 替換所有 XXX 為實際聚合名稱
 * - [ ] 定義所有事件負載型別
 * - [ ] 定義所有具體事件介面
 * - [ ] 更新事件聯合型別
 * - [ ] 實作事件工廠函數
 * - [ ] 實作事件型別守衛
 * - [ ] 遵循事件命名規範
 * - [ ] 包含完整的因果元資料
 * - [ ] 添加 JSDoc 註解
 * - [ ] 編寫單元測試
 */

// END OF FILE
