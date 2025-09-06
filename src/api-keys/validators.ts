import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1, "API key name is required").max(100, "Name too long"),
  company_id: z.number().positive("Company ID must be positive"),
  created_by: z.string().uuid("Created by must be a valid UUID"),
  expires_at: z.string().datetime().optional(),
  permissions: z.array(z.string()).optional(),
  domain_ids: z.array(z.number().positive()).optional(),
});

export const updateApiKeySchema = z.object({
  id: z.number().positive("API key ID must be positive"),
  name: z.string().min(1, "API key name is required").max(100, "Name too long").optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  expires_at: z.string().datetime().optional(),
  company_id: z.number().positive("Company ID must be positive"),
}).refine(
  (data) => data.name || data.status || data.expires_at,
  {
    message: "At least one field to update is required",
  }
);

export const listApiKeysSchema = z.object({
  company_id: z.number().positive("Company ID must be positive"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
});

export const getApiKeyByIdSchema = z.object({
  id: z.number().positive("API key ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const removeApiKeySchema = z.object({
  id: z.number().positive("API key ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});