/*
  Warnings:

  - You are about to drop the column `progressNotes` on the `WorkOrderStatusHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "progressNotes" TEXT[];

-- AlterTable
ALTER TABLE "WorkOrderStatusHistory" DROP COLUMN "progressNotes";
