/*
  Warnings:

  - You are about to drop the column `quantityHistory` on the `WorkOrderStatusHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrderStatusHistory" DROP COLUMN "quantityHistory",
ADD COLUMN     "quantityCompleted" INTEGER;
