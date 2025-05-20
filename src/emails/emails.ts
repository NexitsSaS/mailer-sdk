import { renderAsync } from "@react-email/render";
import { normalizeError } from "../common/utils/normalizeError";
import type { ErrorResponse } from "../common/types/error.types";
import type { Client } from "../client";
import type {
  CancelEmailResponse,
  CreateEmailOptions,
  CreateEmailResponse,
  GetEmailResponse,
  UpdateEmailOptions,
  UpdateEmailResponse,
} from "./types";
import {
  createEmailSchema,
  updateEmailSchema,
  listEmailOptionsSchema,
} from "./validators";

/**
 * Service for email-related operations
 */
export class Emails {
  /**
   * Create a new Emails service
   *
   * @param client - API client for making requests
   */
  
  constructor(private readonly client: Client) {}

  /**
   * Send a new email
   *
   * @param options - Email creation options
   * @returns Promise resolving to created email or error
   */
  async send(options: CreateEmailOptions): Promise<{
    data: CreateEmailResponse | null;
    error: ErrorResponse | null;
  }> {
    try {
      createEmailSchema.parse(options);
      
      const payload = { ...options };

      if (options.react) {
        try {
          payload.html = await renderAsync(options.react);
        } catch (error: unknown) {
          return {
            data: null,
            error: {
              name: "application_error",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to render email template",
            },
          };
        }
      }

      return this.client.post<CreateEmailResponse>("/emails", payload);
    }catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Get details of an existing email
   *
   * @param id - ID of the email to retrieve
   * @returns Promise resolving to email details or error
   */
  get(id: string) {
    if (!id || typeof id !== 'string') {
      return Promise.resolve({
        data: null,
        error: {
          name: "validation_error",
          message: "Email ID is required and must be a string",
        },
      });
    }
    
    return this.client.get<GetEmailResponse>(`/emails/${id}`);
  }

  /**
   * Update an existing email
   * 
   * @param options - Email update options
   * @returns Promise resolving to updated email or error
   */
  update(options: UpdateEmailOptions) {
    try {
      updateEmailSchema.parse(options);
      
      return this.client.patch<UpdateEmailResponse>(`/emails/${options.id}`, {
        scheduled_at: options.scheduledAt,
      });
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Cancel a scheduled email
   * 
   * @param id - ID of email to cancel
   * @returns Promise resolving to cancellation result or error
   */
  cancel(id: string) {
    if (!id || typeof id !== 'string') {
      return Promise.resolve({
        data: null,
        error: {
          name: "validation_error",
          message: "Email ID is required and must be a string",
        },
      });
    }
    
    return this.client.post<CancelEmailResponse>(`/emails/${id}/cancel`);
  }

  /**
   * List emails with optional filtering
   *
   * @param options - Optional pagination and filtering parameters
   * @returns Promise resolving to list of emails or error
   */
  list(options?: {
    limit?: number;
    before?: string;
    after?: string;
    status?: "sent" | "queued" | "scheduled" | "failed";
  }) {
    try {
      if (options) {
        listEmailOptionsSchema.parse(options);
      }
      
      const params = new URLSearchParams();

      if (options?.limit) {
        params.append("limit", options.limit.toString());
      }

      if (options?.before) {
        params.append("before", options.before);
      }

      if (options?.after) {
        params.append("after", options.after);
      }

      if (options?.status) {
        params.append("status", options.status);
      }

      const queryString = params.toString();
      const path = queryString ? `/emails?${queryString}` : "/emails";

      return this.client.get(path);
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }
}