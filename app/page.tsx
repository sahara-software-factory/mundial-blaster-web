"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { toast } from "sonner"
import { 
  Send, 
  Plus, 
  QrCode, 
  Power, 
  Trash2, 
  Play, 
  Image as ImageIcon,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  Edit3,      // ← NUEVO
  Tag,        // ← NUEVO
  Zap,
  RotateCcw
} from "lucide-react"
import { QRModal } from "./components/qr-modal"
import { useRouter } from "next/navigation"
import { useLicense } from "@/hooks/useLicense"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "./components/ui/sidebar"
import { PremiumModal } from "./components/ui/modal"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

interface LineaWhatsApp {
  id: string
  phone: string
  nombre: string
  status: string
}

interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
}

interface TagItem {
  id: string
  name: string
  color: string
}

type TabType = "plan" | "lines" | "campaign" | "logs"

export default function Dashboard() {
  const router = useRouter()
  const { license, loading: licenseLoading, checked: licenseChecked, isActive } = useLicense()
  const { user, loading: authLoading, checked: authChecked, isAuthenticated, logout } = useAuth()

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>("plan")
  
  // Líneas
  const [lines, setLines] = useState<LineaWhatsApp[]>([])
  const [selectedLine, setSelectedLine] = useState<LineaWhatsApp | null>(null)
  
  // QR
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrTargetLine, setQrTargetLine] = useState<LineaWhatsApp | null>(null)
  
  // Campaña
  const [numbersText, setNumbersText] = useState("")
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [delayMin, setDelayMin] = useState(4000)
  const [delayMax, setDelayMax] = useState(12000)
  const [isSending, setIsSending] = useState(false)
  const [numberSource, setNumberSource] = useState<"manual" | "contacts" | "tag">("manual")  // ← NUEVO
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)               // ← NUEVO
  
  // Contactos + Tags (para campaña por tag)
  const [contactList, setContactList] = useState<Contact[]>([])  // ← NUEVO
  const [tags, setTags] = useState<TagItem[]>([])                 // ← NUEVO
  
  // Logs
  const [logs, setLogs] = useState<string[]>([])
  
  // UI
  const [socketConnected, setSocketConnected] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newPhone, setNewPhone] = useState("")
  const [newName, setNewName] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeKey, setUpgradeKey] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const isPro = license?.tier === 'pro' || license?.tier === 'business'
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : 
 
  
  
  // Redirecciones
  useEffect(() => {
    if (licenseLoading || authLoading || !licenseChecked || !authChecked) return
    if (!isActive) { window.location.href = "/setup"; return }
    if (!isAuthenticated) { window.location.href = "/login"; return }
  }, [licenseLoading, authLoading, licenseChecked, authChecked, isActive, isAuthenticated])

  useEffect(() => {
    if (isActive && isAuthenticated) fetchLines()
  }, [isActive, isAuthenticated])

  useEffect(() => {
    if (!SOCKET_URL || !isActive) return
    const socket = io(SOCKET_URL)
    socket.on("connect", () => setSocketConnected(true))
    socket.on("disconnect", () => setSocketConnected(false))
    return () => { socket.disconnect() }
  }, [isActive])

