/*
  Warnings:

  - You are about to drop the column `progressNotes` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "progressNotes";

-- AlterTable
ALTER TABLE "WorkOrderStatusHistory" ADD COLUMN     "progressNotes" TEXT;
