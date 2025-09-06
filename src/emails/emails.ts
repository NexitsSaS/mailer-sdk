import React from "react";
import { renderAsync } from "@react-email/render";

import type { Client } from "../client";
import type { ErrorResponse } from "../common/types/error.types";
import type {
  CancelEmailResponse,
  CreateEmailOptions,
  CreateEmailResponse,
  GetEmailResponse,
  UpdateEmailOptions,
  UpdateEmailResponse,
} from "./types";
import { normalizeError } from "../common/utils/normalizeError";
import {
  createEmailSchema,
  listEmailOptionsSchema,
  updateEmailSchema,
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
    } catch (error) {
      return {
        data: null,
        error: normalizeError(error),
      };
    }
  }

  /**
   * Queue a new email via the outbox mechanism
   *
   * This method does not send the email immediately.
   * Instead, it inserts the email into the outbox table,
   * where it will be picked up by a background worker,
   * published to SQS, and sent asynchronously.
   *
   * @param input - Email payload and metadata for delivery and tracking
   * @returns Promise resolving to the queued email's idempotency key or an error
   */

  async sendQueued(input: {
    payload: {
      type: "EMAIL";
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body?: string;
      react?: React.ReactElement;
      from?: string;
      replyTo?: string;
      attachments?: {
        filename: string;
        content: string;
        contentType: string;
      }[];
    };
    metadata: {
      tenantId: number;
      domainId: number;
      senderId: string;
      apiKeyId: number;
      templateId: number;
      trackingEnabled: boolean;
    };
  }): Promise<{
    data: { idempotencyKey: string } | null;
    error: ErrorResponse | null;
  }> {
    try {
      const { payload, metadata } = input;

      let htmlBody = payload.body ?? "";

      if (payload.react) {
        try {
          if (!React.isValidElement(payload.react)) {
            throw new Error("Invalid React element provided to renderAsync");
          }

          htmlBody = await renderAsync(payload.react);
          if (htmlBody.length > 100_000) {
            throw new Error("Rendered HTML body too large");
          }
        } catch (error) {
          console.error("❌ renderAsync failed:", error);
          return {
            data: null,
            error: {
              name: "application_error",
              message:
                error instanceof Error
                  ? error.message
                  : "Template render failed",
            },
          };
        }
      }

      const response = await this.client.post<{ idempotencyKey: string }>(
        "/emails/queue",
        {
          payload: {
            type: "EMAIL",
            to: payload.to,
            cc: payload.cc,
            bcc: payload.bcc,
            subject: payload.subject,
            htmlBody,
            from: payload.from,
            replyTo: payload.replyTo,
            attachments: payload.attachments,
          },
          metadata,
        },
      );

      if (!response.data?.idempotencyKey) {
        console.error("❌ Missing idempotencyKey in response:", response);
        return {
          data: null,
          error: {
            name: "application_error",
            message: "No idempotency key returned from queue endpoint",
          },
        };
      }

      return {
        data: response.data,
        error: response.error,
      };
    } catch (err) {
      return {
        data: null,
        error: normalizeError(err),
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
    if (!id || typeof id !== "string") {
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
    if (!id || typeof id !== "string") {
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
