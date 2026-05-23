"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { QRModal } from "./components/qr-modal"
import { useRouter } from "next/navigation"
import { useLicense } from "@/hooks/useLicense"
import { useUser } from "@/hooks/useUser"
import { useAuth } from "@/hooks/useAuth"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

export default function Dashboard() {
const router = useRouter()
const { license, loading: licenseLoading, checked: licenseChecked, isActive } = useLicense()
const { user, loading: authLoading, checked: authChecked, isAuthenticated, logout } = useAuth()

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
const [showSettings, setShowSettings] = useState(false)

  // 🔥 CADENA DE REDIRECCIÓN
useEffect(() => {
  if (!licenseLoading && licenseChecked) {
    if (!isActive) {
      router.push("/setup")
    } else if (!authLoading && authChecked && !isAuthenticated) {
      router.push("/login")  // ← ANTES DECÍA "/onboarding"
    }
  }
}, [licenseLoading, authLoading, licenseChecked, authChecked, isActive, isAuthenticated, router])

// Cargar líneas al entrar
useEffect(() => {
  if (isActive && isAuthenticated) {
    fetchLines()
  }
}, [isActive, isAuthenticated])
  // Socket connection
  useEffect(() => {
    if (!SOCKET_URL || !isActive) return
    const socket = io(SOCKET_URL)
    socket.on("connect", () => setSocketConnected(true))
    socket.on("disconnect", () => setSocketConnected(false))
    return () => { socket.disconnect() }
  }, [isActive])

  // Spinner mientras carga licencia O usuario
 if (licenseLoading || authLoading || !licenseChecked || !authChecked) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

if (!isActive) return null
if (!isAuthenticated) return null  // ← ANTES DECÍA !hasUser

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
    fetch("/api/lineas/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: line.phone }),
    }).catch(console.error)
  }

  const logoutLine = async (lineId: string) => {
    if (!confirm("¿Seguro que querés desconectar esta línea?")) return
    try {
      const res = await fetch("/api/lineas/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId }),
      })
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

  // RENDER
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      {/* HEADER */}
<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
        MB
      </div>
      <h1 className="text-xl font-bold text-white">Mundial Blaster</h1>
      {license?.label && (
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
          {license.label}
        </span>
      )}
    </div>
    
    <div className="flex items-center gap-3">
      {/* Avatar + Nombre */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-lg">
          {user?.avatar === 'avatar1' && '👤'}
          {user?.avatar === 'avatar2' && '🧑‍💼'}
          {user?.avatar === 'avatar3' && '👩‍💻'}
          {user?.avatar === 'avatar4' && '🦸'}
          {user?.avatar === 'avatar5' && '🧙'}
          {user?.avatar === 'avatar6' && '🤖'}
          {user?.avatar === 'avatar7' && '👽'}
          {user?.avatar === 'avatar8' && '🎩'}
          {user?.avatar === 'avatar9' && '🦁'}
          {user?.avatar === 'avatar10' && '🐺'}
          {!user?.avatar && '👤'}
        </div>
        <span className="text-sm text-slate-300 hidden sm:block">{user?.nombre}</span>
      </div>

      {/* Botón Settings */}
      <button 
        onClick={() => setShowSettings(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        title="Configuración"
      >
        ⚙️
      </button>

      {/* Botón Logout */}
      <button 
        onClick={logout}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Cerrar sesión"
      >
        🚪
      </button>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Líneas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Líneas WhatsApp</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                + Agregar
              </button>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {lines.map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setSelectedLine(line)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedLine?.id === line.id 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white text-sm">{line.nombre}</p>
                        <p className="text-xs text-slate-500 font-mono">{line.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor(line.status)}`}>
                        {line.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {line.status !== "CONECTADA" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openQrForLine(line) }}
                          className="text-xs px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded border border-emerald-600/30 hover:bg-emerald-600/30"
                        >
                          Conectar
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); logoutLine(line.id) }}
                        className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded border border-red-600/30 hover:bg-red-600/30"
                      >
                        Desconectar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {lines.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No hay líneas. Agregá una para empezar.
                </div>
              )}
            </div>
          </div>

          {/* Info de licencia */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-white text-sm mb-2">Tu Plan</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Plan</span>
                <span className="text-white">{license?.label || "-"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Líneas</span>
                <span className="text-white">{lines.length} / {license?.maxLines || 1}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spintax</span>
                <span className={license?.features?.spintax ? "text-emerald-400" : "text-slate-600"}>
                  {license?.features?.spintax ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Agendamiento</span>
                <span className={license?.features?.scheduling ? "text-emerald-400" : "text-slate-600"}>
                  {license?.features?.scheduling ? "✅" : "❌"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel central: Campaña */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">📤 Nueva Campaña</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Línea seleccionada</label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  {selectedLine ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{selectedLine.nombre}</span>
                      <span className="text-xs text-slate-500">{selectedLine.phone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600 text-sm">Seleccioná una línea del panel izquierdo</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Números (uno por línea)</label>
                <textarea
                  value={numbersText}
                  onChange={e => setNumbersText(e.target.value)}
                  placeholder="5491123456789&#10;5491165432109&#10;..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {numbersText.split("\n").filter(Boolean).length} números detectados
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Mensaje</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Hola {{nombre}}, te escribo de..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">URL de imagen (opcional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://tusitio.com/imagen.jpg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Delay mínimo (ms)</label>
                  <input
                    type="number"
                    value={delayMin}
                    onChange={e => setDelayMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Delay máximo (ms)</label>
                  <input
                    type="number"
                    value={delayMax}
                    onChange={e => setDelayMax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={sendCampaign}
                disabled={isSending || !selectedLine}
                className={`w-full font-bold py-3 rounded-xl transition-all ${
                  isSending || !selectedLine
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
                }`}
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Enviando...
                  </span>
                ) : (
                  "🚀 Disparar Campaña"
                )}
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-white text-sm mb-2">📋 Logs</h3>
            <div className="bg-slate-950 rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <span className="text-slate-700">Esperando acciones...</span>
              ) : (
                logs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      log.includes("✅") ? "text-emerald-400" : 
                      log.includes("❌") ? "text-red-400" : 
                      log.includes("🚀") ? "text-blue-400" : "text-slate-400"
                    }`}
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal agregar línea */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-white mb-4">Agregar Línea</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Número (con código país)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="5491123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nombre (opcional)</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Línea Principal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addLine}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      {/* MODAL SETTINGS */}
<AnimatePresence>
  {showSettings && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">⚙️ Configuración</h3>
          <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          const token = localStorage.getItem('mb_token')
          
          try {
            const res = await fetch("/api/auth/me", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                nombre: form.get("nombre"),
                email: form.get("email"),
                current_password: form.get("current_password") || undefined,
                new_password: form.get("new_password") || undefined,
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            alert("✅ Perfil actualizado")
            setShowSettings(false)
          } catch (err: any) {
            alert("❌ " + err.message)
          }
        }} className="space-y-4">
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre</label>
            <input name="nombre" defaultValue={user?.nombre || ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input name="email" type="email" defaultValue={user?.email || ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 mb-3">Cambiar contraseña (opcional)</p>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña actual</label>
              <input name="current_password" type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mt-3">
              <label className="block text-sm text-slate-400 mb-1">Nueva contraseña</label>
              <input name="new_password" type="password" minLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
            Guardar cambios
          </button>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
     <QRModal 
          open={qrModalOpen} 
          onOpenChange={(v) => {
            setQrModalOpen(v)
            if (!v) setQrTargetLine(null)
          }} 
          line={qrTargetLine} 
        />
    </div>
  )
}