"use client"

import { useEffect, useState } from "react"
import { getSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

export function useSocket() {
  const [socket] = useState<Socket>(() => getSocket())
  const [isConnected, setIsConnected] = useState(socket?.connected || false)

  useEffect(() => {
    if (!socket) return

    function onConnect() {
      setIsConnected(true)
      console.log("🟢 Socket conectado")
    }

    function onDisconnect() {
      setIsConnected(false)
      console.log("🔴 Socket desconectado")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    setIsConnected(socket.connected)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [socket])

  return { socket, isConnected }
}