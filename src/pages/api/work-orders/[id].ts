import { NextApiRequest, NextApiResponse } from "next";
import { Role } from "prisma/prisma-client";
import { z } from "zod";
import { Status } from "@prisma/client";
import prisma from "@/utils/prisma";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

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
  const { id } = req.query; // 'id' will be the workOrderNumber
  console.log("Work Order Number: ", id);

  if (req.method === "GET") {
    try {
      await getWorkOrderById(id as string, res);
    } catch (error) {
      console.error("Error in GET handler:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "PUT") {
    try {
      const user = authenticated(req); // Authenticate the user
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
      workOrderData = workOrderSchema.parse(req.body);
    } else {
      workOrderData = operatorWorkOrderSchema.parse(req.body);
    }

    const currentWorkOrder = await prisma.workOrder.findUnique({
      where: {
        workOrderNumber,
      },
    });

    if (currentWorkOrder?.assignedToId !== user.userId) {
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
      };

      if (currentWorkOrder?.status !== workOrderData.status) {
        const statusHistoryData = {
          workOrderId: workOrder.id,
          status: workOrderData.status,
        };

        if (workOrderData.status === Status.COMPLETED) {
          await prisma.workOrderStatusHistory.create({
            data: {
              ...statusHistoryData,
              completedAt: new Date(), // Tambahkan completedAt jika status COMPLETED
            },
          });
        } else {
          await prisma.workOrderStatusHistory.create({
            data: statusHistoryData,
          });
        }
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
          orderBy: { startedAt: "asc" }, // Urutkan berdasarkan startedAt
        },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ message: "Work order not found." });
    }

    // Hitung durasi
    let duration = null;
    if (workOrder.statusHistory.length > 0) {
      const firstPending = workOrder.statusHistory.find(
        (history) => history.status === Status.PENDING
      );
      const lastCompleted = workOrder.statusHistory
        .slice()
        .reverse()
        .find((history) => history.status === Status.COMPLETED); // Gunakan slice().reverse() agar tidak mengubah array asli

      if (firstPending && lastCompleted) {
        duration = Math.floor(
          (lastCompleted.completedAt!.getTime() -
            firstPending.startedAt.getTime()) /
            1000
        ); // Durasi dalam detik
      }
    }

    res.status(200).json({
      workOrder: {
        ...workOrder,
        duration, // Sertakan durasi dalam respons
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    await prisma.$disconnect();
  }
};

export const workOrderSchema = z.object({
  productName: z.string(),
  quantity: z.number(),
  deadline: z.string().transform((date) => new Date(date)),
  status: z.enum([Status.PENDING, Status.IN_PROGRESS, Status.COMPLETED]),
  assignedToId: z.number(),
  progressNotes: z.array(z.string()).optional(),
  updatedAt: z
    .string()
    .transform((date) => new Date(date))
    .optional(),
});

export const operatorWorkOrderSchema = z.object({
  status: z.enum([
    Status.PENDING,
    Status.IN_PROGRESS,
    Status.COMPLETED,
    Status.CANCELED,
  ]),
  progressNotes: z.array(z.string()).optional(),
  updatedAt: z
    .string()
    .transform((date) => new Date(date))
    .optional(),
});

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
