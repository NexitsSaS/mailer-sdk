import { StandardError } from "../../common/types/error.types";

/**
 * Options for updating an existing email
 */
export type UpdateEmailOptions = {
  /**
   * ID of the email to update
   */
  id: string;
  
  /**
   * New scheduled time for the email
   */
  scheduledAt?: string | Date;
};

export interface UpdateEmailResponse {
  data: { id: string; object: "email" } | null;
  error: StandardError | null;
}
