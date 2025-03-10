import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "prisma/prisma-client";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";
import { AuthWithResponse } from "@/utils/interfaces";
import { authSchema } from "@/utils/schemas";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { username, password } = authSchema.parse(req.body);
    await register({ username, password, res });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request." });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};

export const register = async ({
  username,
  password,
  role = Role.OPERATOR,
  res,
}: AuthWithResponse) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(400).json({ message: "Username already exists." });
  }
};
