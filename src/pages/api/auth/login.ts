import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Role } from "prisma/prisma-client";
import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthWithResponse } from "@/utils/interfaces";
import { authSchema } from "@/utils/schemas";
const secret = process.env.secretkey || "secret";

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
      { expiresIn: "10h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};
export const verifyAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded.role !== Role.PRODUCTION_MANAGER) {
      return res
        .status(403)
        .json({ message: "Forbidden: Production Manager role required." });
    }

    (req as any).payload = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
};
