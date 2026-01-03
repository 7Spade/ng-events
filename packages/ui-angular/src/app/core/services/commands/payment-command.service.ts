import { Injectable } from '@angular/core';
import { PaymentRepository } from '@ng-events/core-engine';

/**
 * Payment Command Service
 * Handles write operations for Payment aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Create new payment
   * TODO: Load aggregate → execute business method → save
   */
  async createPayment(params: {
    workspaceId: string; // MANDATORY multi-tenant parameter
    amount: number;
    currency: string;
    payerId: string;
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. PaymentEntity.create()
    // 2. paymentRepository.save(payment)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Process payment
   * TODO: Load aggregate → process() → save
   */
  async processPayment(params: {
    paymentId: string;
    workspaceId: string; // MANDATORY for validation
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. paymentRepository.load(paymentId)
    // 2. payment.process()
    // 3. paymentRepository.save(payment)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Refund payment
   * TODO: Load aggregate → refund() → save
   */
  async refundPayment(params: {
    paymentId: string;
    workspaceId: string; // MANDATORY for validation
  }): Promise<void> {
    // TODO: Implement command flow
    throw new Error('Not implemented - skeleton only');
  }
}
