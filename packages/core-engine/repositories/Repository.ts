/**
 * Repository Interface
 * 
 * 定義聚合持久化和載入的基本契約
 * 
 * 泛型參數:
 * - TAggregate: 聚合根型別，必須擴展 AggregateRoot
 * - TId: 聚合識別符型別（通常為 string）
 * 
 * 職責:
 * - 儲存聚合（包含未提交的事件）
 * - 從事件重建聚合
 * - 刪除聚合（軟刪除或標記）
 * 
 * 實作位置:
 * - 介面定義在 domain layer (此檔案)
 * - 具體實作在 platform-adapters layer (Firestore, In-Memory, etc.)
 */

import { AggregateRoot } from '../aggregates';

/**
 * 倉儲基礎介面
 * 
 * @template TAggregate - 聚合根型別
 * @template TId - 聚合識別符型別
 */
export interface Repository<TAggregate extends AggregateRoot<any, TId, any>, TId = string> {
  /**
   * 儲存聚合
   * 
   * 實作應該:
   * 1. 取得聚合的未提交事件（uncommittedEvents）
   * 2. 將事件追加到事件儲存庫
   * 3. 更新投影/快照（如需要）
   * 4. 標記事件為已提交
   * 
   * @param aggregate - 要儲存的聚合
   * @returns Promise that resolves when saved
   */
  save(aggregate: TAggregate): Promise<void>;

  /**
   * 根據 ID 載入聚合
   * 
   * 實作應該:
   * 1. 從事件儲存庫取得該聚合的所有事件
   * 2. 使用聚合的 fromEvents() 工廠方法重建聚合
   * 
   * @param id - 聚合 ID
   * @returns 聚合實例，如果不存在則返回 null
   */
  load(id: TId): Promise<TAggregate | null>;

  /**
   * 刪除聚合
   * 
   * 實作應該:
   * - 軟刪除：發出 XXXDeleted 事件
   * - 或標記事件流為已刪除
   * 
   * @param id - 聚合 ID
   * @returns Promise that resolves when deleted
   */
  delete(id: TId): Promise<void>;

  /**
   * 檢查聚合是否存在
   * 
   * @param id - 聚合 ID
   * @returns 是否存在
   */
  exists(id: TId): Promise<boolean>;
}

// END OF FILE
