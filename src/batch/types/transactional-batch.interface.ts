import React from "react";

export interface TransactionalBatchEmailOptions {
  emails: Array<{
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    react?: React.ReactElement;
    from?: string;
    reply_to?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>;
  }>;
  metadata: {
    domain_id: number;
    sender_id: string;
    api_key_id?: number;
    tracking_enabled?: boolean;
    priority?: number;
    message_type: 'TRANSACTIONAL';
  };
}

export interface TransactionalBatchEmailResponse {
  status: 'SUCCESS' | 'FAILED';
  message_type: 'TRANSACTIONAL';
  batch_type: 'TRANSACTIONAL_BATCH';
  result: {
    total_emails: number;
    total_recipients: number;
    successful: number;
    failed: number;
    metrics: {
      total_emails: number;
      total_recipients: number;
      successful: number;
      failed: number;
      success_rate: number;
    };
  };
  timestamp: string;
}

export interface TransactionalSingleEmailOptions {
  payload: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html_body?: string;
    text_body?: string;
    from?: string;
    reply_to?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>;
  };
  metadata: {
    tenant_id: number;
    domain_id: number;
    sender_id: string;
    api_key_id?: number;
    template_id?: number;
    tracking_enabled?: boolean;
    priority?: number;
    idempotency_key?: string;
  };
}

export interface TransactionalSingleEmailResponse {
  status: 'QUEUED' | 'FAILED';
  message_type: 'TRANSACTIONAL';
  idempotency_key: string;
  message_id: string;
  timestamp: string;
}