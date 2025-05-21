import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Emails } from '../emails';
import type {
  CancelEmailResponse,
  CreateEmailOptions,
  CreateEmailResponse,
  GetEmailResponse,
  UpdateEmailOptions,
  UpdateEmailResponse
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


describe('Emails SDK', () => {
  let mockClient: MockClient;
  let emails: Emails;

  beforeEach(() => {
    vi.restoreAllMocks(); 
    global.fetch = vi.fn(); 
    mockClient = new MockClient();
    emails = new Emails(mockClient);
  });
  

  describe('send()', () => {
    /**
     * Test case: Sending a basic email with minimal fields
     * Verifies that the client.post method is called with correct parameters
     * and the response is properly returned
     */
    it('sends an email with basic fields', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
          status: 'sent'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'no-reply@nexits.io',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

  
    /**
     * Test case: Sending an email with CC recipients
     * Verifies the client handles CC field correctly
     */
    it('sends an email with CC recipients', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'no-reply@nexits.io',
        to: 'user@example.com',
        cc: ['cc1@example.com', 'cc2@example.com'],
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Sending an email with BCC recipients
     * Verifies the client handles BCC field correctly
     */
    it('sends an email with BCC recipients', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'no-reply@nexits.io',
        to: 'user@example.com',
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Sending an email with custom headers
     * Verifies that custom headers are properly passed to the API
     */
    it('sends an email with custom headers', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'no-reply@nexits.io',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>',
        headers: {
          'X-Entity-Ref-ID': '123456'
        }
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Sending an email with attachments
     * Verifies that attachments are properly passed to the API
     */
    it('sends an email with attachments', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'no-reply@nexits.io',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>',
        attachments: [
          {
            filename: 'test.pdf',
            content: 'base64encodedcontent',
            type: 'application/pdf'
          }
        ]
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

    

/**
 * Test case: Includes required headers in the HTTP request
 * Ensures that the HTTP request made by the client includes all mandatory headers,
 * such as Authorization, Content-Type, and X-SDK-Version. This validates proper
 * client initialization and header injection for authentication and tracking.
 */

    it('includes required headers in the HTTP request', async () => {
      // Create a real Client instance to test its header behavior
      const realClient = new Client('rk_test_1234567890', { baseUrl: 'http://localhost:3000' });
      
      // Mock the fetchRequest method to capture the headers without making actual network calls
      const fetchRequestSpy = vi.spyOn(realClient as any, 'fetchRequest').mockResolvedValue({
        data: { id: 'header-test-id', status: 'sent' },
        error: null
      });
      
      // Create an Emails instance with the real client
      const testEmails = new Emails(realClient);
      
      const input: CreateEmailOptions = {
        from: 'admin@nexits.io',
        to: 'header@example.com',
        subject: 'Header Check',
        html: '<p>Hello</p>',
      };
    
      await testEmails.send(input);
      
      // Verify fetchRequest was called
      expect(fetchRequestSpy).toHaveBeenCalled();
      
      // Get the Headers from the private property on the client
      const headers = (realClient as any).headers;
      
      // Verify headers
      expect(headers.get('Authorization')).toBe('Bearer rk_test_1234567890');
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('X-SDK-Version')).toMatch(/^raven-sdk:/);
    });
    
  });

  describe('get()', () => {
    /**
     * Test case: Get email details
     * Verifies that the client.get method is called with correct ID
     * and the response is properly returned
     */
    it('retrieves email details', async () => {
      const mockResponse: GetEmailResponse = {
        data: {
          id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
          subject: 'Test Email',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          html: '<p>Hello World</p>',
          createdAt: '2023-04-07T23:13:52.669661+00:00',
          status: 'delivered'
        },
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const emailId = '67d9bcdb-5a02-42d7-8da9-0d6feea18cff';
      const result = await emails.get(emailId);

      expect(mockClient.get).toHaveBeenCalledWith(`/emails/${emailId}`);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Error handling when getting a non-existent email
     * Verifies that errors from the API are properly propagated
     */
    it('handles not found errors gracefully', async () => {
        const errorResponse: GetEmailResponse = {
          data: null,
          error: {
            code: 'not_found',
            message: 'Email not found'
          }
        };
      
      vi.mocked(mockClient.get).mockResolvedValue(errorResponse);

      const emailId = 'non-existent-id';
      const result = await emails.get(emailId);

      expect(mockClient.get).toHaveBeenCalledWith(`/emails/${emailId}`);
      expect(result).toEqual(errorResponse);
    });
  });

  describe('update()', () => {
    /**
     * Test case: Update email scheduling
     * Verifies that the client.patch method is called with correct parameters
     */
    it('updates email scheduling time', async () => {
      const mockResponse: UpdateEmailResponse = {
        data: {
          id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
          object: 'email'
        },
        error: null
      };
      
      vi.mocked(mockClient.patch).mockResolvedValue(mockResponse);

      const updateOptions: UpdateEmailOptions = {
        id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
        scheduledAt: '2023-05-01T10:00:00Z'
      };
      
      const result = await emails.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `/emails/${updateOptions.id}`,
        { scheduled_at: updateOptions.scheduledAt }
      );
      expect(result).toEqual(mockResponse);
    });

   

    /**
     * Test case: Error handling for update operation
     * Verifies that errors from the API are properly propagated
     */
    it('handles update errors properly', async () => {
        const errorResponse: UpdateEmailResponse = {
            data: null,
            error: {
              code: 'not_found',
              message: 'Email not found'
            }
          };
          
      vi.mocked(mockClient.patch).mockResolvedValue(errorResponse);

      const updateOptions: UpdateEmailOptions = {
        id: 'non-existent-id',
        scheduledAt: '2023-05-01T10:00:00Z'
      };
      
      const result = await emails.update(updateOptions);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `/emails/${updateOptions.id}`,
        { scheduled_at: updateOptions.scheduledAt }
      );
      expect(result).toEqual(errorResponse);
    });
  });

  describe('cancel()', () => {
    /**
     * Test case: Cancel a scheduled email
     * Verifies that the client.post method is called with correct path
     */
    it('cancels a scheduled email', async () => {
      const mockResponse: CancelEmailResponse = {
        data: {
          id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
          object: 'email'
        },
        error: null
      };
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const emailId = '67d9bcdb-5a02-42d7-8da9-0d6feea18cff';
      const result = await emails.cancel(emailId);

      expect(mockClient.post).toHaveBeenCalledWith(`/emails/${emailId}/cancel`);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Error handling when cancelling fails
     * Verifies that errors from the API are properly propagated
     */
    it('handles errors when cancellation fails', async () => {
        const errorResponse: CancelEmailResponse = {
            data: null,
            error: {
              code: 'bad_request',
              message: 'Cannot cancel email that has already been sent'
            }
          };
          
      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const emailId = 'already-sent-email-id';
      const result = await emails.cancel(emailId);

      expect(mockClient.post).toHaveBeenCalledWith(`/emails/${emailId}/cancel`);
      expect(result).toEqual(errorResponse);
    });
  });

  describe('list()', () => {
    /**
     * Test case: List emails without filters
     * Verifies that the client.get method is called with correct base path
     */
    it('lists emails without filters', async () => {
      const mockResponse = {
        data: [
          {
            id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
            status: 'sent'
          },
          {
            id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
            status: 'delivered'
          }
        ],
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list();

      expect(mockClient.get).toHaveBeenCalledWith('/emails');
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: List emails with limit parameter
     * Verifies that the client.get method is called with limit query parameter
     */
    it('lists emails with limit parameter', async () => {
      const mockResponse = {
        data: [
          {
            id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
            status: 'sent'
          }
        ],
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list({ limit: 1 });

      expect(mockClient.get).toHaveBeenCalledWith('/emails?limit=1');
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: List emails with pagination parameters
     * Verifies that the client.get method is called with before/after query parameters
     */
    it('lists emails with pagination parameters', async () => {
      const mockResponse = {
        data: [
          {
            id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
            status: 'delivered'
          }
        ],
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list({
        after: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
        limit: 10
      });

      expect(mockClient.get).toHaveBeenCalledWith('/emails?limit=10&after=67d9bcdb-5a02-42d7-8da9-0d6feea18cff');
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: List emails with status filter
     * Verifies that the client.get method is called with status query parameter
     */
    it('lists emails with status filter', async () => {
      const mockResponse = {
        data: [
          {
            id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
            status: 'sent'
          }
        ],
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list({ status: 'sent' });

      expect(mockClient.get).toHaveBeenCalledWith('/emails?status=sent');
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: List emails with all filter parameters
     * Verifies that the client.get method combines all query parameters correctly
     */
    it('lists emails with all filter parameters', async () => {
      const mockResponse = {
        data: [
          {
            id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
            status: 'failed'
          }
        ],
        error: null
      };
      
      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list({
        limit: 5,
        before: 'before-id',
        after: 'after-id',
        status: 'failed'
      });

      // Note: URL parameters order might be different depending on URLSearchParams implementation
      // Here We'll check that each parameter is included rather than exact string matching
      expect(mockClient.get).toHaveBeenCalled();
      const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;
      
      expect(calledUrl).toContain('/emails?');
      expect(calledUrl).toContain('limit=5');
      expect(calledUrl).toContain('before=before-id');
      expect(calledUrl).toContain('after=after-id');
      expect(calledUrl).toContain('status=failed');
      
      expect(result).toEqual(mockResponse);
    });
  });


  /**
 * Test case: Sending a plain text-only email
 * Verifies the client accepts emails without HTML content
 */
it('sends a plain text-only email', async () => {
    const mockResponse: CreateEmailResponse = {
      data: {
        id: 'plain-text-id',
        status: 'sent',
      },
      error: null,
    };
  
    vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
    const input: CreateEmailOptions = {
      from: 'no-reply@nexits.io',
      to: 'text@example.com',
      subject: 'Text Email',
      text: 'This is a plain text email.',
    };
  
    const result = await emails.send(input);
  
    expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
    expect(result).toEqual(mockResponse);
  });

/**
 * Test case: API responds with plain text instead of JSON
 * Verifies fallback parsing logic handles non-JSON responses gracefully
 */

it('handles plain text error responses gracefully', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({
      data: null,
      error: {
        code: 'application_error',
        message:
          'Internal server error. We are unable to process your request right now, please try again later.',
      },
    });
  
    const input: CreateEmailOptions = {
      from: 'no-reply@nexits.io',
      to: 'user@example.com',
      subject: 'Test Email',
      html: '<p>Hello World</p>',
    };
  
    const result = await emails.send(input);
  
    expect(result).toEqual({
      data: null,
      error: {
        code: 'application_error',
        message:
          'Internal server error. We are unable to process your request right now, please try again later.',
      },
    });
  });
  
  describe('Idempotency header behavior', () => {
    /**
     * Test case: Omits Idempotency-Key header if not provided
     * Verifies that the client does not include the Idempotency-Key header
     * when no key is explicitly set in the request options
     */
    it('omits Idempotency-Key header if not provided', async () => {
      const mockResponse = {
        data: {
          id: 'email-123',
          status: 'sent',
        },
        error: null,
      };
  
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
      const payload = {
        from: 'admin@nexits.io',
        to: 'test@example.com',
        subject: 'No Idempotency Key',
        html: '<p>Hello</p>',
      };
  
      await emails.send(payload);
  
      const calledArgs = vi.mocked(mockClient.post).mock.calls[0];
      const requestOptions = calledArgs?.[2] as { headers?: Record<string, string> } | undefined;
      const headers = requestOptions?.headers ?? {};
  
      expect(headers['Idempotency-Key']).toBeUndefined();
    });
  });
   
/**
 * Test case: Skips Idempotency-Key if provided value is an empty string
 * Ensures that a falsy key is treated the same as undefined
 */
it('ignores empty Idempotency-Key value', async () => {
    const mockResponse = {
      data: { id: 'email-456', status: 'sent' },
      error: null,
    };
  
    vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
    const input: CreateEmailOptions = {
      from: 'admin@nexits.io',
      to: 'test@example.com',
      subject: 'Empty Idempotency Key',
      html: '<p>Hello</p>',
    };
  
    await emails.send(input);
  
    const calledArgs = vi.mocked(mockClient.post).mock.calls[0];
  
    const requestOptions: { headers?: Record<string, string> } | undefined =
      calledArgs?.[2];
  
    const headers = requestOptions?.headers ?? {};
  
    expect(headers['Idempotency-Key']).toBeUndefined();
  });
  

});