// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import bcrypt from "bcrypt";

interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

const secret = process.env.secretkey || "secret";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // 'id' will be the userId

  if (req.method === "GET") {
    try {
      await getUserById(Number(id), res);
    } catch (error) {
      console.error("Error in getUserById:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "PUT") {
    try {
      const user = authenticated(req);
      if (user.role !== Role.PRODUCTION_MANAGER) {
        return res.status(403).json({ message: "Forbidden." });
      }

      await updateUser(Number(id), req, res);
    } catch (error) {
      console.error("Error in updateUser:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "DELETE") {
    try {
      const user = authenticated(req);
      if (user.role !== Role.PRODUCTION_MANAGER) {
        return res.status(403).json({ message: "Forbidden." });
      }

      await deleteUser(Number(id), res);
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
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

const getUserById = async (userId: number, res: NextApiResponse) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};

const updateUser = async (
  userId: number,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { username, password, role } = req.body;
    let updateData: any = { username, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};

const deleteUser = async (userId: number, res: NextApiResponse) => {
  try {
    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};
