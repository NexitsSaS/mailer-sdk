export interface CreateDomainOptions {
    company_id: number;
    domain_name: string;
    is_primary?: boolean;
  }
  
  export interface CreateDomainResponse {
    id: number;
    company_id: number;
    domain_name: string;
    status: 'PENDING';
    verification_token: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
  }