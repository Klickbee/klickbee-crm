import { z } from "zod";

const statusValues = ["Active", "FollowUp", "inactive"] as const;

export const createCompanySchema = z.object({
  fullName: z.string().trim().min(1, "Company name is required"),
  industry: z.string().trim().min(1, "Industry is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  website: z.string().trim().optional().or(z.literal("")),
  status: z.enum(statusValues).default("Active"),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  assing: z.array(z.string().trim().min(1)).optional().default([]),
  notes: z.string().optional().or(z.literal("")),
  files: z.any().optional(),
  ownerId: z.string(),
  userId: z.string(),
});

export const updateCompanySchema = z.object({
  id: z.string().trim().min(1),
  fullName: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  status: z.enum(statusValues).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  assing: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().optional(),
  files: z.any().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
