/*
  Warnings:

  - You are about to drop the column `duration` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `progressNotes` on the `WorkOrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `WorkOrderStatusHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "WorkOrderStatusHistory" DROP COLUMN "progressNotes",
DROP COLUMN "quantity";
