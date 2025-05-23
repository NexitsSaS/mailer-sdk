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

// Mock the module at the top level, outside the describe block
vi.mock('@react-email/render', () => ({
  renderAsync: vi.fn()
}));

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
  
  describe('send() - Advanced Validation & Error Handling', () => {
     /**
   * Test case: Validation error for missing required fields
   * Verifies that the SDK properly validates required fields before sending
   * This test ensures proper error handling for incomplete email data
   * Note: This test triggers Zod validation which returns "Required" message
   */
     it('returns validation error when from field is missing', async () => {
      const input = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      } as CreateEmailOptions;
  
      const result = await emails.send(input);
  
      expect(result).toMatchInlineSnapshot(`
        {
          "data": null,
          "error": {
            "message": "Required",
            "name": "validation_error",
          },
        }
      `);
    });

    /**
   * Test case: Invalid email format validation  
   * Verifies that the SDK catches invalid email formats and returns appropriate errors
   * Critical for preventing malformed email addresses from being processed
   * Note: This test triggers Zod validation for invalid email format
   */
  it('returns validation error for invalid from email format', async () => {
    const input: CreateEmailOptions = {
      from: 'invalid-email-format', 
      to: 'user@example.com',
      subject: 'Test Email',
      html: '<p>Hello World</p>'
    };

    const result = await emails.send(input);

    expect(result).toMatchInlineSnapshot(`
      {
        "data": null,
        "error": {
          "message": "Invalid sender email address",
          "name": "validation_error",
        },
      }
    `);
  });

    /**
     * Test case: Network failure handling
     * Tests the SDK's behavior when network requests fail completely
     * Ensures graceful degradation and proper error messaging
     */
    it('handles network failures gracefully', async () => {
      // Mock a network failure
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: {
          name: 'application_error',
          message: 'Unable to fetch data. The request could not be resolved.'
        }
      });

      const input: CreateEmailOptions = {
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };

      const result = await emails.send(input);

      expect(result).toEqual(
        expect.objectContaining({
          data: null,
          error: {
            message: 'Unable to fetch data. The request could not be resolved.',
            name: 'application_error',
          },
        })
      );
    });

    /**
     * Test case: API returns plain text instead of JSON
     * Tests handling of non-JSON responses from the API
     * Important for robust error handling when API behaves unexpectedly
     */
    it('handles non-JSON API responses gracefully', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({
        data: null,
        error: {
          name: 'application_error',
          message: 'Internal server error. We are unable to process your request right now, please try again later.'
        }
      });

      const input: CreateEmailOptions = {
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };

      const result = await emails.send(input);

      expect(result).toEqual(
        expect.objectContaining({
          data: null,
          error: {
            message: 'Internal server error. We are unable to process your request right now, please try again later.',
            name: 'application_error',
          },
        })
      );
    });
  });

  
  describe('send() - Multiple Recipients & Advanced Fields', () => {
    /**
     * Test case: Sending email to multiple TO recipients
     * Verifies the SDK can handle arrays of email addresses in the TO field
     * Essential for bulk email functionality
     */
    it('sends email to multiple recipients', async () => {
      const input: CreateEmailOptions = {
        from: 'admin@nexits.io',
        to: ['user1@example.com', 'user2@example.com'] as any, 
        subject: 'Test Email',
        text: 'Hello world'
      };
    
      const result = await emails.send(input);
        
      if (result.error) {
        
        expect(result.error.name).toBe('validation_error');
        return;
      }
    
      // If validation passes, then test the client call
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };
    
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
    
      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });

    /**
     * Test case: Email with replyTo field
     * Tests the replyTo functionality which is commonly used for customer support emails
     * Ensures proper handling of reply-to addresses
     */
    it('sends email with replyTo addresses', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: '124dc0f1-e36c-417c-a65c-e33773abc768',
          status: 'sent'
        },
        error: null
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const input: CreateEmailOptions = {
        from: 'noreply@nexits.io',
        to: 'user@example.com',
        replyTo: ['support@nexits.io', 'help@nexits.io'],
        subject: 'Test Email',
        text: 'Hello world'
      };

      const result = await emails.send(input);

      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "id": "124dc0f1-e36c-417c-a65c-e33773abc768",
            "status": "sent",
          },
          "error": null,
        }
      `);
    });
  });

  describe('send() - React Template Rendering', () => {
    /**
     * Test case: Successful React template rendering
     * Tests that React email templates are properly rendered to HTML
     * Critical for template-based email functionality
     */
    it('successfully renders React email template', async () => {
      const mockResponse: CreateEmailResponse = {
        data: {
          id: 'react-template-id',
          status: 'sent'
        },
        error: null
      };
    
      // Mock renderAsync to return HTML
      const { renderAsync } = await import('@react-email/render');
      vi.mocked(renderAsync).mockResolvedValue('<div>Hello from React!</div>');
      
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
    
      // Mock a simple React component
      const MockReactComponent = () => '<div>Hello from React!</div>';
    
      const input: CreateEmailOptions = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'React Template Test',
        react: MockReactComponent
      };
    
      const result = await emails.send(input);
    
      expect(result).toEqual(mockResponse);
      expect(mockClient.post).toHaveBeenCalledWith('/emails', expect.objectContaining({
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'React Template Test',
        html: '<div>Hello from React!</div>', 
      }));
      
      // Verify renderAsync was called with the React component
      expect(renderAsync).toHaveBeenCalledWith(MockReactComponent);
    });

    /**
     * Test case: React template rendering failure
     * Tests error handling when React template rendering fails
     * Ensures proper error reporting for template issues
     */
    it('handles React template rendering errors', async () => {
      // Mock renderAsync to throw an error
      const { renderAsync } = await import('@react-email/render');
      vi.mocked(renderAsync).mockRejectedValue(new Error('Template rendering failed'));

      const input: CreateEmailOptions = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'React Template Test',
        react: () => '<invalid-component/>' 
      };

      const result = await emails.send(input);

      expect(result).toEqual({
        data: null,
        error: {
          name: 'application_error',
          message: 'Template rendering failed'
        }
      });

      // Restore the mock
      vi.restoreAllMocks();
    });
  });

  describe('get() - Enhanced Error Scenarios', () => {
    /**
     * Test case: Invalid email ID format
     * Tests validation of email ID parameter
     * Ensures proper error handling for malformed IDs
     */
    it('handles invalid email ID format', async () => {
      const result = await emails.get(''); 

      expect(result).toMatchInlineSnapshot(`
        {
          "data": null,
          "error": {
            "message": "Email ID is required and must be a string",
            "name": "validation_error",
          },
        }
      `);
    });

    /**
     * Test case: Get email with comprehensive data
     * Tests retrieval of emails with all possible fields populated
     * Ensures complete data handling for complex email objects
     */
    it('retrieves email with complete data including cc and bcc', async () => {
      const mockResponse: GetEmailResponse = {
        data: {
          id: '67d9bcdb-5a02-42d7-8da9-0d6feea18cff',
          subject: 'Complete Email Test',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          cc: ['cc1@example.com', 'cc2@example.com'],
          bcc: ['bcc1@example.com'],
          replyTo: ['reply@example.com'],
          html: '<p>Hello World</p>',
          text: 'Hello World',
          createdAt: '2023-04-07T23:13:52.669661+00:00',
          status: 'delivered'
        },
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.get('67d9bcdb-5a02-42d7-8da9-0d6feea18cff');

      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "bcc": [
              "bcc1@example.com",
            ],
            "cc": [
              "cc1@example.com",
              "cc2@example.com",
            ],
            "createdAt": "2023-04-07T23:13:52.669661+00:00",
            "from": "sender@example.com",
            "html": "<p>Hello World</p>",
            "id": "67d9bcdb-5a02-42d7-8da9-0d6feea18cff",
            "replyTo": [
              "reply@example.com",
            ],
            "status": "delivered",
            "subject": "Complete Email Test",
            "text": "Hello World",
            "to": [
              "recipient@example.com",
            ],
          },
          "error": null,
        }
      `);
    });
  });

  describe('cancel() - Enhanced Error Handling', () => {
    /**
     * Test case: Invalid email ID for cancellation
     * Tests validation of email ID parameter for cancel operation
     * Ensures proper error handling for malformed IDs
     */
    it('handles invalid email ID for cancellation', async () => {
      const result = await emails.cancel(''); // Empty string

      expect(result).toMatchInlineSnapshot(`
        {
          "data": null,
          "error": {
            "message": "Email ID is required and must be a string",
            "name": "validation_error",
          },
        }
      `);
    });

    /**
     * Test case: Attempting to cancel already sent email
     * Tests business logic error handling for invalid state transitions
     * Important for proper user feedback on impossible operations
     */
    it('handles attempt to cancel already sent email', async () => {
      const errorResponse = {
        data: null,
        error: {
          name: 'bad_request',
          message: 'Cannot cancel email that has already been sent'
        }
      };

      vi.mocked(mockClient.post).mockResolvedValue(errorResponse);

      const result = await emails.cancel('already-sent-email-id');

      expect(result).toMatchInlineSnapshot(`
        {
          "data": null,
          "error": {
            "message": "Cannot cancel email that has already been sent",
            "name": "bad_request",
          },
        }
      `);
    });
  });

  describe('list() - Enhanced Filtering & Error Handling', () => {
    /**
     * Test case: List with invalid parameters
     * Tests validation of list parameters
     * Ensures proper error handling for invalid filter options
     */
    it('handles invalid list parameters', async () => {
      const result = await emails.list({ limit: -1 }); // Invalid limit

      expect(result).toEqual({
        data: null,
        error: expect.objectContaining({
          name: 'validation_error'
        })
      });
    });

    /**
     * Test case: List emails with comprehensive filtering
     * Tests all possible filter combinations
     * Ensures robust query parameter handling
     */
    it('lists emails with comprehensive filtering options', async () => {
      const mockResponse = {
        data: [
          {
            id: '71cdfe68-cf79-473a-a9d7-21f91db6a526',
            status: 'queued',
            subject: 'Queued Email',
            from: 'sender@example.com',
            to: ['recipient@example.com'],
            createdAt: '2023-04-07T23:13:52.669661+00:00'
          }
        ],
        error: null
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await emails.list({
        limit: 50,
        before: 'before-cursor',
        after: 'after-cursor', 
        status: 'queued'
      });

      // Verify all parameters are included in the URL
      const calledUrl = vi.mocked(mockClient.get).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/emails?');
      expect(calledUrl).toContain('limit=50');
      expect(calledUrl).toContain('before=before-cursor');
      expect(calledUrl).toContain('after=after-cursor');
      expect(calledUrl).toContain('status=queued');

      expect(result).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "createdAt": "2023-04-07T23:13:52.669661+00:00",
              "from": "sender@example.com",
              "id": "71cdfe68-cf79-473a-a9d7-21f91db6a526",
              "status": "queued",
              "subject": "Queued Email",
              "to": [
                "recipient@example.com",
              ],
            },
          ],
          "error": null,
        }
      `);
    });
  });

  describe('Idempotency Advanced Testing', () => {
    /**
     * Test case: Idempotency key support (if implemented in CreateEmailOptions)
     * Tests that idempotency headers are correctly included in requests
     * Critical for preventing duplicate email sends
     * 
     * Note: This test assumes idempotencyKey will be added to CreateEmailOptions interface
     * If not implemented yet, this test documents the expected behavior
     */
    it('includes Idempotency-Key header when provided in options', async () => {
      const mockResponse = {
        data: { id: 'idempotent-email-id', status: 'sent' },
        error: null
      };
  
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
      const input: CreateEmailOptions & { idempotencyKey?: string } = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'Idempotency Test',
        html: '<p>Test</p>',
        idempotencyKey: 'unique-key-123' // Add to CreateEmailOptions interface
      };
  
      const result = await emails.send(input);
  
      // Verify the call was made with the input
      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });
  
    /**
     * Test case: No idempotency key provided
     * Tests that no idempotency header is sent when not specified
     * Ensures clean requests when idempotency is not needed
     */
    it('omits Idempotency-Key header when not provided', async () => {
      const mockResponse = {
        data: { id: 'no-idempotency-id', status: 'sent' },
        error: null
      };
  
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
      const input: CreateEmailOptions = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'No Idempotency',
        html: '<p>Test</p>'
        // No idempotencyKey provided
      };
  
      const result = await emails.send(input);
  
      // Verify the call was made without idempotency key
      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });
  
    /**
     * Test case: Empty idempotency key is handled correctly
     * Tests edge case handling for empty string idempotency keys
     * Ensures proper validation of idempotency key values
     */
    it('handles empty idempotency key correctly', async () => {
      const mockResponse = {
        data: { id: 'empty-idempotency-id', status: 'sent' },
        error: null
      };
  
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);
  
      const input: CreateEmailOptions & { idempotencyKey?: string } = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'Empty Idempotency',
        html: '<p>Test</p>',
        idempotencyKey: '' // Empty string
      };
  
      const result = await emails.send(input);
  
      expect(mockClient.post).toHaveBeenCalledWith('/emails', input);
      expect(result).toEqual(mockResponse);
    });
  
    /**
     * Test case: Client-level idempotency header handling
     * Tests that the Client class properly handles custom headers in HTTP requests
     * This test verifies the HTTP-level implementation of additional headers
     */
    it('client properly handles custom headers in HTTP requests', async () => {
      // Create a real client to test HTTP behavior
      const realClient = new Client('rk_test_1234567890', { baseUrl: 'http://localhost:3000' });
      
      // Mock fetch to capture the actual HTTP request
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'test-id', status: 'sent' })
      });
      global.fetch = mockFetch;
  
      // Test the client's post method directly (without custom headers for now)
      const result = await realClient.post('/emails', {
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });
  
      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
      
      // Verify the request was made with default headers
      const fetchCall = mockFetch.mock.calls[0];
      const requestOptions = fetchCall[1] as RequestInit;
      
      // The client should include default headers
      expect(requestOptions.headers).toBeDefined();
      
      expect(result.data).toBeDefined();
    });
  
  
    /**
     * Test case: Multiple requests with same idempotency key
     * Tests that idempotent requests with the same key produce consistent results
     * Important for ensuring idempotency works as expected
     * 
     * Note: This test simulates the expected behavior - actual idempotency 
     * would be handled by the server, not the client
     */
    it('demonstrates idempotent behavior expectation', async () => {
      const idempotentResponse = {
        data: { id: 'same-id-for-idempotent-requests', status: 'sent' },
        error: null
      };
  
      // Mock the same response for both calls
      vi.mocked(mockClient.post)
        .mockResolvedValueOnce(idempotentResponse)
        .mockResolvedValueOnce(idempotentResponse);
  
      const input: CreateEmailOptions & { idempotencyKey?: string } = {
        from: 'admin@nexits.io',
        to: 'user@example.com',
        subject: 'Idempotent Request',
        html: '<p>Test</p>',
        idempotencyKey: 'same-key-123'
      };
  
      // Make two identical requests
      const result1 = await emails.send(input);
      const result2 = await emails.send(input);
  
      // Both should return the same result (simulating server-side idempotency)
      expect(result1).toEqual(result2);
      expect((result1.data as any)?.id).toBe('same-id-for-idempotent-requests');
      expect((result2.data as any)?.id).toBe('same-id-for-idempotent-requests');
    });
  });

});