import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const attachmentSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "Content is required"),
  contentType: z.string().min(1, "Content type is required"),
});

const batchEmailItemSchema = z.object({
  to: z.union([
    z.string().regex(emailRegex),
    z.array(z.string().regex(emailRegex)).min(1, "At least one recipient is required"),
  ]),
  cc: z.union([
    z.string().regex(emailRegex),
    z.array(z.string().regex(emailRegex)),
  ]).optional(),
  bcc: z.union([
    z.string().regex(emailRegex),
    z.array(z.string().regex(emailRegex)),
  ]).optional(),
  subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
  html: z.string().optional(),
  text: z.string().optional(),
  react: z.any().optional(),
  from: z.string().regex(emailRegex).optional(),
  reply_to: z.string().regex(emailRegex).optional(),
  attachments: z.array(attachmentSchema).max(10, "Too many attachments").optional(),
  headers: z.record(z.string()).optional(),
  tags: z.record(z.string()).optional(),
}).refine(
  (data) => data.html || data.text || data.react,
  {
    message: "Either html, text, or react content is required",
    path: ["html", "text", "react"],
  }
);

export const batchEmailSchema = z.object({
  emails: z.array(batchEmailItemSchema)
    .min(1, "At least one email is required")
    .max(100, "Too many emails in batch"),
  metadata: z.object({
    domain_id: z.number().positive().optional(),
    sender_id: z.string().optional(),
    api_key_id: z.number().positive().optional(),
    tracking_enabled: z.boolean().optional().default(false),
  }).optional(),
});

export const marketingCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255, "Name too long"),
  subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
  from_address: z.string().regex(emailRegex).optional(),
  recipients: z.array(z.string().regex(emailRegex))
    .min(1, "At least one recipient is required")
    .max(10000, "Too many recipients"),
  html_body: z.string().optional(),
  text_body: z.string().optional(),
  react: z.any().optional(), 
  metadata: z.object({
    company_id: z.number().positive("Company ID must be positive"),
    user_id: z.string().uuid("User ID must be a valid UUID"),
    domain_id: z.number().positive("Domain ID must be positive"),
    tracking_enabled: z.boolean().optional().default(true),
  }),
}).refine(
  (data) => data.html_body || data.text_body || data.react,
  {
    message: "Either html_body, text_body, or react content is required",
    path: ["html_body", "text_body", "react"],
  }
);

export const transactionalBatchSchema = z.object({
  emails: z.array(
    z.object({
      to: z.union([
        z.string().regex(emailRegex),
        z.array(z.string().regex(emailRegex)).min(1, "At least one recipient is required"),
      ]),
      cc: z.union([
        z.string().regex(emailRegex),
        z.array(z.string().regex(emailRegex)),
      ]).optional(),
      bcc: z.union([
        z.string().regex(emailRegex),
        z.array(z.string().regex(emailRegex)),
      ]).optional(),
      subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
      html: z.string().optional(),
      text: z.string().optional(),
      react: z.any().optional(), 
      from: z.string().regex(emailRegex).optional(),
      reply_to: z.string().regex(emailRegex).optional(),
      attachments: z.array(attachmentSchema).max(10, "Too many attachments").optional(),
    }).refine(
      (data) => data.html || data.text || data.react,
      {
        message: "Either html, text, or react content is required",
        path: ["html", "text", "react"],
      }
    )
  ).min(1, "At least one email is required").max(100, "Too many emails in batch"),
  metadata: z.object({
    domain_id: z.number().positive("Domain ID must be positive"),
    sender_id: z.string().min(1, "Sender ID is required"),
    api_key_id: z.number().positive().optional(),
    tracking_enabled: z.boolean().optional().default(false),
    priority: z.number().min(1).max(10).optional().default(1),
    message_type: z.literal('TRANSACTIONAL'),
  }),
});

export const transactionalEmailSchema = z.object({
  payload: z.object({
    to: z.array(z.string().regex(emailRegex))
      .min(1, "At least one recipient is required"),
    cc: z.array(z.string().regex(emailRegex)).optional(),
    bcc: z.array(z.string().regex(emailRegex)).optional(),
    subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
    html_body: z.string().optional(),
    text_body: z.string().optional(),
    from: z.string().regex(emailRegex).optional(),
    reply_to: z.string().regex(emailRegex).optional(),
    attachments: z.array(attachmentSchema).max(10, "Too many attachments").optional(),
  }).refine(
    (data) => data.html_body || data.text_body,
    {
      message: "Either html_body or text_body is required",
      path: ["html_body", "text_body"],
    }
  ),
  metadata: z.object({
    tenant_id: z.number().positive("Tenant ID must be positive"),
    domain_id: z.number().positive("Domain ID must be positive"),
    sender_id: z.string().min(1, "Sender ID is required"),
    api_key_id: z.number().positive().optional(),
    template_id: z.number().positive().optional(),
    tracking_enabled: z.boolean().optional().default(false),
    priority: z.number().min(1).max(10).optional().default(1),
    idempotency_key: z.string().optional(),
  }),
});

export const batchStatusSchema = z.object({
  batch_id: z.string().min(1, "Batch ID is required"),
});

export const batchCancelSchema = z.object({
  batch_id: z.string().min(1, "Batch ID is required"),
});