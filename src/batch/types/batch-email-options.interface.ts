import React from "react";

export interface BatchEmailOptions {
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
    headers?: Record<string, string>;
    tags?: Record<string, string>;
  }>;
  metadata?: {
    domain_id?: number;
    sender_id?: string;
    api_key_id?: number;
    tracking_enabled?: boolean;
  };
}

export interface MarketingCampaignOptions {
  name: string;
  subject: string;
  from_address?: string;
  recipients: string[];
  html_body?: string;
  text_body?: string;
  react?: React.ReactElement;
  metadata: {
    company_id: number;
    user_id: string;
    domain_id: number;
    tracking_enabled?: boolean;
  };
}

export interface TransactionalBatchOptions {
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

export interface TransactionalEmailOptions {
  payload: {
    type: 'EMAIL';
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

export interface BatchEmailResponse {
  status: 'SUCCESS' | 'FAILED';
  result: {
    total_emails: number;
    total_recipients: number;
    successful: number;
    failed: number;
    success_rate: number;
    errors?: Array<{
      index: number;
      error: string;
      recipients?: string[];
    }>;
  };
  timestamp: string;
}

export interface MarketingCampaignResponse {
  status: 'SUCCESS' | 'FAILED';
  message_type: 'MARKETING';
  channel_type: 'EMAIL';
  broadcast_id: number;
  result: {
    broadcast_name: string;
    total_emails: number;
    emails_updated: number;
    status: string;
  };
  timestamp: string;
}

export interface TransactionalEmailResponse {
  status: 'QUEUED' | 'FAILED';
  message_type: 'TRANSACTIONAL';
  idempotency_key: string;
  message_id: string;
  timestamp: string;
}