"use client"

import { useEffect, useState, useCallback } from "react"
import { useSocket } from "@/hooks/use-socket"
import {
  Smartphone,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wifi,
  ShieldCheck,
  ScanLine,
  X,
  ChevronRight,
  Signal,
  KeyRound
} from "lucide-react"

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

type UIStatus = "IDLE" | "CONNECTING" | "PENDING" | "PENDING_CODE" | "FINISHING" | "CONECTADA" | "ERROR"

const CONNECTING_STEPS = [
  "Conectando con WhatsApp...",
  "Recibiendo información del servidor...",
  "Generando sesión segura...",
  "Esperando código de vinculación...",
]

const SOCKET_URL = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost'
      ? (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:8080')
      : (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ''))
  : ''

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
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [method, setMethod] = useState<"qr" | "code">("qr")
  const [error, setError] = useState<string | null>(null)
  const [connectStep, setConnectStep] = useState(0)
  const { socket } = useSocket()

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setUiStatus("IDLE")
      setQr(null)
      setPairingCode(null)
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

  // 🔄 POLLING HÍBRIDO: fallback si el socket falla
  useEffect(() => {
    if (!open || !line) return
    if (uiStatus === "CONECTADA" || uiStatus === "FINISHING") return

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('mb_token') || ''
        const res = await fetch(`/api/lineas/${line.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        })
        if (!res.ok) return
        const data = await res.json()

        if (data.status === 'CONECTADA') {
          setUiStatus("FINISHING")
          setTimeout(() => {
            setUiStatus("CONECTADA")
            setTimeout(() => {
              onOpenChange(false)
            }, 2500)
          }, 2000)
        }
      } catch {}
    }, 2500)

    return () => clearInterval(interval)
  }, [open, line, uiStatus, onOpenChange])

  // 📡 Socket listeners
  useEffect(() => {
    if (!open || !line || !socket) return

    const handleQr = (payload: any) => {
      if (payload.lineId === line.id) {
        setQr(payload.qr)
        setUiStatus("PENDING")
        setError(null)
      }
    }

    const handlePairingCode = (payload: any) => {
      if (payload.lineId === line.id) {
        setPairingCode(payload.code)
        setUiStatus("PENDING_CODE")
        setError(null)
      }
    }

    const handleStatus = (payload: any) => {
      if (payload.lineId !== line.id) return

      if (payload.status === "CONECTADA") {
        setUiStatus("FINISHING")
        setTimeout(() => {
          setUiStatus("CONECTADA")
          setTimeout(() => {
            onOpenChange(false)
          }, 2500)
        }, 2000)
      } else if (payload.status === "QR_EXPIRED") {
        setUiStatus("ERROR")
        setQr(null)
        setError("El código QR expiró. Generá uno nuevo.")
      } else if (payload.status === "DESCONECTADA" || payload.status === "LOGGED_OUT") {
        // Si estábamos esperando QR/código y la sesión murió → avisar
        if (uiStatus === "PENDING" || uiStatus === "PENDING_CODE" || uiStatus === "CONNECTING") {
          setUiStatus("ERROR")
          setQr(null)
          setPairingCode(null)
          setError(
            payload.reason === "SESSION_INVALID"
              ? "La sesión fue invalidada por WhatsApp. Generá un código nuevo."
              : "La conexión se interrumpió. Intentá de nuevo."
          )
        } else {
          setUiStatus("IDLE")
          setQr(null)
          setPairingCode(null)
        }
      } else if (payload.status === "PENDING") {
        setUiStatus("PENDING")
      }
    }

    socket.on("qr", handleQr)
    socket.on("pairing_code", handlePairingCode)
    socket.on("status", handleStatus)

    return () => {
      socket.off("qr", handleQr)
      socket.off("pairing_code", handlePairingCode)
      socket.off("status", handleStatus)
    }
  }, [open, line, socket, onOpenChange, uiStatus])

  const startConnection = useCallback(async (force: boolean) => {
    if (!line) return
    if (uiStatus === "CONNECTING" || uiStatus === "PENDING" || uiStatus === "PENDING_CODE") return
    setUiStatus("CONNECTING")
    setError(null)
    setQr(null)
    setPairingCode(null)
    setConnectStep(0)

    try {
      const token = localStorage.getItem('mb_token') || ''
      const res = await fetch("/api/lineas/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: line.phone, force, method }),  // ← force variable
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Error al iniciar conexión")
      }
    } catch (err: any) {
      setUiStatus("ERROR")
      setError(err.message || "No se pudo contactar al servidor")
    }
  }, [line, method, uiStatus])

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
            <div className="flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
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

              {/* Selector de método */}
              <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                {(["qr", "code"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      method === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === "qr" ? <ScanLine size={13} /> : <KeyRound size={13} />}
                    {m === "qr" ? "Código QR" : "Código de 8 dígitos"}
                  </button>
                ))}
              </div>

              {/* Intento suave: NO borra la sesión */}
<button
  onClick={() => startConnection(false)}
  className="group relative flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
>
  <RefreshCw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
  Reconectar sesión
</button>

{/* Generar código nuevo: borra la sesión */}
<button
  onClick={() => startConnection(true)}
  className="group flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-all"
>
  {method === "qr" ? <ScanLine size={15} /> : <KeyRound size={15} />}
  {method === "qr" ? "Generar QR nuevo" : "Generar código nuevo"}
  <ChevronRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
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
                  WhatsApp <ChevronRight size={12} className="inline" /> Dispositivos vinculados <ChevronRight size={12} className="inline" /> Vincular dispositivo
                </p>
              </div>
            </div>
          )}

          {/* ========== PENDING CODE (pairing code) ========== */}
          {uiStatus === "PENDING_CODE" && pairingCode && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 bg-white/[0.04] rounded-2xl border border-white/[0.08]">
                <span className="text-4xl font-mono font-bold tracking-[0.3em] text-white">
                  {pairingCode}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Signal size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Esperando vinculación</span>
                </div>
                <h3 className="text-lg font-bold text-white">Ingresá el código en tu celular</h3>
                <p className="text-sm text-slate-400 max-w-[300px]">
                  WhatsApp <ChevronRight size={12} className="inline" /> Dispositivos vinculados <ChevronRight size={12} className="inline" /> <span className="text-white font-medium">Vincular con número de teléfono</span>
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
                onClick={() => startConnection(true)}
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