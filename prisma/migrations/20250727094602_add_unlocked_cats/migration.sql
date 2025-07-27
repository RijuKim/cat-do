-- AlterTable
ALTER TABLE "User" ADD COLUMN     "unlockedCats" TEXT[] DEFAULT ARRAY['두두']::TEXT[];
