// pages/api/reports/work-order-summary.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Role, Status } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/pages/api/users/methods/get"; // Gunakan fungsi authenticated yang sudah ada

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = authenticated(req);
    if (user.role !== Role.PRODUCTION_MANAGER) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const workOrders = await prisma.workOrder.findMany({
      select: {
        productName: true,
        status: true,
        quantity: true,
      },
    });

    const summary = workOrders.reduce((acc, wo) => {
      if (!acc[wo.productName]) {
        acc[wo.productName] = {
          productName: wo.productName,
          [Status.PENDING]: 0,
          [Status.IN_PROGRESS]: 0,
          [Status.COMPLETED]: 0,
          [Status.CANCELED]: 0,
          totalQuantity: 0,
        };
      }
      acc[wo.productName][wo.status] += wo.quantity;
      acc[wo.productName].totalQuantity += wo.quantity;
      return acc;
    }, {} as Record<string, any>);

    const report = Object.values(summary);
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error in work order summary report:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
}
