/**
 * PaymentStatus Value Object
 */
export type PaymentStatus = 'pending' | 'processed' | 'refunded' | 'failed';

/**
 * PaymentStatus Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents payment states with validation.
 */
export class PaymentStatusVO {
  readonly value: PaymentStatus;

  private constructor(value: PaymentStatus) {
    this.value = value;
  }

  /**
   * Factory method to create PaymentStatus instance
   * @param value - The payment status value
   * @returns PaymentStatusVO instance
   */
  static create(value: PaymentStatus): PaymentStatusVO {
    // TODO: Implement validation logic (valid status check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the payment status
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed values)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The payment status string
   */
  getValue(): PaymentStatus {
    return this.value;
  }

  /**
   * Checks equality with another PaymentStatusVO
   * @param other - Another PaymentStatusVO instance
   * @returns true if values are equal
   */
  equals(other: PaymentStatusVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
