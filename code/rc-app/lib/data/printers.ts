import { prisma } from '@/lib/prisma'

/**
 * Get all printers from database
 */
export async function getPrinters() {
  return await prisma.printer.findMany({
    orderBy: {
      printerNaam: 'asc',
    },
  })
}

/**
 * Get printer by ID
 */
export async function getPrinterById(printerId: number) {
  return await prisma.printer.findUnique({
    where: { printerId },
  })
}

/**
 * Get printer by name
 */
export async function getPrinterByName(printerNaam: string) {
  return await prisma.printer.findUnique({
    where: { printerNaam },
  })
}

/**
 * Get all connected printers
 */
export async function getConnectedPrinters() {
  return await prisma.printer.findMany({
    where: {
      isConnected: true,
    },
    orderBy: {
      printerNaam: 'asc',
    },
  })
}

/**
 * Update printer connection status
 */
export async function updatePrinterConnectionStatus(
  printerId: number,
  isConnected: boolean,
  socketId?: string | null
) {
  return await prisma.printer.update({
    where: { printerId },
    data: {
      isConnected,
      socketId: socketId !== undefined ? socketId : undefined,
      lastConnected: isConnected ? new Date() : undefined,
    },
  })
}

/**
 * Get print jobs with filters
 */
export async function getPrintJobs(filters?: {
  printerId?: number
  status?: string
  voorwerpId?: number
  limit?: number
}) {
  const where: any = {}
  
  if (filters?.printerId) {
    where.printerId = filters.printerId
  }
  
  if (filters?.status) {
    where.status = filters.status
  }
  
  if (filters?.voorwerpId) {
    where.voorwerpId = filters.voorwerpId
  }
  
  return await prisma.printJob.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: filters?.limit || 100,
    include: {
      printer: true,
    },
  })
}

/**
 * Get pending print jobs for a specific printer
 */
export async function getPendingPrintJobsForPrinter(printerId: number) {
  return await prisma.printJob.findMany({
    where: {
      printerId,
      status: 'pending',
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

/**
 * Create a new print job
 */
export async function createPrintJob(data: {
  printerId: number
  voorwerpId: number
  volgnummer: string
  klantNaam: string
  klantTelefoon?: string | null
  afdelingNaam: string
}) {
  return await prisma.printJob.create({
    data: {
      printerId: data.printerId,
      voorwerpId: data.voorwerpId,
      volgnummer: data.volgnummer,
      klantNaam: data.klantNaam,
      klantTelefoon: data.klantTelefoon,
      afdelingNaam: data.afdelingNaam,
      status: 'pending',
    },
  })
}

/**
 * Update print job status
 */
export async function updatePrintJobStatus(
  printJobId: number,
  status: string,
  errorMessage?: string
) {
  const data: any = { status }
  
  if (status === 'sent') {
    data.sentAt = new Date()
  } else if (status === 'completed') {
    data.completedAt = new Date()
  }
  
  if (errorMessage) {
    data.errorMessage = errorMessage
  }
  
  return await prisma.printJob.update({
    where: { printJobId },
    data,
  })
}

/**
 * Get print job by ID
 */
export async function getPrintJobById(printJobId: number) {
  return await prisma.printJob.findUnique({
    where: { printJobId },
    include: {
      printer: true,
    },
  })
}

/**
 * Count pending print jobs
 */
export async function countPendingPrintJobs(printerId?: number) {
  const where: any = { status: 'pending' }
  
  if (printerId) {
    where.printerId = printerId
  }
  
  return await prisma.printJob.count({ where })
}

/**
 * Delete old completed print jobs
 */
export async function deleteOldCompletedPrintJobs(daysOld: number = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  return await prisma.printJob.deleteMany({
    where: {
      status: 'completed',
      completedAt: {
        lt: cutoffDate,
      },
    },
  })
}
