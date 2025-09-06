
import type { Client } from "../client";
import type { ErrorResponse } from "../common/types/error.types";
import type {
  CreateDomainOptions,
  CreateDomainResponse,
  UpdateDomainOptions,
  UpdateDomainResponse,
  GetDomainResponse,
  RemoveDomainResponse,
  ListDomainsOptions,
  ListDomainsResponse,
  VerifyDomainResponse,
  GetDomainVerificationResponse,
} from "./types";
import { normalizeError } from "../common/utils/normalizeError";
import {
  createDomainSchema,
  updateDomainSchema,
  listDomainsSchema,
  getDomainByIdSchema,
  removeDomainSchema,
  verifyDomainSchema,
  getDomainVerificationSchema,
} from "./validators";

/**
 * Service for domain management operations
 */
export class Domains {
  /**
   * Create a new Domains service
   *
   * @param client - API client for making requests
   */
  constructor(private readonly client: Client) {}

  /**
   * Create a new domain
   *
   * @param options - Domain creation options
   * @returns Promise resolving to created domain or error
   */
  async create(options: CreateDomainOptions): Promise<{
    data: CreateDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      createDomainSchema.parse(options);

      const response = await this.client.post<CreateDomainResponse>("/domains", options);
      
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
   * Get details of an existing domain
   *
   * @param id - ID of the domain to retrieve
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to domain details or error
   */
  async get(id: number, companyId: number): Promise<{
    data: GetDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      getDomainByIdSchema.parse({ id, company_id: companyId });

      const response = await this.client.get<{ domain: GetDomainResponse }>(`/domains/${id}`);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.domain || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Update an existing domain
   *
   * @param options - Domain update options
   * @returns Promise resolving to updated domain or error
   */
  async update(options: UpdateDomainOptions): Promise<{
    data: UpdateDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      updateDomainSchema.parse(options);

      const { id, company_id, ...updateData } = options;
      const response = await this.client.patch<{ domain: UpdateDomainResponse }>(`/domains/${id}`, updateData);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.domain || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Remove/delete a domain
   *
   * @param id - ID of domain to remove
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to removal result or error
   */
  async remove(id: number, companyId: number): Promise<{
    data: RemoveDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      removeDomainSchema.parse({ id, company_id: companyId });

      const response = await this.client.delete<RemoveDomainResponse>(`/domains/${id}`);
      
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
   * List domains with optional filtering and pagination
   *
   * @param options - Pagination and filtering parameters (companyId is required)
   * @returns Promise resolving to list of domains or error
   */
  async list(options: ListDomainsOptions): Promise<{
    data: ListDomainsResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      listDomainsSchema.parse(options);

      const params = new URLSearchParams();
      params.append("companyId", options.company_id.toString());

      if (options.status) {
        params.append("status", options.status);
      }

      if (options.is_primary !== undefined) {
        params.append("is_primary", options.is_primary.toString());
      }

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }

      if (options.offset) {
        params.append("offset", options.offset.toString());
      }

      const queryString = params.toString();
      const path = `/domains?${queryString}`;

      const response = await this.client.get<ListDomainsResponse>(path);
      
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
   * Get domain verification details and instructions
   *
   * @param id - Domain ID
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to verification details or error
   */
  async getVerification(id: number, companyId: number): Promise<{
    data: GetDomainVerificationResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      getDomainVerificationSchema.parse({ id, company_id: companyId });

      const response = await this.client.get<GetDomainVerificationResponse>(`/domains/${id}/verification`);
      
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
   * Verify a domain (check if verification records are in place)
   *
   * @param id - Domain ID to verify
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to verification result or error
   */
  async verify(id: number, companyId: number): Promise<{
    data: VerifyDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      verifyDomainSchema.parse({ id, company_id: companyId });

      const response = await this.client.post<VerifyDomainResponse>(`/domains/${id}/verify`, {
        companyId,
      });
      
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
   * Set a domain as primary (unsets other primary domains)
   *
   * @param id - Domain ID to set as primary
   * @param companyId - Company ID for authorization
   * @returns Promise resolving to updated domain or error
   */
  async setPrimary(id: number, companyId: number): Promise<{
    data: UpdateDomainResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<{ domain: UpdateDomainResponse }>(`/domains/${id}/set-primary`, {
        companyId,
      });
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data?.domain || null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Get domain statistics (emails sent, reputation, etc.)
   *
   * @param id - Domain ID
   * @param companyId - Company ID for authorization
   * @param options - Optional date range for statistics
   * @returns Promise resolving to domain statistics or error
   */
  async getStats(id: number, companyId: number, options?: {
    from_date?: string;
    to_date?: string;
  }): Promise<{
    data: {
      emails_sent: number;
      emails_delivered: number;
      emails_bounced: number;
      emails_complained: number;
      delivery_rate: number;
      reputation_score: number;
      daily_breakdown: Array<{
        date: string;
        emails_sent: number;
        delivered: number;
        bounced: number;
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
      const path = `/domains/${id}/stats?${queryString}`;

      return this.client.get(path);
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }
}