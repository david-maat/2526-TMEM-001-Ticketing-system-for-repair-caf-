-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_voorwerpId_fkey" FOREIGN KEY ("voorwerpId") REFERENCES "Voorwerp"("voorwerpId") ON DELETE RESTRICT ON UPDATE CASCADE;
