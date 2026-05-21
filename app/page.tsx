"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { QRModal } from "./components/qr-modal"
import { useRouter } from "next/navigation"
import { useLicense } from "@/hooks/useLicense"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

export default function Dashboard() {
  const router = useRouter()
  const { license, loading, checked, isActive } = useLicense()

  // 🔥 TODOS los useEffect VAN PRIMERO, antes de cualquier return condicional
  useEffect(() => {
    console.log("[Dashboard] checked:", checked, "isActive:", isActive)
    if (checked && !isActive) {
      console.log("[Dashboard] No license, redirecting to /setup")
      router.push("/setup")
    }
  }, [checked, isActive, router])

  useEffect(() => {
    if (checked && isActive) {
      console.log("[Dashboard] Fetching lines...")
      fetchLines()
    }
  }, [checked, isActive])

  useEffect(() => {
    if (!SOCKET_URL || !checked || !isActive) return
    const socket = io(SOCKET_URL, { transports: ["websocket"] })
    socket.on("connect", () => setSocketConnected(true))
    socket.on("disconnect", () => setSocketConnected(false))
    socket.on("status", (payload: any) => {
      if (payload.status === "CONECTADA") fetchLines()
    })
    return () => { socket.disconnect() }
  }, [checked, isActive])

  // Estados del dashboard
  const [lines, setLines] = useState<LineaWhatsApp[]>([])
  const [selectedLine, setSelectedLine] = useState<LineaWhatsApp | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrTargetLine, setQrTargetLine] = useState<LineaWhatsApp | null>(null)
  const [numbersText, setNumbersText] = useState("")
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [delayMin, setDelayMin] = useState(4000)
  const [delayMax, setDelayMax] = useState(12000)
  const [isSending, setIsSending] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPhone, setNewPhone] = useState("")
  const [newName, setNewName] = useState("")

  // Mientras carga o no chequeó todavía, mostramos spinner
  if (loading || !checked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Si no hay licencia, no renderizamos nada (ya se redirigió)
  if (!isActive) return null

  // Funciones
  const fetchLines = async () => {
    try {
      const res = await fetch("/api/lineas")
      const data = await res.json()
      if (data.lines) setLines(data.lines)
    } catch (e) {
      console.error("Error cargando líneas:", e)
    }
  }

  const addLine = async () => {
    if (!newPhone.trim()) return alert("Escribí el número de la línea")
    try {
      const res = await fetch("/api/lineas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim(), nombre: newName.trim() || "Nueva Línea" }),
      })
      const data = await res.json()
      if (data.success && data.line) {
        setShowAddModal(false)
        setNewPhone("")
        setNewName("")
        await fetchLines()
        setQrTargetLine(data.line)
        setQrModalOpen(true)
      } else {
        alert(data.error || "Error creando línea")
      }
    } catch (e) {
      alert("Error de red")
    }
  }

  const openQrForLine = (line: LineaWhatsApp) => {
    setQrTargetLine(line)
    setQrModalOpen(true)
    fetch("/api/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: line.phone }),
    }).catch(console.error)
  }

  const logoutLine = async (lineId: string) => {
    if (!confirm("¿Seguro que querés desconectar esta línea?")) return
    try {
      const res = await fetch(`/api/lineas/${lineId}`, { method: "DELETE" })
      if (res.ok) {
        fetchLines()
        if (selectedLine?.id === lineId) setSelectedLine(null)
      } else {
        alert("Error al desconectar")
      }
    } catch (e) {
      alert("Error de red al desconectar")
    }
  }

  const sendCampaign = async () => {
    if (!selectedLine) return alert("Seleccioná una línea primero")
    const rawNumbers = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
    const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ""), name: "" }))
    if (targets.length === 0) return alert("No hay números válidos")

    setIsSending(true)
    setLogs([`🚀 Iniciando campaña: ${targets.length} números...`])

    try {
      const res = await fetch("/api/campaign/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineId: selectedLine.id,
          targets,
          message,
          imageUrl: imageUrl || undefined,
          delayMin,
          delayMax,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setLogs(prev => [...prev, `✅ Campaña ${data.campaignId} disparada`, `📊 Total: ${data.total} números`, `⏳ Procesando en servidor...`])
      } else {
        setLogs(prev => [...prev, `❌ Error: ${data.error}`])
      }
    } catch (e) {
      setLogs(prev => [...prev, `❌ Error de red`])
    } finally {
      setIsSending(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === "CONECTADA") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    if (status === "PENDING") return "bg-amber-500/20 text-amber-400 border-amber-500/50"
    return "bg-red-500/20 text-red-400 border-red-500/50"
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mundial Blaster</h1>
              <p className="text-xs text-slate-400">Beta Edition — Envío masivo WhatsApp</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${socketConnected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
            {socketConnected ? "● Socket Online" : "● Socket Offline"}
          </div>
        </div>

        {/* Líneas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Líneas WhatsApp
            </h2>
            <div className="flex gap-2">
              <button onClick={fetchLines} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
                🔄 Refrescar
              </button>
              <button onClick={() => setShowAddModal(true)} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors text-white font-medium">
                ➕ Agregar Línea
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {lines.length === 0 && (
              <p className="text-slate-500 text-sm">No hay líneas registradas. Agregá una con el botón de arriba.</p>
            )}
            {lines.map(line => (
              <div key={line.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${selectedLine?.id === line.id ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-800 bg-slate-950"}`}>
                <div className="space-y-1">
                  <p className="font-mono text-white font-semibold">{line.phone}</p>
                  <p className="text-xs text-slate-400">{line.nombre}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusColor(line.status)}`}>
                    {line.status === "CONECTADA" ? "🟢 ONLINE" : line.status === "PENDING" ? "🟡 PENDIENTE" : "🔴 OFFLINE"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {line.status !== "CONECTADA" && (
                    <button onClick={() => openQrForLine(line)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                      📷 Conectar QR
                    </button>
                  )}
                  {line.status === "CONECTADA" && (
                    <button onClick={() => setSelectedLine(line)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedLine?.id === line.id ? "bg-emerald-600 border-emerald-500 text-white" : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"}`}>
                      {selectedLine?.id === line.id ? "✓ Usando esta" : "Usar esta"}
                    </button>
                  )}
                  <button onClick={() => logoutLine(line.id)} className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-colors text-sm">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Agregar Línea */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-blue-500 rounded-2xl p-6 space-y-4 w-full max-w-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Agregar Nueva Línea</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Número de WhatsApp (sin + ni espacios)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="5491123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre (opcional)</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej: Línea Principal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={addLine}
                  disabled={!newPhone.trim()}
                  className={`w-full h-12 rounded-xl font-bold transition-all ${!newPhone.trim() ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                >
                  💾 Guardar y Generar QR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Modal */}
        <QRModal 
          open={qrModalOpen} 
          onOpenChange={(v) => {
            setQrModalOpen(v)
            if (!v) setQrTargetLine(null)
          }} 
          line={qrTargetLine} 
        />

        {/* Campaña */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            Nueva Campaña
          </h2>

          {selectedLine ? (
            <div className="inline-block px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium">
              📱 Usando: {selectedLine.phone}
            </div>
          ) : (
            <div className="inline-block px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium">
              ⚠️ Seleccioná una línea arriba
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Números de destino (uno por línea)</label>
            <textarea
              value={numbersText}
              onChange={e => setNumbersText(e.target.value)}
              placeholder="5491123456789&#10;5491165432198&#10;5491176543210"
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-y"
            />
            <p className="text-xs text-slate-500">{numbersText.split("\n").filter(Boolean).length} números detectados</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hola! Tenemos una promo imperdible para el mundial..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">URL de imagen (opcional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://i.imgur.com/tu-imagen.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500">Debe ser una URL pública. Si no tenés, dejá vacío.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Delay mínimo (ms)</label>
              <input type="number" value={delayMin} onChange={e => setDelayMin(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Delay máximo (ms)</label>
              <input type="number" value={delayMax} onChange={e => setDelayMax(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Delay aleatorio entre mensajes para evitar detección. Recomendado: 4000-12000ms.</p>

          <button
            onClick={sendCampaign}
            disabled={isSending || !selectedLine}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${isSending || !selectedLine ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.01] active:scale-[0.99]"}`}
          >
            {isSending ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>DISPARANDO...</span> : <span className="flex items-center justify-center gap-2">🚀 DISPARAR CAMPAÑA</span>}
          </button>

          {logs.length > 0 && (
            <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
              {logs.map((l, i) => (
                <div key={i} className={`${l.startsWith("✅") ? "text-emerald-400" : l.startsWith("❌") ? "text-red-400" : l.startsWith("🚀") ? "text-blue-400" : "text-slate-400"}`}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}