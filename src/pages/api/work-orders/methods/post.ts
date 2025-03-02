import { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import prisma from "@/utils/prisma";
import { z } from "zod";
import { Role, Status } from "@prisma/client";
import { verifyAdmin } from "../../auth/login";

interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

const secret = process.env.secretkey || "secret";

const createWorkOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Gunakan verifyAdmin untuk memeriksa peran pengguna
    await verifyAdmin(req, res, async () => {
      // Jika verifyAdmin berhasil, ini akan dijalankan
      const payload = (req as any).payload;
      console.log(payload);

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
          statusHistory: {
            create: {
              status: workOrderData.status,
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
