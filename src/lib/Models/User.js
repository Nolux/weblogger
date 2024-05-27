import { z } from "zod";

export const UserModel = z.object({
  email: z.string().min(1).email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
