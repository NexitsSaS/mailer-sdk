import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeys } from '../api-keys';
import type {
  CreateApiKeyOptions,
  UpdateApiKeyOptions,
  ListApiKeysOptions,
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

describe('API Keys SDK', () => {
  let mockClient: MockClient;
  let apiKeys: ApiKeys;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    mockClient = new MockClient();
    apiKeys = new ApiKeys(mockClient);
  });

  describe('create()', () => {
    /**
     * Test case: Creating a basic API key with minimal fields
     * Verifies that the client.post method is called with correct parameters
     * and the response is properly returned
     */
    it('creates an API key with basic fields', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 1,
            name: 'Test API Key',
            key: 'rk_live_abcd1234567890',
            company_id: 123,
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE' as const,
            created_at: '2023-04-07T23:13:52.669661+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(mockClient.post).toHaveBeenCalledWith('/api-keys', input);
      expect(result).toEqual({
        data: mockResponse.data.apiKey,
        error: null
      });
    });

    /**
     * Test case: Creating an API key with permissions and domain associations
     * Verifies that permissions and domain_ids are properly passed to the API
     */
    it('creates an API key with permissions and domain associations', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 3,
            name: 'Full Access Key',
            key: 'rk_live_full123456789',
            company_id: 123,
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE' as const,
            created_at: '2023-04-07T23:13:52.669661+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateApiKeyOptions = {
        name: 'Full Access Key',
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        permissions: ['emails:send', 'domains:read'],
        domain_ids: [1, 2, 3],
      };

      const result = await apiKeys.create(input);

      expect(mockClient.post).toHaveBeenCalledWith('/api-keys', input);
      expect(result.data).toEqual(mockResponse.data.apiKey);
    });

    /**
     * Test case: Error handling when creating API key with invalid data
     * Verifies that validation errors are properly handled
     */
    it('handles validation errors when creating API key', async () => {
      const input = {
        name: '', // Invalid: empty name
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      } as CreateApiKeyOptions;

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        name: 'validation_error',
        message: 'API key name is required',
      });
    });

    /**
     * Test case: Error handling when API returns error
     * Verifies that API errors are properly propagated
     */
    it('handles API errors when creating API key', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'unauthorized',
          message: 'Company not found or access denied',
        }
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 999, // Non-existent company
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('get()', () => {
    /**
     * Test case: Get API key details
     * Verifies that the client.get method is called with correct ID and company
     * and the response is properly returned
     */
    it('retrieves API key details', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 1,
            name: 'Test API Key',
            company_id: 123,
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE' as const,
            created_at: '2023-04-07T23:13:52.669661+00:00',
            last_used_at: '2023-04-08T10:30:00.000000+00:00',
            usage_stats: {
              emails_sent: 1500,
              last_30_days: 250,
              current_month: 150,
            }
          }
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await apiKeys.get(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/api-keys/1');
      expect(result.data).toEqual(mockResponse.data.apiKey);
    });

    /**
     * Test case: Error handling when getting a non-existent API key
     * Verifies that errors from the API are properly propagated
     */
    it('handles not found errors gracefully', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'API key not found'
        }
      };

      vi.mocked(mockClient.get).mockResolvedValue(errorResponse);

      const result = await apiKeys.get(999, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/api-keys/999');
      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });

    /**
     * Test case: Validation error for invalid parameters
     * Verifies that invalid parameters are caught before API call
     */
    it('handles validation errors for invalid parameters', async () => {
      const result = await apiKeys.get(-1, 123); // Invalid ID

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
    });
  });

  describe('update()', () => {
    /**
     * Test case: Update API key name
     * Verifies that the client.patch method is called with correct parameters
     */
    it('updates API key name', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 1,
            name: 'Updated API Key Name',
            status: 'ACTIVE' as const,
            updated_at: '2023-04-08T12:00:00.000000+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateApiKeyOptions = {
        id: 1,
        company_id: 123,
        name: 'Updated API Key Name',
      };

      const result = await apiKeys.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith('/api-keys/1', {
        name: 'Updated API Key Name',
      });
      expect(result.data).toEqual(mockResponse.data.apiKey);
    });

    /**
     * Test case: Update API key status
     * Verifies that status updates are handled correctly
     */
    it('updates API key status', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 1,
            name: 'Test API Key',
            status: 'INACTIVE' as const,
            updated_at: '2023-04-08T12:00:00.000000+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateApiKeyOptions = {
        id: 1,
        company_id: 123,
        status: 'INACTIVE',
      };

      const result = await apiKeys.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith('/api-keys/1', {
        status: 'INACTIVE',
      });
      expect(result.data?.status).toBe('INACTIVE');
    });

    /**
     * Test case: Error handling for update operation
     * Verifies that errors from the API are properly propagated
     */
    it('handles update errors properly', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'API key not found'
        }
      };

      vi.mocked(mockClient.patch).mockResolvedValue(errorResponse);

      const updateOptions: UpdateApiKeyOptions = {
        id: 999,
        company_id: 123,
        name: 'Updated Name',
      };

      const result = await apiKeys.update(updateOptions);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('remove()', () => {
    /**
     * Test case: Remove an API key
     * Verifies that the client.delete method is called with correct path
     */
    it('removes an API key', async () => {
      const mockResponse = {
        data: { success: true },
        error: null
      };

      vi.mocked(mockClient.delete).mockResolvedValue(mockResponse);

      const result = await apiKeys.remove(1, 123);

      expect(mockClient.delete).toHaveBeenCalledWith('/api-keys/1');
      expect(result.data).toEqual({ success: true });
    });

    /**
     * Test case: Error handling when removal fails
     * Verifies that errors from the API are properly propagated
     */
    it('handles errors when removal fails', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'bad_request',
          message: 'Cannot delete API key that is currently in use'
        }
      };

      vi.mocked(mockClient.delete).mockResolvedValue(errorResponse);

      const result = await apiKeys.remove(1, 123);

      expect(mockClient.delete).toHaveBeenCalledWith('/api-keys/1');
      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });

    /**
     * Test case: Validation error for invalid parameters
     * Verifies that invalid parameters are caught before API call
     */
    it('handles validation errors for invalid parameters', async () => {
      const result = await apiKeys.remove(-1, 123); // Invalid ID

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
    });
  });

  describe('list()', () => {
    /**
     * Test case: List API keys with minimal parameters
     * Verifies that the client.get method is called with correct query parameters
     */
    it('lists API keys with minimal parameters', async () => {
      const mockResponse = {
        data: {
          apiKeys: [
            {
              id: 1,
              name: 'API Key 1',
              status: 'ACTIVE' as const,
              created_at: '2023-04-07T20:29:10.666968+00:00',
              last_used_at: '2023-04-08T10:30:00.000000+00:00',
            },
            {
              id: 2,
              name: 'API Key 2',
              status: 'ACTIVE' as const,
              created_at: '2023-04-06T23:09:49.093947+00:00',
              last_used_at: null,
            },
          ]
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const options: ListApiKeysOptions = {
        company_id: 123,
      };

      const result = await apiKeys.list(options);

      expect(mockClient.get).toHaveBeenCalledWith('/api-keys?companyId=123');
      expect(result.data).toEqual(mockResponse.data);
    });

    /**
     * Test case: List API keys with all filter parameters
     * Verifies that the client.get method combines all query parameters correctly
     */
    it('lists API keys with all filter parameters', async () => {
      const mockResponse = {
        data: {
          apiKeys: [
            {
              id: 3,
              name: 'Inactive API Key',
              status: 'INACTIVE' as const,
              created_at: '2023-04-05T15:45:30.123456+00:00',
              last_used_at: '2023-04-06T09:15:00.000000+00:00',
            }
          ]
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const options: ListApiKeysOptions = {
        company_id: 123,
        limit: 10,
        offset: 5,
        status: 'INACTIVE',
      };

      const result = await apiKeys.list(options);

      expect(mockClient.get).toHaveBeenCalled();
      const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;

      expect(calledUrl).toContain('/api-keys?');
      expect(calledUrl).toContain('companyId=123');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('offset=5');
      expect(calledUrl).toContain('status=INACTIVE');

      expect(result.data).toEqual(mockResponse.data);
    });

    /**
     * Test case: Validation error for missing required parameters
     * Verifies that company_id is required for listing
     */
    it('handles validation error for missing company_id', async () => {
      const options = {
        limit: 10,
      } as ListApiKeysOptions; // Missing company_id

      const result = await apiKeys.list(options);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
    });
  });

  describe('getUsage()', () => {
    /**
     * Test case: Get API key usage statistics
     * Verifies that usage statistics are retrieved correctly
     */
    it('retrieves API key usage statistics', async () => {
      const mockResponse = {
        data: {
          emails_sent: 2500,
          last_30_days: 750,
          current_month: 450,
          daily_breakdown: [
            { date: '2023-04-01', emails_sent: 25 },
            { date: '2023-04-02', emails_sent: 30 },
            { date: '2023-04-03', emails_sent: 45 },
          ]
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await apiKeys.getUsage(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/api-keys/1/usage?companyId=123');
      expect(result.data).toEqual(mockResponse.data);
    });

    /**
     * Test case: Get API key usage with date range
     * Verifies that date range parameters are handled correctly
     */
    it('retrieves API key usage with date range', async () => {
      const mockResponse = {
        data: {
          emails_sent: 1200,
          last_30_days: 1200,
          current_month: 1200,
          daily_breakdown: [
            { date: '2023-04-01', emails_sent: 400 },
            { date: '2023-04-02', emails_sent: 400 },
            { date: '2023-04-03', emails_sent: 400 },
          ]
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await apiKeys.getUsage(1, 123, {
        from_date: '2023-04-01T00:00:00Z',
        to_date: '2023-04-03T23:59:59Z',
      });

      const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/api-keys/1/usage?');
      expect(calledUrl).toContain('companyId=123');
      expect(calledUrl).toContain('from_date=2023-04-01T00%3A00%3A00Z');
      expect(calledUrl).toContain('to_date=2023-04-03T23%3A59%3A59Z');

      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('regenerate()', () => {
    /**
     * Test case: Regenerate an API key
     * Verifies that the client.post method is called correctly for regeneration
     */
    it('regenerates an API key', async () => {
      const mockResponse = {
        data: {
          apiKey: {
            id: 1,
            name: 'Test API Key',
            key: 'rk_live_new_key_1234567890',
            company_id: 123,
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE' as const,
            created_at: '2023-04-07T23:13:52.669661+00:00',
          }
        },
        error: null
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await apiKeys.regenerate(1, 123);

      expect(mockClient.post).toHaveBeenCalledWith('/api-keys/1/regenerate', {
        companyId: 123,
      });
      expect(result.data).toEqual(mockResponse.data.apiKey);
      expect(result.data?.key).toBe('rk_live_new_key_1234567890');
    });

    /**
     * Test case: Error handling when regeneration fails
     * Verifies that errors from the API are properly propagated
     */
    it('handles errors when regeneration fails', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'API key not found'
        }
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const result = await apiKeys.regenerate(999, 123);

      expect(mockClient.post).toHaveBeenCalledWith('/api-keys/999/regenerate', {
        companyId: 123,
      });
      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('Advanced Validation & Error Handling', () => {
    /**
     * Test case: Network failure handling
     * Tests the SDK's behavior when network requests fail completely
     */
    it('handles network failures gracefully', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: {
          name: 'application_error',
          message: 'Unable to fetch data. The request could not be resolved.'
        }
      });

      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        name: 'application_error',
        message: 'Unable to fetch data. The request could not be resolved.'
      });
    });

    /**
     * Test case: Invalid UUID format validation
     * Tests validation of UUID format for created_by field
     */
    it('validates UUID format for created_by field', async () => {
      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 123,
        created_by: 'invalid-uuid-format',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
      expect(result.error?.message).toContain('UUID');
    });

    /**
     * Test case: Invalid company_id validation
     * Tests validation of company_id field
     */
    it('validates positive company_id', async () => {
      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: -1, // Invalid: negative number
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
    });
  });

  describe('Headers and Authentication', () => {
    /**
     * Test case: Includes required headers in the HTTP request
     * Ensures that the HTTP request made by the client includes all mandatory headers
     */
    it('includes required headers in the HTTP request', async () => {
      const realClient = new Client('rk_test_1234567890', { baseUrl: 'http://localhost:3000' });
      
      const fetchRequestSpy = vi.spyOn(realClient as any, 'fetchRequest').mockResolvedValue({
        data: { 
          apiKey: { 
            id: 1, 
            name: 'Test', 
            key: 'rk_live_test123',
            company_id: 123,
            created_by: '550e8400-e29b-41d4-a716-446655440000',
            status: 'ACTIVE',
            created_at: '2023-04-07T23:13:52.669661+00:00',
          } 
        },
        error: null
      });
      
      const testApiKeys = new ApiKeys(realClient);
      
      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };
    
      await testApiKeys.create(input);
      
      expect(fetchRequestSpy).toHaveBeenCalled();
      
      const headers = (realClient as any).headers;
      
      expect(headers.get('Authorization')).toBe('Bearer rk_test_1234567890');
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('X-SDK-Version')).toMatch(/^raven-sdk:/);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test case: Empty response handling
     * Tests handling when API returns empty/null responses
     */
    it('handles empty API responses gracefully', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({
        data: null,
        error: null
      });

      const result = await apiKeys.get(1, 123);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    /**
     * Test case: Malformed response structure
     * Tests handling when API returns unexpected response structure
     */
    it('handles malformed response structure', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: { wrongField: 'unexpected' }, // Missing apiKey wrapper
        error: null
      });

      const input: CreateApiKeyOptions = {
        name: 'Test API Key',
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull(); // Should handle missing apiKey gracefully
      expect(result.error).toBeNull();
    });

    /**
     * Test case: Large API key name
     * Tests validation of maximum name length
     */
    it('validates maximum API key name length', async () => {
      const longName = 'a'.repeat(256); // Exceeds 255 character limit

      const input: CreateApiKeyOptions = {
        name: longName,
        company_id: 123,
        created_by: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await apiKeys.create(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('validation_error');
      expect(result.error?.message).toContain('too long');
    });
  });
});