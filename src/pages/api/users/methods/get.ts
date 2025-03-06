import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import prisma from "@/utils/prisma";
import { AuthenticatedUser } from "@/utils/interfaces";

const secret = process.env.secretkey || "secret";

const getAllUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = authenticated(req);
    if (user.role !== Role.PRODUCTION_MANAGER) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const users = await prisma.user.findMany({
      where: {
        role: Role.OPERATOR,
      },
    });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};
export default getAllUsers;

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
