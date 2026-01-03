/**
 * Workspace Repository Interface
 * 
 * 定義 Workspace 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { Workspace } from '../aggregates/Workspace';
import { WorkspaceStatus } from '../events/WorkspaceCreated';

/**
 * Workspace 倉儲介面
 * 
 * 提供 Workspace 聚合的持久化和領域特定查詢
 */
export interface WorkspaceRepository extends Repository<Workspace, string> {
  /**
   * 根據 Account ID 查找所有 Workspace
   * 
   * @param accountId - Account ID
   * @returns Workspace 陣列
   */
  findByAccountId(accountId: string): Promise<Workspace[]>;

  /**
   * 查找所有就緒狀態的 Workspace
   * 
   * @returns 就緒狀態的 Workspace 陣列
   */
  findReadyWorkspaces(): Promise<Workspace[]>;

  /**
   * 根據狀態查找 Workspace
   * 
   * @param status - Workspace 狀態
   * @returns Workspace 陣列
   */
  findByStatus(status: WorkspaceStatus): Promise<Workspace[]>;

  /**
   * 根據 Account ID 和狀態查找 Workspace
   * 
   * @param accountId - Account ID
   * @param status - Workspace 狀態
   * @returns Workspace 陣列
   */
  findByAccountIdAndStatus(accountId: string, status: WorkspaceStatus): Promise<Workspace[]>;
}

// END OF FILE
