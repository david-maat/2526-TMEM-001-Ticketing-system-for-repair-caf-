import { Server } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '@/types/socket'

declare global {
  var io: Server | undefined
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
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
    
    res.socket.server.io = io
    global.io = io
  } else {
    console.log('Socket.IO server already running')
  }
  
  res.end()
}

export default ioHandler
