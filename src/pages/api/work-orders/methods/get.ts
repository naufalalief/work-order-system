import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/middleware/auth";

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

export default getWorkOrders;
