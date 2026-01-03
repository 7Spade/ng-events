/**
 * Application Error
 * 
 * Skeleton: Base error class for application errors.
 * 🔒 NO IMPLEMENTATION - Structure only
 */

/**
 * Application Error
 * 
 * Base class for all application-level errors.
 * Provides consistent error structure and metadata.
 */
export class ApplicationError extends Error {
  public readonly code: string;
  public readonly metadata: any;

  constructor(message: string, code: string, metadata?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.metadata = metadata;
  }
}

/**
 * Validation Error
 * 
 * Thrown when input validation fails.
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, metadata?: any) {
    super(message, 'VALIDATION_ERROR', metadata);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error
 * 
 * Thrown when requested resource is not found.
 */
export class NotFoundError extends ApplicationError {
  constructor(message: string, metadata?: any) {
    super(message, 'NOT_FOUND', metadata);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 * 
 * Thrown when operation conflicts with current state.
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, metadata?: any) {
    super(message, 'CONFLICT', metadata);
    this.name = 'ConflictError';
  }
}

// END OF FILE
