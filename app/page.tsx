    "use client"

    import { useState, useEffect, useRef } from "react"
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
    RotateCcw,
    Sparkles,
    Eye,
    Upload,
    AlertTriangle,
    X
    } from "lucide-react"
    import { QRModal } from "./components/qr-modal"
    import { useRouter } from "next/navigation"
    import { useLicense } from "@/hooks/useLicense"
    import { useAuth } from "@/hooks/useAuth"
    import { Sidebar } from "./components/ui/sidebar"
    import { PremiumModal } from "./components/ui/modal"
    import { ConfirmDialog } from "./components/ui/confirm-dialog"
    import { useConfirm } from "@/hooks/useConfirm"
import { CampaignLineSelector } from "./components/campaign-line-selector"
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
    const hasConnectedLine = lines.some(l => l.status === "CONECTADA")
    const selectedLineConnected = selectedLine?.status === "CONECTADA"
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
    const { isOpen, options, confirm: askConfirm, onConfirm, onCancel } = useConfirm()

    const [campaignName, setCampaignName] = useState("")
    const [showImportNumbers, setShowImportNumbers] = useState(false)
    const [importNumbersText, setImportNumbersText] = useState("")

    const [isVerifying, setIsVerifying] = useState(false)
const [duplicateNumbers, setDuplicateNumbers] = useState<string[]>([])
const [verifyTimeout, setVerifyTimeout] = useState<NodeJS.Timeout | null>(null)
    // Contactos + Tags (para campaña por tag)
    const [contactList, setContactList] = useState<Contact[]>([])  // ← NUEVO
    const [tags, setTags] = useState<TagItem[]>([])                 // ← NUEVO

    // const campaignNameRef = useRef<HTMLInputElement>(null)
    
    // Logs
    const [logs, setLogs] = useState<string[]>([])
    // const [campaignName, setCampaignName] = useState("")
    const [scheduleMode, setScheduleMode] = useState<"now" | "pending">("now")

    const [showPreview, setShowPreview] = useState(false)

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') || '' : '' 
    const [templates, setTemplates] = useState<any[]>([])
    const [showSpintaxHelp, setShowSpintaxHelp] = useState(false)

  
const [importLoading, setImportLoading] = useState(false)
const [importProgress, setImportProgress] = useState(0)
const [dragActive, setDragActive] = useState(false)
const [importedCount, setImportedCount] = useState(0)
const [previewNumbers, setPreviewNumbers] = useState<string[]>([])
const [pendingNumbers, setPendingNumbers] = useState<string[]>([])
const [distributionMode, setDistributionMode] = useState<"single" | "round_robin">("single")
const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])
        function resolveSpintax(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
    if (!content.includes('|')) return match
    const variants = content.split("|").map((s: string) => s.trim()).filter(Boolean)
    return variants.length ? variants[Math.floor(Math.random() * variants.length)] : ''
  })
}

