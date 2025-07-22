/*
  Warnings:

  - A unique constraint covering the columns `[date,catName,userId]` on the table `ProcrastinationAdvice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProcrastinationAdvice_date_catName_key";

-- AlterTable
ALTER TABLE "ProcrastinationAdvice" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProcrastinationAdvice_date_catName_userId_key" ON "ProcrastinationAdvice"("date", "catName", "userId");

-- AddForeignKey
ALTER TABLE "ProcrastinationAdvice" ADD CONSTRAINT "ProcrastinationAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
