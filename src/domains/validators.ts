import { z } from "zod";

const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

export const createDomainSchema = z.object({
  company_id: z.number().positive("Company ID must be positive"),
  domain_name: z.string()
    .min(1, "Domain name is required")
    .max(255, "Domain name too long")
    .regex(domainRegex, "Invalid domain name format"),
  is_primary: z.boolean().optional().default(false),
});

export const updateDomainSchema = z.object({
  id: z.number().positive("Domain ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
  domain_name: z.string()
    .min(1, "Domain name is required")
    .max(255, "Domain name too long")
    .regex(domainRegex, "Invalid domain name format")
    .optional(),
  is_primary: z.boolean().optional(),
}).refine(
  (data) => data.domain_name || data.is_primary !== undefined,
  {
    message: "At least one field to update is required",
  }
);

export const listDomainsSchema = z.object({
  company_id: z.number().positive("Company ID must be positive"), 
  status: z.enum(['VERIFIED', 'PENDING', 'FAILED']).optional(),
  is_primary: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const getDomainByIdSchema = z.object({
  id: z.number().positive("Domain ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const removeDomainSchema = z.object({
  id: z.number().positive("Domain ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const verifyDomainSchema = z.object({
  id: z.number().positive("Domain ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"), 
});

export const getDomainVerificationSchema = z.object({
  id: z.number().positive("Domain ID must be positive"),
  company_id: z.number().positive("Company ID must be positive"),
});