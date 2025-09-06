import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const createBroadcastSchema = z.object({
  campaign_id: z.number().positive().optional(),
  company_id: z.number().positive("Company ID must be positive"),
  sender_id: z.string().uuid("Sender ID must be a valid UUID"),
  name: z.string().min(1, "Broadcast name is required").max(255, "Name too long"),
  channel_type: z.enum(['EMAIL', 'SMS']),
  message_type: z.enum(['TRANSACTIONAL', 'MARKETING', 'PROMOTIONAL']).default('TRANSACTIONAL'),
  scheduled_at: z.string().datetime().optional(),
  subject: z.string().min(1, "Subject is required").max(998, "Subject too long").optional(),
  from_address: z.string().email().optional(),
  body_html: z.string().optional(),
  body_text: z.string().optional(),
  recipients: z.array(z.string().regex(emailRegex, "Invalid email format")).min(1, "At least one recipient is required"),
  domain_id: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.channel_type === 'EMAIL') {
      return data.subject && (data.body_html || data.body_text);
    }
    return true;
  },
  {
    message: "Email broadcasts require subject and either HTML or text body",
    path: ["subject", "body_html", "body_text"],
  }
);

export const updateBroadcastSchema = z.object({
  id: z.number().positive("Broadcast ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
  name: z.string().min(1, "Broadcast name is required").max(255, "Name too long").optional(),
  scheduled_at: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'QUEUED', 'SENT', 'FAILED']).optional(),
}).refine(
  (data) => data.name || data.scheduled_at || data.status,
  {
    message: "At least one field to update is required",
  }
);

export const listBroadcastsSchema = z.object({
  company_id: z.number().positive("Company ID must be positive"), 
  campaign_id: z.number().positive().optional(),
  status: z.enum(['SCHEDULED', 'QUEUED', 'SENT', 'FAILED']).optional(),
  channel_type: z.enum(['EMAIL', 'SMS']).optional(),
  message_type: z.enum(['TRANSACTIONAL', 'MARKETING', 'PROMOTIONAL']).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.from_date && data.to_date) {
      return new Date(data.from_date) <= new Date(data.to_date);
    }
    return true;
  },
  {
    message: "from_date must be before or equal to to_date",
    path: ["from_date", "to_date"],
  }
);

export const getBroadcastByIdSchema = z.object({
  id: z.number().positive("Broadcast ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const cancelBroadcastSchema = z.object({
  id: z.number().positive("Broadcast ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const getBroadcastStatsSchema = z.object({
  id: z.number().positive("Broadcast ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});