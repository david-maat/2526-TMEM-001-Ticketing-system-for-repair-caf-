import { Server } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '@/types/socket'

declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Initialize Socket.IO server if not already done
  if (!globalThis.io) {
    console.log('Setting up Socket.IO server...')
    
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
    
    globalThis.io = io
    console.log('Socket.IO server setup complete')
  }
  
  // Let Socket.IO engine handle the request
  if (globalThis.io) {
    // @ts-ignore - Socket.IO engine handles HTTP requests internally
    globalThis.io.engine.handleRequest(req, res)
  } else {
    res.status(503).end('Socket.IO not initialized')
  }
}

export default ioHandler
