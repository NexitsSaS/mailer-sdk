import type { ApiKey } from './api-key.interface';

export interface ListApiKeysOptions {
  company_id: number; 
  limit?: number;
  offset?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export type ListApiKeysResponse = Pick<
  ApiKey,
  'id' | 'name' | 'status' | 'created_at' | 'last_used_at' | 'expires_at'
>[];