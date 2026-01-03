/**
 * Issue Repository Interface
 * 
 * 定義 IssueEntity 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { IssueEntity } from '../aggregates/IssueEntity';
import { IssueStatus } from '../value-objects/IssueStatus';
import { IssueType } from '../value-objects/IssueType';
import { IssuePriority } from '../value-objects/IssuePriority';

/**
 * Issue 倉儲介面
 * 
 * 提供 IssueEntity 聚合的持久化和領域特定查詢
 */
export interface IssueRepository extends Repository<IssueEntity, string> {
  /**
   * 根據 Workspace ID 查找所有 Issue
   * 
   * @param workspaceId - Workspace ID（multi-tenant boundary）
   * @returns IssueEntity 陣列
   */
  findByWorkspaceId(workspaceId: string): Promise<IssueEntity[]>;

  /**
   * 根據受讓人 ID 查找 Issue
   * 
   * @param assigneeId - 受讓人 ID
   * @returns IssueEntity 陣列
   */
  findByAssigneeId(assigneeId: string): Promise<IssueEntity[]>;

  /**
   * 根據報告人 ID 查找 Issue
   * 
   * @param reporterId - 報告人 ID
   * @returns IssueEntity 陣列
   */
  findByReporterId(reporterId: string): Promise<IssueEntity[]>;

  /**
   * 根據 Workspace ID 和狀態查找 Issue
   * 
   * @param workspaceId - Workspace ID
   * @param status - Issue 狀態
   * @returns IssueEntity 陣列
   */
  findByStatus(workspaceId: string, status: IssueStatus): Promise<IssueEntity[]>;

  /**
   * 根據 Workspace ID 和類型查找 Issue
   * 
   * @param workspaceId - Workspace ID
   * @param type - Issue 類型
   * @returns IssueEntity 陣列
   */
  findByType(workspaceId: string, type: IssueType): Promise<IssueEntity[]>;

  /**
   * 根據 Workspace ID 和優先級查找 Issue
   * 
   * @param workspaceId - Workspace ID
   * @param priority - Issue 優先級
   * @returns IssueEntity 陣列
   */
  findByPriority(workspaceId: string, priority: IssuePriority): Promise<IssueEntity[]>;

  /**
   * 查找 Workspace 中的未分配 Issue
   * 
   * @param workspaceId - Workspace ID
   * @returns 未分配的 IssueEntity 陣列
   */
  findUnassignedIssues(workspaceId: string): Promise<IssueEntity[]>;

  /**
   * 查找 Workspace 中的嚴重問題
   * 
   * @param workspaceId - Workspace ID
   * @returns 嚴重優先級的 IssueEntity 陣列
   */
  findCriticalIssues(workspaceId: string): Promise<IssueEntity[]>;

  /**
   * 計算 Workspace 中符合條件的 Issue 數量
   * 
   * @param workspaceId - Workspace ID
   * @param type - 可選的類型篩選
   * @param status - 可選的狀態篩選
   * @returns Issue 數量
   */
  countByWorkspace(workspaceId: string, type?: IssueType, status?: IssueStatus): Promise<number>;
}

// END OF FILE
