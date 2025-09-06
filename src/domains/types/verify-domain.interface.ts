export interface VerifyDomainOptions {
    id: number;
    company_id: number;
  }
  
  export interface VerifyDomainResponse {
    id: number;
    domain_name: string;
    status: 'VERIFIED' | 'FAILED';
    verification_method: 'DNS' | 'FILE';
    verified_at?: string;
    updated_at: string;
  }
  
  export interface GetDomainVerificationResponse {
    id: number;
    domain_name: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    verification_token: string;
    verification_records: {
      dns: {
        type: 'TXT' | 'CNAME';
        name: string;
        value: string;
      }[];
      file: {
        filename: string;
        content: string;
        url: string;
      };
    };
    instructions: {
      dns: string;
      file: string;
    };
  }