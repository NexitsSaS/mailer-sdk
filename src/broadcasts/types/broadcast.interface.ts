export interface Broadcast {
    id: number;
    campaign_id?: number;
    company_id: number;
    sender_id: string; 
    name: string;
    channel_type: 'EMAIL' | 'SMS';
    message_type: 'TRANSACTIONAL' | 'MARKETING' | 'PROMOTIONAL';
    status: 'SCHEDULED' | 'QUEUED' | 'SENT' | 'FAILED';
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    failed_count: number;
    created_at: string;
    updated_at: string;
  }