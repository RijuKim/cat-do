-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyMoodCheck" TEXT,
ADD COLUMN     "lastLoginDate" TEXT,
ADD COLUMN     "loginStreak" INTEGER NOT NULL DEFAULT 0;
