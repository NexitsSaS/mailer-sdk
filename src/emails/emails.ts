import type { Raven } from "../raven";
import type {
  CancelEmailResponse,
  CreateEmailOptions,
  CreateEmailResponse,
  GetEmailResponse,
  UpdateEmailOptions,
  UpdateEmailResponse,
} from "./types";


/**
 * Service for email-related operations
 */
export class Emails {

 /**
   * Create a new Emails service
   * 
   * @param client - Raven SDK client
   */


  constructor(private readonly client: Raven) {}

  /**
   * Send a new email
   * 
   * @param options - Email creation options
   * @returns Promise resolving to created email or error
   */
  send(options: CreateEmailOptions) {
    return this.client.post<CreateEmailResponse>("/emails", options);
  }
  
/**
   * Get details of an existing email
   * 
   * @param id - ID of the email to retrieve
   * @returns Promise resolving to email details or error
   */
  get(id: string) {
    return this.client.get<GetEmailResponse>(`/emails/${id}`);
  }

  update(options: UpdateEmailOptions) {
    return this.client.patch<UpdateEmailResponse>(`/emails/${options.id}`, {
      scheduled_at: options.scheduledAt,
    });
  }

  cancel(id: string) {
    return this.client.post<CancelEmailResponse>(`/emails/${id}/cancel`);
  }

  
  /**
   * List emails with optional filtering
   * 
   * @param options - Optional pagination and filtering parameters
   * @returns Promise resolving to list of emails or error
   */
  list(options?: {
    limit?: number;
    before?: string;
    after?: string;
    status?: 'sent' | 'queued' | 'scheduled' | 'failed';
  }) {
    const params = new URLSearchParams();
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options?.before) {
      params.append('before', options.before);
    }
    
    if (options?.after) {
      params.append('after', options.after);
    }
    
    if (options?.status) {
      params.append('status', options.status);
    }
    
    const queryString = params.toString();
    const path = queryString ? `/emails?${queryString}` : '/emails';
    
    return this.client.get(path);
  }

}
