'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | undefined

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // First, fetch the API route to initialize Socket.IO server
    fetch('/api/socketio').then(() => {
      // Then connect with Socket.IO client
      if (!socket) {
        socket = io({
          path: '/api/socketio',
        })

        socket.on('connect', () => {
          console.log('Socket connected')
          setIsConnected(true)
        })

        socket.on('disconnect', () => {
          console.log('Socket disconnected')
          setIsConnected(false)
        })
      }
    })

    return () => {
      // Don't disconnect on component unmount
      // Keep the connection alive for the session
    }
  }, [])

  return { socket, isConnected }
}
