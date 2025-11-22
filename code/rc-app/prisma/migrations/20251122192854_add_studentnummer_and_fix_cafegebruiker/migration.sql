-- AlterTable
ALTER TABLE "Gebruiker" ADD COLUMN     "studentNummer" TEXT;

-- AddForeignKey
ALTER TABLE "CafeGebruiker" ADD CONSTRAINT "CafeGebruiker_gebruikerId_fkey" FOREIGN KEY ("gebruikerId") REFERENCES "Gebruiker"("gebruikerId") ON DELETE RESTRICT ON UPDATE CASCADE;
