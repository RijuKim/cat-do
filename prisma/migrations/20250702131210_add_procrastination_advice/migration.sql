-- CreateTable
CREATE TABLE "ProcrastinationAdvice" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "catName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcrastinationAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcrastinationAdvice_date_catName_key" ON "ProcrastinationAdvice"("date", "catName");
