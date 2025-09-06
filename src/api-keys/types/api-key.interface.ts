export interface ApiKey {
    id: number;
    name: string;
    key?: string; 
    company_id: number;
    created_by: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    last_used_at?: string;
    expires_at?: string;
    created_at: string;
    permissions?: string[];
    domains?: { id: number; domain: string }[];
  }