import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Role } from "prisma/prisma-client";
import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface Auth {
  username: string;
  password: string;
  role?: Role;
}

interface AuthWithResponse extends Auth {
  res: NextApiResponse;
}
const secret = process.env.secretkey || "secret";

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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { username, password } = authSchema.parse(req.body);
    await login({ username, password, res });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};

export const login = async ({ username, password, res }: AuthWithResponse) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { userId: user.id, username, role: user.role },
      secret,
      { expiresIn: "30s" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};
