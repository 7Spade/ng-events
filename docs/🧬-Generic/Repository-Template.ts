/**
 * Repository Template
 * 
 * 使用此範本定義倉儲介面 (Repository Interface)
 * 遵循 Repository<TAggregate> 泛型模式
 * 
 * 使用步驟:
 * 1. 複製此檔案並重新命名 (例: AccountRepository.ts, TaskRepository.ts)
 * 2. 替換所有 XXX 為你的聚合名稱
 * 3. 定義領域特定查詢方法
 * 4. 在 platform-adapters 中實作具體倉儲
 */

import { Repository, AggregateRoot } from '@ng-events/core-engine';

// ============================================================================
// 泛型說明 (Generic Explanation)
// ============================================================================

/**
 * Repository 泛型參數:
 * 
 * Repository<TAggregate extends AggregateRoot>
 * 
 * - TAggregate: 聚合根型別，必須擴展 AggregateRoot
 * 
 * 核心方法:
 * - save(aggregate): 儲存聚合（發起的事件）
 * - load(id): 從事件載入並重建聚合
 * - delete(id): 刪除聚合（軟刪除或事件標記）
 */

// ============================================================================
// 倉儲介面 (Repository Interface)
// ============================================================================

/**
 * XXX 倉儲介面
 * 
 * 定義 XXX 聚合的持久化和查詢操作
 * 
 * ⚠️ 注意事項:
 * - 這是介面定義，實際實作在 platform-adapters
 * - 所有方法應該是非同步的 (返回 Promise)
 * - 查詢方法應該通過投影或快照實作，而非直接查詢事件
 */
export interface XXXRepository extends Repository<XXX> {
  // ========================================================================
  // 基本 CRUD 操作 (Basic CRUD Operations)
  // ========================================================================
  // 這些方法繼承自 Repository<TAggregate>:
  // - save(aggregate: XXX): Promise<void>
  // - load(id: string): Promise<XXX | null>
  // - delete(id: string): Promise<void>

  // ========================================================================
  // 領域特定查詢 (Domain-Specific Queries)
  // ========================================================================

  /**
   * 根據特定條件查找 XXX
   * 
   * @param criteria - 查詢條件
   * @returns XXX 陣列或 null
   * 
   * 使用範例:
   * ```typescript
   * const xxxs = await repository.findByCriteria({
   *   status: 'active',
   *   createdAfter: new Date('2024-01-01'),
   * });
   * ```
   */
  findByCriteria(criteria: XXXQueryCriteria): Promise<XXX[]>;

  /**
   * 檢查 XXX 是否存在
   * 
   * @param id - XXX ID
   * @returns 是否存在
   */
  exists(id: string): Promise<boolean>;

  /**
   * 計算符合條件的 XXX 數量
   * 
   * @param criteria - 查詢條件
   * @returns 數量
   */
  count(criteria?: XXXQueryCriteria): Promise<number>;

  // TODO: 添加其他領域特定查詢方法
  // 範例:
  // - findByOwnerId(ownerId: string): Promise<XXX[]>
  // - findActive(): Promise<XXX[]>
  // - findByDateRange(start: Date, end: Date): Promise<XXX[]>
}

// ============================================================================
// 查詢條件型別 (Query Criteria Types)
// ============================================================================

/**
 * XXX 查詢條件
 * 
 * 定義可用的查詢過濾器
 */
export interface XXXQueryCriteria {
  // TODO: 添加查詢條件屬性
  // 範例:
  // status?: 'active' | 'inactive' | 'archived';
  // ownerId?: string;
  // createdAfter?: Date;
  // createdBefore?: Date;
  // tags?: string[];
  
  // 分頁參數
  limit?: number;
  offset?: number;
  
  // 排序參數
  orderBy?: keyof XXXState;
  orderDirection?: 'asc' | 'desc';
}

// ============================================================================
// 倉儲實作指南 (Repository Implementation Guide)
// ============================================================================

/**
 * 在 platform-adapters 中實作倉儲
 * 
 * 範例: FirestoreXXXRepository
 * 
 * ```typescript
 * export class FirestoreXXXRepository implements XXXRepository {
 *   constructor(
 *     private eventStore: EventStore,
 *     private projection: XXXProjection
 *   ) {}
 * 
 *   async save(aggregate: XXX): Promise<void> {
 *     const events = aggregate.getUncommittedEvents();
 *     
 *     // 儲存事件到 EventStore
 *     for (const event of events) {
 *       await this.eventStore.append(event);
 *     }
 *     
 *     // 清除未提交事件
 *     aggregate.clearUncommittedEvents();
 *     
 *     // 更新投影（可選，也可以通過事件處理器）
 *     await this.projection.update(aggregate);
 *   }
 * 
 *   async load(id: string): Promise<XXX | null> {
 *     // 從 EventStore 載入事件
 *     const events = await this.eventStore.load(id);
 *     
 *     if (events.length === 0) {
 *       return null;
 *     }
 *     
 *     // 從事件重建聚合
 *     return XXX.fromEvents(id, events as XXXEvent[]);
 *   }
 * 
 *   async findByCriteria(criteria: XXXQueryCriteria): Promise<XXX[]> {
 *     // 使用投影查詢（不直接查詢事件）
 *     const snapshots = await this.projection.query(criteria);
 *     
 *     // 從快照重建聚合（可選）
 *     return Promise.all(
 *       snapshots.map(snapshot => this.load(snapshot.id))
 *     ).then(results => results.filter(Boolean) as XXX[]);
 *   }
 * }
 * ```
 */

