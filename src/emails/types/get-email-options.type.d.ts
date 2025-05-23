import type { StandardError } from "../../common/types/error.types";

export interface GetEmailResponseSuccess {
  id: string;
  subject: string;
  from: string;
  to: string[];
  text?: string | null;
  html?: string | null;
  createdAt: string;
  status: string;
  scheduledAt?: string;
  cc?: string[] | null;        
  bcc?: string[] | null;       
  replyTo?: string[] | null;  
}

export interface GetEmailResponse {
  data: GetEmailResponseSuccess | null;
  error: StandardError | null;
}
