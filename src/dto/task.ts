import { z } from "zod";
import type { UserDTO } from "./user";

type AuditAction = "create" | "update";

interface AuditLog {
  id: string;
  user: UserDTO;
  action: AuditAction;
  changes: string;
  created_at: string;
}

const taskStatus = z.union([
  z.literal("not_started"),
  z.literal("on_progress"),
  z.literal("done"),
  z.literal("reject"),
]);

type TaskStatus = z.infer<typeof taskStatus>;

const createTaskDTO = z.object({
  team_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: taskStatus,
});

type CreateTaskDTO = z.infer<typeof createTaskDTO>;

const updateTaskDTO = z.object({
  team_id: z
    .object({
      old_value: z.string().uuid().nullable(),
      new_value: z.string().uuid().nullable(),
    })
    .optional(),
  name: z
    .object({
      old_value: z.string().min(1),
      new_value: z.string().min(1),
    })
    .optional(),
  description: z
    .object({
      old_value: z.string().nullable(),
      new_value: z.string().nullable(),
    })
    .optional(),
  status: z
    .object({
      old_value: taskStatus,
      new_value: taskStatus,
    })
    .optional(),
});

type UpdateTaskDTO = z.infer<typeof updateTaskDTO>;

const taskDTO = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  status: taskStatus,
  created_at: z.string(),
  updated_at: z.string(),
});

type TaskDTO = z.infer<typeof taskDTO>;

export { createTaskDTO, taskDTO, updateTaskDTO };
export type { TaskDTO, TaskStatus, CreateTaskDTO, AuditLog, UpdateTaskDTO };
