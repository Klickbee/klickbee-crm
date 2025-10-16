import { z } from "zod";

const statusValues = ["Active", "FollowUp", "inactive"] as const;

export const createCustomerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  companyId: z
    .string()
    .optional()
    .nullable(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  status: z.enum(statusValues).default("Active"),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  notes: z.string().optional().or(z.literal("")),
  files: z.any().optional(),
  ownerId: z.string(),
  userId: z.string(),
});

export const updateCustomerSchema = z.object({
  id: z.string().trim().min(1),
  fullName: z.string().trim().optional(),
   companyId: z
    .string()
    .optional()
    .nullable(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  status: z.enum(statusValues).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().optional(),
  files: z.any().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
