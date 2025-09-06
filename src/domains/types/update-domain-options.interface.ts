export interface UpdateDomainOptions {
    id: number;
    company_id: number; 
    domain_name?: string;
    is_primary?: boolean;
  }
  
  export interface UpdateDomainResponse {
    id: number;
    domain_name: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    is_primary: boolean;
    updated_at: string;
  }
  
  export interface GetDomainResponse {
    id: number;
    company_id: number;
    domain_name: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    verification_token?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface RemoveDomainResponse {
    success: boolean; 
  }