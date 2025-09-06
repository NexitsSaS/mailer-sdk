export interface Domain {
    id: number;
    company_id: number;
    domain_name: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    verification_token?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
  }