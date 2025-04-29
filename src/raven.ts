import type {
  GetOptions,
  PatchOptions,
  PostOptions,
  PutOptions,
} from "./common/interfaces";
import type { ErrorResponse } from './common/types/error.types';
import { Emails } from "./emails/emails";
import { version } from "../package.json";


/**
 * Default API endpoint
 */
const DEFAULT_BASE_URL = "http://localhost:3000";


/**
 * Configuration options for the Raven client
 */
export type RavenOptions = {
  /**
   * Base URL for API requests
   */
  baseUrl?: string;
  
  /**
   * Default headers to include with every request
   */
  defaultHeaders?: Record<string, string>;
};


/**
 * Raven SDK client for interacting with the Raven API
 */
export class Raven {
  private readonly headers: Headers;
  private readonly baseUrl: string;

  
  /**
   * Email operations
   */
  readonly emails: Emails;

  /**
   * Create a new Raven SDK client
   * 
   * @param key - API key for authentication
   * @param options - Configuration options
   */
  constructor(
    readonly key?: string,
    options: RavenOptions = {}
  ) {
    // Try to get API key from environment if not provided
    if (!key && typeof process !== "undefined" && process.env) {
      this.key = process.env.RAVEN_API_KEY;
    }

    // Throw error if API key still not available
    if (!this.key) {
      throw new Error(
        "Missing API key. Pass it to the constructor: new Raven('rk_...')"
      );
    }

    // Set base URL from options or environment
    this.baseUrl = options.baseUrl || 
      (typeof process !== "undefined" && process.env && process.env.RAVEN_BASE_URL) ||
      DEFAULT_BASE_URL;

    // Initialize request headers
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      "X-SDK-Version": `raven-sdk:${version}`,
      ...options.defaultHeaders,
    });

    // Initialize service clients
    this.emails = new Emails(this);
  }

  /**
   * Makes an API request and handles the response
   * 
   * @param path - API endpoint path
   * @param options - Fetch request options
   * @returns Object containing data or error
   */
  async fetchRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: ErrorResponse | null }> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: this.headers,
      });

      if (!response.ok) {
        const raw = await response.text();
        try {
          return { data: null, error: JSON.parse(raw) };
        } catch (_) {
          return {
            data: null,
            error: {
              name: "internal_server_error",
              message: "An unexpected error occurred",
            },
          };
        }
      }

      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          name: "internal_server_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Make a GET request to the API
   * 
   * @param path - API endpoint path
   * @param options - Additional request options
   * @returns Promise with response data or error
   */
  get<T>(path: string, options?: GetOptions) {
    return this.fetchRequest<T>(path, { method: "GET", ...options });
  }

  /**
   * Make a POST request to the API
   * 
   * @param path - API endpoint path
   * @param entity - Request body data
   * @param options - Additional request options
   * @returns Promise with response data or error
   */
  post<T>(path: string, entity?: unknown, options: PostOptions = {}) {
    return this.fetchRequest<T>(path, {
      method: "POST",
      body: JSON.stringify(entity),
      ...options,
    });
  }

  /**
   * Make a PATCH request to the API
   * 
   * @param path - API endpoint path
   * @param entity - Request body data
   * @param options - Additional request options
   * @returns Promise with response data or error
   */
  patch<T>(path: string, entity: unknown, options: PatchOptions = {}) {
    return this.fetchRequest<T>(path, {
      method: "PATCH",
      body: JSON.stringify(entity),
      ...options,
    });
  }

  /**
   * Make a PUT request to the API
   * 
   * @param path - API endpoint path
   * @param entity - Request body data
   * @param options - Additional request options
   * @returns Promise with response data or error
   */
  put<T>(path: string, entity: unknown, options: PutOptions = {}) {
    return this.fetchRequest<T>(path, {
      method: "PUT",
      body: JSON.stringify(entity),
      ...options,
    });
  }

  /**
   * Make a DELETE request to the API
   * 
   * @param path - API endpoint path
   * @param query - Optional request body
   * @returns Promise with response data or error
   */

  delete<T>(path: string, query?: unknown) {
    return this.fetchRequest<T>(path, {
      method: "DELETE",
      body: query ? JSON.stringify(query) : undefined,
    });
  }
}