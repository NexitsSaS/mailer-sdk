import { StandardError } from "../../common/types/error.types";

/**
 * Success response for email creation
 */
export type CreateEmailResponseSuccess = {
  /**
   * Unique identifier for the email
   */
  id: string;
  
  /**
   * Current status of the email
   */
  status: 'sent' | 'queued' | 'scheduled' | 'failed';
};


/**
 * Complete response for creating an email
 */
export interface CreateEmailResponse {
  data: CreateEmailResponseSuccess | null;
  error: StandardError | null;
}
