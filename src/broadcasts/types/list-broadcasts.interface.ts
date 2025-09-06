import type { Broadcast } from './broadcast.interface';

export interface ListBroadcastsOptions {
  company_id: number; 
  campaign_id?: number;
  status?: 'SCHEDULED' | 'QUEUED' | 'SENT' | 'FAILED';
  channel_type?: 'EMAIL' | 'SMS';
  message_type?: 'TRANSACTIONAL' | 'MARKETING' | 'PROMOTIONAL';
  limit?: number;
  offset?: number;
  from_date?: string;
  to_date?: string;
}

export type ListBroadcastsResponse = Pick<
  Broadcast,
  'id' | 'campaign_id' | 'name' | 'channel_type' | 'message_type' | 'status' | 'total_recipients' | 'sent_count' | 'delivered_count' | 'failed_count' | 'scheduled_at' | 'created_at' | 'updated_at'
>[];

export interface GetBroadcastResponse extends Broadcast {
  campaign?: {
    id: number;
    name: string;
    status: string;
  };
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UpdateBroadcastOptions {
  id: number;
  company_id: number; 
  name?: string;
  scheduled_at?: string;
  status?: 'SCHEDULED' | 'QUEUED' | 'SENT' | 'FAILED';
}

export interface UpdateBroadcastResponse {
  id: number;
  name: string;
  status: 'SCHEDULED' | 'QUEUED' | 'SENT' | 'FAILED';
  scheduled_at?: string;
  updated_at: string;
}