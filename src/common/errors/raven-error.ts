import type {
  ErrorResponse,
  RavenErrorCode,
} from "../../common/types/error.types";

/**
 * Custom error class for Raven API errors
 */
export class RavenError extends Error {
  /**
   * Error code
   */
  public readonly name: RavenErrorCode;

  /**
   * HTTP status code for this error
   */
  public readonly statusCode?: number;

  /**
   * Create a new Raven error
   *
   * @param message - Error message
   * @param name - Error code
   * @param statusCode - Optional HTTP status code
   */
  public constructor(
    message: string,
    name: RavenErrorCode,
    statusCode?: number,
  ) {
    super(message);
    this.message = message;
    this.name = name;
    this.statusCode = statusCode;

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, RavenError.prototype);
  }

  /**
   * Create a RavenError from an API error response
   *
   * @param response - Error response from API
   * @returns New RavenError instance
   */
  static fromResponse(response: ErrorResponse): RavenError {
    const { name, message } = response;
    return new RavenError(message, name);
  }

  /**
   * Convert error to JSON string
   *
   * @returns JSON representation of error
   */
  toString(): string {
    return JSON.stringify(
      {
        message: this.message,
        name: this.name,
        statusCode: this.statusCode,
      },
      null,
      2,
    );
  }
}
