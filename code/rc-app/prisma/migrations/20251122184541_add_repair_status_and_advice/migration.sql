-- AlterTable
ALTER TABLE "Voorwerp" ADD COLUMN     "advies" TEXT;

-- CreateTable
CREATE TABLE "ReparatieStatus" (
    "reparatieStatusId" SERIAL NOT NULL,
    "voorwerpId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReparatieStatus_pkey" PRIMARY KEY ("reparatieStatusId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReparatieStatus_voorwerpId_key" ON "ReparatieStatus"("voorwerpId");

-- AddForeignKey
ALTER TABLE "ReparatieStatus" ADD CONSTRAINT "ReparatieStatus_voorwerpId_fkey" FOREIGN KEY ("voorwerpId") REFERENCES "Voorwerp"("voorwerpId") ON DELETE RESTRICT ON UPDATE CASCADE;
