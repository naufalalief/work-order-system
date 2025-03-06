import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/middleware/auth";

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
