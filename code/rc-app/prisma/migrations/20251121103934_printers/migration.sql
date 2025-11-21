-- CreateTable
CREATE TABLE "Printer" (
    "printerId" SERIAL NOT NULL,
    "printerNaam" TEXT NOT NULL,
    "socketId" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastConnected" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("printerId")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "printJobId" SERIAL NOT NULL,
    "printerId" INTEGER NOT NULL,
    "voorwerpId" INTEGER NOT NULL,
    "volgnummer" TEXT NOT NULL,
    "klantNaam" TEXT NOT NULL,
    "klantTelefoon" TEXT,
    "afdelingNaam" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("printJobId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Printer_printerNaam_key" ON "Printer"("printerNaam");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_socketId_key" ON "Printer"("socketId");

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("printerId") ON DELETE RESTRICT ON UPDATE CASCADE;
