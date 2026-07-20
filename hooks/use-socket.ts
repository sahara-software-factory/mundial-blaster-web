"use client"

import { useEffect, useState, useCallback } from "react"
import { getSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

export function useSocket() {
  const [socket] = useState<Socket>(() => getSocket())
  const [isConnected, setIsConnected] = useState(socket?.connected || false)

  useEffect(() => {
    if (!socket) return

    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // Estado inicial
    setIsConnected(socket.connected)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [socket])

  // Helper: suscribirse a un evento sin acumular listeners
  const subscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socket) return () => {}
    socket.on(event, handler)
    return () => { socket.off(event, handler) }
  }, [socket])

  return { socket, isConnected, subscribe }
}