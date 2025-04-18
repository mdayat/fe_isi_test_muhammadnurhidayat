import { z } from "zod";

const userRole = z.union([z.literal("lead"), z.literal("team")]);

type UserRole = z.infer<typeof userRole>;

const loginUserDTO = z.object({
  id: z.string().uuid(),
});

const userDTO = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: userRole,
  created_at: z.string(),
});

type UserDTO = z.infer<typeof userDTO>;

export { userDTO, userRole, loginUserDTO };
export type { UserDTO, UserRole };
