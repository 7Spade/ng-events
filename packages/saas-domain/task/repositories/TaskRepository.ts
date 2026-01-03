/**
 * Task Repository Interface
 * 
 * 定義 TaskEntity 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { TaskEntity } from '../aggregates/TaskEntity';
import { TaskStatus } from '../value-objects/TaskStatus';
import { TaskPriority } from '../value-objects/TaskPriority';

/**
 * Task 倉儲介面
 * 
 * 提供 TaskEntity 聚合的持久化和領域特定查詢
 */
export interface TaskRepository extends Repository<TaskEntity, string> {
  /**
   * 根據 Workspace ID 查找所有 Task
   * 
   * @param workspaceId - Workspace ID（multi-tenant boundary）
   * @returns TaskEntity 陣列
   */
  findByWorkspaceId(workspaceId: string): Promise<TaskEntity[]>;

  /**
   * 根據受讓人 ID 查找 Task
   * 
   * @param assigneeId - 受讓人 ID
   * @returns TaskEntity 陣列
   */
  findByAssigneeId(assigneeId: string): Promise<TaskEntity[]>;

  /**
   * 根據 Workspace ID 和狀態查找 Task
   * 
   * @param workspaceId - Workspace ID
   * @param status - Task 狀態
   * @returns TaskEntity 陣列
   */
  findByStatus(workspaceId: string, status: TaskStatus): Promise<TaskEntity[]>;

  /**
   * 根據 Workspace ID 和優先級查找 Task
   * 
   * @param workspaceId - Workspace ID
   * @param priority - Task 優先級
   * @returns TaskEntity 陣列
   */
  findByPriority(workspaceId: string, priority: TaskPriority): Promise<TaskEntity[]>;

  /**
   * 查找 Workspace 中的未分配 Task
   * 
   * @param workspaceId - Workspace ID
   * @returns 未分配的 TaskEntity 陣列
   */
  findUnassignedTasks(workspaceId: string): Promise<TaskEntity[]>;

  /**
   * 計算 Workspace 中符合條件的 Task 數量
   * 
   * @param workspaceId - Workspace ID
   * @param status - 可選的狀態篩選
   * @returns Task 數量
   */
  countByWorkspace(workspaceId: string, status?: TaskStatus): Promise<number>;
}

// END OF FILE
