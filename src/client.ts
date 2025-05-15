import { z } from "zod";
import type {
  GetOptions,
  PatchOptions,
  PostOptions,
  PutOptions,
} from "./common/interfaces";
import type { ErrorResponse } from "./common/types/error.types";
import { version } from "../package.json";

/**
 * Default API endpoint
 */
const DEFAULT_BASE_URL = "http://localhost:3000";

/**
 * Validation schema for API key
 */
const apiKeySchema = z
  .string()
  .min(1, { message: "API key cannot be empty" })
  .refine((key: string) => key.startsWith("rk_"), {
    message: "API key must start with 'rk_'",
  })
  .refine((key: string) => key.length >= 10, {
    message: "API key must be at least 10 characters long",
  });

/**
 * Configuration options for the API client
 */
export interface ClientOptions {
  /**
   * Base URL for API requests
   */
  baseUrl?: string;

  /**
   * Default headers to include with every request
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

/**
 * HTTP client for making API requests
 */
export class Client {
  private readonly headers: Headers;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Create a new API client
   *
   * @param key - API key for authentication
   * @param options - Configuration options
   */
  constructor(readonly key: string, options: ClientOptions = {}) {
    try {
      apiKeySchema.parse(key);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid API key:\n${error.errors.map((e) => `• ${e.message}`).join("\n")}`
        );
      }
      throw error;
    }

    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? 10000;

    // Initialize request headers
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
      "X-SDK-Version": `raven-sdk:${version}`,
      ...options.defaultHeaders,
    });
  }

  /**
   * Makes an API request and handles the response
   *
   * @param path - API endpoint path
   * @param options - Fetch request options
   * @returns Object containing data or error
   */
  private async fetchRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: ErrorResponse | null }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: this.headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const raw = await response.text();
        try {
          const parsed = JSON.parse(raw) as unknown;
          const error = parsed as ErrorResponse;
          return { data: null, error };
        } catch {
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
      // Handle timeout errors
      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          data: null,
          error: {
            name: "request_timeout",
            message: `Request timed out after ${this.timeout}ms`,
          },
        };
      }

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