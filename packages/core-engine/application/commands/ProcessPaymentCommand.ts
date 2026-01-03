/**
 * Process Payment Command
 * 
 * Skeleton: User intent to process a payment.
 * 🔒 NO IMPLEMENTATION - Data structure only
 */

/**
 * Process Payment Command
 * 
 * Represents user intent to process a payment for a workspace.
 */
export interface ProcessPaymentCommand {
  workspaceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  processedBy: string;
}

// END OF FILE