// ============================================================================
// 倉儲使用範例 (Repository Usage Examples)
// ============================================================================

/**
 * 在應用服務中使用倉儲
 * 
 * ```typescript
 * @Injectable()
 * export class XXXService {
 *   constructor(private repository: XXXRepository) {}
 * 
 *   async createXXX(params: CreateXXXParams): Promise<string> {
 *     // 創建聚合
 *     const xxx = XXX.create({
 *       id: generateId(),
 *       ...params,
 *     });
 * 
 *     // 儲存到倉儲
 *     await this.repository.save(xxx);
 * 
 *     return xxx.id;
 *   }
 * 
 *   async updateXXX(id: string, params: UpdateXXXParams): Promise<void> {
 *     // 載入聚合
 *     const xxx = await this.repository.load(id);
 *     if (!xxx) {
 *       throw new Error('XXX not found');
 *     }
 * 
 *     // 執行領域行為
 *     xxx.update(params);
 * 
 *     // 儲存變更
 *     await this.repository.save(xxx);
 *   }
 * 
 *   async getActiveXXXs(): Promise<XXX[]> {
 *     return this.repository.findByCriteria({ status: 'active' });
 *   }
 * }
 * ```
 */

// ============================================================================
// 測試輔助工具 (Testing Utilities)
// ============================================================================

/**
 * 記憶體倉儲實作（用於測試）
 * 
 * ```typescript
 * export class InMemoryXXXRepository implements XXXRepository {
 *   private store = new Map<string, XXXEvent[]>();
 * 
 *   async save(aggregate: XXX): Promise<void> {
 *     const events = aggregate.getUncommittedEvents();
 *     const existing = this.store.get(aggregate.id) || [];
 *     this.store.set(aggregate.id, [...existing, ...events]);
 *     aggregate.clearUncommittedEvents();
 *   }
 * 
 *   async load(id: string): Promise<XXX | null> {
 *     const events = this.store.get(id);
 *     if (!events || events.length === 0) {
 *       return null;
 *     }
 *     return XXX.fromEvents(id, events);
 *   }
 * 
 *   async delete(id: string): Promise<void> {
 *     this.store.delete(id);
 *   }
 * 
 *   async findByCriteria(criteria: XXXQueryCriteria): Promise<XXX[]> {
 *     // 簡化實作：載入所有並過濾
 *     const all = Array.from(this.store.keys())
 *       .map(id => this.load(id))
 *       .filter(Boolean);
 *     return Promise.all(all) as Promise<XXX[]>;
 *   }
 * 
 *   async exists(id: string): Promise<boolean> {
 *     return this.store.has(id);
 *   }
 * 
 *   async count(criteria?: XXXQueryCriteria): Promise<number> {
 *     return this.store.size;
 *   }
 * }
 * ```
 */

// ============================================================================
// 最佳實踐 (Best Practices)
// ============================================================================

/**
 * 倉儲設計原則:
 * 
 * ✅ 單一職責
 *    - 倉儲只負責聚合的持久化和查詢
 *    - 不包含業務邏輯
 * 
 * ✅ 事件溯源模式
 *    - save() 儲存事件，不儲存狀態
 *    - load() 從事件重建聚合
 * 
 * ✅ 使用投影查詢
 *    - 複雜查詢使用投影或快照
 *    - 不直接查詢事件流
 * 
 * ✅ 介面隔離
 *    - 只暴露必要的查詢方法
 *    - 避免通用 query(sql) 方法
 * 
 * ✅ 依賴注入
 *    - 倉儲通過 DI 注入到應用服務
 *    - 方便測試和替換實作
 * 
 * ❌ 避免洩漏實作細節
 *    - 不暴露 Firestore、SQL 等特定型別
 *    - 使用領域型別作為參數和返回值
 * 
 * ❌ 避免 N+1 查詢
 *    - 使用批次載入
 *    - 考慮使用投影預先聚合資料
 */

// ============================================================================
// 使用檢查清單 (Usage Checklist)
// ============================================================================

/**
 * 完成實施後，請確認以下項目:
 * 
 * - [ ] 替換所有 XXX 為實際聚合名稱
 * - [ ] 定義領域特定查詢方法
 * - [ ] 定義查詢條件型別
 * - [ ] 在 platform-adapters 實作具體倉儲
 * - [ ] 實作記憶體倉儲用於測試
 * - [ ] 編寫倉儲單元測試
 * - [ ] 編寫倉儲整合測試
 * - [ ] 添加 JSDoc 註解
 * - [ ] 更新 DI 配置
 * - [ ] 更新文件
 */

// END OF FILE
