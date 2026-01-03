/**
 * Account Repository Interface
 * 
 * 定義 Account 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { Account } from '../aggregates/Account';
import { AccountStatus } from '../events/AccountCreated';

/**
 * Account 倉儲介面
 * 
 * 提供 Account 聚合的持久化和領域特定查詢
 */
export interface AccountRepository extends Repository<Account, string> {
  /**
   * 根據擁有者 ID 查找 Account
   * 
   * @param ownerId - 擁有者 ID
   * @returns Account 陣列
   */
  findByOwnerId(ownerId: string): Promise<Account[]>;

  /**
   * 查找所有活躍的 Account
   * 
   * @returns 活躍狀態的 Account 陣列
   */
  findActiveAccounts(): Promise<Account[]>;

  /**
   * 根據狀態查找 Account
   * 
   * @param status - Account 狀態
   * @returns Account 陣列
   */
  findByStatus(status: AccountStatus): Promise<Account[]>;

  /**
   * 計算符合條件的 Account 數量
   * 
   * @param status - 可選的狀態篩選
   * @returns Account 數量
   */
  count(status?: AccountStatus): Promise<number>;
}

// END OF FILE