function generatePreview(text: string, targetName = "Juan Pérez", targetPhone = "5491123456789"): string {
  let t = resolveSpintax(text)
  t = t.replace(/\{\{nombre\}\}/gi, targetName).replace(/\{nombre\}/gi, targetName)
  t = t.replace(/\{\{telefono\}\}/gi, targetPhone).replace(/\{telefono\}/gi, targetPhone)
  return t
}

        const fetchLines = async () => {
  try {
    const token = localStorage.getItem('mb_token') || ''
    const res = await fetch("/api/lineas", { 
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store" 
    })
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
    const token = localStorage.getItem('mb_token') || ''
    const res = await fetch("/api/lineas", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
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
  const token = localStorage.getItem('mb_token') || ''
  fetch("/api/lineas/connect", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ phone: line.phone }),
  }).catch(() => {})
}

    const logoutLine = async (lineId: string) => {
  const ok = await askConfirm({
    title: "Desconectar línea",
    description: "¿Seguro que querés desconectar esta línea de WhatsApp? Tendrás que escanear el QR nuevamente para reconectar.",
    confirmText: "Desconectar",
    cancelText: "Cancelar",
    variant: "warning",
  })
  if (!ok) return
  try {
    const token = localStorage.getItem('mb_token') || ''
    const res = await fetch("/api/lineas/logout", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
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
  if (selectedLine.status !== "CONECTADA") return toast.error("La línea seleccionada no está conectada")
  
  const rawNumbers = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
  const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ""), name: "" }))
  if (targets.length === 0) return toast.error("No hay números válidos")

  setIsSending(true)
  setLogs(prev => [...prev, `🚀 ${scheduleMode === 'now' ? 'Campaña iniciada' : 'Campaña guardada'}: ${targets.length} números`])

  try {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        lineId: selectedLine.id,
        targets,
        message,
        imageUrl: imageUrl || undefined,
        delayMin,
        distribution_mode: distributionMode,
        selected_lines: selectedLineIds, // Array de UUIDs
        delayMax,
        name: campaignName.trim() || undefined,
        schedule: scheduleMode
      }),
    })
    const data = await res.json()
    if (data.success) {
      if (scheduleMode === 'pending') {
        toast.success("Campaña guardada en espera")
        setLogs(prev => [...prev, `⏸️ Campaña ${data.campaignId} guardada para ejecutar después`])
      } else {
        setLogs(prev => [...prev, `✅ Campaña ${data.campaignId} | Total: ${data.total}`])
        toast.success(`Campaña iniciada: ${data.total} números`)
      }
      setActiveTab("logs")
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

const extractNumbersFromSheet = (data: any[][]): string[] => {
  const numbers: string[] = []
  data.forEach((row: any[]) => {
    row.forEach((cell: any) => {
      const str = String(cell || '').trim()
      // Buscar números de teléfono: mínimo 8 dígitos, opcional +
      const cleaned = str.replace(/\D/g, '')
      if (cleaned.length >= 8) numbers.push(cleaned)
    })
  })
  return [...new Set(numbers)] // eliminar duplicados
}

const handleNumberFile = (file: File) => {
  if (!file) return
  setImportLoading(true)
  setImportProgress(0)

  const reader = new FileReader()
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 12
    setImportProgress(Math.min(progress, 85))
  }, 150)

  reader.onload = (e) => {
    clearInterval(interval)
    setImportProgress(100)
    
    const buffer = e.target?.result
    let numbers: string[] = []

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const XLSX = require('xlsx')
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        numbers = extractNumbersFromSheet(jsonData as any[][])
      } else {
        // CSV o TXT
        const text = String(buffer || '')
        const raw = text.split(/[\n\r,\s\t;]+/).map(n => n.trim()).filter(Boolean)
        numbers = raw.map(n => n.replace(/\D/g, '')).filter(n => n.length >= 8)
        numbers = [...new Set(numbers)]
      }
    } catch (err) {
      console.error('Error parseando archivo:', err)
      toast.error('Error leyendo el archivo. Asegurate de que sea un formato válido.')
      setImportLoading(false)
      return
    }

    setTimeout(() => {
      setImportedCount(numbers.length)
      setPreviewNumbers(numbers.slice(0, 20))
      setPendingNumbers(numbers)
      setImportLoading(false)
      setImportProgress(0)
      
      if (numbers.length === 0) {
        toast.error('No se encontraron números válidos en el archivo')
      }
    }, 400)
  }

  reader.onerror = () => {
    clearInterval(interval)
    setImportLoading(false)
    toast.error('Error leyendo el archivo')
  }

  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    reader.readAsArrayBuffer(file)
  } else {
    reader.readAsText(file)
  }
}

const confirmImportNumbers = () => {
  if (pendingNumbers.length === 0) return
  
  const current = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
  const merged = [...new Set([...current, ...pendingNumbers])]
  setNumbersText(merged.join("\n"))
  
  toast.success(`${pendingNumbers.length} números agregados a la campaña`)
  setShowImportNumbers(false)
  setImportedCount(0)
  setPreviewNumbers([])
  setPendingNumbers([])
}

const handleImportNumbers = (text: string) => {
  const raw = text.split(/[\n,\s;]+/).map(n => n.trim()).filter(Boolean)
  const cleaned = raw.map(n => n.replace(/\D/g, '')).filter(n => n.length >= 8)
  const unique = [...new Set(cleaned)]
  
  if (unique.length === 0) {
    toast.error("No se encontraron números válidos")
    return
  }
  
  setImportedCount(unique.length)
  setPreviewNumbers(unique.slice(0, 20))
  setPendingNumbers(unique)
}

