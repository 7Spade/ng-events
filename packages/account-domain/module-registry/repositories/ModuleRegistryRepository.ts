/**
 * ModuleRegistry Repository Interface
 * 
 * 定義 ModuleRegistry 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { ModuleRegistry } from '../aggregates/ModuleRegistry';

/**
 * Module ID 類型
 */
export type ModuleId = 'task' | 'payment' | 'issue' | string;

/**
 * ModuleRegistry 倉儲介面
 * 
 * 提供 ModuleRegistry 聚合的持久化和領域特定查詢
 */
export interface ModuleRegistryRepository extends Repository<ModuleRegistry, string> {
  /**
   * 根據 Workspace ID 查找 ModuleRegistry
   * 
   * 注意：每個 Workspace 通常只有一個 ModuleRegistry
   * 
   * @param workspaceId - Workspace ID
   * @returns ModuleRegistry 或 null
   */
  findByWorkspaceId(workspaceId: string): Promise<ModuleRegistry | null>;

  /**
   * 查找啟用了特定模組的所有 Workspace
   * 
   * @param moduleId - Module ID
   * @returns ModuleRegistry 陣列
   */
  findWorkspacesWithEnabledModule(moduleId: ModuleId): Promise<ModuleRegistry[]>;

  /**
   * 檢查 Workspace 是否啟用了特定模組
   * 
   * @param workspaceId - Workspace ID
   * @param moduleId - Module ID
   * @returns 是否啟用
   */
  isModuleEnabledInWorkspace(workspaceId: string, moduleId: ModuleId): Promise<boolean>;
}

// END OF FILE
