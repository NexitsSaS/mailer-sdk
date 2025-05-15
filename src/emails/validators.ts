import { z } from "zod";

export const createEmailSchema = z
  .object({
    to: z.string().email({ message: "Invalid recipient email address" }),
    from: z.string().email({ message: "Invalid sender email address" }),
    subject: z.string().min(1, { message: "Email subject cannot be empty" }),
    html: z.string().optional(),
    text: z.string().optional(),
    react: z.unknown().optional(),
    scheduledAt: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) =>
      data.html !== undefined ||
      data.text !== undefined ||
      data.react !== undefined,
    {
      message: "At least one of html, text, or react must be provided",
    },
  );

export const updateEmailSchema = z.object({
  id: z.string().min(1, { message: "Email ID is required" }),
  scheduledAt: z.string().datetime(),
});

export const listEmailOptionsSchema = z.object({
  limit: z.number().positive().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  status: z.enum(["sent", "queued", "scheduled", "failed"]).optional(),
});
