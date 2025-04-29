/**
 * Options for creating a new email
 */
export type CreateEmailOptions = {
  /**
   * Email sender address
   */
  from: string;
  
  /**
   * Email recipient(s)
   */
  to: string | string[];
  
  /**
   * Email subject line
   */
  subject: string;
  
  /**
   * HTML content of the email
   */
  html?: string;
  
  /**
   * Plain text content of the email
   */
  text?: string;
  
  /**
   * Reply-to address
   */
  replyTo?: string;
  
  /**
   * Email CC recipients
   */
  cc?: string | string[];
  
  /**
   * Email BCC recipients
   */
  bcc?: string | string[];
  
  /**
   * Attachments for the email
   */
  attachments?: EmailAttachment[];
  
  /**
   * Custom email headers
   */
  headers?: Record<string, string>;
  
  /**
   * Tags for email categorization and tracking
   */
  tags?: Array<{ name: string; value: string }>;
};



/**
 * Email attachment definition
 */
export type EmailAttachment = {
  /**
   * Filename for the attachment
   */
  filename: string;
  
  /**
   * Content of the attachment (Base64 encoded)
   */
  content: string;
  
  /**
   * MIME type of the attachment
   */
  type?: string;
  
  /**
   * How the attachment should be displayed
   */
  disposition?: 'attachment' | 'inline';
  
  /**
   * Content ID for inline attachments
   */
  contentId?: string;
};