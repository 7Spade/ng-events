/**
 * Currency Value Object
 * 
 * ISO 4217 currency codes
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'TWD';

/**
 * Currency Value Object Class
 * 
 * Class-based implementation for future migration from type alias.
 * Represents ISO 4217 currency codes with validation.
 */
export class CurrencyVO {
  readonly value: Currency;

  private constructor(value: Currency) {
    this.value = value;
  }

  /**
   * Factory method to create Currency instance
   * @param value - The currency code value
   * @returns CurrencyVO instance
   */
  static create(value: Currency): CurrencyVO {
    // TODO: Implement validation logic (valid ISO 4217 code check)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Validates the currency code
   * @throws Error if validation fails
   */
  validate(): void {
    // TODO: Implement validation rules (must be one of allowed ISO codes)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Gets the raw value
   * @returns The currency code string
   */
  getValue(): Currency {
    return this.value;
  }

  /**
   * Checks equality with another CurrencyVO
   * @param other - Another CurrencyVO instance
   * @returns true if values are equal
   */
  equals(other: CurrencyVO): boolean {
    // TODO: Implement equality check
    throw new Error('Not implemented - skeleton only');
  }
}
