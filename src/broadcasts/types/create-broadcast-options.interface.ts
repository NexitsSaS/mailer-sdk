export interface CreateBroadcastOptions {
    campaign_id?: number;
    company_id: number;
    sender_id: string; 
    name: string;
    channel_type: 'EMAIL' | 'SMS';
    message_type: 'TRANSACTIONAL' | 'MARKETING' | 'PROMOTIONAL';
    scheduled_at?: string;
    subject?: string;
    from_address?: string;
    body_html?: string;
    body_text?: string;
    recipients: string[]; 
    domain_id?: number;
  }
  
  export interface CreateBroadcastResponse {
    id: number;
    broadcast_id: number;
    name: string;
    status: 'SCHEDULED' | 'QUEUED';
    total_emails: number;
    emails_updated: number;
    channel_type: 'EMAIL' | 'SMS';
    message_type: 'TRANSACTIONAL' | 'MARKETING' | 'PROMOTIONAL';
    created_at: string;
  }