-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jellyCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "JellyReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JellyReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JellyReward_userId_date_key" ON "JellyReward"("userId", "date");

-- AddForeignKey
ALTER TABLE "JellyReward" ADD CONSTRAINT "JellyReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
