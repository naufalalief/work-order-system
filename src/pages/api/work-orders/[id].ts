import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "prisma/prisma-client";
import { z } from "zod";
import { Status } from "@prisma/client";
import prisma from "@/utils/prisma";
import { authenticated } from "@/middleware/auth";
import { operatorWorkOrderSchema, workOrderSchema } from "@/utils/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      await getWorkOrderById(id as string, res);
    } catch (error) {
      console.error("Error in GET handler:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "PUT") {
    try {
      const user = authenticated(req);
      if (user.expired) {
        return res.status(401).json({ message: "Unauthorized: Token expired" });
      }

      await editWorkOrder(id as string, req, res, {
        userId: user.userId,
        role: user.role,
      });
    } catch (error) {
      console.error("Error in PUT handler:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "DELETE") {
    try {
      const user = authenticated(req);
      if (user.expired) {
        return res.status(401).json({ message: "Unauthorized: Token expired" });
      }

      await deleteWorkOrder(id as string, res, {
        userId: user.userId,
        role: user.role,
      });
    } catch (error) {
      console.error("Error in DELETE handler:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}

const editWorkOrder = async (
  workOrderNumber: string,
  req: NextApiRequest,
  res: NextApiResponse,
  user: { userId: number; role: Role }
) => {
  try {
    let workOrderData;

    if (user.role === Role.PRODUCTION_MANAGER) {
      const { progressNotes, ...rest } = req.body;
      workOrderData = workOrderSchema.parse(rest);
    } else {
      workOrderData = operatorWorkOrderSchema.parse(req.body);
    }

    const currentWorkOrder = await prisma.workOrder.findUnique({
      where: {
        workOrderNumber,
      },
      include: {
        statusHistory: true,
      },
    });

    if (
      user.role === Role.OPERATOR &&
      currentWorkOrder?.assignedToId !== user.userId
    ) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed to edit this work order.",
      });
    }

    if (!currentWorkOrder) {
      return res.status(404).json({ message: "Work Order Not Found." });
    }

    const workOrder = await prisma.workOrder.update({
      where: { workOrderNumber },
      data: workOrderData,
    });

    if (currentWorkOrder?.status !== workOrderData.status) {
      const statusHistoryData = {
        workOrderId: workOrder.id,
        status: workOrderData.status,
        progressNote: req.body.progressNote,
        quantityCompleted: req.body.quantityCompleted,
        completedAt: new Date(),
      };

      await prisma.workOrderStatusHistory.create({
        data: statusHistoryData,
      });

      if (workOrderData.status === Status.COMPLETED) {
        const firstPending = currentWorkOrder.statusHistory.find(
          (history) => history.status === Status.PENDING
        );

        if (firstPending && statusHistoryData.completedAt) {
          const duration = Math.floor(
            (statusHistoryData.completedAt.getTime() -
              firstPending.startedAt.getTime()) /
              1000
          );

          await prisma.workOrder.update({
            where: { workOrderNumber },
            data: {
              duration: duration,
            },
          });
        }
      }

      if (
        user.role === Role.OPERATOR &&
        (workOrderData.status === Status.IN_PROGRESS ||
          workOrderData.status === Status.COMPLETED) &&
        req.body.progressNote
      ) {
        let updatedProgressNotes = currentWorkOrder.progressNotes || [];
        updatedProgressNotes = [...updatedProgressNotes, req.body.progressNote];

        await prisma.workOrder.update({
          where: { workOrderNumber },
          data: {
            progressNotes: updatedProgressNotes,
          },
        });
      }
    }

    res.status(200).json({
      message: "Work order updated successfully.",
      workOrder,
    });
  } catch (error) {
    console.error("Error occurred:", error);
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

const getWorkOrderById = async (
  workOrderNumber: string,
  res: NextApiResponse
) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { workOrderNumber },
      include: {
        assignedTo: true,
        statusHistory: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found." });
    }

    let duration = null;
    if (workOrder.statusHistory.length > 0) {
      const firstPending = workOrder.statusHistory.find(
        (history) => history.status === Status.PENDING
      );
      const lastCompleted = workOrder.statusHistory
        .slice()
        .reverse()
        .find((history) => history.status === Status.COMPLETED);

      if (firstPending && lastCompleted) {
        duration = Math.floor(
          (lastCompleted.completedAt!.getTime() -
            firstPending.startedAt.getTime()) /
            1000
        );
      }
    }

    res.status(200).json({
      workOrder: {
        ...workOrder,
        duration,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};

const deleteWorkOrder = async (
  workOrderNumber: string,
  res: NextApiResponse,
  user: { userId: number; role: Role }
) => {
  if (user.role !== Role.PRODUCTION_MANAGER) {
    return res.status(403).json({ message: "Forbidden." });
  }

  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: {
        workOrderNumber,
      },
    });

    if (!workOrder) {
      return res.status(404).json({
        message: "Work Order Not Found.",
      });
    }

    const workOrderHistory = await prisma.workOrderStatusHistory.deleteMany({
      where: {
        workOrderId: workOrder.id,
      },
    });

    await prisma.workOrder.delete({
      where: { workOrderNumber },
    });

    res.status(200).json({ message: "Work order deleted successfully." });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};
