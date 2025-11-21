import { createPrintJob } from '@/lib/actions/printers'
import { getConnectedPrinters } from '@/lib/data/printers'

/**
 * Send a print job to a connected printer
 * Returns the print job if successful
 */
export async function sendPrintJob(data: {
  voorwerpId: number
  volgnummer: string
  klantNaam: string
  klantTelefoon?: string | null
  afdelingNaam: string
}) {
  try {
    // Get first available connected printer
    const connectedPrinters = await getConnectedPrinters()
    
    if (connectedPrinters.length === 0) {
      console.warn('No connected printers available')
      return { success: false, error: 'Geen verbonden printers beschikbaar' }
    }
    
    // Use the first available printer
    const printer = connectedPrinters[0]
    
    // Create print job in database
    const result = await createPrintJob({
      printerId: printer.printerId,
      voorwerpId: data.voorwerpId,
      volgnummer: data.volgnummer,
      klantNaam: data.klantNaam,
      klantTelefoon: data.klantTelefoon,
      afdelingNaam: data.afdelingNaam,
    })
    
    if (!result.success) {
      return result
    }
    
    // Send to printer via WebSocket if connected
    if (printer.socketId && globalThis.printerIo) {
      try {
        globalThis.printerIo.to(printer.socketId).emit('print-job', {
          printJobId: result.printJob.printJobId,
          volgnummer: data.volgnummer,
          klantNaam: data.klantNaam,
          klantTelefoon: data.klantTelefoon,
          afdelingNaam: data.afdelingNaam,
        })
        
        // Update status to sent
        const { updatePrintJobStatus } = await import('@/lib/data/printers')
        await updatePrintJobStatus(result.printJob.printJobId, 'sent')
        
        console.log(`Print job ${result.printJob.printJobId} sent to printer ${printer.printerNaam}`)
      } catch (emitError) {
        console.error('Error emitting print job to socket:', emitError)
        // Job is created in DB but not sent - will be picked up on reconnect
      }
    } else {
      console.warn(`Printer ${printer.printerNaam} not connected - job will be sent on reconnect`)
    }
    
    return { success: true, printJob: result.printJob, printer }
  } catch (error) {
    console.error('Error sending print job:', error)
    return { success: false, error: 'Fout bij versturen van printjob' }
  }
}

/**
 * Broadcast print job to all connected printers
 */
export async function broadcastPrintJob(data: {
  voorwerpId: number
  volgnummer: string
  klantNaam: string
  klantTelefoon?: string | null
  afdelingNaam: string
}) {
  try {
    const connectedPrinters = await getConnectedPrinters()
    
    if (connectedPrinters.length === 0) {
      console.warn('No connected printers available')
      return { success: false, error: 'Geen verbonden printers beschikbaar' }
    }
    
    const printJobs = []
    
    // Create a print job for each connected printer
    for (const printer of connectedPrinters) {
      const result = await createPrintJob({
        printerId: printer.printerId,
        voorwerpId: data.voorwerpId,
        volgnummer: data.volgnummer,
        klantNaam: data.klantNaam,
        klantTelefoon: data.klantTelefoon,
        afdelingNaam: data.afdelingNaam,
      })
      
      if (result.success) {
        printJobs.push(result.printJob)
        
        // Send to printer via WebSocket if connected
        if (printer.socketId && globalThis.printerIo) {
          try {
            globalThis.printerIo.to(printer.socketId).emit('print-job', {
              printJobId: result.printJob.printJobId,
              volgnummer: data.volgnummer,
              klantNaam: data.klantNaam,
              klantTelefoon: data.klantTelefoon,
              afdelingNaam: data.afdelingNaam,
            })
            
            // Update status to sent
            const { updatePrintJobStatus } = await import('@/lib/data/printers')
            await updatePrintJobStatus(result.printJob.printJobId, 'sent')
          } catch (emitError) {
            console.error(`Error emitting to printer ${printer.printerNaam}:`, emitError)
          }
        }
      }
    }
    
    console.log(`Broadcast ${printJobs.length} print jobs to ${connectedPrinters.length} printers`)
    
    return { success: true, printJobs, printerCount: connectedPrinters.length }
  } catch (error) {
    console.error('Error broadcasting print job:', error)
    return { success: false, error: 'Fout bij uitzenden van printjob' }
  }
}
