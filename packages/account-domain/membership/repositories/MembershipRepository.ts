/**
 * Membership Repository Interface
 * 
 * 定義 Membership 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { Membership } from '../aggregates/Membership';

/**
 * Member 角色
 */
export type MemberRole = 'admin' | 'member' | 'guest';

/**
 * Membership 倉儲介面
 * 
 * 提供 Membership 聚合的持久化和領域特定查詢
 */
export interface MembershipRepository extends Repository<Membership, string> {
  /**
   * 根據 Workspace ID 查找所有成員
   * 
   * @param workspaceId - Workspace ID
   * @returns Membership 陣列
   */
  findByWorkspaceId(workspaceId: string): Promise<Membership[]>;

  /**
   * 根據 Member ID 查找所有加入的 Workspace
   * 
   * @param memberId - Member ID
   * @returns Membership 陣列
   */
  findByMemberId(memberId: string): Promise<Membership[]>;

  /**
   * 根據 Workspace ID 和角色查找成員
   * 
   * @param workspaceId - Workspace ID
   * @param role - Member 角色
   * @returns Membership 陣列
   */
  findByRole(workspaceId: string, role: MemberRole): Promise<Membership[]>;

  /**
   * 查找特定 Workspace 的所有管理員
   * 
   * @param workspaceId - Workspace ID
   * @returns 管理員 Membership 陣列
   */
  findAdminsByWorkspaceId(workspaceId: string): Promise<Membership[]>;

  /**
   * 檢查成員是否存在於 Workspace
   * 
   * @param workspaceId - Workspace ID
   * @param memberId - Member ID
   * @returns 是否存在
   */
  existsInWorkspace(workspaceId: string, memberId: string): Promise<boolean>;
}

// END OF FILE
