/*
  Warnings:

  - You are about to drop the `JellyReward` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JellyReward" DROP CONSTRAINT "JellyReward_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastJellyDate" TEXT;

-- DropTable
DROP TABLE "JellyReward";
