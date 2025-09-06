import React from "react";

export interface MarketingCampaignEmailOptions {
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

export interface MarketingCampaignEmailResponse {
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