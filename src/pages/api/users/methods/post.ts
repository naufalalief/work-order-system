// pages/api/users/post.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { authenticated } from "@/middleware/auth";
import { userSchema } from "@/utils/schemas";

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = authenticated(req);
    if (user.role !== Role.PRODUCTION_MANAGER) {
      return res.status(403).json({ message: "Forbidden." });
    }

    // Validasi input menggunakan Zod
    const userData = userSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
      },
    });
    return res.status(201).json({ user: newUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid request.", errors: error.errors });
    }
    console.error("Error in createUser:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
