import { Role, Status } from "@prisma/client";
import { z } from "zod";

export const authSchema = z.object({
  username: z.string().refine(
    (val) => {
      if (val.includes("admin")) {
        return true;
      }
      return val.length >= 7;
    },
    {
      message: "Username must be at least 7 characters.",
    }
  ),
  password: z.string().refine(
    (val) => {
      if (val.includes("admin")) {
        return true;
      }
      return val.length >= 7;
    },
    {
      message: "Password must be at least 7 characters.",
    }
  ),
});

export const userSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum([Role.PRODUCTION_MANAGER, Role.OPERATOR]),
});

export const workOrderSchema = z.object({
  productName: z.string(),
  quantity: z.number(),
  deadline: z.string().transform((date) => new Date(date)),
  status: z.enum([Status.PENDING, Status.IN_PROGRESS, Status.COMPLETED]),
  assignedToId: z.number(),
  progressNotes: z.array(z.string()).optional(),
  updatedAt: z
    .string()
    .transform((date) => new Date(date))
    .optional(),
});

export const operatorWorkOrderSchema = z.object({
  status: z.enum([
    Status.PENDING,
    Status.IN_PROGRESS,
    Status.COMPLETED,
    Status.CANCELED,
  ]),
  progressNotes: z.array(z.string()).optional(),
  updatedAt: z
    .string()
    .transform((date) => new Date(date))
    .optional(),
});
