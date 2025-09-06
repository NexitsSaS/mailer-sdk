import type { Client } from "../client";
import type { ErrorResponse } from "../common/types/error.types";
import type {
  CreateApiKeyOptions,
  CreateApiKeyResponse,
  UpdateApiKeyOptions,
  UpdateApiKeyResponse,
  GetApiKeyResponse,
  RemoveApiKeyResponse,
  ListApiKeysOptions,
  ListApiKeysResponse,
} from "./types";
import { normalizeError } from "../common/utils/normalizeError";
import {
  createApiKeySchema,
  updateApiKeySchema,
  listApiKeysSchema,
  getApiKeyByIdSchema,
  removeApiKeySchema,
} from "./validators";

/**
 * Service for API key management operations
 */
export class ApiKeys {
  /**
   * Create a new ApiKeys service
   *
   * @param client - API client for making requests
   */
  constructor(private readonly client: Client) {}

  /**
   * Create a new API key
   *
   * @param options - API key creation options
   * @returns Promise resolving to created API key or error
   */
  async create(options: CreateApiKeyOptions): Promise<{
    data: CreateApiKeyResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      createApiKeySchema.parse(options);

      const response = await this.client.post<{ apiKey: CreateApiKeyResponse }>("/api-keys", options);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.apiKey || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Get details of an existing API key
   *
   * @param id - ID of the API key to retrieve
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to API key details or error
   */
  async get(id: number, companyId: number): Promise<{
    data: GetApiKeyResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      getApiKeyByIdSchema.parse({ id, company_id: companyId });

      const response = await this.client.get<{ apiKey: GetApiKeyResponse }>(`/api-keys/${id}`);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.apiKey || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Update an existing API key
   *
   * @param options - API key update options
   * @returns Promise resolving to updated API key or error
   */
  async update(options: UpdateApiKeyOptions): Promise<{
    data: UpdateApiKeyResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      updateApiKeySchema.parse(options);

      const { id, company_id, ...updateData } = options;
      const response = await this.client.patch<{ apiKey: UpdateApiKeyResponse }>(`/api-keys/${id}`, updateData);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.apiKey || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Remove/delete an API key
   *
   * @param id - ID of API key to remove
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to removal result or error
   */
  async remove(id: number, companyId: number): Promise<{
    data: RemoveApiKeyResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      removeApiKeySchema.parse({ id, company_id: companyId });

      const response = await this.client.delete<RemoveApiKeyResponse>(`/api-keys/${id}`);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data || { success: true }, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * List API keys with optional filtering and pagination
   *
   * @param options - Pagination and filtering parameters (companyId is required)
   * @returns Promise resolving to list of API keys or error
   */
  async list(options: ListApiKeysOptions): Promise<{
    data: { apiKeys: ListApiKeysResponse } | null;
    error: ErrorResponse | null;
  }> {
    try {
      listApiKeysSchema.parse(options);

      const params = new URLSearchParams();
      params.append("companyId", options.company_id.toString());

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      if (options.offset) {
        params.append("offset", options.offset.toString());
      }

      if (options.status) {
        params.append("status", options.status);
      }

      const queryString = params.toString();
      const path = `/api-keys?${queryString}`;

      const response = await this.client.get<{ apiKeys: ListApiKeysResponse }>(path);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Get usage statistics for an API key
   *
   * @param id - API key ID
   * @param companyId - Company ID for authorization
   * @param options - Optional date range for statistics
   * @returns Promise resolving to usage statistics or error
   */
  async getUsage(id: number, companyId: number, options?: {
    from_date?: string;
    to_date?: string;
  }): Promise<{
    data: {
      emails_sent: number;
      last_30_days: number;
      current_month: number;
      daily_breakdown: Array<{
        date: string;
        emails_sent: number;
      }>;
    } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const params = new URLSearchParams();
      params.append("companyId", companyId.toString());

      if (options?.from_date) {
        params.append("from_date", options.from_date);
      }

      if (options?.to_date) {
        params.append("to_date", options.to_date);
      }

      const queryString = params.toString();
      const path = `/api-keys/${id}/usage?${queryString}`;

      return this.client.get(path);
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Regenerate an API key (creates new token, invalidates old one)
   *
   * @param id - API key ID to regenerate
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to new API key details or error
   */
  async regenerate(id: number, companyId: number): Promise<{
    data: CreateApiKeyResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<{ apiKey: CreateApiKeyResponse }>(`/api-keys/${id}/regenerate`, {
        companyId,
      });
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.apiKey || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }
}