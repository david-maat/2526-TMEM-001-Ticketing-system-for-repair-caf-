import { Server } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '@/types/socket'
import { prisma } from '@/lib/prisma'

declare global {
  // eslint-disable-next-line no-var
  var printerIo: Server | undefined
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const printerIoHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Initialize Socket.IO server if not already done
  if (!globalThis.printerIo) {
    console.log('Setting up Printer Socket.IO server...')

    const io = new Server(res.socket.server, {
      path: '/api/printer-socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    // Store printer connections
    const printerConnections = new Map<string, string>() // socketId -> printerNaam

    io.on('connection', async (socket) => {
      console.log('Printer client connected:', socket.id)

      // Register printer
      socket.on('register-printer', async (data: { printerNaam: string }) => {
        try {
          const { printerNaam } = data

          if (!printerNaam) {
            socket.emit('error', { message: 'Printer naam is verplicht' })
            return
          }

          // Update or create printer in database
          const printer = await prisma.printer.upsert({
            where: { printerNaam },
            update: {
              socketId: socket.id,
              isConnected: true,
              lastConnected: new Date(),
            },
            create: {
              printerNaam,
              socketId: socket.id,
              isConnected: true,
              lastConnected: new Date(),
            },
          })

          printerConnections.set(socket.id, printerNaam)

          socket.emit('printer-registered', {
            printerId: printer.printerId,
            printerNaam: printer.printerNaam
          })

          console.log(`Printer registered: ${printerNaam} (ID: ${printer.printerId})`)

          // Send pending print jobs for this printer
          const pendingJobs = await prisma.printJob.findMany({
            where: {
              printerId: printer.printerId,
              status: 'pending',
            },
            include: {
              voorwerp: {
                include: {
                  klant: {
                    include: {
                      klantType: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          })

          if (pendingJobs.length > 0) {
            console.log(`Sending ${pendingJobs.length} pending jobs to ${printerNaam}`)
            for (const job of pendingJobs) {
              socket.emit('print-job', {
                printJobId: job.printJobId,
                volgnummer: job.volgnummer,
                klantType: job.voorwerp.klant.klantType.naam,
                afdelingNaam: job.afdelingNaam,
                voorwerpBeschrijving: job.voorwerp.voorwerpBeschrijving,
                klachtBeschrijving: job.voorwerp.klachtBeschrijving,
                printData: job.printData,
              })

              // Update job status to sent
              await prisma.printJob.update({
                where: { printJobId: job.printJobId },
                data: {
                  status: 'sent',
                  sentAt: new Date(),
                },
              })
            }
          }
        } catch (error) {
          console.error('Error registering printer:', error)
          socket.emit('error', { message: 'Fout bij registreren van printer' })
        }
      })

      // Handle print job completion
      socket.on('print-completed', async (data: { printJobId: number }) => {
        try {
          const { printJobId } = data

          if (!printJobId) {
            socket.emit('error', { message: 'Print job ID is verplicht' })
            return
          }

          // Update print job status
          const updatedJob = await prisma.printJob.update({
            where: { printJobId },
            data: {
              status: 'completed',
              completedAt: new Date(),
            },
          })

          socket.emit('print-ack', {
            printJobId,
            status: 'completed'
          })

          console.log(`Print job ${printJobId} completed`)

          // Notify all connected clients about the completion
          io.emit('print-status-update', {
            printJobId,
            status: 'completed',
            volgnummer: updatedJob.volgnummer,
          })
        } catch (error) {
          console.error('Error marking print as completed:', error)
          socket.emit('error', { message: 'Fout bij markeren als voltooid' })
        }
      })

      // Handle print job failure
      socket.on('print-failed', async (data: { printJobId: number; errorMessage?: string }) => {
        try {
          const { printJobId, errorMessage } = data

          if (!printJobId) {
            socket.emit('error', { message: 'Print job ID is verplicht' })
            return
          }

          // Update print job status
          const updatedJob = await prisma.printJob.update({
            where: { printJobId },
            data: {
              status: 'failed',
              errorMessage: errorMessage || 'Onbekende fout',
            },
          })

          socket.emit('print-ack', {
            printJobId,
            status: 'failed'
          })

          console.log(`Print job ${printJobId} failed: ${errorMessage}`)

          // Notify all connected clients about the failure
          io.emit('print-status-update', {
            printJobId,
            status: 'failed',
            volgnummer: updatedJob.volgnummer,
            errorMessage,
          })
        } catch (error) {
          console.error('Error marking print as failed:', error)
          socket.emit('error', { message: 'Fout bij markeren als mislukt' })
        }
      })

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log('Printer client disconnected:', socket.id)

        const printerNaam = printerConnections.get(socket.id)

        if (printerNaam) {
          try {
            // Update printer status in database
            await prisma.printer.update({
              where: { printerNaam },
              data: {
                isConnected: false,
                socketId: null,
              },
            })

            printerConnections.delete(socket.id)
            console.log(`Printer disconnected: ${printerNaam}`)
          } catch (error) {
            console.error('Error updating printer disconnect status:', error)
          }
        }
      })
    })

    globalThis.printerIo = io

    console.log('Printer Socket.IO server setup complete')
  }

  // Let Socket.IO engine handle the request
  if (globalThis.printerIo) {
    // @ts-ignore - Socket.IO engine handles HTTP requests internally
    globalThis.printerIo.engine.handleRequest(req, res)
  } else {
    res.status(503).end('Socket.IO not initialized')
  }
}

export default printerIoHandler
