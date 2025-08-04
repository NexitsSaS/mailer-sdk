/**
 * Map of error codes to HTTP status codes
 */
export const RAVEN_ERROR_CODES = {
  missing_required_field: 422,
  invalid_access: 422,
  invalid_parameter: 422,
  invalid_region: 422,
  rate_limit_exceeded: 429,
  missing_api_key: 401,
  invalid_api_key: 403,
  invalid_from_address: 403,
  validation_error: 403,
  not_found: 404,
  method_not_allowed: 405,
  request_timeout: 408,
  application_error: 500,
  internal_server_error: 500,
} as const;

/**
 * Error code type derived from error code map keys
 */
export type RavenErrorCode = keyof typeof RAVEN_ERROR_CODES;

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Error code identifier
   */
  name: RavenErrorCode;
}

export interface StandardError {
  /**
   * Error message
   */
  message: string;

  /**
   * Error code
   */
  code?: string;
}
