import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Domains } from '../domains';
import type {
  CreateDomainOptions,
  CreateDomainResponse,
  UpdateDomainOptions,
  ListDomainsOptions,
  ListDomainsResponse,
  VerifyDomainResponse,
  GetDomainVerificationResponse,
} from '../types';
import { Client } from '../../client';

class MockClient extends Client {
  public post = vi.fn();
  public get = vi.fn();
  public patch = vi.fn();
  public delete = vi.fn();
  public put = vi.fn();

  constructor() {
    super('rk_test_1234567890', { baseUrl: 'http://localhost:3000' });
  }
}

describe('Domains SDK', () => {
  let mockClient: MockClient;
  let domains: Domains;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    mockClient = new MockClient();
    domains = new Domains(mockClient);
  });

  describe('create()', () => {
    it('creates a domain with basic fields', async () => {
      const mockResponse: CreateDomainResponse = {
        id: 1,
        company_id: 123,
        domain_name: 'example.com',
        status: 'PENDING',
        verification_token: 'token_abc123456789',
        is_primary: false,
        created_at: '2023-04-07T22:48:33.420498+00:00',
        updated_at: '2023-04-07T22:48:33.420498+00:00',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: CreateDomainOptions = {
        company_id: 123,
        domain_name: 'example.com',
      };

      const result = await domains.create(input);

      expect(mockClient.post).toHaveBeenCalledWith('/domains', input);
      expect(result).toEqual({
        data: mockResponse,
        error: null,
      });
    });

    it('handles validation errors', async () => {
      const input = {
        company_id: 123,
        domain_name: '', // Invalid: empty domain name
      } as CreateDomainOptions;

      const result = await domains.create(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
    });

    it('handles API errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'domain_already_exists',
          message: 'Domain already exists in the system',
        }
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const input: CreateDomainOptions = {
        company_id: 123,
        domain_name: 'existing.com',
      };

      const result = await domains.create(input);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('get()', () => {
    it('retrieves domain details', async () => {
      const mockResponse = {
        data: {
          domain: {
            id: 1,
            company_id: 123,
            domain_name: 'example.com',
            status: 'VERIFIED' as const,
            verification_token: 'token_abc123456789',
            is_primary: true,
            created_at: '2023-04-07T22:48:33.420498+00:00',
            updated_at: '2023-04-08T10:30:00.000000+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await domains.get(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/domains/1');
      expect(result.data).toEqual(mockResponse.data.domain);
    });

    it('handles not found errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'Domain not found'
        }
      };

      vi.mocked(mockClient.get).mockResolvedValue(errorResponse);

      const result = await domains.get(999, 123);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('update()', () => {
    it('updates domain name', async () => {
      const mockResponse = {
        data: {
          domain: {
            id: 1,
            domain_name: 'updated-example.com',
            status: 'VERIFIED' as const,
            is_primary: false,
            updated_at: '2023-04-08T12:00:00.000000+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateDomainOptions = {
        id: 1,
        company_id: 123,
        domain_name: 'updated-example.com',
      };

      const result = await domains.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith('/domains/1', {
        domain_name: 'updated-example.com',
      });
      expect(result.data).toEqual(mockResponse.data.domain);
    });

    it('handles update errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'Domain not found'
        }
      };

      vi.mocked(mockClient.patch).mockResolvedValue(errorResponse);

      const updateOptions: UpdateDomainOptions = {
        id: 999,
        company_id: 123,
        domain_name: 'updated-name.com',
      };

      const result = await domains.update(updateOptions);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('remove()', () => {
    it('removes a domain', async () => {
      const mockResponse = {
        data: { success: true },
        error: null
      };

      vi.mocked(mockClient.delete).mockResolvedValue(mockResponse);

      const result = await domains.remove(1, 123);

      expect(mockClient.delete).toHaveBeenCalledWith('/domains/1');
      expect(result.data).toEqual({ success: true });
    });

    it('handles removal errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'bad_request',
          message: 'Cannot delete primary domain'
        }
      };

      vi.mocked(mockClient.delete).mockResolvedValue(errorResponse);

      const result = await domains.remove(1, 123);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('list()', () => {
    it('lists domains with minimal parameters', async () => {
      const mockResponse: ListDomainsResponse = [
        {
          id: 1,
          domain_name: 'example.com',
          status: 'VERIFIED',
          is_primary: true,
          created_at: '2023-04-07T22:48:33.420498+00:00',
          updated_at: '2023-04-08T10:30:00.000000+00:00',
        },
        {
          id: 2,
          domain_name: 'secondary.com',
          status: 'PENDING',
          is_primary: false,
          created_at: '2023-04-06T15:20:10.123456+00:00',
          updated_at: '2023-04-06T15:20:10.123456+00:00',
        },
      ];

      vi.mocked(mockClient.get).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const options: ListDomainsOptions = {
        company_id: 123,
      };

      const result = await domains.list(options);

      expect(mockClient.get).toHaveBeenCalledWith('/domains?companyId=123');
      expect(result.data).toEqual(mockResponse);
    });

    it('lists domains with filtering', async () => {
      const mockResponse: ListDomainsResponse = [
        {
          id: 3,
          domain_name: 'verified.com',
          status: 'VERIFIED',
          is_primary: false,
          created_at: '2023-04-05T12:30:45.789012+00:00',
          updated_at: '2023-04-07T09:15:30.456789+00:00',
        }
      ];

      vi.mocked(mockClient.get).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const options: ListDomainsOptions = {
        company_id: 123,
        status: 'VERIFIED',
        limit: 10,
      };

      const result = await domains.list(options);

      const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;
      expect(calledUrl).toContain('companyId=123');
      expect(calledUrl).toContain('status=VERIFIED');
      expect(calledUrl).toContain('limit=10');
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getVerification()', () => {
    it('retrieves domain verification details', async () => {
      const mockResponse: GetDomainVerificationResponse = {
        id: 1,
        domain_name: 'example.com',
        status: 'PENDING',
        verification_token: 'token_abc123456789',
        verification_records: {
          dns: [
            {
              type: 'TXT',
              name: '_raven-verification',
              value: 'raven-site-verification=token_abc123456789',
            }
          ],
          file: {
            filename: 'raven-verification.txt',
            content: 'raven-site-verification=token_abc123456789',
            url: 'https://example.com/.well-known/raven-verification.txt',
          }
        },
        instructions: {
          dns: 'Add the TXT record to your DNS settings.',
          file: 'Upload the verification file to your website.',
        }
      };

      vi.mocked(mockClient.get).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await domains.getVerification(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/domains/1/verification');
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('verify()', () => {
    it('verifies a domain successfully', async () => {
      const mockResponse: VerifyDomainResponse = {
        id: 1,
        domain_name: 'example.com',
        status: 'VERIFIED',
        verification_method: 'DNS',
        verified_at: '2023-04-08T14:30:00.000000+00:00',
        updated_at: '2023-04-08T14:30:00.000000+00:00',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await domains.verify(1, 123);

      expect(mockClient.post).toHaveBeenCalledWith('/domains/1/verify', {
        companyId: 123,
      });
      expect(result.data).toEqual(mockResponse);
      expect(result.data?.status).toBe('VERIFIED');
    });

    it('handles verification failure', async () => {
      const mockResponse: VerifyDomainResponse = {
        id: 1,
        domain_name: 'example.com',
        status: 'FAILED',
        verification_method: 'DNS',
        updated_at: '2023-04-08T14:30:00.000000+00:00',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await domains.verify(1, 123);

      expect(result.data?.status).toBe('FAILED');
    });
  });

  describe('setPrimary()', () => {
    it('sets domain as primary', async () => {
      const mockResponse = {
        data: {
          domain: {
            id: 2,
            domain_name: 'newprimary.com',
            status: 'VERIFIED' as const,
            is_primary: true,
            updated_at: '2023-04-08T15:45:00.000000+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await domains.setPrimary(2, 123);

      expect(mockClient.post).toHaveBeenCalledWith('/domains/2/set-primary', {
        companyId: 123,
      });
      expect(result.data).toEqual(mockResponse.data.domain);
      expect(result.data?.is_primary).toBe(true);
    });
  });

  describe('getStats()', () => {
    it('retrieves domain statistics', async () => {
      const mockResponse = {
        data: {
          emails_sent: 5000,
          emails_delivered: 4850,
          emails_bounced: 75,
          emails_complained: 25,
          delivery_rate: 97.0,
          reputation_score: 8.5,
          daily_breakdown: [
            { date: '2023-04-01', emails_sent: 150, delivered: 145, bounced: 3 },
            { date: '2023-04-02', emails_sent: 200, delivered: 195, bounced: 2 },
          ]
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await domains.getStats(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/domains/1/stats?companyId=123');
      expect(result.data).toEqual(mockResponse.data);
    });
    
    it('retrieves domain statistics with date range', async () => {
        const mockResponse = {
          data: {
            emails_sent: 1500,
            emails_delivered: 1450,
            emails_bounced: 30,
            emails_complained: 10,
            delivery_rate: 96.7,
            reputation_score: 8.2,
            daily_breakdown: []
          },
          error: null
        };
      
        vi.mocked(mockClient.get).mockResolvedValue(mockResponse);
      
        await domains.getStats(1, 123, {
          from_date: '2023-04-01T00:00:00Z',
          to_date: '2023-04-03T23:59:59Z',
        });
      
        const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;
        expect(calledUrl).toContain('from_date=2023-04-01T00%3A00%3A00Z');
        expect(calledUrl).toContain('to_date=2023-04-03T23%3A59%3A59Z');
      });
  });
});