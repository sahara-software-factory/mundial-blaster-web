"use client"

import { useEffect, useState, useCallback } from "react"
import { io } from "socket.io-client"
import { 
  Smartphone, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  ShieldCheck, 
  ScanLine, 
  X,
  ChevronRight,
  Signal
} from "lucide-react"

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

type UIStatus = "IDLE" | "CONNECTING" | "PENDING" | "FINISHING" | "CONECTADA" | "ERROR"

const CONNECTING_STEPS = [
  "Conectando con WhatsApp...",
  "Recibiendo información del servidor...",
  "Generando sesión segura...",
  "Solicitando código QR...",
]

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
  const [connectStep, setConnectStep] = useState(0)

  useEffect(() => {
    if (open) {
      setUiStatus("IDLE")
      setQr(null)
      setError(null)
      setConnectStep(0)
    }
  }, [open])

  // Rotar textos durante CONNECTING
  useEffect(() => {
    if (uiStatus !== "CONNECTING") return
    const interval = setInterval(() => {
      setConnectStep(prev => (prev + 1) % CONNECTING_STEPS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [uiStatus])

  useEffect(() => {
    if (!open || !line) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL
    if (!socketUrl) {
      setError("Error de configuración del servidor")
      return
    }

    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('mb_token') || '') 
      : ''
    
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
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
          }, 2500)
        }, 2000)
      } else if (payload.status === "QR_EXPIRED") {
        setUiStatus("ERROR")
        setQr(null)
        setError("El código QR expiró. Generá uno nuevo.")
      } else if (payload.status === "DESCONECTADA" || payload.status === "LOGGED_OUT") {
        setUiStatus("IDLE")
        setQr(null)
      } else if (payload.status === "PENDING") {
        setUiStatus("PENDING")
      }
    })

    return () => { socket.disconnect() }
  }, [open, line, onOpenChange])

  const startConnection = useCallback(async () => {
    if (!line) return
    setUiStatus("CONNECTING")
    setError(null)
    setQr(null)
    setConnectStep(0)

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
  }, [line])

  if (!open || !line) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-white/[0.06] flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">Vincular WhatsApp</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {line.nombre} · <span className="text-slate-500">{line.phone}</span>
            </p>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative p-8 flex flex-col items-center justify-center min-h-[380px]">
          
          {/* ========== IDLE ========== */}
          {uiStatus === "IDLE" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-28 w-28 bg-[#1e293b] rounded-2xl flex items-center justify-center border border-white/[0.08] shadow-xl">
                  <Smartphone size={48} className="text-blue-400" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#0f172a] rounded-xl flex items-center justify-center border border-white/[0.08] shadow-lg">
                  <Wifi size={18} className="text-emerald-400" />
                </div>
              </div>
              
              <div className="space-y-3 max-w-[280px]">
                <h3 className="text-xl font-bold text-white">Listo para conectar</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Abrí WhatsApp en tu celular y mantenelo cerca. La conexión es segura y encriptada.
                </p>
              </div>

              <button 
                onClick={startConnection} 
                className="group relative flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                <ScanLine size={20} className="transition-transform group-hover:rotate-12" />
                Generar Código QR
                <ChevronRight size={16} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* ========== CONNECTING ========== */}
          {uiStatus === "CONNECTING" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300">
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 m-auto flex items-center justify-center">
                  <Loader2 size={32} className="text-blue-400 animate-spin" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white min-h-[28px]">
                  {CONNECTING_STEPS[connectStep]}
                </h3>
                <div className="flex items-center justify-center gap-1.5">
                  {[0, 1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i <= connectStep ? 'w-6 bg-blue-400' : 'w-1.5 bg-slate-700'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Esto puede tardar unos segundos</p>
              </div>
            </div>
          )}

          {/* ========== PENDING QR ========== */}
          {uiStatus === "PENDING" && qr && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="relative p-4 bg-white rounded-2xl shadow-2xl shadow-white/10">
                <div className="absolute -inset-1 bg-blue-500/20 rounded-3xl blur-lg animate-pulse" />
                <img 
                  src={qr} 
                  alt="QR WhatsApp" 
                  className="relative h-56 w-56 rounded-xl" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Signal size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Esperando escaneo</span>
                </div>
                <h3 className="text-lg font-bold text-white">Escaneá con tu celular</h3>
                <p className="text-sm text-slate-400">
                  WhatsApp <ChevronRight size={12} className="inline" /> Menú <ChevronRight size={12} className="inline" /> Dispositivos vinculados
                </p>
              </div>
            </div>
          )}

          {/* ========== FINISHING ========== */}
          {uiStatus === "FINISHING" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300">
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-full w-full bg-[#1e293b] rounded-full flex items-center justify-center border border-emerald-500/30 shadow-xl">
                  <ShieldCheck size={48} className="text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">Verificando sesión...</h3>
                <p className="text-sm text-slate-400">Estableciendo conexión segura con Meta</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* ========== CONECTADA ========== */}
          {uiStatus === "CONECTADA" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative h-28 w-28 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/40 shadow-2xl">
                  <CheckCircle2 size={56} className="text-emerald-400" strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">¡Conectado!</h3>
                <p className="text-sm text-slate-400">Tu línea está activa y lista para enviar</p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Sesión activa</span>
              </div>
            </div>
          )}

          {/* ========== ERROR ========== */}
          {uiStatus === "ERROR" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in shake duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                <div className="relative h-28 w-28 bg-[#1e293b] rounded-2xl flex items-center justify-center border border-red-500/20 shadow-xl">
                  <AlertTriangle size={48} className="text-red-400" strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-3 max-w-[280px]">
                <h3 className="text-xl font-bold text-white">Algo salió mal</h3>
                <p className="text-sm text-red-400/80 leading-relaxed">
                  {error || "No se pudo establecer la conexión. Intentá de nuevo."}
                </p>
              </div>

              <button 
                onClick={startConnection} 
                className="group flex items-center gap-2 bg-[#1e293b] hover:bg-red-500/10 border border-white/[0.08] hover:border-red-500/30 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02]"
              >
                <RefreshCw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
                Reintentar conexión
              </button>
            </div>
          )}

        </div>

        {/* Footer hint */}
        <div className="relative p-4 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={12} />
            <span>Conexión encriptada de extremo a extremo</span>
          </div>
        </div>
      </div>
    </div>
  )
}