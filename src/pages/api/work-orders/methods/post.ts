import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/prisma";
import { z } from "zod";
import { Status } from "@prisma/client";
import { verifyAdmin } from "../../auth/login";
import { workOrderSchema } from "@/utils/schemas";

const createWorkOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await verifyAdmin(req, res, async () => {
      const payload = (req as any).payload;

      const workOrderData = workOrderSchema.parse(req.body);

      const assignedToUser = await prisma.user.findUnique({
        where: { id: workOrderData.assignedToId },
      });

      if (!assignedToUser) {
        return res.status(400).json({ message: "Invalid assignedToId." });
      }

      const workOrderNumber = `WO-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      const workOrder = await prisma.workOrder.create({
        data: {
          workOrderNumber,
          ...workOrderData,
          status: Status.PENDING,
          progressNotes: ["Initiating"],
          statusHistory: {
            create: {
              status: workOrderData.status,
              completedAt: new Date(),
              quantityCompleted: 0,
            },
          },
        },
      });

      res
        .status(201)
        .json({ message: "Work order created successfully.", workOrder });
    });
  } catch (error) {
    console.error("Error occurred:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid request.", errors: error.errors });
    } else {
      return res.status(500).json({ message: "Internal server error." });
    }
  } finally {
    await prisma.$disconnect();
  }
};

export default createWorkOrder;
