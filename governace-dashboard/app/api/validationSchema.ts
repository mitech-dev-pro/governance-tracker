import {z} from "zod";

// Status enum to match Prisma schema
const StatusEnum = z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "AT_RISK", "COMPLETED", "DEFERRED"]);

// Create governance item schema
export const createGovernanceSchema = z.object({
  number: z.string().min(1, "Number is required").max(50, "Number must be less than 50 characters").optional(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Description is required"),
  status: StatusEnum.default("NOT_STARTED"),
  ownerId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  dueDate: z.union([z.string().datetime(), z.null()]).optional(),
  clauseRefs: z.array(z.string()).default([]),
  progress: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(["public", "department", "private"]).default("department"),
  actionitemType: z.string().optional(), // Add actionitem type field
  actionitem: z.string().optional(), // Alias for actionitemType for backwards compatibility
});

// Update governance item schema
export const updateGovernanceSchema = z.object({
  number: z.string().min(1, "Number is required").max(50, "Number must be less than 50 characters").optional(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
  description: z.string().min(1, "Description is required").optional(),
  status: StatusEnum.optional(),
  ownerId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  clauseRefs: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["public", "department", "private"]).optional(),
  actionitemType: z.string().optional(), // Add actionitem type field
  actionitem: z.string().optional(), // Alias for actionitemType for backwards compatibility
});

// Query parameters schema for GET requests
export const governanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: StatusEnum.optional(),
  departmentId: z.coerce.number().optional(),
  ownerId: z.coerce.number().optional(),
  search: z.string().optional(),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.coerce.number().positive(),
});

export type CreateGovernanceData = z.infer<typeof createGovernanceSchema>;
export type UpdateGovernanceData = z.infer<typeof updateGovernanceSchema>;
export type GovernanceQueryParams = z.infer<typeof governanceQuerySchema>;