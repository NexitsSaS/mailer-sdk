import type { Domain } from './domain.interface';

export interface ListDomainsOptions {
  company_id: number; 
  status?: 'VERIFIED' | 'PENDING' | 'FAILED';
  is_primary?: boolean;
  limit?: number;
  offset?: number;
}

export type ListDomainsResponse = Pick<
  Domain,
  'id' | 'domain_name' | 'status' | 'is_primary' | 'created_at' | 'updated_at'
>[];