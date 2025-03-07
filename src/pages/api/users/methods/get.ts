import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/middleware/auth";

const getAllUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = authenticated(req);
    if (user.role === Role.OPERATOR) {
      const loggedInUser = await prisma.user.findUnique({
        where: {
          id: user.userId,
        },
      });
      return res.status(200).json({ users: [loggedInUser] });
    } else if (user.role === Role.PRODUCTION_MANAGER) {
      const users = await prisma.user.findMany({
        where: {
          role: Role.OPERATOR,
        },
      });
      return res.status(200).json({ users });
    } else {
      return res.status(403).json({ message: "Forbidden." });
    }
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};
export default getAllUsers;
