/**
 * Payment Repository Interface
 * 
 * 定義 PaymentEntity 聚合的持久化和查詢操作
 */

import { Repository } from '@ng-events/core-engine';
import { PaymentEntity } from '../aggregates/PaymentEntity';
import { PaymentStatus } from '../value-objects/PaymentStatus';
import { Currency } from '../value-objects/Currency';

/**
 * Payment 倉儲介面
 * 
 * 提供 PaymentEntity 聚合的持久化和領域特定查詢
 */
export interface PaymentRepository extends Repository<PaymentEntity, string> {
  /**
   * 根據 Workspace ID 查找所有 Payment
   * 
   * @param workspaceId - Workspace ID（multi-tenant boundary）
   * @returns PaymentEntity 陣列
   */
  findByWorkspaceId(workspaceId: string): Promise<PaymentEntity[]>;

  /**
   * 根據客戶 ID 查找 Payment
   * 
   * @param customerId - 客戶 ID
   * @returns PaymentEntity 陣列
   */
  findByCustomerId(customerId: string): Promise<PaymentEntity[]>;

  /**
   * 根據狀態查找 Payment
   * 
   * @param status - Payment 狀態
   * @returns PaymentEntity 陣列
   */
  findByStatus(status: PaymentStatus): Promise<PaymentEntity[]>;

  /**
   * 根據 Workspace ID 和狀態查找 Payment
   * 
   * @param workspaceId - Workspace ID
   * @param status - Payment 狀態
   * @returns PaymentEntity 陣列
   */
  findByWorkspaceAndStatus(workspaceId: string, status: PaymentStatus): Promise<PaymentEntity[]>;

  /**
   * 根據幣別查找 Payment
   * 
   * @param workspaceId - Workspace ID
   * @param currency - 幣別
   * @returns PaymentEntity 陣列
   */
  findByCurrency(workspaceId: string, currency: Currency): Promise<PaymentEntity[]>;

  /**
   * 計算 Workspace 的總付款金額
   * 
   * @param workspaceId - Workspace ID
   * @param status - 可選的狀態篩選（例如僅計算已處理的付款）
   * @returns 總金額（按幣別分組）
   */
  getTotalAmountByWorkspace(workspaceId: string, status?: PaymentStatus): Promise<Map<Currency, number>>;
}

// END OF FILE
