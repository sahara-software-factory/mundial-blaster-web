"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

type UIStatus = "IDLE" | "CONNECTING" | "PENDING" | "FINISHING" | "CONECTADA" | "ERROR"

export function QRModal({
  open,
  onOpenChange,
  line,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  line: LineaWhatsApp | null
}) {
  const [uiStatus, setUiStatus] = useState<UIStatus>("IDLE")
  const [qr, setQr] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setUiStatus("IDLE")
      setQr(null)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open || !line) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL
    if (!socketUrl) {
      setError("Error de configuración del servidor")
      return
    }

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    })

    socket.on("qr", (payload) => {
      if (payload.lineId === line.id) {
        setQr(payload.qr)
        setUiStatus("PENDING")
        setError(null)
      }
    })

    socket.on("status", (payload) => {
      if (payload.lineId !== line.id) return

      if (payload.status === "CONECTADA") {
        setUiStatus("FINISHING")
        setTimeout(() => {
          setUiStatus("CONECTADA")
          setTimeout(() => {
            onOpenChange(false)
            window.location.reload()
          }, 2000)
        }, 1500)
      } else if (payload.status === "QR_EXPIRED") {
        setUiStatus("ERROR")
        setQr(null)
        setError("El código QR expiró. Reintentá.")
      } else if (payload.status === "DESCONECTADA" || payload.status === "LOGGED_OUT") {
        setUiStatus("IDLE")
        setQr(null)
      } else if (payload.status === "PENDING") {
        setUiStatus("PENDING")
      }
    })

    return () => { socket.disconnect() }
  }, [open, line, onOpenChange])

  const startConnection = async () => {
    if (!line) return
    setUiStatus("CONNECTING")
    setError(null)
    setQr(null)

    try {
      const token = localStorage.getItem('mb_token') || ''
      const res = await fetch("/api/lineas/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: line.phone }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Error al iniciar conexión")
      }
    } catch (err: any) {
      setUiStatus("ERROR")
      setError(err.message || "No se pudo contactar al servidor")
    }
  }

  if (!open || !line) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Vincular Dispositivo</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Línea: {line.phone}</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl">✕</button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center min-h-[320px]">
          
          {/* IDLE / ERROR */}
          {(uiStatus === "IDLE" || uiStatus === "ERROR") && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative h-24 w-24 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 mx-auto text-4xl">
                  {error ? "⚠️" : "📱"}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{error ? "Algo salió mal" : "Listo para conectar"}</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-[250px] mx-auto">
                  {error || "Abrí WhatsApp en tu celular y tenelo listo para escanear."}
                </p>
              </div>
              <button 
                onClick={startConnection} 
                className="bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-xl px-8 py-3 font-medium shadow-lg transition-all hover:scale-105 mx-auto"
              >
                {error ? "🔄 Reintentar" : "📡 Generar Código QR"}
              </button>
            </div>
          )}

          {/* CONNECTING */}
          {uiStatus === "CONNECTING" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-300">Contactando servidor...</p>
            </div>
          )}

          {/* PENDING QR */}
          {uiStatus === "PENDING" && qr && (
            <div className="text-center space-y-4">
              <div className="relative p-2 bg-white rounded-xl shadow-2xl mx-auto w-fit">
                <img src={qr} alt="QR WhatsApp" className="h-64 w-64 rounded-lg" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">📷 Escanea con tu celular</p>
                <p className="text-xs text-[var(--text-muted)]">WhatsApp ⋮ Dispositivos Vinculados</p>
              </div>
            </div>
          )}

          {/* FINISHING */}
          {uiStatus === "FINISHING" && (
            <div className="text-center space-y-4">
              <div className="relative h-24 w-24 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="absolute inset-0 m-auto flex items-center justify-center text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Verificando...</h3>
              <p className="text-sm text-[var(--text-secondary)]">Estableciendo conexión segura</p>
            </div>
          )}

          {/* SUCCESS */}
          {uiStatus === "CONECTADA" && (
            <div className="text-center space-y-6">
              <div className="h-28 w-28 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/10 text-5xl">
                ✅
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">¡Conectado!</h3>
                <p className="text-[var(--text-secondary)]">Tu línea está lista para enviar.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}