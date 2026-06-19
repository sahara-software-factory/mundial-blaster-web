import { io, Socket } from "socket.io-client"

let globalSocket: Socket | null = null

const SOCKET_URL = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost'
      ? (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:8080')
      : (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ''))
  : ''

export function getSocket(): Socket {
  if (!globalSocket && SOCKET_URL) {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('mb_token') || localStorage.getItem('wabisend_token') || '') 
      : ''
    globalSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: { token }, // ← 🔒 Token enviado en handshake
    })
    console.log("🟢 WabiSend socket creado")
  }
  return globalSocket!
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}