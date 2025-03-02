// pages/api/users/post.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";
import { z } from "zod"; // Import Zod untuk validasi
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

// Skema validasi Zod
const userSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum([Role.PRODUCTION_MANAGER, Role.OPERATOR]),
});

interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

const secret = process.env.secretkey || "secret";

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

export const authenticated = (req: NextApiRequest): AuthenticatedUser => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        userId: decoded.userId as number,
        username: decoded.username as string,
        role: decoded.role as Role,
        expired: true,
      };
    }
    return {
      userId: decoded.userId as number,
      username: decoded.username as string,
      role: decoded.role as Role,
      expired: false,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        userId: 0,
        username: "",
        role: Role.OPERATOR,
        expired: true,
      };
    } else {
      throw new Error("Unauthorized");
    }
  }
};
