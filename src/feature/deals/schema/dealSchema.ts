// src/feature/deals/schemas/dealSchema.ts
import { z } from "zod";

export const dealStageEnum = z.enum(["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"]);
export const currencyEnum = z.enum(["USD", "EUR", "GBP"]);

export const createDealSchema = z.object({
  dealName: z.string().trim().min(1),
  company: z.string().trim().min(1),
  contact: z.string().trim().optional().or(z.literal("")),
  stage: dealStageEnum,
  amount: z.preprocess((val) => {
  if (typeof val === "string") return Number(val);
  return val;
}, z.number().min(0, { message: "Amount cannot be negative" })),
  currency: currencyEnum,
  ownerId: z.string(),
  closeDate: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  notes: z.string().optional().nullable(),
  files: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      size: z.number().optional(),
      mimeType: z.string().optional()
    })
  ).optional().nullable()
});

export const updateDealSchema = createDealSchema.partial().extend({
  id: z.string().uuid()
});
