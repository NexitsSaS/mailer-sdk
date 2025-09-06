export interface UpdateApiKeyOptions {
    id: number;
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    expires_at?: string;
    company_id: number; 
  }
  
  export interface UpdateApiKeyResponse {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    expires_at?: string;
    updated_at: string;
  }
  
  export interface GetApiKeyResponse {
    id: number;
    name: string;
    company_id: number;
    created_by: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    created_at: string;
    last_used_at?: string;
    expires_at?: string;
    permissions?: string[];
    domains?: { id: number; domain: string }[];
    usage_stats?: {
      emails_sent: number;
      last_30_days: number;
      current_month: number;
    };
  }
  
  export interface RemoveApiKeyResponse {
    success: boolean; 
  }