// Cargar contactos y tags cuando se necesiten para campaña
useEffect(() => {
  if ((numberSource === "contacts" || numberSource === "tag") && isAuthenticated) {
    fetch("/api/contacts", { 
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store" 
    })
      .then(r => r.json())
      .then(data => setContactList(data.contacts || []))
      .catch(() => {})
    
    fetch("/api/tags/stats", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
      .then(r => r.json())
      .then(data => setTags(data.tags || []))
      .catch(() => {})
  }
}, [numberSource, isAuthenticated, token])

  if (licenseLoading || authLoading || !licenseChecked || !authChecked) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] bg-gray-50 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!isActive || !isAuthenticated) return null

  const fetchLines = async () => {
    try {
      const res = await fetch("/api/lineas", { cache: "no-store" })
      const data = await res.json()
      if (data.lines) setLines(data.lines)
    } catch {
      toast.error("Error cargando líneas")
    }
  }

  const addLine = async () => {
    if (!newPhone.trim()) return toast.error("Escribí el número")
    if (!isPro && lines.length >= 1) {
      setShowUpgrade(true)
      return
    }
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
        toast.success("Línea creada. Escaneá el QR.")
      } else if (res.status === 403) {
        setShowUpgrade(true)
      } else {
        toast.error(data.error || "Error creando línea")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const openQrForLine = (line: LineaWhatsApp) => {
    setQrTargetLine(line)
    setQrModalOpen(true)
    fetch("/api/lineas/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: line.phone }),
    }).catch(() => {})
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
        toast.success("Línea desconectada")
      } else {
        toast.error("Error al desconectar")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const sendCampaign = async () => {
    if (!selectedLine) return toast.error("Seleccioná una línea primero")
    const rawNumbers = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
    const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ""), name: "" }))
    if (targets.length === 0) return toast.error("No hay números válidos")

    setIsSending(true)
    setLogs(prev => [...prev, `🚀 Campaña iniciada: ${targets.length} números`])
    setActiveTab("logs")

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
        setLogs(prev => [...prev, `✅ Campaña ${data.campaignId} | Total: ${data.total}`])
        toast.success(`Campaña iniciada: ${data.total} números`)
      } else {
        setLogs(prev => [...prev, `❌ Error: ${data.error}`])
        toast.error(data.error || "Error en campaña")
      }
    } catch {
      setLogs(prev => [...prev, `❌ Error de red`])
      toast.error("Error de red")
    } finally {
      setIsSending(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === "CONECTADA") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    if (status === "PENDING") return "bg-amber-500/10 text-amber-400 border-amber-500/30"
    return "bg-red-500/10 text-red-400 border-red-500/30"
  }

  const statusDot = (status: string) => {
    if (status === "CONECTADA") return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
    if (status === "PENDING") return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
    return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
  }

  const tabs = [
    { id: "plan" as TabType, label: "Plan", icon: Activity },
    { id: "lines" as TabType, label: "Líneas", icon: Users },
    { id: "campaign" as TabType, label: "Campaña", icon: Send },
    { id: "logs" as TabType, label: "Logs", icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] bg-gray-50 text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 flex">
      <Sidebar onUpgrade={() => setShowUpgradeModal(true)} onSettings={() => setShowSettings(true)} />
      
      {/* Main content with sidebar offset */}
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)]/60 dark:bg-[var(--bg-card)]/60 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]/60 dark:border-[var(--border-color)]/60 border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full animate-pulse ${socketConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`} />
            <span className={`text-sm ${socketConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              {socketConnected ? 'Servidor activo' : 'Desconectado'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <button onClick={() => setShowUpgrade(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[var(--text-primary)] text-xs font-bold rounded-lg shadow-lg shadow-amber-500/25 flex items-center gap-1.5">
                <Zap size={14} /> Upgrade
              </button>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm text-[var(--text-primary)]">
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">{user?.nombre}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-[var(--text-primary)] shadow-lg shadow-blue-500/25'
                      : 'bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-600 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 hover:border-blue-500/30'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl"
            >
              {/* TAB: PLAN */}
              {activeTab === "plan" && (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border border-[var(--border-color)]/60 dark:border-[var(--border-color)]/60 border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">Tu Plan</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Configuración actual del sistema</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        isPro 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {isPro ? '✦ PRO' : 'STARTER'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PlanFeature icon={Users} label="Líneas WhatsApp" value={`${lines.length} / ${license?.maxLines || 1}`} active />
                      <PlanFeature icon={Send} label="Envíos mensuales" value="Ilimitados" active />
                      <PlanFeature icon={Activity} label="Spintax" value={isPro ? "Avanzado por línea" : "Básico (3 variantes)"} active />
                      <PlanFeature icon={RotateCcw} label="Rotación líneas" value={isPro ? "Round Robin" : "No disponible"} active={isPro} pro={!isPro} />
                      <PlanFeature icon={CheckCircle2} label="Historial campañas" value={isPro ? "Ilimitado + Exportar" : "30 días"} active />
                      <PlanFeature icon={Clock} label="Delay configurable" value={isPro ? "1-60s libre" : "5-15s fijo"} active={isPro} pro={!isPro} />
                    </div>

                    {!isPro && (
                      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-sm text-amber-400 flex items-center gap-2">
                          <Zap size={16} /> Desbloqueá todas las funciones con el plan Pro por $750 USD
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: LÍNEAS */}
              {activeTab === "lines" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">Líneas WhatsApp</h2>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                    >
                      <Plus size={16} /> Agregar línea
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lines.map((line) => (
                      <motion.div
                        key={line.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          selectedLine?.id === line.id
                            ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                            : "border-[var(--border-color)]/60 dark:border-[var(--border-color)]/60 border-gray-200 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white hover:border-[var(--border-hover)] dark:hover:border-[var(--border-hover)] hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedLine(line)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusDot(line.status)}`} />
                            <div>
                              <p className="font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 text-sm">{line.nombre}</p>
                              <p className="text-xs text-[var(--text-muted)] font-mono">{line.phone}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full border ${statusColor(line.status)}`}>
                            {line.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          {line.status !== "CONECTADA" && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openQrForLine(line) }}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              <QrCode size={14} /> Conectar
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); logoutLine(line.id) }}
                            className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            <Power size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {lines.length === 0 && (
                      <div className="col-span-full py-12 border border-dashed border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-300 rounded-2xl text-center">
                        <Users size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-muted)] text-sm">No hay líneas conectadas</p>
                        <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium">
                          + Conectar primera línea
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CAMPAÑA */}
              {activeTab === "campaign" && (
                
                <div className="max-w-3xl space-y-6">
                  <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border border-[var(--border-color)]/60 dark:border-[var(--border-color)]/60 border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">Nueva Campaña</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Dispará mensajes masivos por WhatsApp</p>
                      </div>
                      {selectedLine ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className={`h-1.5 w-1.5 rounded-full ${statusDot(selectedLine.status)}`} />
                          <span className="text-xs text-blue-400 font-medium">{selectedLine.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                          Seleccioná una línea primero
                        </span>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* Origen de números */}
<div className="flex gap-2 mb-3">
  {[
    { id: "manual", label: "Manual", icon: Edit3 },
    { id: "contacts", label: "Contactos", icon: Users },
    { id: "tag", label: "Por Tag", icon: Tag },
  ].map(src => {
    const Icon = src.icon
    return (
      <button
        key={src.id}
        onClick={() => setNumberSource(src.id as any)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${numberSource === src.id ? 'bg-blue-600 text-white border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
      >
        <Icon size={12} /> {src.label}
      </button>
    )
  })}
</div>

{/* Filtro por tag */}
{numberSource === "tag" && (
  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
    {tags.map((t: any) => (
      <button
        key={t.id}
        onClick={() => setSelectedTagFilter(selectedTagFilter === t.name ? null : t.name)}
        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all whitespace-nowrap ${selectedTagFilter === t.name ? 'text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
        style={selectedTagFilter === t.name ? { backgroundColor: t.color, borderColor: t.color } : {}}
      >
        {t.name}
      </button>
    ))}
  </div>
)}

{/* Textarea de números */}
{numberSource === "manual" && (
  <textarea
    value={numbersText}
    onChange={e => setNumbersText(e.target.value)}
    placeholder="5491123456789&#10;5491165432109&#10;..."
    rows={6}
    className="input-field font-mono resize-none"
  />
)}

{/* Lista de contactos seleccionables */}
{(numberSource === "contacts" || numberSource === "tag") && (
  <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 h-48 overflow-y-auto space-y-1">
    {contactList
      .filter(c => numberSource === "contacts" || !selectedTagFilter || c.tags.includes(selectedTagFilter))
      .map(c => {
        const isSelected = numbersText.includes(c.phone)
        return (
          <button
            key={c.id}
            onClick={() => {
              const current = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
              const exists = current.includes(c.phone)
              const next = exists 
                ? current.filter(n => n !== c.phone)
                : [...current, c.phone]
              setNumbersText(next.join("\n"))
            }}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${isSelected ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-[var(--border-color)]'}`}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {c.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[var(--text-primary)]">{c.name}</p>
                <p className="text-[var(--text-muted)]">{c.phone}</p>
              </div>
            </div>
            {isSelected && <CheckCircle2 size={14} className="text-blue-400" />}
          </button>
        )
      })}
    {numberSource === "tag" && selectedTagFilter && contactList.filter(c => c.tags.includes(selectedTagFilter)).length === 0 && (
      <p className="text-center text-xs text-[var(--text-muted)] py-4">No hay contactos con esta etiqueta</p>
    )}
  </div>
)}

<span className="text-xs text-[var(--text-muted)] mt-2 block">
  {numbersText.split("\n").filter(Boolean).length} números seleccionados
</span>

                      <div>
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                          <Send size={14} /> Mensaje
                        </label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Hola {{nombre}}, te escribo de..."
                          rows={4}
                          className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-4 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none"
                        />
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-100 px-2 py-1 rounded border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200">
                            Spintax: {"{{"}hola|buenas|hey{"}}"}
                          </span>
                          {!isPro && (
                            <span className="text-[10px] text-amber-400 flex items-center gap-1">
                              <Zap size={10} /> Avanzado en Pro
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <ImageIcon size={14} /> URL de imagen (opcional)
                          </label>
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder="https://tusitio.com/imagen.jpg"
                            className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-3 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <Clock size={14} /> Delay (ms)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={delayMin}
                              onChange={e => setDelayMin(Number(e.target.value))}
                              className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-3 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                            <span className="text-[var(--text-muted)]">-</span>
                            <input
                              type="number"
                              value={delayMax}
                              onChange={e => setDelayMax(Number(e.target.value))}
                              className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-3 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={sendCampaign}
                        disabled={isSending || !selectedLine}
                        className={`w-full font-bold py-4 rounded-xl transition-all relative overflow-hidden ${
                          isSending || !selectedLine
                            ? "bg-[#1E293B] dark:bg-[#1E293B] bg-gray-200 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        }`}
                      >
                        {isSending ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            Enviando...
                          </span>
                        ) : !selectedLine ? (
                          <span className="flex items-center justify-center gap-2">
                            <Users size={18} /> Seleccioná una línea en la pestaña "Líneas"
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Play size={18} /> Disparar {numbersText.split("\n").filter(Boolean).length} mensajes
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LOGS */}
              {activeTab === "logs" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">Logs en vivo</h2>
                    <div className="flex items-center gap-2">
                      {!isPro && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Zap size={10} className="inline" /> PRO
                        </span>
                      )}
                      <button 
                        onClick={() => isPro ? setLogs([]) : setShowUpgrade(true)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          isPro 
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                            : 'border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 text-[var(--text-muted)] cursor-not-allowed'
                        }`}
                      >
                        <Trash2 size={14} /> Limpiar
                      </button>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border border-[var(--border-color)]/60 dark:border-[var(--border-color)]/60 border-gray-200 rounded-2xl p-4">
                    <div className="bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-xs space-y-1.5 border border-[var(--border-color)]/40 dark:border-[var(--border-color)]/40 border-gray-200">
                      <AnimatePresence initial={false}>
                        {logs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <Activity size={24} className="mb-2" />
                            <span>Esperando acciones...</span>
                          </div>
                        ) : (
                          logs.map((log, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`${
                                log.includes("✅") ? "text-emerald-400" : 
                                log.includes("❌") ? "text-red-400" : 
                                log.includes("🚀") ? "text-blue-400" : "text-[var(--text-secondary)]"
                              }`}
                            >
                              <span className="text-[var(--text-muted)] mr-2">{new Date().toLocaleTimeString()}</span>
                              {log}
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <PremiumModal open={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar Línea">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Número (con código país)</label>
            <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="5491123456789" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Nombre (opcional)</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Línea Principal" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
          </div>
          {!isPro && lines.length >= 1 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <Zap size={14} /> Tu plan Starter permite 1 línea. Upgrade a Pro para 3 líneas.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-[var(--text-primary)] rounded-xl transition-colors">Cancelar</button>
            <button onClick={addLine} disabled={!isPro && lines.length >= 1} className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${!isPro && lines.length >= 1 ? 'bg-[#1E293B] text-[var(--text-muted)] cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)]'}`}>Guardar</button>
          </div>
        </div>
      </PremiumModal>

      <PremiumModal open={showSettings} onClose={() => setShowSettings(false)} title="Configuración">
        <form onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          const token = localStorage.getItem('mb_token')
          try {
            const res = await fetch("/api/auth/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                nombre: form.get("nombre"),
                email: form.get("email"),
                current_password: form.get("current_password") || undefined,
                new_password: form.get("new_password") || undefined,
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Perfil actualizado")
            setShowSettings(false)
          } catch (err: any) {
            toast.error(err.message)
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Nombre</label>
            <input name="nombre" defaultValue={user?.nombre || ""} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
            <input name="email" type="email" defaultValue={user?.email || ""} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
          </div>
          <div className="border-t border-[var(--border-color)] pt-4">
            <p className="text-xs text-[var(--text-muted)] mb-3">Cambiar contraseña (opcional)</p>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Contraseña actual</label>
              <input name="current_password" type="password" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mt-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Nueva contraseña</label>
              <input name="new_password" type="password" minLength={6} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">Guardar cambios</button>
        </form>
      </PremiumModal>

      <PremiumModal open={showUpgrade} onClose={() => setShowUpgrade(false)} title="Upgrade a Pro">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-2">🚀</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Desbloqueá el poder completo</h3>
          <div className="space-y-2 text-left bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border-color)]">
            <FeatureListItem text="3 líneas WhatsApp simultáneas" />
            <FeatureListItem text="Rotación Round-Robin inteligente" />
            <FeatureListItem text="Spintax avanzado por línea" />
            <FeatureListItem text="Historial de campañas ilimitado" />
            <FeatureListItem text="Repetir campañas exitosas (1 click)" />
            <FeatureListItem text="Soporte prioritario por WhatsApp" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">$750 <span className="text-sm font-normal text-[var(--text-muted)]">USD / único</span></p>
          <button onClick={() => toast.info("Contactá a ventas para upgrade")} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[var(--text-primary)] font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all">Quiero upgrade</button>
          <button onClick={() => setShowUpgrade(false)} className="text-sm text-[var(--text-muted)] hover:text-slate-300">Ahora no</button>
        </div>
      </PremiumModal>

<AnimatePresence>
  {showUpgradeModal && (
    <PremiumModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Upgrade a Pro">
      <div className="text-center space-y-4">
        <div className="text-5xl mb-2">✦</div>
        <h3 className="text-xl font-bold text-white">Upgrade a Pro</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Pegá acá tu licencia Pro para desbloquear instantáneamente todas las funciones.
        </p>
        
        <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Tu plan actual</p>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Starter
          </span>
        </div>

        <textarea
          value={upgradeKey}
          onChange={e => setUpgradeKey(e.target.value)}
          placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows={4}
          className="input-field font-mono text-xs resize-none"
        />

        {upgrading ? (
          <div className="flex items-center justify-center gap-2 py-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full" />
            <span className="text-sm text-amber-400">Activando Pro...</span>
          </div>
        ) : (
          <button
            onClick={async () => {
              if (!upgradeKey.trim()) return toast.error("Pegá la licencia")
              setUpgrading(true)
              try {
                const res = await fetch("/api/setup/activate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ licenseKey: upgradeKey.trim() }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Licencia inválida")
                
                // Verificar que sea Pro
                if (data.tier !== 'pro' && data.tier !== 'business') {
                  throw new Error("Esta licencia no es Pro. Contactá a ventas.")
                }
                
                toast.success("🎉 ¡Felicitaciones! Tenés Pro activado de por vida.")
                setShowUpgradeModal(false)
                
                // Recarga completa para que useLicense lea la nueva licencia
                setTimeout(() => {
                  window.location.href = "/"
                }, 1500)
                
              } catch (e: any) {
                toast.error(e.message)
                setUpgrading(false)
              }
            }}
            disabled={!upgradeKey.trim()}
            className={`w-full font-bold py-3 rounded-xl transition-all ${
              upgradeKey.trim()
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            ✦ Activar Pro
          </button>
        )}

        <p className="text-xs text-[var(--text-muted)]">
          ¿No tenés licencia Pro? <button onClick={() => toast.info("Contactá a ventas")} className="text-amber-400 hover:underline">Comprar ahora</button>
        </p>
      </div>
    </PremiumModal>
  )}
</AnimatePresence>
      

      <QRModal open={qrModalOpen}  onOpenChange={(v) => setQrModalOpen(v)}  line={qrTargetLine} />
    </div>
  )
}

function PlanFeature({ icon: Icon, label, value, active, pro }: { icon: any, label: string, value: string, active?: boolean, pro?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-input)]/50 dark:bg-[var(--bg-input)]/50 bg-gray-50/50 border border-[var(--border-color)]/30 dark:border-[var(--border-color)]/30 border-gray-200/50">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-[var(--text-muted)]'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className={`text-sm font-medium ${active ? 'text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900' : 'text-[var(--text-muted)]'}`}>{value}</p>
      </div>
      {pro && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>}
    </div>
  )
}

function FeatureListItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
      {text}
    </div>
  )
}