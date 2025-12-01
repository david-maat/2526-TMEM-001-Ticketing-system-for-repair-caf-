import type { Server as HTTPServer } from 'http'
import type { NextApiResponse } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO
}

// Printer WebSocket event types
export interface PrintJobData {
  printJobId: number
  volgnummer: string
  klantType: string
  afdelingNaam: string
  voorwerpBeschrijving?: string | null
  klachtBeschrijving?: string | null
  printData?: {
    type?: 'registration' | 'delivery'
    materials?: Array<{
      naam: string
      aantal: number
      prijs: number
    }>
    subtotal?: number
    totalPrice?: number
  } | null
}

export interface PrinterRegistrationData {
  printerNaam: string
}

export interface PrintCompletedData {
  printJobId: number
}

export interface PrintFailedData {
  printJobId: number
  errorMessage?: string
}

// Global printer IO instance
declare global {
  var printerIo: IOServer | undefined
}
