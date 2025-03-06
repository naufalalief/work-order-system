// pages/api/reports/operator-summary.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Role, Status } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/middleware/auth";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = authenticated(req);
    if (user.role !== Role.PRODUCTION_MANAGER) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const operators = await prisma.user.findMany({
      where: { role: Role.OPERATOR },
      select: { id: true, username: true },
    });

    const reports = await Promise.all(
      operators.map(async (operator) => {
        const completedWorkOrders = await prisma.workOrder.findMany({
          where: {
            assignedToId: operator.id,
            status: Status.COMPLETED,
          },
          select: {
            productName: true,
            quantity: true,
          },
        });

        const summary = completedWorkOrders.reduce((acc, wo) => {
          if (!acc[wo.productName]) {
            acc[wo.productName] = {
              productName: wo.productName,
              totalQuantity: 0,
            };
          }
          acc[wo.productName].totalQuantity += wo.quantity;
          return acc;
        }, {} as Record<string, any>);

        return {
          operatorName: operator.username,
          report: Object.values(summary),
        };
      })
    );

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("Error in operator summary report:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
