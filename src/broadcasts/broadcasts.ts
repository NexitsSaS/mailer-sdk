import type { Client } from "../client";
import type { ErrorResponse } from "../common/types/error.types";
import type {
  CreateBroadcastOptions,
  CreateBroadcastResponse,
  UpdateBroadcastOptions,
  UpdateBroadcastResponse,
  GetBroadcastResponse,
  ListBroadcastsOptions,
  ListBroadcastsResponse,
} from "./types";
import { normalizeError } from "../common/utils/normalizeError";

/**
 * Service for broadcast management operations
 */
export class Broadcasts {
  /**
   * Create a new Broadcasts service
   *
   * @param client - API client for making requests
   */
  constructor(private readonly client: Client) {}

  /**
   * Create a new broadcast
   *
   * @param options - Broadcast creation options
   * @returns Promise resolving to created broadcast or error
   */
  async create(options: CreateBroadcastOptions): Promise<{
    data: CreateBroadcastResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<CreateBroadcastResponse>("/broadcasts", options);
      
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
   * Get details of an existing broadcast
   *
   * @param id - ID of the broadcast to retrieve
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to broadcast details or error
   */
  async get(id: number, companyId: number): Promise<{
    data: GetBroadcastResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.get<{ broadcast: GetBroadcastResponse }>(
        `/broadcasts/${id}?companyId=${companyId}`
      );
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.broadcast || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Update an existing broadcast
   *
   * @param options - Broadcast update options
   * @returns Promise resolving to updated broadcast or error
   */
  async update(options: UpdateBroadcastOptions): Promise<{
    data: UpdateBroadcastResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const { id, company_id, ...updateData } = options;
      const response = await this.client.patch<{ broadcast: UpdateBroadcastResponse }>(
        `/broadcasts/${id}`,
        updateData
      );
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.broadcast || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * List broadcasts with optional filtering and pagination
   *
   * @param options - Pagination and filtering parameters (companyId is required)
   * @returns Promise resolving to list of broadcasts or error
   */
  async list(options: ListBroadcastsOptions): Promise<{
    data: { broadcasts: ListBroadcastsResponse; total: number } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const params = new URLSearchParams();
      params.append("companyId", options.company_id.toString());

      if (options.campaign_id) {
        params.append("campaign_id", options.campaign_id.toString());
      }

      if (options.status) {
        params.append("status", options.status);
      }

      if (options.channel_type) {
        params.append("channel_type", options.channel_type);
      }

      if (options.message_type) {
        params.append("message_type", options.message_type);
      }

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      if (options.offset) {
        params.append("offset", options.offset.toString());
      }

      if (options.from_date) {
        params.append("from_date", options.from_date);
      }

      if (options.to_date) {
        params.append("to_date", options.to_date);
      }

      const queryString = params.toString();
      const path = `/broadcasts?${queryString}`;

      const response = await this.client.get<{ broadcasts: ListBroadcastsResponse; total: number }>(path);
      
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
   * Cancel a scheduled broadcast
   *
   * @param id - Broadcast ID to cancel
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to cancellation result or error
   */
  async cancel(id: number, companyId: number): Promise<{
    data: { success: boolean; status: string } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<{ success: boolean; status: string }>(
        `/broadcasts/${id}/cancel`,
        { companyId }
      );
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data || { success: true, status: 'CANCELLED' }, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Get broadcast statistics and metrics
   *
   * @param id - Broadcast ID
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to broadcast statistics or error
   */
  async getStats(id: number, companyId: number): Promise<{
    data: {
      total_recipients: number;
      sent_count: number;
      delivered_count: number;
      failed_count: number;
      delivery_rate: number;
      completion_rate: number;
      started_at?: string;
      completed_at?: string;
      duration_minutes?: number;
    } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.get<{
        total_recipients: number;
        sent_count: number;
        delivered_count: number;
        failed_count: number;
        delivery_rate: number;
        completion_rate: number;
        started_at?: string;
        completed_at?: string;
        duration_minutes?: number;
      }>(`/broadcasts/${id}/stats?companyId=${companyId}`);
      
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
}