import { z } from "zod";

const taskStatus = z.union([
  z.literal("not_started"),
  z.literal("on_progress"),
  z.literal("done"),
  z.literal("reject"),
]);

const createTaskDTO = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: taskStatus,
});

const updateTaskDTO = z.object({
  team_id: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: taskStatus.optional(),
});

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
export type { TaskDTO };
