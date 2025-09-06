import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Broadcasts } from '../broadcasts';
import type {
  CreateBroadcastOptions,
  CreateBroadcastResponse,
  UpdateBroadcastOptions,
  ListBroadcastsOptions,
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

describe('Broadcasts SDK', () => {
  let mockClient: MockClient;
  let broadcasts: Broadcasts;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    mockClient = new MockClient();
    broadcasts = new Broadcasts(mockClient);
  });

  describe('create()', () => {
    it('creates a broadcast with basic fields', async () => {
      const mockResponse: CreateBroadcastResponse = {
        id: 1,
        broadcast_id: 1,
        name: 'Test Broadcast',
        status: 'SCHEDULED',
        total_emails: 100,
        emails_updated: 100,
        channel_type: 'EMAIL',
        message_type: 'TRANSACTIONAL',
        created_at: '2023-04-08T10:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: CreateBroadcastOptions = {
        company_id: 123,
        sender_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Broadcast',
        channel_type: 'EMAIL',
        message_type: 'TRANSACTIONAL',
        subject: 'Test Subject',
        body_html: '<p>Test content</p>',
        recipients: ['user1@example.com', 'user2@example.com'],
      };

      const result = await broadcasts.create(input);

      expect(mockClient.post).toHaveBeenCalledWith('/broadcasts', input);
      expect(result).toEqual({
        data: mockResponse,
        error: null,
      });
    });

    it('creates a marketing broadcast with campaign', async () => {
      const mockResponse: CreateBroadcastResponse = {
        id: 2,
        broadcast_id: 2,
        name: 'Marketing Campaign',
        status: 'QUEUED',
        total_emails: 500,
        emails_updated: 500,
        channel_type: 'EMAIL',
        message_type: 'MARKETING',
        created_at: '2023-04-08T11:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: CreateBroadcastOptions = {
        campaign_id: 10,
        company_id: 123,
        sender_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Marketing Campaign',
        channel_type: 'EMAIL',
        message_type: 'MARKETING',
        subject: 'Special Offer',
        body_html: '<p>Don\'t miss our special offer!</p>',
        recipients: ['customer@example.com'],
        scheduled_at: '2023-04-09T09:00:00.000Z',
      };

      const result = await broadcasts.create(input);

      expect(result.data?.message_type).toBe('MARKETING');
      expect(result.data?.total_emails).toBe(500);
    });

    it('handles API errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'validation_error',
          message: 'Invalid recipients list',
        },
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const input: CreateBroadcastOptions = {
        company_id: 123,
        sender_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Broadcast',
        channel_type: 'EMAIL',
        message_type: 'TRANSACTIONAL',
        recipients: [],
      };

      const result = await broadcasts.create(input);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('get()', () => {
    it('retrieves broadcast details', async () => {
      const mockResponse = {
        data: {
          broadcast: {
            id: 1,
            campaign_id: 10,
            company_id: 123,
            sender_id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Broadcast',
            channel_type: 'EMAIL' as const,
            message_type: 'MARKETING' as const,
            status: 'SENT' as const,
            scheduled_at: '2023-04-08T09:00:00.000Z',
            started_at: '2023-04-08T09:00:00.000Z',
            completed_at: '2023-04-08T09:15:00.000Z',
            total_recipients: 100,
            sent_count: 100,
            delivered_count: 95,
            failed_count: 5,
            created_at: '2023-04-07T15:00:00.000Z',
            updated_at: '2023-04-08T09:15:00.000Z',
          }
        },
        error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await broadcasts.get(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/broadcasts/1?companyId=123');
      expect(result.data).toEqual(mockResponse.data.broadcast);
    });

    it('handles not found errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'Broadcast not found',
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(errorResponse);

      const result = await broadcasts.get(999, 123);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('update()', () => {
    it('updates broadcast name', async () => {
      const mockResponse = {
        data: {
          broadcast: {
            id: 1,
            name: 'Updated Broadcast Name',
            status: 'SCHEDULED' as const,
            updated_at: '2023-04-08T12:00:00.000Z',
          }
        },
        error: null,
      };

      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateBroadcastOptions = {
        id: 1,
        company_id: 123,
        name: 'Updated Broadcast Name',
      };

      const result = await broadcasts.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith('/broadcasts/1', {
        name: 'Updated Broadcast Name',
      });
      expect(result.data).toEqual(mockResponse.data.broadcast);
    });

    it('updates broadcast schedule', async () => {
      const mockResponse = {
        data: {
          broadcast: {
            id: 1,
            name: 'Test Broadcast',
            status: 'SCHEDULED' as const,
            scheduled_at: '2023-04-10T10:00:00.000Z',
            updated_at: '2023-04-08T12:00:00.000Z',
          }
        },
        error: null,
      };

      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateBroadcastOptions = {
        id: 1,
        company_id: 123,
        scheduled_at: '2023-04-10T10:00:00.000Z',
      };

      const result = await broadcasts.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith('/broadcasts/1', {
        scheduled_at: '2023-04-10T10:00:00.000Z',
      });
      expect(result.data?.scheduled_at).toBe('2023-04-10T10:00:00.000Z');
    });

    it('handles update errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'bad_request',
          message: 'Cannot update sent broadcast',
        },
      };

      vi.mocked(mockClient.patch).mockResolvedValue(errorResponse);

      const updateOptions: UpdateBroadcastOptions = {
        id: 1,
        company_id: 123,
        name: 'New Name',
      };

      const result = await broadcasts.update(updateOptions);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('list()', () => {
    it('lists broadcasts with minimal parameters', async () => {
      const mockResponse = {
        data: {
          broadcasts: [
            {
              id: 1,
              campaign_id: 10,
              name: 'Broadcast 1',
              channel_type: 'EMAIL' as const,
              message_type: 'MARKETING' as const,
              status: 'SENT' as const,
              total_recipients: 100,
              sent_count: 100,
              delivered_count: 95,
              failed_count: 5,
              scheduled_at: '2023-04-08T09:00:00.000Z',
              created_at: '2023-04-07T15:00:00.000Z',
              updated_at: '2023-04-08T09:15:00.000Z',
            },
            {
              id: 2,
              campaign_id: null,
              name: 'Broadcast 2',
              channel_type: 'EMAIL' as const,
              message_type: 'TRANSACTIONAL' as const,
              status: 'SCHEDULED' as const,
              total_recipients: 50,
              sent_count: 0,
              delivered_count: 0,
              failed_count: 0,
              scheduled_at: '2023-04-09T10:00:00.000Z',
              created_at: '2023-04-08T14:00:00.000Z',
              updated_at: '2023-04-08T14:00:00.000Z',
            },
          ],
          total: 2,
        },
        error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const options: ListBroadcastsOptions = {
        company_id: 123,
      };

      const result = await broadcasts.list(options);

      expect(mockClient.get).toHaveBeenCalledWith('/broadcasts?companyId=123');
      expect(result.data).toEqual(mockResponse.data);
    });

  });

  describe('cancel()', () => {
    it('cancels a scheduled broadcast', async () => {
      const mockResponse = {
        data: {
          success: true,
          status: 'CANCELLED',
        },
        error: null,
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await broadcasts.cancel(1, 123);

      expect(mockClient.post).toHaveBeenCalledWith('/broadcasts/1/cancel', {
        companyId: 123,
      });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('handles cancel errors', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'bad_request',
          message: 'Cannot cancel already sent broadcast',
        },
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const result = await broadcasts.cancel(1, 123);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });

    it('provides default response when API returns empty', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await broadcasts.cancel(1, 123);

      expect(result.data).toEqual({ success: true, status: 'CANCELLED' });
    });
  });

  describe('getStats()', () => {
    it('retrieves broadcast statistics', async () => {
      const mockResponse = {
        data: {
          total_recipients: 1000,
          sent_count: 1000,
          delivered_count: 950,
          failed_count: 50,
          delivery_rate: 95.0,
          completion_rate: 100.0,
          started_at: '2023-04-08T09:00:00.000Z',
          completed_at: '2023-04-08T09:30:00.000Z',
          duration_minutes: 30,
        },
        error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await broadcasts.getStats(1, 123);

      expect(mockClient.get).toHaveBeenCalledWith('/broadcasts/1/stats?companyId=123');
      expect(result.data).toEqual(mockResponse.data);
      expect(result.data?.delivery_rate).toBe(95.0);
      expect(result.data?.duration_minutes).toBe(30);
    });

    it('handles stats not found', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'not_found',
          message: 'Broadcast statistics not available',
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(errorResponse);

      const result = await broadcasts.getStats(999, 123);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  describe('Error Handling', () => {
    it('handles network failures gracefully', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: {
          name: 'application_error',
          message: 'Network request failed',
        },
      });

      const input: CreateBroadcastOptions = {
        company_id: 123,
        sender_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Broadcast',
        channel_type: 'EMAIL',
        message_type: 'TRANSACTIONAL',
        recipients: ['user@example.com'],
      };

      const result = await broadcasts.create(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('application_error');
    });

    
  });

  describe('Edge Cases', () => {
    it('handles empty broadcasts list', async () => {
      const mockResponse = {
        data: {
          broadcasts: [],
          total: 0,
        },
        error: null,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await broadcasts.list({ company_id: 123 });

      expect(result.data?.broadcasts).toHaveLength(0);
      expect(result.data?.total).toBe(0);
    });

    it('handles malformed response structure', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({
        data: { wrongField: 'unexpected' },
        error: null,
      });

      const result = await broadcasts.get(1, 123);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });
});