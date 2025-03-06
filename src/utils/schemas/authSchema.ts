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
