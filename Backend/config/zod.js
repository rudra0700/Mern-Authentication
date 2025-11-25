import { z } from "zod";

export const registerZodSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 char"),
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password have to be at least 8 char long"),
});

export const loginZodSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password have to be at least 8 char long"),
});