const onDrag = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
  else if (e.type === "dragleave") setDragActive(false)
}

const onDrop = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setDragActive(false)
  if (e.dataTransfer.files?.[0]) handleNumberFile(e.dataTransfer.files[0])
}

const verifyNumbers = (text: string) => {
  const raw = text.split("\n").map(n => n.trim()).filter(Boolean)
  const cleaned = raw.map(n => n.replace(/\D/g, '')).filter(n => n.length >= 8)
  
  const seen = new Map<string, number>()
  cleaned.forEach(n => seen.set(n, (seen.get(n) || 0) + 1))
  
  const dups = Array.from(seen.entries())
    .filter(([_, count]) => count > 1)
    .map(([num]) => num)
  
  setDuplicateNumbers(dups)
  setIsVerifying(false)
}

useEffect(() => {
  if (verifyTimeout) clearTimeout(verifyTimeout)
  
  const raw = numbersText.trim()
  if (!raw) {
    setDuplicateNumbers([])
    setIsVerifying(false)
    return
  }
  
  setIsVerifying(true)
  const t = setTimeout(() => verifyNumbers(raw), 3000)
  setVerifyTimeout(t)
  
  return () => clearTimeout(t)
}, [numbersText])



const removeAllDuplicates = () => {
  const raw = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
  const seen = new Set<string>()
  const cleaned: string[] = []
  
  raw.forEach(n => {
    const clean = n.replace(/\D/g, '')
    if (!seen.has(clean)) {
      seen.add(clean)
      cleaned.push(n) // mantenemos formato original
    }
  })
  
  setNumbersText(cleaned.join("\n"))
  setDuplicateNumbers([]) // limpiar inmediatamente
  toast.success(`${raw.length - cleaned.length} duplicados eliminados. ${cleaned.length} únicos restantes.`)
}

