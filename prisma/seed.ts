// filepath: /d:/project/sistem-manajemen-work-order/prisma/seed.ts
import { PrismaClient, Role, Status } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin", 10);

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: Role.PRODUCTION_MANAGER,
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { username: "operator" },
    update: {},
    create: {
      username: "operator",
      password: hashedPassword,
      role: Role.OPERATOR,
    },
  });

  const sampleWorkOrder1 = await prisma.workOrder.create({
    data: {
      workOrderNumber: "WO-20250301-001",
      productName: "Sample Product 1",
      quantity: 100,
      deadline: new Date("2025-03-15"),
      status: Status.PENDING,
      assignedToId: operatorUser.id,
      progressNotes: [],
      statusHistory: {
        create: {
          status: Status.PENDING,
        },
      },
    },
  });

  const sampleWorkOrder2 = await prisma.workOrder.create({
    data: {
      workOrderNumber: "WO-20250301-002",
      productName: "Sample Product 2",
      quantity: 200,
      deadline: new Date("2025-04-15"),
      status: Status.PENDING,
      assignedToId: operatorUser.id,
      progressNotes: [],
      statusHistory: {
        create: {
          status: Status.PENDING,
        },
      },
    },
  });

  console.log("Admin user created:", adminUser);
  console.log("Sample work order created:", sampleWorkOrder1);
  console.log("Sample work order created:", sampleWorkOrder2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
