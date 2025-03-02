import { PrismaClient, Status, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Seed Users (upsert)
  const adminPasswordHash = await bcrypt.hash("admin", saltRounds);
  const operatorPasswordHash = await bcrypt.hash("admin", saltRounds);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPasswordHash, role: Role.PRODUCTION_MANAGER },
    create: {
      username: "admin",
      password: adminPasswordHash,
      role: Role.PRODUCTION_MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { username: "operator" },
    update: { password: operatorPasswordHash, role: Role.OPERATOR },
    create: {
      username: "operator",
      password: operatorPasswordHash,
      role: Role.OPERATOR,
    },
  });

  console.log("Users seeded successfully.");

  // Seed Work Orders
  const admin = await prisma.user.findFirst({ where: { username: "admin" } });
  const operator = await prisma.user.findFirst({
    where: { username: "operator" },
  });

  if (!admin || !operator) {
    console.warn("Users not found. Please seed users first.");
    return;
  }

  await prisma.workOrder.createMany({
    data: [
      {
        workOrderNumber: "WO-001",
        productName: "Product A",
        quantity: 100,
        deadline: new Date("2024-12-31"),
        status: Status.PENDING,
        assignedToId: operator.id,
        progressNotes: ["Initial Note"],
      },
      {
        workOrderNumber: "WO-002",
        productName: "Product B",
        quantity: 200,
        deadline: new Date("2024-12-31"),
        status: Status.PENDING,
        assignedToId: operator.id,
        progressNotes: ["Initial Note"],
      },
    ],
  });

  console.log("Work orders seeded successfully.");

  // Seed WorkOrderStatusHistory
  const workOrder1 = await prisma.workOrder.findFirst();
  const workOrder2 = await prisma.workOrder.findFirst({ skip: 1 });

  if (!workOrder1 || !workOrder2) {
    console.warn("Work orders not found. Please seed work orders first.");
    return;
  }

  await prisma.workOrderStatusHistory.createMany({
    data: [
      {
        workOrderId: workOrder1.id,
        status: Status.PENDING,
        progressNotes: "Work order created.",
      },
      {
        workOrderId: workOrder1.id,
        status: Status.IN_PROGRESS,
        progressNotes: "Started working on the order.",
        quantity: 10,
      },
      {
        workOrderId: workOrder1.id,
        status: Status.COMPLETED,
        progressNotes: "Order completed.",
        completedAt: new Date(),
        quantity: 10,
      },
      {
        workOrderId: workOrder2.id,
        status: Status.PENDING,
        progressNotes: "New work order.",
      },
      {
        workOrderId: workOrder2.id,
        status: Status.IN_PROGRESS,
        progressNotes: "Work in progress.",
        quantity: 5,
      },
    ],
  });

  console.log("WorkOrderStatusHistory seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
