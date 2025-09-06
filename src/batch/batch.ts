import { renderAsync } from "@react-email/render";
import type { Client } from "../client";
import type { ErrorResponse } from "../common/types/error.types";
import type {
  BatchEmailOptions,
  BatchEmailResponse,
  MarketingCampaignOptions,
  MarketingCampaignResponse,
  TransactionalBatchOptions,
  TransactionalEmailOptions,
  TransactionalEmailResponse,
} from "./types";
import { normalizeError } from "../common/utils/normalizeError";

/**
 * Service for batch email operations
 */
export class Batch {
  /**
   * Create a new Batch service
   *
   * @param client - API client for making requests
   */
  constructor(private readonly client: Client) {}

  /**
   * Send batch emails (general purpose)
   *
   * @param options - Batch email options
   * @returns Promise resolving to batch result or error
   */
  async sendEmails(options: BatchEmailOptions): Promise<{
    data: BatchEmailResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const processedEmails = await Promise.all(
        options.emails.map(async (email) => {
          if (email.react) {
            try {
              const html = await renderAsync(email.react);
              return { ...email, html, react: undefined };
            } catch (error) {
              throw new Error(`Failed to render template for email to ${email.to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          return email;
        })
      );

      const response = await this.client.post<BatchEmailResponse>("/batch-email", {
        ...options,
        emails: processedEmails,
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
   * Send marketing campaign emails
   *
   * @param options - Marketing campaign options
   * @returns Promise resolving to campaign result or error
   */
  async sendMarketingCampaign(options: MarketingCampaignOptions): Promise<{
    data: MarketingCampaignResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      let htmlBody = options.html_body;

      // Process React template if provided
      if (options.react) {
        try {
          htmlBody = await renderAsync(options.react);
        } catch (error) {
          return {
            data: null,
            error: {
              name: "application_error",
              message: error instanceof Error ? error.message : "Failed to render React template",
            },
          };
        }
      }

      const payload = {
        name: options.name,
        subject: options.subject,
        fromAddress: options.from_address,
        recipients: options.recipients,
        htmlBody,
        textBody: options.text_body,
        metadata: options.metadata,
      };

      const response = await this.client.post<MarketingCampaignResponse>(
        "/emails/marketing/campaign",
        payload
      );
      
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
   * Send transactional batch emails
   *
   * @param options - Transactional batch options
   * @returns Promise resolving to batch result or error
   */
  async sendTransactionalBatch(options: TransactionalBatchOptions): Promise<{
    data: BatchEmailResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const processedEmails = await Promise.all(
        options.emails.map(async (email) => {
          if (email.react) {
            try {
              const html = await renderAsync(email.react);
              return { ...email, html, react: undefined };
            } catch (error) {
              throw new Error(`Failed to render template for email to ${email.to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          return email;
        })
      );

      const response = await this.client.post<BatchEmailResponse>(
        "/emails/transactional/batch",
        {
          emails: processedEmails,
          metadata: options.metadata,
        }
      );
      
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
   * Send single transactional email
   *
   * @param options - Transactional email options
   * @returns Promise resolving to email result or error
   */
  async sendTransactionalEmail(options: TransactionalEmailOptions): Promise<{
    data: TransactionalEmailResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<TransactionalEmailResponse>(
        "/emails/transactional/send",
        options
      );
      
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
   * Get batch processing status
   *
   * @param batchId - Batch ID to check status for
   * @returns Promise resolving to batch status or error
   */
 async getStatus(batchId: string): Promise<{
    data: {
      batch_id: string;
      status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
      total_emails: number;
      processed: number;
      successful: number;
      failed: number;
      created_at: string;
      completed_at?: string;
      errors?: Array<{
        index: number;
        error: string;
      }>;
    } | null;
    error: ErrorResponse | null;
  }> {
    try {
      type BatchStatusResponse = {
        batch_id: string;
        status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
        total_emails: number;
        processed: number;
        successful: number;
        failed: number;
        created_at: string;
        completed_at?: string;
        errors?: Array<{
          index: number;
          error: string;
        }>;
      };

      const response = await this.client.get<BatchStatusResponse>(`/batch-email/${batchId}/status`);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      const isValidBatchStatus = (data: any): data is BatchStatusResponse => {
        return data && 
               typeof data.batch_id === 'string' &&
               ['PROCESSING', 'COMPLETED', 'FAILED'].includes(data.status) &&
               typeof data.total_emails === 'number' &&
               typeof data.processed === 'number' &&
               typeof data.successful === 'number' &&
               typeof data.failed === 'number' &&
               typeof data.created_at === 'string';
      };

      if (response.data && isValidBatchStatus(response.data)) {
        return { data: response.data, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Cancel a batch processing job
   *
   * @param batchId - Batch ID to cancel
   * @returns Promise resolving to cancellation result or error
   */
  async cancel(batchId: string): Promise<{
    data: { success: boolean; cancelled_at: string } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const response = await this.client.post<{ success: boolean; cancelled_at: string }>(`/batch-email/${batchId}/cancel`);
      
      if (response.error) {
        return { data: null, error: response.error };
      }

      // Ensure response.data has the correct shape or provide default
      const data = response.data && 'success' in response.data 
        ? response.data 
        : { success: true, cancelled_at: new Date().toISOString() };

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }
}