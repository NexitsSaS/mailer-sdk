import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Batch } from '../batch';
import type {
  BatchEmailOptions,
  BatchEmailResponse,
  MarketingCampaignOptions,
  MarketingCampaignResponse,
  TransactionalBatchOptions,
  TransactionalEmailOptions,
  TransactionalEmailResponse,
} from '../types';
import { Client } from '../../client';
import React from 'react';

// Mock the module at the top level
vi.mock('@react-email/render', () => ({
  renderAsync: vi.fn()
}));

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

describe('Batch SDK', () => {
  let mockClient: MockClient;
  let batch: Batch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    mockClient = new MockClient();
    batch = new Batch(mockClient);
  });

  describe('sendEmails()', () => {
    it('sends batch emails with basic fields', async () => {
      const mockResponse: BatchEmailResponse = {
        status: 'SUCCESS',
        result: {
          total_emails: 2,
          total_recipients: 2,
          successful: 2,
          failed: 0,
          success_rate: 100,
        },
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: BatchEmailOptions = {
        emails: [
          {
            to: 'user1@example.com',
            subject: 'Test Email 1',
            html: '<p>Hello User 1</p>',
          },
          {
            to: 'user2@example.com',
            subject: 'Test Email 2',
            html: '<p>Hello User 2</p>',
          },
        ],
      };

      const result = await batch.sendEmails(input);

      expect(mockClient.post).toHaveBeenCalledWith('/batch-email', input);
      expect(result.data).toEqual(mockResponse);
    });

    it('processes React templates in batch emails', async () => {
      const mockResponse: BatchEmailResponse = {
        status: 'SUCCESS',
        result: {
          total_emails: 1,
          total_recipients: 1,
          successful: 1,
          failed: 0,
          success_rate: 100,
        },
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      // Mock renderAsync to return HTML
      const { renderAsync } = await import('@react-email/render');
      vi.mocked(renderAsync).mockResolvedValue('<div>Hello from React!</div>');
      
      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const MockReactComponent = React.createElement('div', null, 'Hello from React!');

      const input: BatchEmailOptions = {
        emails: [
          {
            to: 'user@example.com',
            subject: 'React Template Test',
            react: MockReactComponent,
          },
        ],
      };

      const result = await batch.sendEmails(input);

      expect(renderAsync).toHaveBeenCalledWith(MockReactComponent);
      expect(result.data).toEqual(mockResponse);
    });

  });

  describe('sendMarketingCampaign()', () => {
    it('sends marketing campaign with basic fields', async () => {
      const mockResponse: MarketingCampaignResponse = {
        status: 'SUCCESS',
        message_type: 'MARKETING',
        channel_type: 'EMAIL',
        broadcast_id: 123,
        result: {
          broadcast_name: 'Test Campaign',
          total_emails: 100,
          emails_updated: 100,
          status: 'QUEUED',
        },
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: MarketingCampaignOptions = {
        name: 'Test Campaign',
        subject: 'Marketing Email',
        recipients: ['user1@example.com', 'user2@example.com'],
        html_body: '<p>Marketing content</p>',
        metadata: {
          company_id: 123,
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          domain_id: 1,
        },
      };

      const result = await batch.sendMarketingCampaign(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails/marketing/campaign', {
        name: 'Test Campaign',
        subject: 'Marketing Email',
        fromAddress: undefined,
        recipients: ['user1@example.com', 'user2@example.com'],
        htmlBody: '<p>Marketing content</p>',
        textBody: undefined,
        metadata: input.metadata,
      });
      expect(result.data).toEqual(mockResponse);
    });

    it('processes React templates in marketing campaigns', async () => {
      const mockResponse: MarketingCampaignResponse = {
        status: 'SUCCESS',
        message_type: 'MARKETING',
        channel_type: 'EMAIL',
        broadcast_id: 124,
        result: {
          broadcast_name: 'React Campaign',
          total_emails: 50,
          emails_updated: 50,
          status: 'QUEUED',
        },
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      const { renderAsync } = await import('@react-email/render');
      vi.mocked(renderAsync).mockResolvedValue('<div>Marketing React Template</div>');
      
      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const MockReactComponent = React.createElement('div', null, 'Marketing React Template');

      const input: MarketingCampaignOptions = {
        name: 'React Campaign',
        subject: 'React Marketing Email',
        recipients: ['user@example.com'],
        react: MockReactComponent,
        metadata: {
          company_id: 123,
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          domain_id: 1,
        },
      };

      const result = await batch.sendMarketingCampaign(input);

      expect(renderAsync).toHaveBeenCalledWith(MockReactComponent);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('sendTransactionalBatch()', () => {
    it('sends transactional batch emails', async () => {
      const mockResponse: BatchEmailResponse = {
        status: 'SUCCESS',
        result: {
          total_emails: 3,
          total_recipients: 3,
          successful: 3,
          failed: 0,
          success_rate: 100,
        },
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: TransactionalBatchOptions = {
        emails: [
          {
            to: 'user1@example.com',
            subject: 'Order Confirmation',
            html: '<p>Your order has been confirmed</p>',
          },
          {
            to: 'user2@example.com',
            subject: 'Password Reset',
            html: '<p>Reset your password</p>',
          },
        ],
        metadata: {
          domain_id: 1,
          sender_id: 'sender123',
          tracking_enabled: false,
          message_type: 'TRANSACTIONAL',
        },
      };

      const result = await batch.sendTransactionalBatch(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails/transactional/batch', {
        emails: input.emails,
        metadata: input.metadata,
      });
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('sendTransactionalEmail()', () => {
    it('sends single transactional email', async () => {
      const mockResponse: TransactionalEmailResponse = {
        status: 'QUEUED',
        message_type: 'TRANSACTIONAL',
        idempotency_key: 'idem_key_123',
        message_id: 'msg_456',
        timestamp: '2023-04-08T10:00:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const input: TransactionalEmailOptions = {
        payload: {
          to: ['user@example.com'],
          subject: 'Account Verification',
          html_body: '<p>Please verify your account</p>',
        },
        metadata: {
          tenant_id: 123,
          domain_id: 1,
          sender_id: 'sender123',
          tracking_enabled: false,
        },
      };

      const result = await batch.sendTransactionalEmail(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails/transactional/send', input);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getStatus()', () => {
    it('retrieves batch processing status', async () => {
      const mockResponse = {
        batch_id: 'batch_123',
        status: 'COMPLETED' as const,
        total_emails: 100,
        processed: 100,
        successful: 95,
        failed: 5,
        created_at: '2023-04-08T09:00:00.000Z',
        completed_at: '2023-04-08T09:05:00.000Z',
      };

      vi.mocked(mockClient.get).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await batch.getStatus('batch_123');

      expect(mockClient.get).toHaveBeenCalledWith('/batch-email/batch_123/status');
      expect(result.data).toEqual(mockResponse);
    });

    it('handles invalid batch status response', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({
        data: { invalid: 'response' }, // Missing required fields
        error: null,
      });

      const result = await batch.getStatus('batch_123');

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('cancel()', () => {
    it('cancels a batch processing job', async () => {
      const mockResponse = {
        success: true,
        cancelled_at: '2023-04-08T10:30:00.000Z',
      };

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await batch.cancel('batch_123');

      expect(mockClient.post).toHaveBeenCalledWith('/batch-email/batch_123/cancel');
      expect(result.data).toEqual(mockResponse);
    });

    it('handles cancel response without success field', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: {}, // Empty response
        error: null,
      });

      const result = await batch.cancel('batch_123');

      expect(result.data?.success).toBe(true);
      expect(result.data?.cancelled_at).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles network failures', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: {
          name: 'application_error',
          message: 'Network request failed',
        },
      });

      const input: BatchEmailOptions = {
        emails: [
          {
            to: 'user@example.com',
            subject: 'Test',
            html: '<p>Test</p>',
          },
        ],
      };

      const result = await batch.sendEmails(input);

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('application_error');
    });
  });
});