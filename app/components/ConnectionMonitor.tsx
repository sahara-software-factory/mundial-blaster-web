"use client"

import { useEffect, useState, useCallback } from "react"
import { useSocket } from "@/hooks/use-socket"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Wifi, WifiOff, AlertTriangle, RefreshCw, X } from "lucide-react"
import { PremiumModal } from "@/app/components/ui/modal"

interface DisconnectedLine {
  lineId: string
  nombre?: string
  phone?: string
  reason?: string
  timestamp: Date
}

export function ConnectionMonitor() {
  const { socket, isConnected: socketConnected } = useSocket()
  const router = useRouter()
  const [linesMap, setLinesMap] = useState<Record<string, any>>({})
  const [disconnected, setDisconnected] = useState<DisconnectedLine[]>([])
  const [showModal, setShowModal] = useState(false)

  const loadLines = useCallback(async () => {
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/lineas', {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store'
      })
      const data = await res.json()
      const map: Record<string, any> = {}
      data.lines?.forEach((l: any) => { map[l.id] = l })
      setLinesMap(map)
    } catch {}
  }, [])

  useEffect(() => {
    loadLines()
  }, [loadLines])

  useEffect(() => {
    if (!socket) return

    const handleStatus = (data: { lineId: string, status: string, reason?: string, phone?: string, nombre?: string }) => {
      const line = linesMap[data.lineId] || { phone: data.phone, nombre: data.nombre }
      const lineName = line?.nombre || line?.phone || data.lineId

      if (data.status === 'CONECTADA') {
        setDisconnected(prev => {
          const filtered = prev.filter(l => l.lineId !== data.lineId)
          if (filtered.length !== prev.length) {
            toast.success(`Línea reconectada`, {
              description: `${lineName} está online`,
              duration: 4000,
              icon: <Wifi size={16} className="text-emerald-400" />
            })
          }
          return filtered
        })
        return
      }

      if (data.status === 'DESCONECTADA') {
        const reasonMap: Record<string, string> = {
          'SESSION_INVALID': 'Sesión invalidada por WhatsApp',
          'LOGOUT': 'Desconexión manual',
          'DISCONNECT': 'Conexión perdida',
          'BANNED': 'Número posiblemente baneado'
        }

        const newLine: DisconnectedLine = {
          lineId: data.lineId,
          nombre: line?.nombre,
          phone: line?.phone,
          reason: reasonMap[data.reason || ''] || data.reason || 'Desconectada',
          timestamp: new Date()
        }

        setDisconnected(prev => {
          const exists = prev.some(l => l.lineId === data.lineId)
          if (exists) return prev
          return [...prev, newLine]
        })

        setShowModal(true)

        toast.error(`Línea desconectada`, {
          description: `${lineName}: ${newLine.reason}`,
          duration: 10000,
          icon: <WifiOff size={16} className="text-red-400" />,
          action: {
            label: 'Reconectar',
            onClick: () => router.push('/dashboard')
          }
        })
      }
    }

    socket.on("status", handleStatus)

    return () => {
      socket.off("status", handleStatus)
    }
  }, [socket, linesMap, router])

  const handleReconnect = () => {
    setShowModal(false)
    router.push('/dashboard')
  }

  const handleDismiss = () => {
    setShowModal(false)
  }

  const clearLine = (lineId: string) => {
    setDisconnected(prev => {
      const filtered = prev.filter(l => l.lineId !== lineId)
      if (filtered.length === 0) setShowModal(false)
      return filtered
    })
  }

  if (disconnected.length === 0 && !showModal) return null

  return (
    <PremiumModal
      open={showModal}
      onClose={handleDismiss}
      title={
        <div className="flex items-center gap-2.5 text-red-400">
          <div className="p-1.5 bg-red-500/10 rounded-lg">
            <WifiOff size={18} />
          </div>
          <span className="text-base">
            ¡Línea{disconnected.length > 1 ? 's' : ''} desconectada{disconnected.length > 1 ? 's' : ''}!
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs text-red-400 flex items-start gap-2 leading-relaxed">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              {disconnected.length === 1
                ? 'La sesión de WhatsApp se cerró. No podrás enviar mensajes hasta reconectar.'
                : `Se cerraron ${disconnected.length} sesiones de WhatsApp. No podrás enviar mensajes hasta reconectarlas.`}
            </span>
          </p>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {disconnected.map(line => (
            <div
              key={line.lineId}
              className="flex items-center justify-between p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]/60"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {line.nombre || line.phone || line.lineId}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {line.reason} · {line.timestamp.toLocaleTimeString('es-AR')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  OFFLINE
                </span>
                <button
                  onClick={() => clearLine(line.lineId)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  title="Descartar alerta"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <p className="text-[10px] text-amber-300/80 leading-relaxed">
            <strong className="text-amber-400">Precaución:</strong>{' '}
            Si la línea fue baneada por WhatsApp, esperá 24-48h antes de reconectar el mismo número.
            Si fue desconexión manual o por inactividad, podés reconectar inmediatamente escaneando el QR.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleReconnect}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Ir a reconectar
          </button>
          <button
            onClick={handleDismiss}
            className="px-5 py-3 rounded-xl bg-[var(--bg-input)] text-[var(--text-secondary)] font-bold text-sm border border-[var(--border-color)] hover:border-slate-600 transition-all"
          >
            Cerrar
          </button>
        </div>

        {!socketConnected && (
          <p className="text-[10px] text-center text-[var(--text-muted)]">
            Socket offline · Reconectando...
          </p>
        )}
      </div>
    </PremiumModal>
  )
}