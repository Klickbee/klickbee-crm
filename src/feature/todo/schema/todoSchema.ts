import { z } from "zod";

// Client form uses lowercase values; map them to Prisma enums (PascalCase)
const statusValues = [ "Todo", "InProgress", "OnHold", "Done"] as const;
const priorityValues = ["high", "urgent", "medium", "low"] as const;

export const createTodoSchema = z
  .object({
    taskName: z.string().trim().min(1, "Task name is required"),
    status: z.string().default("Todo"),
    priority: z.string().default("high"),
    linkedId: z.string().trim().min(1),
    assignedId: z.string().trim().optional().or(z.literal("")),
    dueDate: z.string().nullable().optional(),
    notes: z.string().optional().or(z.literal("")),
    files: z.any().optional(),
  })
  .transform((data) => ({
    ...data,
    // Map form values to Prisma enum casing
    status:
      data.status === undefined
        ? undefined
        : ["Todo", "InProgress", "OnHold", "Done"].includes(data.status)
        ? data.status
        : data.status === "to-do"
        ? "Todo"
        : data.status === "in-progress"
        ? "InProgress"
        : data.status === "on-hold"
        ? "OnHold"
        : data.status === "done"
        ? "Done"
        : "Todo", // still a safe fallback
    priority:
      data.priority === "urgent"
        ? "Urgent"
        : data.priority === "medium"
        ? "Medium"
        : data.priority === "low"
        ? "Low"
        : data.priority === "high"
        ? "High"
        : "High", // default fallback
  }));

export const updateTodoSchema = z
  .object({
    id: z.string().trim().min(1).optional(), // Made optional since id comes from URL
    taskName: z.string().trim().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    linkedId: z.string().trim().optional(),
    assignedId: z.string().trim().optional(),
    dueDate: z.string().nullable().optional(),
    notes: z.string().optional(),
    files: z.any().optional(),
  })
  .transform((data) => ({
    ...data,
    // Map form values to Prisma enum casing - handle both camelCase and lowercase inputs
     status:
      data.status === undefined
        ? undefined
        : ["Todo", "InProgress", "OnHold", "Done"].includes(data.status)
        ? data.status
        : data.status === "to-do"
        ? "Todo"
        : data.status === "in-progress"
        ? "InProgress"
        : data.status === "on-hold"
        ? "OnHold"
        : data.status === "done"
        ? "Done"
        : "Todo", // still a safe fallback
    priority:
      data.priority === undefined
        ? undefined
        : data.priority === "urgent"
        ? "Urgent"
        : data.priority === "medium"
        ? "Medium"
        : data.priority === "low"
        ? "Low"
        : data.priority === "high"
        ? "High"
        : "High", // default fallback
  }));

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
