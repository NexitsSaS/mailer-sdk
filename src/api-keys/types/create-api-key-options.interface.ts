export interface CreateApiKeyOptions {
    name: string;
    company_id: number;
    created_by: string; 
    expires_at?: string; 
    permissions?: string[]; 
    domain_ids?: number[]; 
  }
  
  export interface CreateApiKeyResponse {
    id: number;
    name: string;
    key: string;
    company_id: number;
    created_by: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    expires_at?: string;
    created_at: string;
  }