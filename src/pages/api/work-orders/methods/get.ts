import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import prisma from "@/utils/prisma";

interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

const secret = process.env.secretkey || "secret";

const getWorkOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = authenticated(req);
    const { username, userId, role, expired } = user;
    console.log(user);

    if (expired) {
      return res.status(401).json({ message: "Token expired" });
    }

    if (role === Role.PRODUCTION_MANAGER) {
      const workOrders = await prisma.workOrder.findMany({
        include: { assignedTo: true, statusHistory: true },
      });
      return res.status(200).json({ workOrders });
    } else if (role === Role.OPERATOR) {
      const workOrders = await prisma.workOrder.findMany({
        where: { assignedToId: userId },
        include: { assignedTo: true, statusHistory: true },
      });
      return res.status(200).json({ data: workOrders });
    } else {
      return res.status(403).json({ message: "Forbidden." });
    }
  } catch (error) {
    console.error("Error in getWorkOrders:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};

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

export default getWorkOrders;