const removeSpecificNumber = (phoneToRemove: string) => {
  const raw = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
  const cleaned = raw.filter(n => n.replace(/\D/g, '') !== phoneToRemove)
  setNumbersText(cleaned.join("\n"))
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

useEffect(() => {
  const cloned = localStorage.getItem('mb_clone_campaign')
  if (!cloned) return
  
  try {
    const data = JSON.parse(cloned)
    console.log('🔄 Clonando campaña:', data)
    localStorage.removeItem('mb_clone_campaign')
    
    setActiveTab('campaign')
    setNumberSource('manual')
    setMessage(data.message || '')
    setImageUrl(data.image_url || '')
    setCampaignName(data.name || '') // ← AHORA CON STATE
    
    if (data.targets && Array.isArray(data.targets) && data.targets.length > 0) {
      const phones = data.targets.map((t: any) => t.phone).filter(Boolean).join('\n')
      setNumbersText(phones)
    } else {
      setNumbersText('')
    }
    
    toast.success('Campaña clonada. Editá y enviá cuando quieras.')
  } catch (e) {
    console.error('❌ Error cargando clone:', e)
  }
}, [])
    
    useEffect(() => {
        if (licenseLoading || authLoading || !licenseChecked || !authChecked) return
        if (!isActive) { 
        router.push("/setup")
        return 
        }
        if (!isAuthenticated) { 
        router.push("/login")
        return 
        }
    }, [licenseLoading, authLoading, licenseChecked, authChecked, isActive, isAuthenticated, router])

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

    useEffect(() => {
  if (!isAuthenticated) return
  fetch("/api/templates", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
    .then(r => r.json())
    .then(data => setTemplates(data.templates || []))
    .catch(() => {})
}, [isAuthenticated, token])

// Helper: insertar spintax en el textarea
const insertSpintax = (type: 'saludo' | 'despedida' | 'emoji' | 'nombre') => {
  const presets: Record<string, string> = {
    saludo: "{{Hola|Buenas|Hey|Qué tal|Saludos}}",
    despedida: "{{Saludos|Un abrazo|Atentamente|Gracias|Nos vemos}}",
    emoji: "{{👋|✨|🚀|💪|🔥|👍|🎯}}",
    nombre: "{{nombre|amigo|cliente|crack}}"
  }
  setMessage(prev => prev ? `${prev} ${presets[type]}` : presets[type])
}

const copyMessage = async () => {
  if (!message) return
  await navigator.clipboard.writeText(message)
  toast.success("Mensaje copiado")
}

        if (licenseLoading || authLoading || !licenseChecked || !authChecked) {
        return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
        )
    }
    if (!isActive || !isAuthenticated) return null


    if (!isAuthenticated) {
        return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
            <p className="text-[var(--text-secondary)]">Sesión expirada. Redirigiendo al login...</p>
            <button 
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
            Ir al login
            </button>
        </div>
        )
    }

    if (!isActive) {
        return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
            <p className="text-[var(--text-secondary)]">Licencia requerida. Redirigiendo...</p>
            <button 
            onClick={() => router.push("/setup")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
            Activar licencia
            </button>
        </div>
        )
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
                        {selectedLineConnected ? (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
    <div className={`h-1.5 w-1.5 rounded-full ${statusDot(selectedLine.status)}`} />
    <span className="text-xs text-blue-400 font-medium">{selectedLine.nombre}</span>
  </div>
) : lines.length === 0 ? (
  <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
    No hay líneas creadas
  </span>
) : !hasConnectedLine ? (
  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
    Conectá una línea primero
  </span>
) : (
  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
    Seleccioná una línea conectada
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

    {/* Nombre + Scheduling */}
{/* Nombre de campaña + Modo de ejecución */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
      Nombre de campaña
    </label>
    <input
  type="text"
  value={campaignName}
  onChange={e => setCampaignName(e.target.value)}
  placeholder="Ej: Promo Mayo 2026"
  className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-3 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
/>
  </div>
  <div>
    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
      Ejecución
    </label>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setScheduleMode("now")}
        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
          scheduleMode === "now"
            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
            : 'bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 text-[var(--text-secondary)] border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 hover:border-slate-600'
        }`}
      >
        ⚡ Enviar ahora
      </button>
      <button
        type="button"
        onClick={() => setScheduleMode("pending")}
        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
          scheduleMode === "pending"
            ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25'
            : 'bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 text-[var(--text-secondary)] border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 hover:border-slate-600'
        }`}
      >
        ⏸️ Guardar para después
      </button>
    </div>
  </div>
</div>

    {/* Textarea de números */}

    {/* <div className="flex items-center justify-between mb-2">
  <span className="text-xs text-[var(--text-muted)]">
    {numbersText.split("\n").filter(Boolean).length} números seleccionados
  </span>
  <button
    onClick={() => setShowImportNumbers(true)}
    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
  >
    <Upload size={12} /> Importar números
  </button>
</div> */}
    {numberSource === "manual" && (
  <div className="space-y-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-[var(--text-muted)]">
        {numbersText.split("\n").filter(Boolean).length} números
        {duplicateNumbers.length > 0 && (
          <span className="text-red-400 ml-2 font-medium">• {duplicateNumbers.length} duplicado{duplicateNumbers.length > 1 ? 's' : ''}</span>
        )}
      </span>
      <button
        onClick={() => setShowImportNumbers(true)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
      >
        <Upload size={12} /> Importar números
      </button>
    </div>

    <CampaignLineSelector
  mode={distributionMode}
  onModeChange={setDistributionMode}
  selectedIds={selectedLineIds}
  onSelectionChange={setSelectedLineIds}
/>
    
    <div className="relative">
      <textarea
        value={numbersText}
        onChange={e => setNumbersText(e.target.value)}
        placeholder="5491123456789&#10;5491165432109&#10;..."
        rows={6}
        className={`w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border rounded-xl p-4 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none font-mono ${
          duplicateNumbers.length > 0
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 focus:border-blue-500/50'
        }`}
      />
      {isVerifying && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-blue-400 bg-[var(--bg-card)]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full"
          />
          Verificando números...
        </div>
      )}
    </div>

    {/* Validación de duplicados en textarea general */}
    {duplicateNumbers.length > 0 && (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
            <AlertTriangle size={12} /> {duplicateNumbers.length} número{duplicateNumbers.length > 1 ? 's' : ''} duplicado{duplicateNumbers.length > 1 ? 's' : ''}
          </p>
          <button
            onClick={removeAllDuplicates}
            className="text-[10px] px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
          >
            <Trash2 size={10} /> Eliminar todos los duplicados
          </button>
        </div>
        <p className="text-[10px] text-red-400/60">
          Se mantendrá solo la primera ocurrencia de cada número.
        </p>
      </div>
    )}
    
    {duplicateNumbers.length === 0 && !isVerifying && numbersText && (
      <div className="flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 size={12} /> Todo ok para salir
      </div>
    )}
  </div>
)}

    <span className="text-xs text-[var(--text-muted)] mt-2 block">
    {numbersText.split("\n").filter(Boolean).length} números seleccionados
    </span>

                       <div>
  <div className="flex items-center justify-between mb-2">
    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
      <Send size={14} /> Mensaje
    </label>
    <div className="flex items-center gap-2">
      {/* Selector de Templates */}
      <select
        value=""
        onChange={e => {
          const t = templates.find(x => x.id === e.target.value)
          if (t) setMessage(t.content)
        }}
        className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-[11px] text-[var(--text-secondary)] focus:outline-none focus:border-blue-500"
      >
        <option value="">📄 Cargar template...</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={copyMessage}
        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/30 transition-colors"
      >
        📋 Copiar
      </button>
    </div>
  </div>
  
  <textarea
    value={message}
    onChange={e => setMessage(e.target.value)}
    placeholder="Escribí tu mensaje aquí... Usá los botones de abajo para insertar Spintax automáticamente."
    rows={4}
    className="w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-xl p-4 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none"
  />
  
  <div className="flex items-center gap-3 mt-2">
  <button
    type="button"
    onClick={() => setShowPreview(true)}
    className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
  >
    <Eye size={12} /> Ver preview
  </button>
  <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-1 rounded border border-[var(--border-color)]">
  {`Spintax: {{hola|buenas|hey}}`}
</span>
  <button
    type="button"
    onClick={() => setShowSpintaxHelp(true)}
    className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center gap-1"
  >
    <Sparkles size={10} /> ¿Qué es Spintax?
  </button>
</div>
  
  {/* Barra de herramientas Spintax */}
  <div className="flex flex-wrap items-center gap-2 mt-3">
    <span className="text-[10px] text-[var(--text-muted)]">Insertar:</span>
    <button type="button" onClick={() => insertSpintax('saludo')} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
      👋 Saludo
    </button>
    <button type="button" onClick={() => insertSpintax('despedida')} className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
      ✌️ Despedida
    </button>
    <button type="button" onClick={() => insertSpintax('emoji')} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
      🔥 Emoji
    </button>
    <button type="button" onClick={() => insertSpintax('nombre')} className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
      🏷️ Nombre
    </button>
    <div className="flex-1" />
    <button
      type="button"
      onClick={() => setShowSpintaxHelp(true)}
      className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center gap-1"
    >
      <Sparkles size={10} /> ¿Qué es Spintax?
    </button>
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
  disabled={isSending || !selectedLineConnected || isVerifying || duplicateNumbers.length > 0}
  className={`w-full font-bold py-4 rounded-xl transition-all relative overflow-hidden ${
    isSending || !selectedLineConnected || isVerifying || duplicateNumbers.length > 0
      ? "bg-[#1E293B] dark:bg-[#1E293B] bg-gray-200 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-gray-400 cursor-not-allowed"
      : scheduleMode === 'pending'
      ? "bg-gradient-to-r from-amber-600 to-orange-500 text-[var(--text-primary)] shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
      : "bg-gradient-to-r from-blue-600 to-blue-500 text-[var(--text-primary)] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
  }`}
>
  {isSending ? (
    <span className="flex items-center justify-center gap-2">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
      {scheduleMode === 'pending' ? 'Guardando...' : 'Enviando...'}
    </span>
  ) : isVerifying ? (
    <span className="flex items-center justify-center gap-2">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
      Verificando...
    </span>
  ) : duplicateNumbers.length > 0 ? (
    <span className="flex items-center justify-center gap-2 text-red-300">
      <AlertTriangle size={18} /> Eliminá duplicados para continuar
    </span>
  ) : !selectedLine ? (
    <span className="flex items-center justify-center gap-2">
      <Users size={18} /> Seleccioná una línea en la pestaña "Líneas"
    </span>
  ) : !selectedLineConnected ? (
    <span className="flex items-center justify-center gap-2">
      <Power size={18} /> Conectá la línea para {scheduleMode === 'pending' ? 'guardar' : 'enviar'}
    </span>
  ) : (
    <span className="flex items-center justify-center gap-2">
      {scheduleMode === 'pending' ? <Clock size={18} /> : <Play size={18} />}
      {scheduleMode === 'pending' ? 'Guardar' : 'Disparar'} {numbersText.split("\n").filter(Boolean).length} mensajes
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
        {/* MODAL: Vista previa del mensaje */}
        {/* MODAL: Importar números para campaña */}
{/* MODAL: Importar números para campaña */}
<PremiumModal open={showImportNumbers} onClose={() => !importLoading && setShowImportNumbers(false)} title="Importar Números">
  <div className="space-y-4">
    {/* Warning */}
    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
      <p className="text-xs text-amber-400 font-medium flex items-start gap-2">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <span>
          Estos números se usarán <strong>solo para esta campaña</strong> y <strong>NO se guardarán como contactos</strong>. 
          Para reutilizarlos, agregalos a Contactos.
        </span>
      </p>
    </div>

    {importLoading ? (
      <div className="space-y-4 py-6">
        <div className="w-full h-3 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${importProgress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            {importProgress < 100 ? 'Procesando archivo...' : '¡Listo!'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {importProgress < 100 ? `${Math.round(importProgress)}%` : `${importedCount} números encontrados`}
          </p>
        </div>
      </div>
    ) : importedCount > 0 ? (
      /* Preview de números encontrados */
      <div className="space-y-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            {importedCount} números válidos encontrados
          </p>
        </div>
        <div className="bg-[var(--bg-input)] rounded-xl p-3 h-32 overflow-y-auto border border-[var(--border-color)]">
          <div className="flex flex-wrap gap-1.5">
            {previewNumbers.map((num, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {num}
              </span>
            ))}
            {importedCount > previewNumbers.length && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--border-color)] text-[var(--text-muted)]">
                +{importedCount - previewNumbers.length} más
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setImportedCount(0); setPreviewNumbers([]) }}
            className="flex-1 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-hover)] transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={confirmImportNumbers}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-xl text-sm font-bold transition-colors"
          >
            Agregar a campaña
          </button>
        </div>
      </div>
    ) : (
      <>
        {/* Dropzone */}
        <div
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => document.getElementById('number-file-input')?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-blue-500 bg-blue-500/5' 
              : 'border-[var(--border-color)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-input)]'
          }`}
        >
          <input
            id="number-file-input"
            type="file"
            accept=".xlsx,.csv,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleNumberFile(e.target.files[0])}
          />
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <Upload size={24} className="text-blue-400" />
          </div>
          <p className="text-sm text-[var(--text-primary)] font-medium mb-1">
            Arrastrá un archivo o hacé clic para seleccionar
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Excel (.xlsx), CSV o TXT
          </p>
        </div>

        {/* Alternativa: pegar */}
        <div className="relative">
  <textarea
    value={numbersText}
    onChange={e => setNumbersText(e.target.value)}
    placeholder="5491123456789&#10;5491165432109&#10;..."
    rows={6}
    className={`w-full bg-[var(--bg-input)] dark:bg-[var(--bg-input)] bg-gray-50 border rounded-xl p-4 text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900 placeholder:text-slate-700 dark:placeholder:text-slate-700 placeholder:text-gray-400 focus:outline-none focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none font-mono ${
      duplicateNumbers.length > 0
        ? 'border-red-500/50 focus:border-red-500'
        : 'border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 focus:border-blue-500/50'
    }`}
  />
  {isVerifying && (
    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-blue-400 bg-[var(--bg-card)]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full"
      />
      Verificando números...
    </div>
  )}
</div>

{/* Contador + Duplicados */}
<div className="flex flex-col gap-2 mt-2">
  <div className="flex items-center justify-between">
    <span className="text-xs text-[var(--text-muted)]">
      {numbersText.split("\n").filter(Boolean).length} números
    </span>
    {duplicateNumbers.length === 0 && !isVerifying && numbersText && (
      <span className="text-xs text-emerald-400 flex items-center gap-1">
        <CheckCircle2 size={10} /> Todo ok para salir
      </span>
    )}
  </div>
  {duplicateNumbers.length > 0 && (
  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
    {/* Header */}
    <div className="flex items-center justify-between">
      <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
        <AlertTriangle size={12} /> {duplicateNumbers.length} número{duplicateNumbers.length > 1 ? 's' : ''} duplicado{duplicateNumbers.length > 1 ? 's' : ''}
      </p>
      <button
        onClick={removeAllDuplicates}
        className="text-[10px] px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
      >
        <Trash2 size={10} /> Eliminar duplicados
      </button>
    </div>
    
    {/* Lista de duplicados clickeables */}
    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
      {duplicateNumbers.map((num, i) => (
        <button
          key={i}
          onClick={() => removeSpecificNumber(num)}
          className="group flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono hover:bg-red-500/30 transition-colors"
          title="Clic para eliminar todas las ocurrencias de este número"
        >
          {num}
          <X size={10} className="opacity-60 group-hover:opacity-100" />
        </button>
      ))}
    </div>
    
    <p className="text-[10px] text-red-400/60">
      💡 Clic en un número para eliminarlo completamente, o usá "Eliminar duplicados" para dejar solo la primera ocurrencia de cada uno.
    </p>
  </div>
)}
</div>
      </>
    )}
  </div>
</PremiumModal>
<PremiumModal open={showPreview} onClose={() => setShowPreview(false)} title="Vista previa del mensaje">
  <div className="space-y-4">
    <p className="text-xs text-[var(--text-muted)]">
      Estas son 3 simulaciones de cómo llegaría el mensaje a tus contactos:
    </p>
    
    <div className="space-y-3">
      {[1, 2, 3].map(i => {
        const preview = generatePreview(message)
        return (
          <div key={i} className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] relative">
            <span className="absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Variante {i}
            </span>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap mt-1 font-mono">
              {preview}
            </p>
          </div>
        )
      })}
    </div>

    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>Datos de ejemplo: <strong>Juan Pérez</strong> — <strong>5491123456789</strong></span>
    </div>
  </div>
</PremiumModal> 

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

        {/* MODAL: Ayuda Spintax */}
<PremiumModal open={showSpintaxHelp} onClose={() => setShowSpintaxHelp(false)} title="¿Qué es Spintax?">
  <div className="space-y-4 text-sm">
    <p className="text-[var(--text-secondary)]">
      <strong className="text-[var(--text-primary)]">Spintax</strong> es una técnica que permite que cada mensaje sea <span className="text-emerald-400">ligeramente diferente</span>, evitando que WhatsApp detecte patrones repetidos y te baneé.
    </p>
    
    <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sintaxis</p>
      <code className="block text-xs font-mono text-blue-400 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
        {"{{"}opción 1|opción 2|opción 3{"}}"}
      </code>
      <p className="text-xs text-[var(--text-muted)]">
        WhatsApp recibe solo UNA de las opciones, elegida al azar.
      </p>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ejemplo práctico</p>
      <div className="grid grid-cols-1 gap-2">
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <p className="text-[10px] text-emerald-400 mb-1">Template</p>
          <p className="text-xs font-mono text-[var(--text-primary)]">
            {"{{"}Hola|Buenas|Hey{"}}"} {"{{"}Juan|amigo|crack{"}}"}, tenemos 50% OFF. {"{{"}Escribí YA|No te lo pierdas|Aprovechá hoy{"}}"}
          </p>
        </div>
        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <p className="text-[10px] text-blue-400 mb-1">Resultado posible 1</p>
          <p className="text-xs text-[var(--text-primary)]">"Hola Juan, tenemos 50% OFF. Escribí YA"</p>
        </div>
        <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
          <p className="text-[10px] text-purple-400 mb-1">Resultado posible 2</p>
          <p className="text-xs text-[var(--text-primary)]">"Buenas crack, tenemos 50% OFF. Aprovechá hoy"</p>
        </div>
      </div>
    </div>

    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
      <p className="text-xs text-amber-400 flex items-start gap-2">
        <Zap size={14} className="shrink-0 mt-0.5" />
        <span>
          <strong>Consejo Pro:</strong> Mientras más variantes uses, menos probable es que te reporten como spam. 
          Combiná Spintax + delays aleatorios entre 1-60s para máxima protección.
        </span>
      </p>
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
                            router.push("/")

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
        <ConfirmDialog open={isOpen} onClose={onCancel} onConfirm={onConfirm} {...options} />

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