import { z } from "zod";

// Form uses specific literal values; map to Prisma enums
const statusValues = ["scheduled", "confirmed", "cancelled"] as const;
const frequencyValues = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
const endsValues = ["Never", "After", "OnDate"] as const;

const dateLike = z.union([z.string().datetime().optional(), z.date()]).optional();

export const createMeetingSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    startDate: dateLike,
    startTime: dateLike,
    endTime: dateLike,
    repeatMeeting: z.boolean().default(false),
    frequency: z.enum(frequencyValues).default("Daily"),
    repeatOn: z.string().optional().or(z.literal("")),
    repeatEvery: z.coerce.number().int().min(0).default(0),
    ends: z.enum(endsValues).default("Never"),
    linkedId: z.string(),
    location: z.string().optional().or(z.literal("")),
    assignedId: z.string().optional().or(z.literal("")),
    participants: z.array(z.string().trim().min(1)).optional().default([]),
    status: z.enum(statusValues).default("scheduled"),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
    notes: z.string().optional().or(z.literal("")),
    files: z.any().optional(),
    ownerId: z.string(),
  })
  .transform((data) => ({
    ...data,
    status:
      data.status === "confirmed"
        ? "Confirmed"
        : data.status === "cancelled"
        ? "Cancelled"
        : "Scheduled",
  }));

export const updateMeetingSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().optional(),
    startDate: dateLike,
    startTime: dateLike,
    endTime: dateLike,
    repeatMeeting: z.boolean().optional(),
    frequency: z.enum(frequencyValues).optional(),
    repeatOn: z.string().optional(),
    repeatEvery: z.coerce.number().int().min(0).optional(),
    ends: z.enum(endsValues).optional(),
    linkedTo: z.string().trim().optional(),
    location: z.string().optional(),
    assignedTo: z.string().optional(),
    participants: z.array(z.string().trim().min(1)).optional(),
    status: z.enum(statusValues).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    notes: z.string().optional(),
    files: z.any().optional(),
  })
  .transform((data) => ({
    ...data,
    status:
      data.status === undefined
        ? undefined
        : data.status === "confirmed"
        ? "Confirmed"
        : data.status === "cancelled"
        ? "Cancelled"
        : "Scheduled",
  }));

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
