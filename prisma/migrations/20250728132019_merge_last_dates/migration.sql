/*
  Warnings:

  - You are about to drop the column `lastJellyDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastJellyDate",
DROP COLUMN "lastLoginDate",
ADD COLUMN     "lastActivityDate" TEXT;
