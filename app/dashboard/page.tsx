"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { toast } from "sonner"
import {
  Send,
  Plus,
  QrCode,
  Power,
  Globe,
  Trash2,
  Play,
  Image as ImageIcon,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  Edit3,
  Tag,
  Zap,
  RotateCcw,
  Sparkles,
  Eye,
  Upload,
  AlertTriangle,
  X,
  Check,
  UserCheck,
  Link,
  Calendar,
  ArrowUpRight,
  Hand,
  LineChart,
  DollarSign,
  Flame,
  Rocket,
  ShoppingBag,
  Target,
  ArrowRight,
  Ban,
  BarChart3,
  CalendarClock,
  Copy,
  Lock,
  Download,
  FileText,
  FlaskConical,
  OctagonX,
  RefreshCw,
  Repeat,
  Split,
  Shield,
  Save,
  Timer,
  Gauge,
  Crosshair,
  Loader2,
  ShieldCheck,
  Info,
  ShieldBan,
  XCircle
} from "lucide-react"
import { QRModal } from "../components/qr-modal"
import { useUpgradeModal } from "../components/UpgradeModalProvider"
import { useRouter } from "next/navigation"
import { useLicense } from "@/hooks/useLicense"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "../components/ui/sidebar"
import { PremiumModal } from "../components/ui/modal"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { useConfirm } from "@/hooks/useConfirm"
import { CampaignLineSelector } from "../components/campaign-line-selector"

import { 
  DEMO_LINES, DEMO_CONTACTS, DEMO_TAGS, DEMO_TEMPLATES 
} from "@/lib/demo-data"
import { useDemoMode } from "@/hooks/useDemo"
// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

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

// ========== FUERA DEL COMPONENTE (arriba de todo en el archivo) ==========
const FEATURES = [
  { icon: CalendarClock, label: "Programación", desc: "Agendá envíos futuros", tier: 'pro' as TierName  },
  { icon: UserCheck, label: "Modo humano", desc: "Pausas aleatorias anti-ban", tier: 'pro' as TierName  },

  { icon: BarChart3, label: "Reportes avanzados", desc: "Gráficos de conversión", tier: 'pro' as TierName  },
  { icon: Download, label: "Export CSV", desc: "Descargá contactos y logs", tier: 'pro' as TierName  },
  { icon: RefreshCw, label: "Reconexión auto", desc: "Keep-alive 24/7", tier: 'pro' as TierName  },
  { icon: Split, label: "Spintax avanzado", desc: "Mensajes aleatorios", tier: 'pro' as TierName  },
  { icon: Copy, label: "Clonación 1-click", desc: "Duplicá campañas", tier: 'pro' as TierName  },
  { icon: FileText, label: "Métricas templates", desc: "Performance por template", tier: 'pro' as TierName  },
  { icon: FlaskConical, label: "Modo simulacro lite", desc: "Calentá de a un numero antes de cada campaña", tier: 'pro' as TierName  },
  { icon: OctagonX, label: "Cancelación en vivo", desc: "Frená campañas activas", tier: 'business' as TierName  },
   { icon: Ban, label: "Blacklist", desc: "Bloqueá números no deseados", tier: 'business' as TierName  },
  { icon: FlaskConical, label: "Modo simulacro FULL", desc: "Calentá numeros ilimitado y en simultaneo antes de cada campaña", tier: 'business' as TierName  },
  { icon: Repeat, label: "Recurrentes", desc: "Envíos automáticos", tier: 'business' as TierName  },
  { icon: Sparkles, label: "Asistente IA", desc: "Caleb AI integrado", tier: 'business' as TierName  },
  { icon: Users, label: "Multi-usuario", desc: "Agentes ilimitados", tier: 'business' as TierName  },
  { icon: Shield, label: "Whitelist", desc: "Solo contactos permitidos", tier: 'business' as TierName  },
  { icon: Shield, label: "Proxy Rotate", desc: "Cambia la ip de forma dinamica por campaña", tier: 'business' as TierName  },

] as const 


const SOCKET_URL = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' 
      ? (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:8080')
      : (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ''))
  : ''


type TabType = "plan" | "lines" | "campaign" | "logs"

// === TIER CONFIG ===
type TierName = 'starter' | 'pro' | 'business'

interface TierConfig {
  maxLines: number
  maxTemplates: number
  hasCron: boolean
  hasExport: boolean
  hasRoundRobin: boolean
  hasHumanMode: boolean
  hasClone: boolean
  hasAdvancedSpintax: boolean
  hasTemplateVars: boolean
  hasAI: boolean
  hasBlacklist: boolean
  hasSimulacroLite: boolean
  hasTemplateFavorite: boolean
  hasSimulacroFull: boolean
  hasProxyRotate: boolean
}

const TIER_CONFIG: Record<TierName, TierConfig> = {
  starter: {
    maxLines: 2,
    maxTemplates: 5,
    hasCron: false,
    hasExport: false,
    hasRoundRobin: false,
    hasHumanMode: false,
    hasClone: false,
    hasAdvancedSpintax: true,
    hasTemplateVars: false,
    hasAI: false,
    hasBlacklist: false,
    hasSimulacroLite: false,
    hasSimulacroFull: false,
    hasProxyRotate: false,
    hasTemplateFavorite: false
  },
  pro: {
    maxLines: 3,
    maxTemplates: Infinity,
    hasCron: true,
    hasExport: true,
    hasRoundRobin: true,
    hasHumanMode: true,
    hasTemplateFavorite: true,
    hasClone: true,
    hasAdvancedSpintax: true,
    hasTemplateVars: true,
    hasAI: false,
    hasBlacklist: true,
    hasSimulacroLite: true,
    hasSimulacroFull: false,
    hasProxyRotate: false,
  },
  business: {
    maxLines: Infinity,
    maxTemplates: Infinity,
    hasCron: true,
    hasExport: true,
    hasTemplateFavorite: true,
    hasRoundRobin: true,
    hasHumanMode: true,
    hasClone: true,
    hasAdvancedSpintax: true,
    hasTemplateVars: true,
    hasAI: true,
    hasBlacklist: true,
    hasSimulacroLite: true,
    hasSimulacroFull: true,
    hasProxyRotate: true,
  },
}

function getTierConfig(license: any): TierConfig {
  const tierName = (license?.tier || 'starter') as TierName
  return TIER_CONFIG[tierName] || TIER_CONFIG.starter
}





// === FUERA del componente Dashboard (estables, no se recrean) ===

function MessagePreview({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?)/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    const url = match[0]
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`
    parts.push(
      <a
        key={`url-${match.index}`}
        href={cleanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300 break-all"
        onClick={e => e.stopPropagation()}
      >
        {url}
      </a>
    )
    lastIndex = match.index + url.length
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>)
  }

  return <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words">{parts}</p>
}

function validateNumbers(text: string): { valid: boolean; errors: string[]; numbers: string[] } {
  const lines = text.split('\n').map(n => n.trim()).filter(Boolean)
  const errors: string[] = []
  const numbers: string[] = []

  for (const line of lines) {
    const digitsOnly = line.replace(/\D/g, '')

    // 1. No letras
    if (/[a-zA-Z]/.test(line)) {
      errors.push(`"${line.slice(0, 20)}" tiene letras. Solo números iniciando con codigo de area`)
      continue
    }

    // 2. Solo dígitos y + permitido
    if (/[^0-9+]/.test(line)) {
      errors.push(`"${line.slice(0, 20)}" tiene símbolos raros`)
      continue
    }

    // 3. Longitud: entre 7 y 14 dígitos
    if (digitsOnly.length < 7) {
      errors.push(`"${line.slice(0, 20)}" muy corto (${digitsOnly.length} dígitos, mínimo 7)`)
      continue
    }
    if (digitsOnly.length > 14) {
      errors.push(`"${line.slice(0, 20)}" muy largo (${digitsOnly.length} dígitos, máximo 14)`)
      continue
    }

    numbers.push(line)
  }

  return { valid: errors.length === 0 && numbers.length > 0, errors, numbers }
}



// Solo normaliza separadores. NO quita letras ni símbolos (el validador se encarga de rechazarlos visualmente)
function normalizeOnPaste(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/[;,]/g, '\n')   // comas/punto y coma → salto de línea
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .join('\n')
}

function resolveSpintax(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
    if (!content.includes('|')) return match
    const variants = content.split("|").map((s: string) => s.trim()).filter(Boolean)
    return variants.length ? variants[Math.floor(Math.random() * variants.length)] : ''
  })
}

function hasUrl(text: string): boolean {
  return /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(text)
}

function generatePreview(text: string, targetName = "Juan Pérez", targetPhone = "5491123456789"): string {
  let t = resolveSpintax(text)
  t = t.replace(/\{\{nombre\}\}/gi, targetName).replace(/\{nombre\}/gi, targetName)
  t = t.replace(/\{\{telefono\}\}/gi, targetPhone).replace(/\{telefono\}/gi, targetPhone)
  return t
}

function ensureClickableUrls(text: string): string {
  if (!text) return text
  return text
    .replace(
      /(^|\s)(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))(?=\s|$)/g,
      '$1https://$2'
    )
    .replace(
      /(^|\s)([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?)(?=\s|$)/g,
      (match, space, domain) => {
        if (/^https?:\/\//.test(domain)) return match
        return `${space}https://${domain}`
      }
    )
}


const getLogMeta = (log: string) => {
  if (log.startsWith('[OK]') || log.startsWith('[DONE]')) 
    return { icon: CheckCircle2, color: 'text-emerald-400' }
  if (log.startsWith('[ERR]')) 
    return { icon: XCircle, color: 'text-red-400' }
  if (log.startsWith('[SIM]')) 
    return { icon: FlaskConical, color: 'text-amber-400' }
  if (log.startsWith('[PROXY]')) 
    return { icon: Globe, color: 'text-cyan-400' }
  if (log.startsWith('[INFO]')) 
    return { icon: Info, color: 'text-blue-400' }
  if (log.startsWith('[WARN]')) 
    return { icon: AlertTriangle, color: 'text-orange-400' }
  if (log.startsWith('[CSV]')) 
    return { icon: Download, color: 'text-purple-400' }
  if (log.startsWith('[BL]')) 
    return { icon: ShieldBan, color: 'text-purple-400' }
  if (log.startsWith('[CAL]')) 
    return { icon: CalendarClock, color: 'text-pink-400' }
  if (log.startsWith('[CLONE]')) 
    return { icon: Copy, color: 'text-teal-400' }
  if (log.startsWith('[RECON]')) 
    return { icon: RotateCcw, color: 'text-sky-400' }
  if (log === '') 
    return { icon: null, color: 'h-2' } // separador
  return { icon: null, color: 'text-[var(--text-secondary)]' }
}

export default function Dashboard() {
  const router = useRouter()
  const { license, loading: licenseLoading, checked: licenseChecked, isActive } = useLicense()
  const { user, loading: authLoading, checked: authChecked, isAuthenticated } = useAuth()

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>("plan")
  const { isDemo } = useDemoMode()

  // Líneas
  const [lines, setLines] = useState<LineaWhatsApp[]>([])
  const [selectedLine, setSelectedLine] = useState<LineaWhatsApp | null>(null)
  const hasConnectedLine = lines.some(l => l.status === "CONECTADA")
  const selectedLineConnected = selectedLine?.status === "CONECTADA"
  
  // QR
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrTargetLine, setQrTargetLine] = useState<LineaWhatsApp | null>(null)
  const { openUpgrade } = useUpgradeModal()

  // Campaña
  const [numbersText, setNumbersText] = useState(isDemo ? "549115457458\n549115457458\n5492604500364" : "")
  const [message, setMessage] = useState("")

  const [isEditMode, setIsEditMode] = useState(false)
const [editCampaignId, setEditCampaignId] = useState<string | null>(null)
 const [skipBlacklist, setSkipBlacklist] = useState(true)
// const [blacklistCount, setBlacklistCount] = useState(0)

  const ensureClickableUrls = (text: string): string => {
    if (!text) return text
    // Detecta dominios sin protocolo (ej: google.com, www.ejemplo.com)
    // y les agrega https://
    return text.replace(
      /(^|\s)(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*))(?=\s|$)/g,
      '$1https://$2'
    ).replace(
      /(^|\s)([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?)(?=\s|$)/g,
      (match, space, domain) => {
        // Evitar reemplazar si ya tiene protocolo
        if (/^https?:\/\//.test(domain)) return match
        return `${space}https://${domain}`
      }
    )
  }

  const [imageUrl, setImageUrl] = useState("")
  const [delayMin, setDelayMin] = useState(4000)
  const [delayMax, setDelayMax] = useState(12000)
  const [isSending, setIsSending] = useState(false)
  const [numberSource, setNumberSource] = useState<"manual" | "contacts" | "tag">("manual")
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const { isOpen, options, confirm: askConfirm, onConfirm, onCancel } = useConfirm()

  const [campaignName, setCampaignName] = useState("")
  const [showImportNumbers, setShowImportNumbers] = useState(false)

  const [isVerifying, setIsVerifying] = useState(false)

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [verifyTimeout, setVerifyTimeout] = useState<NodeJS.Timeout | null>(null)

  // Contactos + Tags
  const [contactList, setContactList] = useState<Contact[]>([])
  const [tags, setTags] = useState<TagItem[]>([])


    const [scheduleMode, setScheduleMode] = useState<"now" | "pending" | "scheduled">("now")
  const [scheduleDate, setScheduleDate] = useState<string>("")
  const [humanMode, setHumanMode] = useState(false)

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
  const tierConfig = getTierConfig(license)
  const tierName = (license?.tier || 'starter') as TierName
  const isStarter = tierName === 'starter'
  const isPro = tierName === 'pro' || tierName === 'business'
  const isBusiness = tierName === 'business'
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') || '' : ''
  const [templates, setTemplates] = useState<any[]>([])
  const [showSpintaxHelp, setShowSpintaxHelp] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)
  // Import
  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [previewNumbers, setPreviewNumbers] = useState<string[]>([])
  const [pendingNumbers, setPendingNumbers] = useState<string[]>([])
  // Round-robin
  const [distributionMode, setDistributionMode] = useState<"single" | "round_robin">("single")
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])

  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const DEMO_BLACKLIST = ["549115457458", "5492604500364"]

const [blacklistNumbers, setBlacklistNumbers] = useState<string[]>(isDemo ? DEMO_BLACKLIST : [])
const [blacklistInList, setBlacklistInList] = useState<string[]>(isDemo ? DEMO_BLACKLIST : [])
const [blacklistCount, setBlacklistCount] = useState(isDemo ? DEMO_BLACKLIST.length : 0)
const [isLoadingBlacklist, setIsLoadingBlacklist] = useState(false)
const [duplicateNumbers, setDuplicateNumbers] = useState<string[]>(isDemo ? ["549115457458", "5491131237458", "54912223234"] : [])


  // Demo: inicializar datos de prueba después de montar
  // useEffect(() => {
  //   if (isDemo) {
  //     const DEMO_BLACKLIST = ["549115457458", "5492604500364"]
  //     const DEMO_NUMBERS = "549115457458\n549115457458\n5492604500364\n5492604621921"
      
  //     setNumbersText(DEMO_NUMBERS)
  //     setBlacklistNumbers(DEMO_BLACKLIST)
  //     setBlacklistInList(DEMO_BLACKLIST)
  //     setBlacklistCount(DEMO_BLACKLIST.length)
  //     setDuplicateNumbers(["549115457458"])
  //   }
  // }, [isDemo])

  const [simulationMode, setSimulationMode] = useState<'off' | 'lite' | 'full'>('off')
  const [isSimulating, setIsSimulating] = useState(false)
  
  const canSimulateLite = !isStarter && selectedLineIds.length > 0
  const canSimulateFull = isBusiness && selectedLineIds.length > 1 && distributionMode === 'round_robin'
  const isSimulationActive = simulationMode !== 'off'

  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

    const [proxyRotateEnabled, setProxyRotateEnabled] = useState(false)
  const [showProxyModal, setShowProxyModal] = useState(false)
  const [proxyLocation, setProxyLocation] = useState<{ city: string; fakeIp: string; country: string; code: string; latency: number } | null>(null)
  const [isScanningProxy, setIsScanningProxy] = useState(false)
  const [proxyScanText, setProxyScanText] = useState('Listo para escanear')

    const [proxyHistory, setProxyHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

const [auditing, setAuditing] = useState(false)
const [auditResult, setAuditResult] = useState<any>(null)
const [generatingTitle, setGeneratingTitle] = useState(false)
const [campaignSummary, setCampaignSummary] = useState<string | null>(null)
const [showSummaryModal, setShowSummaryModal] = useState(false)
const [hasAiKey, setHasAiKey] = useState(false)

  // Logs
  const [logs, setLogs] = useState<string[]>(() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wabisend_live_logs')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  }
  return []
})



  
const [aiFeatures, setAiFeatures] = useState({
  ai_audit_enabled: false,
  ai_title_enabled: false,
  ai_summary_enabled: false,
  ai_translate_enabled: false
})


const hasAiKeyRef = useRef(hasAiKey)
hasAiKeyRef.current = hasAiKey

const aiFeaturesRef = useRef(aiFeatures)
aiFeaturesRef.current = aiFeatures

  // ─── DERIVED ───
  const targetsCount = useMemo(() => {
    return numbersText.split("\n").map(n => n.trim()).filter(Boolean).length
  }, [numbersText])

  const filteredByTag = useMemo(() => {
    if (!selectedTagFilter) return contactList
    return contactList.filter(c => c.tags?.includes(selectedTagFilter))
  }, [selectedTagFilter, contactList])

  const toggleContact = (phone: string) => {
    const current = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
    if (current.includes(phone)) {
      setNumbersText(current.filter(p => p !== phone).join("\n"))
    } else {
      setNumbersText([...current, phone].join("\n"))
    }
  }

  const isPhoneSelected = (phone: string) => {
    return numbersText.split("\n").map(n => n.trim()).filter(Boolean).includes(phone)
  }

  // ─── FETCHES ───
  const fetchLines = async () => {
     if (isDemo) {
      // DEMO: 5 líneas conectadas con nombres variados
      setLines([
        { id: "demo-line-1", phone: "5491130000001", nombre: "Línea Principal", status: "CONECTADA" },
        { id: "demo-line-2", phone: "5491130000002", nombre: "Línea Ventas", status: "CONECTADA" },
        { id: "demo-line-3", phone: "5491130000003", nombre: "Línea Soporte", status: "CONECTADA" },
        { id: "demo-line-4", phone: "5491130000004", nombre: "Línea Marketing", status: "CONECTADA" },
        { id: "demo-line-5", phone: "5491130000005", nombre: "Línea Backup", status: "CONECTADA" },
      ])
      setSelectedLineIds(["demo-line-1", "demo-line-2", "demo-line-3", "demo-line-4", "demo-line-5"])
      return
    }
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch("/api/lineas", {
        headers: { Authorization: `Bearer ${t}` },
        cache: "no-store"
      })
      const data = await res.json()
      if (data.lines) setLines(data.lines)
    } catch {
      toast.error("Error cargando líneas")
    }
  }


  const deleteLine = async (lineId: string) => {
    const ok = await askConfirm({
      title: "Eliminar línea",
      description: "¿Eliminar esta línea permanentemente? Se perderá la sesión de WhatsApp y el historial asociado.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    })
    if (!ok) return
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch(`/api/lineas/${lineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchLines()
        if (selectedLine?.id === lineId) setSelectedLine(null)
        setSelectedLineIds(prev => prev.filter(id => id !== lineId))
        toast.success("Línea eliminada")
      } else {
        toast.error(data.error || "Error al eliminar")
      }
    } catch {
      toast.error("Error de red")
    }
  }


     const verifyCampaign = useCallback(() => {
    if (isDemo) {
      toast.info(" No podés enviar campañas en modo demo")
      return false
    }
    if (isSimulationActive) {
      if (!numbersText.trim()) {
        toast.error("Agregá al menos un número para simular")
        return false
      }
      if (selectedLineIds.length === 0) {
        toast.error("Seleccioná al menos una línea")
        return false
      }
      return true
    }

    setIsVerifying(true)
    setValidationErrors([])
    
    const { valid, errors, numbers } = validateNumbers(numbersText)
    
    if (!valid) {
      setValidationErrors(errors)
      setIsVerifying(false)
      return false
    }
    
    const seen = new Set<string>()
    const dupSet = new Set<string>() // ← únicos para visualización
    for (const n of numbers) {
      const clean = n.replace(/\D/g, '')
      if (seen.has(clean)) dupSet.add(clean)
      else seen.add(clean)
    }
    setDuplicateNumbers(Array.from(dupSet)) // ← 1 solo por número
    
    if (dupSet.size > 0) {
      setIsVerifying(false)
      return false
    }
    
    if (!message.trim()) {
      setValidationErrors(['El mensaje está vacío'])
      setIsVerifying(false)
      return false
    }

    const connectedLines = lines.filter(l => selectedLineIds.includes(l.id) && l.status === 'CONECTADA')
    if (connectedLines.length === 0) {
      setValidationErrors(['Seleccioná al menos una línea conectada'])
      setIsVerifying(false)
      return false
    }
    
    setIsVerifying(false)
    return true
  }, [numbersText, message, lines, selectedLineIds, isSimulationActive, isDemo, setIsVerifying, setValidationErrors, setDuplicateNumbers])


  const addLine = async () => {
    if (!newPhone.trim()) return toast.error("Escribí el número")
    if (lines.length >= tierConfig.maxLines) {
  setShowUpgrade(true)
  return
}
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch("/api/lineas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
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
    const t = localStorage.getItem('mb_token') || ''
    fetch("/api/lineas/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify({ phone: line.phone }),
    }).catch(() => { })
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
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch("/api/lineas/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ lineId }),
      })
      if (res.ok) {
        fetchLines()
        if (selectedLine?.id === lineId) setSelectedLine(null)
        setSelectedLineIds(prev => prev.filter(id => id !== lineId))
        toast.success("Línea desconectada")
      } else {
        toast.error("Error al desconectar")
      }
    } catch {
      toast.error("Error de red")
    }
  }

 const sendCampaign = async () => {
  const lineasParaEnviar = lines.filter(l => selectedLineIds.includes(l.id))
  const lineasConectadas = lineasParaEnviar.filter(l => l.status === "CONECTADA")

  if (lineasConectadas.length === 0) {
    return toast.error("Seleccioná al menos una línea conectada")
  }

  const rawNumbers = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
  const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ""), name: "" }))
  if (targets.length === 0) return toast.error("No hay números válidos")

  const isRoundRobin = distributionMode === 'round_robin' && lineasConectadas.length > 1

    // Limpiar logs previos al iniciar nueva campaña (auto-limpieza)
  setLogs([])
  
  setIsSending(true)
  setLogs(prev => [...prev, `🚀 ${isEditMode ? 'Guardando cambios' : scheduleMode === 'now' ? 'Campaña iniciada' : 'Campaña guardada'}: ${targets.length} números · ${lineasConectadas.length} línea(s)`])

  if (proxyRotateEnabled && proxyLocation) {
      setLogs(prev => [...prev, `🌐 Proxy Rotate: Conectando con nodo ${proxyLocation.city}...`])
      await new Promise(r => setTimeout(r, 800))
      setLogs(prev => [...prev, `✅ Ruta establecida via ${proxyLocation.city} (${proxyLocation.country}) · IP: ${proxyLocation.fakeIp} · Latencia: ${proxyLocation.latency}ms`])
      await new Promise(r => setTimeout(r, 400))
      setLogs(prev => [...prev, `🔒 IP dinámica activa · Modo anti-ban agresivo`])
      await new Promise(r => setTimeout(r, 300))
    }
    if ((scheduleMode === 'pending' || scheduleMode === 'scheduled') && !proxyRotateEnabled) {
      router.push("dashboard/reports")
    } else if (scheduleMode === 'pending' || scheduleMode === 'scheduled') {
      setTimeout(() => router.push("dashboard/reports"), 2000) // ← dar 2s para leer logs
    }
  try {
    const t = localStorage.getItem('mb_token') || ''
    const body = {
      name: campaignName.trim() || undefined,
      targets,
      message: ensureClickableUrls(message),
      image_url: imageUrl || undefined,
      delay_min: delayMin,
      delay_max: delayMax,
      schedule: scheduleMode,
       execute_at: scheduleMode === 'scheduled' && scheduleDate 
        ? new Date(scheduleDate).toISOString() // ← el input datetime-local ya viene en hora local del navegador, lo convertimos a UTC ISO
        : undefined,
      line_ids: lineasConectadas.map(l => l.id),
      distribution_mode: isRoundRobin ? 'round_robin' : 'single',
      human_mode: humanMode,
      skipBlacklist: isBusiness ? skipBlacklist : false,
      proxy_node: proxyRotateEnabled ? proxyLocation?.city : undefined,
      proxy_ip: proxyRotateEnabled ? proxyLocation?.fakeIp : undefined
    }

    let res
    if (isEditMode && editCampaignId) {
      // === MODO EDICIÓN: PATCH ===
      res = await fetch(`/api/campaigns/${editCampaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify(body)
      })
    } else {
      // === MODO CREACIÓN: POST ===
      res = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify(body)
      })
    }

    const data = await res.json()
    if (data.success) {
      const actionText = isEditMode ? 'Campaña actualizada' 
        : scheduleMode === 'pending' ? 'Campaña guardada en espera' 
        : scheduleMode === 'scheduled' ? `Campaña programada: ${targets.length} números` 
        : `Campaña iniciada: ${targets.length} números · Modo: ${isRoundRobin ? 'Round-robin' : 'Línea única'}`
      
      toast.success(actionText)
      setLogs(prev => [...prev, `✅ ${isEditMode ? 'Editada' : 'Creada'} ${data.campaign?.id || ''} | ${targets.length} msgs`])
      
      if (scheduleMode === 'pending' || scheduleMode === 'scheduled') {
        router.push("dashboard/reports")
      } else {
        setActiveTab("logs")
      }
      
      // Salir de modo edición
      if (isEditMode) {
        setIsEditMode(false)
        setEditCampaignId(null)
      }
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

    const sendSimulation = async () => {
    const lineasParaEnviar = lines.filter(l => selectedLineIds.includes(l.id))
    const lineasConectadas = lineasParaEnviar.filter(l => l.status === "CONECTADA")

    if (lineasConectadas.length === 0) {
      return toast.error("Seleccioná al menos una línea conectada")
    }

    const rawNumbers = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
    const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ""), name: "" }))
    if (targets.length === 0) return toast.error("No hay números válidos")

    if (simulationMode === 'lite' && !isBusiness && targets.length > 1) {
      return toast.error("Simulacro Lite: máximo 1 número. Upgrade a Business para ilimitado.")
    }

    setIsSimulating(true)
    setActiveTab("logs")
    setLogs([])

    try {
      const t = localStorage.getItem('mb_token') || ''
      const body = {
        targets,
        line_ids: lineasConectadas.map(l => l.id),
        mode: simulationMode
      }

      // 1. Crear campaña simulated en backend
      const res = await fetch("/api/campaigns/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Error')

      const campaignId = data.campaign.id
      const total = targets.length

      setLogs(prev => [...prev, `🔥 Iniciando modo simulacro (${simulationMode})...`])
      setLogs(prev => [...prev, `📡 Conectando con ${lineasConectadas.length} nodo(s)...`])
      await new Promise(r => setTimeout(r, 800))

      // 2. Simular pings uno por uno
      const simulatedLogs: { contact_phone: string, line_id: string, latency: number }[] = []
      
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i]
        const line = lineasConectadas[Math.floor(Math.random() * lineasConectadas.length)]
        const latency = Math.floor(Math.random() * 80) + 20 // 20-100ms
        
        // Delay progresivo: más rápido para muchos números
              // Delay según velocidad seleccionada
      const speedConfig = {
        slow: { base: 150, variance: 100, batchPause: 800 },    // ~150-250ms por ping
        normal: { base: 50, variance: 50, batchPause: 400 },   // ~50-100ms por ping
        fast: { base: 15, variance: 20, batchPause: 200 }       // ~15-35ms por ping
      }
      const cfg = speedConfig[simulationSpeed]
      
      for (let i = 0; i < targets.length; i++) {
        // ...
        const delay = Math.random() * cfg.variance + cfg.base
        await new Promise(r => setTimeout(r, delay))
        
        // Batch pause
        if ((i + 1) % 20 === 0 && i < targets.length - 1) {
          setLogs(prev => [...prev, `⏳ Verificando batch ${Math.ceil((i + 1) / 20)}/${Math.ceil(total / 20)}...`])
          await new Promise(r => setTimeout(r, cfg.batchPause))
        }
      }

        setLogs(prev => [...prev, `✅ Handshake ${target.phone} · ${latency}ms · nodo ${line.id.slice(0, 8)}`])
        simulatedLogs.push({ contact_phone: target.phone, line_id: line.id, latency })

        // Batch pause cada 20 números (simula verificación de bloque)
        if ((i + 1) % 20 === 0 && i < targets.length - 1) {
          setLogs(prev => [...prev, `⏳ Verificando batch ${Math.ceil((i + 1) / 20)}/${Math.ceil(total / 20)}...`])
          await new Promise(r => setTimeout(r, 400))
        }
      }

      setLogs(prev => [...prev, `✅ Simulacro EXITOSO: ${total} número(s) verificado(s)`])
      const avgLatency = Math.floor(simulatedLogs.reduce((a, b) => a + b.latency, 0) / simulatedLogs.length)
      setLogs(prev => [...prev, `📊 Latencia promedio: ${avgLatency}ms`])

      toast.success(`Simulacro exitoso: ${total} pings verificados`)
    } catch (err: any) {
      toast.error(err.message || "Error en simulacro")
      setLogs(prev => [...prev, `❌ Error: ${err.message}`])
    } finally {
      setIsSimulating(false)
    }
  }

  // ─── IMPORT / NUMBERS ───
  const extractNumbersFromSheet = (data: any[][]): string[] => {
    const numbers: string[] = []
    data.forEach((row: any[]) => {
      row.forEach((cell: any) => {
        const str = String(cell || '').trim()
        const cleaned = str.replace(/\D/g, '')
        if (cleaned.length >= 8) numbers.push(cleaned)
      })
    })
    return Array.from(new Set(numbers))
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
          const text = String(buffer || '')
          const raw = text.split(/[\n\r,\s\t;]+/).map(n => n.trim()).filter(Boolean)
          numbers = raw.map(n => n.replace(/\D/g, '')).filter(n => n.length >= 8)
          numbers = Array.from(new Set(numbers))
        }
      } catch (err) {
        console.error('Error parseando archivo:', err)
        toast.error('Error leyendo el archivo.')
        setImportLoading(false)
        return
      }

      setTimeout(() => {
        setImportedCount(numbers.length)
        setPreviewNumbers(numbers.slice(0, 20))
        setPendingNumbers(numbers)
        setImportLoading(false)
        setImportProgress(0)
        if (numbers.length === 0) toast.error('No se encontraron números válidos')
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
    const merged = Array.from(new Set([...current, ...pendingNumbers]))
    setNumbersText(merged.join("\n"))
    toast.success(`${pendingNumbers.length} números agregados`)
    setShowImportNumbers(false)
    setImportedCount(0)
    setPreviewNumbers([])
    setPendingNumbers([])
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

const clearLiveLogs = () => {
  setLogs([])
  localStorage.removeItem('wabisend_live_logs')
}

useEffect(() => {
  if (isDemo) return
    if (verifyTimeout) clearTimeout(verifyTimeout)
    const raw = numbersText.trim()
    if (!raw) {
      setDuplicateNumbers([])
      setValidationErrors([])
      setIsVerifying(false)
      return
    }
    setIsVerifying(true)
    const t = setTimeout(() => {
      // Usa la función estricta única (ya no existe verifyNumbers paralela)
      const { valid, errors, numbers } = validateNumbers(numbersText)
      setValidationErrors(errors)

      // Calcular duplicados sobre los números que pasaron validación estricta
      const seen = new Set<string>()
      const dups: string[] = []
      for (const n of numbers) {
        const clean = n.replace(/\D/g, '')
        if (seen.has(clean)) dups.push(n)
        else seen.add(clean)
      }
      setDuplicateNumbers(dups)
      setIsVerifying(false)
    }, 3000)
    setVerifyTimeout(t)
    return () => clearTimeout(t)
  }, [numbersText])

    const openBlacklistModal = async () => {
    setShowBlacklistModal(true)
    setIsLoadingBlacklist(true)
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/blacklist', {
        headers: { Authorization: `Bearer ${t}` }
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      setBlacklistNumbers(data.blacklist?.map((b: any) => b.phone) || [])
    } catch {
      setBlacklistNumbers([])
    } finally {
      setIsLoadingBlacklist(false)
    }
  }

     const removeAllDuplicates = () => {
    const lines = numbersText.split('\n').map(n => n.trim()).filter(Boolean)
    const seen = new Set<string>()
    const unique: string[] = []
    
    for (const line of lines) {
      const clean = line.replace(/\D/g, '')
      if (!seen.has(clean)) {
        seen.add(clean)
        unique.push(line) // conservamos el formato original
      }
    }
    
    setNumbersText(unique.join('\n'))
    setDuplicateNumbers([])
    toast.success("Duplicados eliminados. Se conservó 1 de cada número.")
  }

  const removeSpecificNumber = (numToRemove: string) => {
    if (isDemo) return
    const cleanRemove = numToRemove.replace(/\D/g, '')
    const lines = numbersText.split('\n').map(n => n.trim()).filter(Boolean)
    const filtered = lines.filter(n => n.replace(/\D/g, '') !== cleanRemove)
    setNumbersText(filtered.join('\n'))
    
    // Recalcular duplicados
    const counts: Record<string, number> = {}
    for (const n of filtered) {
      const clean = n.replace(/\D/g, '')
      counts[clean] = (counts[clean] || 0) + 1
    }
    const dups = filtered.filter(n => counts[n.replace(/\D/g, '')] > 1)
    setDuplicateNumbers(Array.from(new Set(dups)))
  }

   useEffect(() => {
    if (numbersText.trim() === '') {
      setValidationErrors([])
      return
    }
    if (validationErrors.length > 0) {
      const { valid } = validateNumbers(numbersText)
      if (valid) setValidationErrors([])
    }
  }, [numbersText])
  // ─── STATUS STYLES ───
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

  // ─── EFFECTS ───
  useEffect(() => {
    if (!tierConfig.hasClone) return
    const cloned = localStorage.getItem('mb_clone_campaign')
    if (!cloned) return
    try {
      const data = JSON.parse(cloned)
      localStorage.removeItem('mb_clone_campaign')
      setActiveTab('campaign')
      setNumberSource('manual')
      setMessage(data.message || '')
      setImageUrl(data.image_url || '')
      setCampaignName(data.name || '')
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
  }, [tierConfig.hasClone])


  useEffect(() => {
    if (logsEndRef.current && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  // === MODO EDICIÓN: precargar campaña pendiente desde Reports ===
useEffect(() => {
  const editRaw = localStorage.getItem('mb_edit_campaign')
  if (!editRaw) return
  try {
    const data = JSON.parse(editRaw)
    localStorage.removeItem('mb_edit_campaign')
    
    setIsEditMode(true)
    setEditCampaignId(data.id)
    setActiveTab('campaign')
    setNumberSource('manual')
    setImageUrl(data.image_url || '')
    setCampaignName(data.name || '')
    setMessage(data.message || '')
    setImageUrl(data.image_url || '')
    setDelayMin(data.delay_min || 4000)
    setDelayMax(data.delay_max || 12000)
    
    if (data.targets && Array.isArray(data.targets)) {
      setNumbersText(data.targets.map((t: any) => t.phone).filter(Boolean).join('\n'))
    }
    
    if (data.line_ids && Array.isArray(data.line_ids)) {
      setSelectedLineIds(data.line_ids)
    }
    
    if (data.scheduled?.execute_at) {
      setScheduleMode('scheduled')
      setScheduleDate(new Date(data.scheduled.execute_at).toISOString().slice(0,16))
    } else {
      setScheduleMode('pending')
    }
    
    toast.success(`Editando: ${data.name}`)
  } catch (e) {
    console.error('Error cargando edición:', e)
  }
}, [])


useEffect(() => {
  const tplPayload = localStorage.getItem('mb_template_payload')
  if (tplPayload) {
    try {
      const data = JSON.parse(tplPayload)
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        setActiveTab('campaign' as TabType)
        setNumberSource('manual')
        setMessage(data.message || '')
        // ✅ Si el template trae imagen, la cargamos. Si no, limpiamos.
        setImageUrl(data.imageUrl || '')
        toast.info(`📄 Template "${data.templateName}" cargado`)
      }
      localStorage.removeItem('mb_template_payload')
    } catch {}
  }

  const urlParams = new URLSearchParams(window.location.search)
  const tabFromUrl = urlParams.get('tab')
  const validTabs: TabType[] = ['plan', 'lines', 'campaign', 'logs']
  if (tabFromUrl && validTabs.includes(tabFromUrl as TabType)) {
    setActiveTab(tabFromUrl as TabType)
    window.history.replaceState({}, '', '/dashboard')
  }
}, [])


// Persistir logs en vivo
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wabisend_live_logs', JSON.stringify(logs))
  }
}, [logs])

  useEffect(() => {
    if (licenseLoading || authLoading || !licenseChecked || !authChecked) return
    if (!isActive) { router.push("/setup"); return }
    if (!isAuthenticated) { router.push("/login"); return }
  }, [licenseLoading, authLoading, licenseChecked, authChecked, isActive, isAuthenticated, router])
  
  useEffect(() => {
    if (isActive && isAuthenticated) fetchLines()
  }, [isActive, isAuthenticated])


  const socketRef = useRef<any>(null)


 useEffect(() => {
  if (isDemo) {
    setSocketConnected(true)
    return
  }
  
  if (!SOCKET_URL || !isActive) {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocketConnected(false)
    }
    return
  }
  
  if (socketRef.current?.connected) return
  
    const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('mb_token') || localStorage.getItem('wabisend_token') || '') 
    : ''
  
  const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: { token }, // ← 🔒 Token para pasar el middleware
  })
  
  socketRef.current = socket
  
  socket.on("connect", () => setSocketConnected(true))
  socket.on("disconnect", () => setSocketConnected(false))
  
  socket.on("campaign_log", (payload: any) => {
    if (payload.isEmergencyStop) {
      setLogs(prev => [...prev, `🚨🚨🚨 TODAS LAS LÍNEAS CAÍDAS - CAMPAÑA DETENIDA 🚨🚨🚨`])
      return
    }
    const icon = payload.status === 'sent' ? '✅' : '❌'
    setLogs(prev => [...prev, `${icon} ${payload.progress} → ${payload.phone} [${payload.linePhone}]`])
  })
  
  // ✅ CAMPAÑA COMPLETE: usar refs para valores actuales
  socket.on("campaign_complete", async (payload: any) => {
    console.log('📡 RECIBIDO campaign_complete:', payload)
    setLogs(prev => [...prev, `🏁 Campaña ${payload.campaignId} finalizada · ${payload.sent} enviados · ${payload.failed} fallidos`])
    
    // Usar refs para leer valores actuales (no stale closure)
    const keyOk = hasAiKeyRef.current
    const summaryEnabled = aiFeaturesRef.current?.ai_summary_enabled
    const isDemoMode = isDemo
    
    console.log('🔍 hasAiKeyRef:', keyOk, 'summaryEnabled:', summaryEnabled, 'isDemo:', isDemoMode)
    
    if ((keyOk && summaryEnabled) || isDemoMode) {
      console.log('✅ Condición OK, llamando a /api/ai/summary')
      try {
        const t = localStorage.getItem('mb_token') || ''
        const res = await fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${t}` 
          },
          body: JSON.stringify({
            campaignId: payload.campaignId,
            sent: payload.sent,
            failed: payload.failed,
            total: payload.sent + payload.failed
          })
        })
        console.log('📡 Response status:', res.status)
        const data = await res.json()
        console.log('📡 Response data:', data)
        if (data.summary) {
          setCampaignSummary(data.summary)
          setShowSummaryModal(true)
          setLogs(prev => [...prev, `🤖 Caleb: ${data.summary}`])
        }
      } catch (err) {
        console.error('❌ Error en fetch summary:', err)
      }
    } else {
      console.log('❌ Condición FALLIDA')
    }
  })

  socket.on("status", (data: { lineId: string, status: string, reason?: string }) => {
    setLines(prev => prev.map(l => 
      l.id === data.lineId ? { ...l, status: data.status } : l
    ))
    if (data.status === 'DESCONECTADA') {
      setSelectedLineIds(prev => prev.filter(id => id !== data.lineId))
      setSelectedLine(prev => prev?.id === data.lineId ? null : prev)
    }
  })

  return () => {
    socket.off("connect")
    socket.off("disconnect")
    socket.off("campaign_log")
    socket.off("campaign_complete")
    socket.off("status")
    socket.disconnect()
    socketRef.current = null
  }
}, [isActive, isDemo])



  useEffect(() => {
  if (!isAuthenticated && !isDemo) return
  const loadFeatures = async () => {
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/me/ai-features', {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.features) setAiFeatures(data.features)
    } catch {}
  }
  loadFeatures()
}, [isAuthenticated, isDemo])

  const checkBlacklistInNumbers = useCallback(async (text: string) => {
    if (isDemo) return // demo ya tiene datos hardcodeados

    console.log('[BL] Starting check. hasBlacklist:', tierConfig?.hasBlacklist, 'text:', text?.slice(0, 30))

    if (!tierConfig?.hasBlacklist) {  // ← ✅ FIX: Pro y Business tienen hasBlacklist
      console.log('[BL] Abort: plan sin blacklist')
      setBlacklistInList([])
      return
    }
    if (!text.trim()) {
      setBlacklistInList([])
      return
    }

    const lines = text.split('\n').map(n => n.trim()).filter(Boolean)
    const phones = lines.map(n => n.replace(/\D/g, '')).filter(p => p.length >= 7)
    console.log('[BL] Parsed phones:', phones)

    if (phones.length === 0) {
      setBlacklistInList([])
      return
    }

    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/blacklist', {
        headers: { Authorization: `Bearer ${t}` }
      })
      console.log('[BL] API status:', res.status)

      if (!res.ok) {
        const errText = await res.text()
        console.warn('[BL] API error:', errText)
        throw new Error('fail')
      }

      const data = await res.json()
      console.log('[BL] API response:', data)

      const rawList: any[] = Array.isArray(data?.blacklist) 
        ? data.blacklist 
        : (Array.isArray(data) ? data : [])
      
      console.log('[BL] Raw entries:', rawList.length, rawList.slice(0, 3))

      const blacklistedPhones = new Set(
        rawList
          .map((b: any) => String(b?.phone || '').replace(/\D/g, ''))
          .filter((p: string) => p.length > 0)
      )
      console.log('[BL] Set contents:', Array.from(blacklistedPhones))

      let found = phones.filter(p => blacklistedPhones.has(p))
      found = Array.from(new Set(found))

      if (found.length === 0 && blacklistedPhones.size > 0) {
        const phonesShort = phones.map(p => p.slice(-10))
        const blacklistShort = new Set(
          Array.from(blacklistedPhones).map((p: string) => p.slice(-10))
        )
        found = phones.filter((_, i) => blacklistShort.has(phonesShort[i]))
        found = Array.from(new Set(found))
        console.log('[BL] Fallback matches (last 10):', found)
      }

      console.log('[BL] Final found:', found)
      setBlacklistInList(found)
    } catch (err) {
      console.error('[BL] Catch error:', err)
      setBlacklistInList([])
    }
  }, [tierConfig?.hasBlacklist, isDemo])  // ← dependencia cambiada


    useEffect(() => {
    if (!tierConfig?.hasBlacklist || !numbersText.trim()) {
      setBlacklistInList([])
      return
    }
    const timer = setTimeout(() => {
      checkBlacklistInNumbers(numbersText)
    }, 600)
    return () => clearTimeout(timer)
  }, [numbersText, tierConfig?.hasBlacklist, checkBlacklistInNumbers])

  useEffect(() => {
    if (tierConfig?.hasBlacklist && numbersText.trim()) {
      console.log('[BL] hasBlacklist true, re-checking...')
      checkBlacklistInNumbers(numbersText)  
    }
  }, [tierConfig?.hasBlacklist, numbersText, checkBlacklistInNumbers])

  // Efecto 2: cuando isBusiness pasa de false a true y ya hay texto
  useEffect(() => {
    if (isBusiness && numbersText.trim()) {
      console.log('[BL] isBusiness became true, re-checking...')
      checkBlacklistInNumbers(numbersText)  
    }
  }, [isBusiness, numbersText, checkBlacklistInNumbers])


  useEffect(() => {
    if (humanMode) {
      toast.warning("Modo Humano PRO activado: simula escritura letra por letra. El envío será ~3x más lento. Recomendado exclusivamente para contactos VIP (<10 números).", {
        duration: 8000,
        action: {
          label: "Entendido",
          onClick: () => {}
        }
      })
    }
  }, [humanMode])

useEffect(() => {
  if (!isAuthenticated && !isDemo) return
  
  if (isDemo) {
    setContactList(DEMO_CONTACTS)
    setTags(DEMO_TAGS)
    setTemplates(DEMO_TEMPLATES)
    setHasAiKey(true)  // demo tiene IA
    setAiFeatures({
      ai_audit_enabled: true,
      ai_title_enabled: true,
      ai_summary_enabled: true,
      ai_translate_enabled: true
    })
    return
  }

  const t = localStorage.getItem('mb_token') || ''

  // Cargar todo en paralelo
  fetch("/api/contacts", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
    .then(r => r.json())
    .then(data => setContactList(data.contacts || []))
    .catch(() => {})

  fetch("/api/tags/stats", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
    .then(r => r.json())
    .then(data => setTags(data.tags || []))
    .catch(() => {})

  fetch("/api/templates", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
    .then(r => r.json())
    .then(data => setTemplates(data.templates || []))
    .catch(() => {})

  // Verificar API key de IA (independiente)
  fetch('/api/openai/config', { 
    headers: { Authorization: `Bearer ${t}` },
    cache: 'no-store'
  })
    .then(r => r.json())
    .then(data => setHasAiKey(data.hasKey || false))  // ← hasKey, no hasAiKey
    .catch(() => setHasAiKey(false))

  // Cargar features de IA
  fetch('/api/me/ai-features', {
    headers: { Authorization: `Bearer ${t}` },
    cache: 'no-store'
  })
    .then(r => r.json())
    .then(data => {
      if (data.features) setAiFeatures(data.features)
    })
    .catch(() => {})

}, [isAuthenticated, isDemo])
  

    // DEMO: Precargar campaña con datos inflados
  useEffect(() => {
    if (isDemo && activeTab === "campaign") {
      const demoNumbers = Array.from({ length: 500 }, (_, i) => 
        `54911${String(30000000 + i).slice(-8)}`
      ).join('\n')
      setNumbersText(demoNumbers)
      setCampaignName("🔥 Black Friday 2026 - Mega Promo")
      setMessage("{{Hola|Buenas|Hey}} {{nombre|amigo|crack}}, tenemos 70% OFF en todo el catálogo solo por hoy. {{Aprovechá|No te lo pierdas|Corré que vuela}} → https://mundialblaster.com/oferta\n\n⚡ Stock limitado. Respondé STOP para darte de baja.")
      setImageUrl("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600")
      setSelectedLineIds(["demo-line-1", "demo-line-2", "demo-line-3", "demo-line-4", "demo-line-5"])
      setDistributionMode("round_robin")
      setHumanMode(true)
      setDelayMin(5000)
      setDelayMax(15000)
      setScheduleMode("now")
    }
  }, [isDemo, activeTab])

useEffect(() => {
  if (!tierConfig?.hasBlacklist && !isDemo) return
  const load = async () => {
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/blacklist', { headers: { Authorization: `Bearer ${t}` } })
      if (res.ok) {
        const data = await res.json()
        setBlacklistCount(data.blacklist?.length || 0)
      }
    } catch {}
  }
  load()
}, [tierConfig?.hasBlacklist, isDemo])


    const PROXY_NODES = [
    { city: 'São Paulo', country: 'Brasil', code: 'BR', latency: 45, x: 32, y: 72, fakeIp: '189.84.123.45' },
    { city: 'Miami', country: 'USA', code: 'US', latency: 28, x: 24, y: 38, fakeIp: '72.215.89.201' },
    { city: 'Frankfurt', country: 'Alemania', code: 'DE', latency: 35, x: 52, y: 32, fakeIp: '85.214.56.112' },
    { city: 'Singapur', country: 'Singapur', code: 'SG', latency: 52, x: 78, y: 55, fakeIp: '103.243.12.88' },
    { city: 'Buenos Aires', country: 'Argentina', code: 'AR', latency: 38, x: 30, y: 78, fakeIp: '181.16.45.77' },
    { city: 'Amsterdam', country: 'Países Bajos', code: 'NL', latency: 33, x: 50, y: 30, fakeIp: '82.196.78.34' },
    { city: 'Londres', country: 'Reino Unido', code: 'GB', latency: 36, x: 48, y: 28, fakeIp: '51.104.92.11' },
    { city: 'Tokio', country: 'Japón', code: 'JP', latency: 48, x: 85, y: 35, fakeIp: '133.242.67.55' },
  ]

  const selectOptimalProxy = async () => {
    setIsScanningProxy(true)
    const texts = [
      'Escaneando nodos globales...',
      'Analizando latencia de red...',
      'Verificando disponibilidad...',
      'Comparando rutas...',
      'Nodo óptimo encontrado'
    ]
    for (const t of texts) {
      setProxyScanText(t)
      await new Promise(r => setTimeout(r, 900))
    }
    const selected = PROXY_NODES[Math.floor(Math.random() * PROXY_NODES.length)]
    setProxyLocation(selected)
    localStorage.setItem('wabisend_proxy_location', JSON.stringify(selected))
    await saveProxyToHistory(selected) // ← AGREGAR
    setIsScanningProxy(false)
    setProxyScanText(`Ruta óptima: ${selected.city} (${selected.latency}ms)`)

    
  }

  const clearProxy = () => {
    setProxyRotateEnabled(false)
    setProxyLocation(null)
    localStorage.removeItem('wabisend_proxy_location')
    setProxyScanText('Listo para escanear')
  }



        const saveProxyToHistory = async (proxy: any) => {
    if (isDemo) {
      // Demo: solo memoria local, no tocar DB
      setProxyHistory(prev => {
        const exists = prev.some((p: any) => p.city === proxy.city && p.fakeIp === proxy.fakeIp)
        if (exists) return prev
        return [{
          city: proxy.city,
          country: proxy.country,
          code: proxy.code,
          fakeIp: proxy.fakeIp,
          latency: proxy.latency,
          usedAt: new Date().toISOString(),
          timesUsed: 1,
        }, ...prev].slice(0, 10)
      })
      return
    }
    try {
      const t = localStorage.getItem('mb_token') || ''
      await fetch('/api/proxy/history', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${t}` 
      },
      body: JSON.stringify({
        city: proxy.city,
        country: proxy.country,
        code: proxy.code,
        fakeIp: proxy.fakeIp,
        latency: proxy.latency
      })
    })
  } catch (e) {
    console.error('Error saving proxy history:', e)
  }
}

      const loadProxyHistory = async () => {
    setIsLoadingHistory(true)
    if (isDemo) {
      // Demo: datos mock en memoria
      setProxyHistory([
        { city: 'São Paulo', country: 'Brasil', code: 'BR', fakeIp: '189.84.123.45', latency: 45, usedAt: new Date().toISOString(), timesUsed: 3 },
        { city: 'Frankfurt', country: 'Alemania', code: 'DE', fakeIp: '85.214.56.112', latency: 35, usedAt: new Date(Date.now() - 86400000).toISOString(), timesUsed: 1 },
      ])
      setIsLoadingHistory(false)
      return
    }
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/proxy/history', {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store'
      })
      const data = await res.json()
      setProxyHistory(data.history || [])
    } catch {
      setProxyHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }


  useEffect(() => {
    const saved = localStorage.getItem('wabisend_proxy_location')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProxyLocation(parsed)
        setProxyRotateEnabled(true)
      } catch {}
    }
  }, [])


    // DEMO: Logs históricos
  useEffect(() => {
    if (isDemo && activeTab === "logs") {
      setLogs([
        // ─── FASE 0: SIMULACRO (calentar líneas) ───
        "[SIM] Simulacro iniciado: 500 pings · calentando 5 líneas",
        "[SIM] Línea Principal: ping 45ms · status CONECTADA",
        "[SIM] Línea Ventas: ping 52ms · status CONECTADA",
        "[SIM] Línea Soporte: ping 38ms · status CONECTADA",
        "[SIM] Línea Marketing: ping 61ms · status CONECTADA",
        "[SIM] Línea Backup: ping 41ms · status CONECTADA",
        "[DONE] Simulacro completado: 5/5 líneas saludables",
        "",
        // ─── FASE 1: PROXY ROTATE ───
        "[PROXY] Estableciendo conexión con nodo Inglaterra...",
        "[PROXY] Escaneando nodos globales: US, DE, BR, SG, JP, AR, NL",
        "[PROXY] Nodos activos encontrados: 8/8",
        "[PROXY] Ruta óptima seleccionada: Londres, UK",
        "[PROXY] IP asignada: 51.104.92.11 · Latencia: 36ms",
        "[PROXY] Modo anti-ban agresivo activado",
        "[DONE] Proxy Rotate configurado: Londres (36ms)",
        "",
        // ─── FASE 2: CAMPAÑA EN VIVO ───
        "[OK] Campaña iniciada: 500 números · 5 líneas · Round-robin · Delay: 5-15s",
        "[OK] 1/500 → 5491130000001 [Línea Principal] · 2.3s",
        "[OK] 2/500 → 5491130000002 [Línea Ventas] · 4.1s",
        "[OK] 3/500 → 5491130000003 [Línea Soporte] · 3.8s",
        "[OK] 4/500 → 5491130000004 [Línea Marketing] · 2.9s",
        "[OK] 5/500 → 5491130000005 [Línea Backup] · 5.2s",
        "[INFO] Modo humano activado: simulando escritura letra por letra...",
        "[OK] 6/500 → 5491130000006 [Línea Principal] · 12.4s (modo humano)",
        "[OK] 7/500 → 5491130000007 [Línea Ventas] · 8.7s",
        "[OK] 8/500 → 5491130000008 [Línea Soporte] · 6.3s",
        "[ERR] 9/500 → 5491130000009 [Línea Marketing] · Número inválido",
        "[OK] 10/500 → 5491130000010 [Línea Backup] · 4.5s",
        "[OK] 11/500 → 5491130000011 [Línea Principal] · 3.2s",
        "[OK] 12/500 → 5491130000012 [Línea Ventas] · 7.1s (modo humano)",
        "[OK] 13/500 → 5491130000013 [Línea Soporte] · 5.8s",
        "[OK] 14/500 → 5491130000014 [Línea Marketing] · 4.2s",
        "[OK] 15/500 → 5491130000015 [Línea Backup] · 6.9s",
        "[INFO] Campaña #1 finalizada · 499 enviados · 1 fallido · Tasa: 99.8%",
        "",
        // ─── FASE 3: MÚLTIPLES CAMPAÑAS ───
        "[OK] Campaña iniciada: 1250 números · 3 líneas · Modo: Single",
        "[OK] 1/1250 → 5491130005678 [Línea Principal] · 3.1s",
        "[OK] 2/1250 → 5491130005679 [Línea Principal] · 2.8s",
        "[OK] 3/1250 → 5491130005680 [Línea Ventas] · 4.5s",
        "[INFO] Campaña #2 finalizada · 1248 enviados · 2 fallidos · Tasa: 99.8%",
        "[OK] Campaña iniciada: 890 números · 2 líneas · Modo: Round-robin",
        "[OK] 1/890 → 5491130009001 [Línea Soporte] · 3.4s",
        "[OK] 2/890 → 5491130009002 [Línea Marketing] · 5.1s",
        "[INFO] Campaña #3 en ejecución · 456 enviados · 0 fallidos",
        "",
        // ─── FASE 4: UTILIDADES ───
        "[CAL] Programada: Reactivación Clientes · 2100 números · 30/05 09:00",
        "[CLONE] Clonación 1-click: Campaña 'Promo Verano' duplicada",
        "[WARN] Reconexión keep-alive: Línea Principal reconectada automáticamente",
        "[CSV] Export: 3847 contactos descargados",
        "[BL] Blacklist: 23 números bloqueados",
      ])
    }
  }, [isDemo, activeTab])


  

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

  // ─── LOADING / AUTH GUARD ───
  if (licenseLoading || authLoading || !licenseChecked || !authChecked) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!isActive || !isAuthenticated) return null

  const tabs = [
    { id: "plan" as TabType, label: "Plan", icon: Activity },
    { id: "lines" as TabType, label: "Líneas", icon: Users },
    { id: "campaign" as TabType, label: "Campaña", icon: Send },
    { id: "logs" as TabType, label: "Logs", icon: CheckCircle2 },
  ]


  


  function SaludoAleatorio() {
  const [saludo, setSaludo] = useState<{ texto: string; Icono: any; color: string } | null>(null)

  useEffect(() => {
    const saludos = [
      { texto: "¿Qué campaña vas a romper hoy?", Icono: Rocket, color: "text-red-400" },
      { texto: "¿A quién le vas a vender hoy?", Icono: DollarSign, color: "text-emerald-400" },
      { texto: "¿Cuál es el objetivo de hoy?", Icono: Target, color: "text-blue-400" },
      { texto: "¿Listo para escalar?", Icono: LineChart, color: "text-purple-400" },
      { texto: "¿Qué producto va a volar hoy?", Icono: ShoppingBag, color: "text-amber-400" },
      { texto: "¿A qué hora arrancamos el envío masivo?", Icono: Clock, color: "text-cyan-400" },
      { texto: "¿Hoy toca nuevo template o campaña?", Icono: Sparkles, color: "text-yellow-400" },
      { texto: "¿Cuántos leads vas a convertir hoy?", Icono: Flame, color: "text-orange-400" }
    ]
    const random = saludos[Math.floor(Math.random() * saludos.length)]
    setSaludo(random)
  }, [])

  if (!saludo) return <span className="text-lg text-[var(--text-secondary)] font-medium">Cargando...</span>

  const { texto, Icono, color } = saludo
  return (
    <span className="inline-flex items-center gap-2 text-lg text-[var(--text-secondary)] font-medium">
      {texto}
      <Icono className={`w-5 h-5 ${color}`} />
    </span>
  )
}

function getSaludoPorHora(): string {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) return "Buen día"
  if (hora >= 12 && hora < 19) return "Buenas tardes"
  return "Buenas noches"
}
    
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onUpgrade={() => setShowUpgradeModal(true)} onSettings={() => setShowSettings(true)} />

      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)]/60 backdrop-blur-md border-b border-[var(--border-color)]/60 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full animate-pulse ${socketConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`} />
            <span className={`text-sm ${socketConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              {socketConnected ? 'Servidor activo' : 'Desconectado'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {!isPro && (
              <button onClick={() => openUpgrade('pro')} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-500/25 flex items-center gap-1.5">
                <Zap size={14} /> Upgrade
              </button>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-color)]">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm text-white">
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.nombre}</p>
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-blue-500/30'
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
              className="max-w-full"
            >
              {/* TAB: PLAN */}
            {activeTab === "plan" && (
  <div className="space-y-6 max-w-5xl">
    {/* HEADER: Saludo + Fecha/Hora */}
    <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]/60 p-6">
                  {(user?.avatar || isDemo) && (
      <div style={{top:"-15px"}} className="absolute right-0 pointer-events-none">
        <img 
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.avatar || 'demo-user'}&backgroundColor=transparent`} 
          alt="avatar" 
          className="h-48"
        />
      </div>
    )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-1">
              {new Date().toLocaleDateString("es-AR", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })} · <span className="text-blue-400 font-mono font-bold">
                {new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </p>
                        <div className="flex items-center gap-3 mb-2">
                            {(user?.avatar || isDemo) && (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.avatar || 'demo-user'}&backgroundColor=transparent`} 
                    alt="avatar" 
                    className="w-8 h-8"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                ¡{getSaludoPorHora()}, {user?.nombre ? ` ${user.nombre}` : ""}! 
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <SaludoAleatorio />
              {user?.expected_volume && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Users size={12} />
                  {user.expected_volume} contactos
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* PLAN CARD — 6 features principales */}
         {/* PLAN CARD — 6 features principales */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Tu Plan</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Configuración actual</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            isBusiness ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
            isPro ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}>
            {isBusiness ? '✦ BUSINESS' : isPro ? '✦ PRO' : 'STARTER'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Líneas WhatsApp */}
          <div className="p-4 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Líneas WhatsApp</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
  {Math.min(isDemo ? 5 : lines.length, tierConfig.maxLines === Infinity ? 99 : tierConfig.maxLines)} 
  <span className="text-[var(--text-muted)] text-sm font-normal">
    / {tierConfig.maxLines === Infinity ? '∞' : tierConfig.maxLines}
  </span>
</p>
              </div>
            </div>
            <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((lines.length / (tierConfig.maxLines === Infinity ? Math.max(lines.length, 1) : tierConfig.maxLines)) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Envíos mensuales */}
          <div className="p-4 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Envíos mensuales</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">Ilimitados</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Activos</span>
            </div>
          </div>

          {/* Spintax */}
          <div className="p-4 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Spintax</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{isPro ? "Avanzado" : "Básico"}</p>
              </div>
            </div>
            {!isPro && <span className="text-[10px] text-[var(--text-muted)]">Upgrade para variables por línea</span>}
          </div>

          {/* Rotación líneas */}
          <div className={`p-4 rounded-xl border transition-all group ${isPro ? 'bg-[var(--bg-input)]/50 border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70' : 'bg-[var(--bg-input)]/30 border-[var(--border-color)]/20 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <RotateCcw size={20} className={isPro ? "text-amber-400" : "text-[var(--text-muted)]"} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Rotación líneas</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{isPro ? "Round Robin" : "No disponible"}</p>
              </div>
            </div>
            {!isPro && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">PRO</span>}
          </div>

          {/* Historial */}
          <div className="p-4 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Historial</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{isPro ? "Ilimitado" : "30 días"}</p>
              </div>
            </div>
          </div>

          {/* Delay */}
          <div className={`p-4 rounded-xl border transition-all group ${isPro ? 'bg-[var(--bg-input)]/50 border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70' : 'bg-[var(--bg-input)]/30 border-[var(--border-color)]/20 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Clock size={20} className={isPro ? "text-rose-400" : "text-[var(--text-muted)]"} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Delay inteligente</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{isPro ? "1-60s" : "5-15s"}</p>
              </div>
            </div>
            {!isPro && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">PRO</span>}
          </div>
        </div>

        {/* CTA Upgrade o Activo */}
        {!isPro ? (
          <button
            onClick={() => openUpgrade('pro')}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-500/20 hover:to-orange-500/20 transition-all group cursor-pointer"
          >
            <Sparkles size={16} className="text-white group-hover:scale-110 transition-transform" />
            <span className="text-white font-bold">Desbloqueá todo con Pro</span>
            <ArrowUpRight size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : !isBusiness ? (
          <button
            onClick={() => openUpgrade('business')}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-500/20 hover:to-cyan-500/20 transition-all group cursor-pointer"
          >
            <Sparkles size={16} className="text-white group-hover:scale-110 transition-transform" />
            <span className="text-white font-bold">Upgrade a Business y desbloqueá todo</span>
            <ArrowUpRight size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">Plan Business activo</p>
              <p className="text-xs text-emerald-300/70">Todas las funciones incluidas</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── FUNCIONES DEL SISTEMA ─── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {isBusiness ? "Todas las funciones activas" : isPro ? "Funciones Pro activas" : "Funciones disponibles"}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {isBusiness ? "Acceso completo al sistema" : isPro ? "Upgrade a Business para desbloquear todo" : "Upgrade para desbloquear funciones avanzadas"}
              </p>
            </div>
          </div>
          
          {!isBusiness && (
            <button 
              onClick={() => openUpgrade(isStarter ? 'pro' : 'business')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles size={12} className="inline mr-1" />
              {isStarter ? 'Upgrade Pro' : 'Upgrade Business'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => {
            const isUnlocked = (f.tier === 'pro' && isPro) || (f.tier === 'business' && isBusiness)
            const isBusinessOnly = f.tier === 'business'

            if (!isUnlocked) {
              return (
                <div 
                  key={i}
                  onClick={() => openUpgrade(isBusinessOnly ? 'business' : 'pro')}
                  className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-50 hover:opacity-70 cursor-pointer transition-opacity group relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                      isBusinessOnly 
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                        : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    }`}>
                      <Lock size={12} /> {isBusinessOnly ? 'BUSINESS' : 'PRO'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <f.icon size={16} className={isBusinessOnly ? 'text-purple-400' : 'text-amber-400'} />
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${
                      isBusinessOnly ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isBusinessOnly ? 'BUSINESS' : 'PRO'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{f.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{f.desc}</p>
                </div>
              )
            }

            return (
              <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <f.icon size={16} className="text-emerald-400" />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 leading-none">
                    {isBusiness ? 'ACTIVE' : 'PRO'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{f.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
  </div>
)}

              {/* TAB: LÍNEAS */}
              {activeTab === "lines" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Líneas WhatsApp</h2>
                    <button 
  onClick={() => {
    if (lines.length >= tierConfig.maxLines) {
      setShowUpgrade(true)
      return
    }
    setShowAddModal(true)
  }}
  disabled={lines.length >= tierConfig.maxLines}
  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl shadow-lg transition-all ${
    lines.length >= tierConfig.maxLines
      ? 'bg-gray-700 cursor-not-allowed opacity-60 text-gray-400'
      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
  }`}
>
  <Plus size={16} /> 
  {lines.length >= tierConfig.maxLines ? 'Límite alcanzado' : 'Agregar línea'}
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
                            : "border-[var(--border-color)]/60 bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                        }`}
                        onClick={() => {
                          setSelectedLine(line)
                          setSelectedLineIds(prev =>
                            prev.includes(line.id) ? prev.filter(id => id !== line.id) : [...prev, line.id]
                          )
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusDot(line.status)}`} />
                            <div>
                              <p className="font-bold text-[var(--text-primary)] text-sm">{line.nombre}</p>
                              <p className="text-xs text-[var(--text-muted)] font-mono">{line.phone}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full border ${statusColor(line.status)}`}>{line.status}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
  {line.status !== "CONECTADA" && (
    <button onClick={(e) => { e.stopPropagation(); openQrForLine(line) }} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
      <QrCode size={14} /> Conectar
    </button>
  )}
  <button 
    onClick={(e) => { e.stopPropagation(); logoutLine(line.id) }}
    disabled={line.status === "DESCONECTADA"}
    className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
      line.status === "DESCONECTADA"
        ? 'bg-gray-700/30 text-gray-500 border-gray-700/30 cursor-not-allowed'
        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
    }`}
    title={line.status === "DESCONECTADA" ? "Ya desconectada" : "Desconectar"}
  >
    <Power size={14} />
  </button>
  <button 
    onClick={(e) => { e.stopPropagation(); deleteLine(line.id) }}
    className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
    title="Eliminar línea"
  >
    <Trash2 size={14} />
  </button>
</div>
                      </motion.div>
                    ))}
                    {lines.length === 0 && (
                      <div className="col-span-full py-12 border border-dashed border-[var(--border-color)] rounded-2xl text-center">
                        <Users size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-muted)] text-sm">No hay líneas</p>
                        <button onClick={() => setShowAddModal(true)} className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium">+ Conectar primera línea</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: CAMPAÑA */}
              {activeTab === "campaign" && (
                <div className="w-full max-w-full space-y-6">
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
    <h2 className="text-xl font-bold text-[var(--text-primary)]">
      {isEditMode ? '✏️ Editando campaña' : 'Nueva Campaña'}
    </h2>
    <p className="text-sm text-[var(--text-muted)] mt-1">
      {isEditMode ? `Modificando: ${campaignName || 'Sin nombre'}` : 'Dispará mensajes masivos por WhatsApp'}
    </p>
  </div>

                      
                      {selectedLineIds.length > 0 ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                          <span className="text-xs text-blue-400 font-medium">
                            {selectedLineIds.length} línea{selectedLineIds.length > 1 ? 's' : ''} seleccionada{selectedLineIds.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : lines.length === 0 ? (
                        <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">No hay líneas creadas</span>
                      ) : !hasConnectedLine ? (
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">Conectá una línea primero</span>
                      ) : (
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">Seleccioná al menos una línea</span>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* LINE SELECTOR */}
                      {tierConfig.hasRoundRobin ? (
                      <CampaignLineSelector
                        mode={distributionMode}
                        onModeChange={setDistributionMode}
                        selectedIds={selectedLineIds}
                        onSelectionChange={setSelectedLineIds}
                        lines={lines}
                      />
                      ) : (
  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-xl flex items-center justify-between">
    <span className="text-xs text-[var(--text-muted)]">Distribución: Línea única</span>
    <button onClick={() => setShowUpgrade(true)} className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg flex items-center gap-1">
      <Zap size={10} /> Round Robin en Pro
    </button>
  </div>
)}

                      {/* ORIGEN */}
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



                      {/* CONTENIDO SEGÚN ORIGEN */}
                      {numberSource === "manual" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[var(--text-muted)]">
                              
                                                {/* Blacklist detectados en la lista */}
                          
                              {targetsCount} números
                              {duplicateNumbers.length > 0 && (
                                <span className="text-red-400 ml-2 font-medium">• {duplicateNumbers.length} duplicado{duplicateNumbers.length > 1 ? 's' : ''}</span>
                              )}
                            </span>
                            <button onClick={() => setShowImportNumbers(true)} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors">
                              <Upload size={12} /> Importar números
                            </button>
                          </div>
                                                    {(blacklistInList.length > 0 || isDemo) && (
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
                                  <Ban size={12} /> {(isDemo ? 2 : blacklistInList.length)} número{(isDemo || blacklistInList.length > 1) ? 's' : ''} en blacklist
                                </p>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      if (isDemo) {
                                        toast.info(" Blacklist demo: solo visual")
                                        return
                                      }
                                      setSkipBlacklist(true)
                                    }}
                                    className="text-[10px] px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                                  >
                                    Activar salto
                                  </button>
                                  <button 
                                    onClick={openBlacklistModal}
                                    className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                                  >
                                    Ver lista
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                {(isDemo ? ["549115457458", "5492604500364"] : blacklistInList).map((num, i) => (
                                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                                    {num}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[10px] text-purple-400/70">
                                Marcá "Saltar contactos en blacklist" para omitirlos automáticamente al enviar.
                              </p>
                            </div>
                          )}
                          <div className="relative">
                                                                               <textarea
                            value={numbersText}
                            readOnly={isDemo}
                            onChange={e => !isDemo && setNumbersText(e.target.value)}  // ← libre, sin bloqueo
                            onPaste={e => {
  e.preventDefault()
  const pasted = e.clipboardData.getData('text')
  const cleaned = normalizeOnPaste(pasted)   // ← solo normaliza separadores, NO mata letras
  setNumbersText(prev => prev ? prev + '\n' + cleaned : cleaned)
}}
                            placeholder="5491123456789&#10;5491165432109&#10;..."
                            rows={6}
                            className={`w-full bg-[var(--bg-input)] border rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none font-mono ${
                              validationErrors.length > 0 || duplicateNumbers.length > 0 ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-500/50'
                            }`}
                          />
                          
                            {isVerifying && (
                              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-blue-400 bg-[var(--bg-card)]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/20">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full" />
                                Verificando...
                              </div>
                            )}
                          </div>
                          {duplicateNumbers.length > 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                                  <AlertTriangle size={12} /> {duplicateNumbers.length} duplicado(s)
                                </p>
                                <button onClick={removeAllDuplicates} className="text-[10px] px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors flex items-center gap-1">
                                  <Trash2 size={10} /> Eliminar duplicados
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                {duplicateNumbers.map((num, i) => (
                                  <p  className="group flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono hover:bg-red-500/30 transition-colors">
                                    {num} <X size={10} className="opacity-60 group-hover:opacity-100" />
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                                                    {/* Errores de validación */}
                          {validationErrors.length > 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1 mt-2">
                              <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                                <AlertTriangle size={12} /> {validationErrors.length} error{validationErrors.length > 1 ? 'es' : ''}
                              </p>
                              {validationErrors.map((err, i) => (
                                <p key={i} className="text-[10px] text-red-300">• {err}</p>
                              ))}
                            </div>
                          )}

                          {duplicateNumbers.length === 0 && validationErrors.length === 0 && !isVerifying && numbersText && (
                            <div className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 size={12} /> {targetsCount} números válidos
                            </div>
                          )}
                        </div>
                      )}

                      {numberSource === "contacts" && (
                        <div className="space-y-2">
                          {contactList.length === 0 ? (
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                              <p className="text-xs text-purple-400">No hay contactos guardados.</p>
                              <p className="text-[10px] text-purple-400/60 mt-1">Agregalos desde la sección Contactos.</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-[var(--text-muted)]">{contactList.length} contactos · {targetsCount} seleccionados</span>
                                <button
                                  onClick={() => {
                                    const allPhones = contactList.map(c => c.phone)
                                    const current = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
                                    const merged = Array.from(new Set([...current, ...allPhones]))
                                    setNumbersText(merged.join("\n"))
                                    toast.success(`${allPhones.length} contactos agregados`)
                                  }}
                                  className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                >
                                  Agregar todos
                                </button>
                              </div>
                              <div className="bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] max-h-64 overflow-y-auto">
                                {contactList.map((contact) => {
                                  const selected = isPhoneSelected(contact.phone)
                                  return (
                                    <div
                                      key={contact.id}
                                      onClick={() => toggleContact(contact.phone)}
                                      className={`flex items-center gap-3 p-3 border-b border-[var(--border-color)]/50 last:border-0 cursor-pointer hover:bg-white/5 transition-colors ${selected ? 'bg-blue-500/10' : ''}`}
                                    >
                                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${selected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                                        {selected && <Check className="h-3.5 w-3.5 text-white" />}
                                      </div>
                                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">
                                        {contact.name?.charAt(0)?.toUpperCase() || "?"}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm text-[var(--text-primary)]">{contact.name || "Sin nombre"}</p>
                                        <p className="text-xs text-[var(--text-muted)] font-mono">{contact.phone}</p>
                                      </div>
                                      {contact.tags?.length > 0 && (
                                        <div className="flex gap-1">
                                          {contact.tags.map((t, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{t}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {numberSource === "tag" && (
                        <div className="space-y-2">
                          {tags.length === 0 ? (
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                              <p className="text-xs text-purple-400">No hay tags creados.</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                <button
                                  onClick={() => setSelectedTagFilter(null)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all whitespace-nowrap ${selectedTagFilter === null ? 'bg-blue-600 text-white border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                                >
                                  Todos
                                </button>
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
                              {selectedTagFilter && (
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-[var(--text-muted)]">{filteredByTag.length} contactos con "{selectedTagFilter}"</span>
                                  <button
                                    onClick={() => {
                                      const phones = filteredByTag.map(c => c.phone)
                                      const current = numbersText.split("\n").map(n => n.trim()).filter(Boolean)
                                      const merged = Array.from(new Set([...current, ...phones]))
                                      setNumbersText(merged.join("\n"))
                                      toast.success(`${phones.length} números agregados del tag`)
                                    }}
                                    className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                  >
                                     Agregar todos
                                  </button>
                                </div>
                              )}
                              <div className="bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] max-h-64 overflow-y-auto">
                                {(selectedTagFilter ? filteredByTag : contactList).map((contact) => {
                                  const selected = isPhoneSelected(contact.phone)
                                  return (
                                    <div
                                      key={contact.id}
                                      onClick={() => toggleContact(contact.phone)}
                                      className={`flex items-center gap-3 p-3 border-b border-[var(--border-color)]/50 last:border-0 cursor-pointer hover:bg-white/5 transition-colors ${selected ? 'bg-blue-500/10' : ''}`}
                                    >
                                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${selected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                                        {selected && <Check className="h-3.5 w-3.5 text-white" />}
                                      </div>
                                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">
                                        {contact.name?.charAt(0)?.toUpperCase() || "?"}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm text-[var(--text-primary)]">{contact.name || "Sin nombre"}</p>
                                        <p className="text-xs text-[var(--text-muted)] font-mono">{contact.phone}</p>
                                      </div>
                                      {contact.tags?.length > 0 && (
                                        <div className="flex gap-1">
                                          {contact.tags.map((t, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{t}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Contador general */}
                      <div className="text-xs text-[var(--text-muted)]">
                        Total: <span className="font-bold text-[var(--text-primary)]">{targetsCount}</span> números para enviar
                      </div>

                      {/* Nombre + Ejecución */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Nombre de campaña</label>
                          <input
                            type="text"
                            value={campaignName}
                             readOnly={isDemo}
                             onChange={e => !isDemo && setCampaignName(e.target.value)}
                            placeholder="Ej: Promo Mayo 2026"
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                          />
                          {message && (
  <button
    onClick={async () => {
    if (!hasAiKey && !isDemo) {
      toast.error("Configurá tu API key de IA primero")
      return
    }
    if (!aiFeatures.ai_title_enabled && !isDemo) {
      toast.error("Activá el Generador de Títulos desde IA → Implementaciones")
      return
    }
    if (isDemo) {
      setGeneratingTitle(true)
      setTimeout(() => {
        setCampaignName("🔥 Black Friday 2026 · 70% OFF solo 24hs")
        setGeneratingTitle(false)
        toast.success(" Título demo generado")
      }, 800)
      return
    }
    setGeneratingTitle(true)
      try {
        const t = localStorage.getItem('mb_token') || ''
        const res = await fetch('/api/ai/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
          body: JSON.stringify({ message })
        })
        const data = await res.json()
        if (data.title) setCampaignName(data.title)
      } catch {
        toast.error("Error generando título")
      } finally {
        setGeneratingTitle(false)
      }
    }}
    disabled={generatingTitle}
    className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors mt-1"
  >
    {generatingTitle ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
    {generatingTitle ? 'Generando...' : '✨ Generar título con IA'}
  </button>
)}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase  tracking-wider mb-1.5 block">Ejecución</label>
                                                                          {/* EJECUCIÓN: 4 botones con iconos */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => { setSimulationMode('off'); setScheduleMode('now'); }}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            scheduleMode === 'now' && !isSimulationActive
                              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                              : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'
                          }`}
                        >
                          <Zap size={14} /> Enviar ahora
                        </button>

                        <button
                          type="button"
                          onClick={() => { setSimulationMode('off'); setScheduleMode('pending'); }}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            scheduleMode === 'pending' && !isSimulationActive
                              ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                              : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'
                          }`}
                        >
                          <Save size={14} /> Guardar
                        </button>

                        {tierConfig.hasCron ? (
                          <button
                            type="button"
                            onClick={() => { setSimulationMode('off'); setScheduleMode('scheduled'); }}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                              scheduleMode === 'scheduled' && !isSimulationActive
                                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                                : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'
                            }`}
                          >
                            
                            <Calendar size={14} /> Programar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowUpgrade(true)}
                            className="py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/30 hover:text-purple-400 transition-all flex items-center justify-center gap-1"
                          >
                            <Calendar size={14} /> <Zap size={10} /> Pro
                          </button>
                        )}

                        {/* SIMULACRO */}
                        {isStarter && 'starter' ? (
                          <button
                            type="button"
                            onClick={() => setShowUpgrade(true)}
                            className="py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:border-amber-500/30 hover:text-amber-400 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Activity size={14} /> Simulacro
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (canSimulateFull) {
                                setSimulationMode(prev => prev === 'full' ? 'off' : 'full')
                              } else if (canSimulateLite) {
                                setSimulationMode(prev => prev === 'lite' ? 'off' : 'lite')
                              } else {
                                toast.info('Seleccioná una sola línea para Simulacro Lite')
                                return
                              }
                              if (simulationMode === 'off') {
                                toast.info('Modo Simulacro activado. Se verificarán los números sin enviar mensajes reales. Recomendamos activar Modo Humano para simular escritura.', { duration: 6000 })
                              }
                            }}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                              isSimulationActive
                                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25'
                                : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-amber-500/30 hover:text-amber-400'
                            }`}
                          >
                            <Activity size={14} />
                            {isSimulationActive ? 'Simulacro ON' : 'Simulacro'}
                          </button>
                        )}
                      </div>

                                              {isSimulationActive && (
                          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-amber-400 font-medium">Modo Simulacro activo</p>
                              <div className="flex items-center gap-1 bg-[var(--bg-input)] rounded-lg p-0.5">
                                {[
                                  { id: 'slow', label: 'Lento', icon: Timer },
                                  { id: 'normal', label: 'Normal', icon: Gauge },
                                  { id: 'fast', label: 'Rápido', icon: Zap }
                                ].map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => setSimulationSpeed(s.id as any)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                      simulationSpeed === s.id
                                        ? 'bg-amber-600 text-white'
                                        : 'text-amber-400/60 hover:text-amber-400'
                                    }`}
                                  >
                                    <s.icon size={10} /> {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-amber-400/70">
                              Se verificarán {targetsCount} número{targetsCount !== 1 ? 's' : ''}. 
                              {!isBusiness && ' Máximo 1 número en modo Lite.'}
                            </p>
                          </div>
                        )}

                          {/* Selector de fecha/hora */}
                          {scheduleMode === 'scheduled' && tierConfig.hasCron && (
                            <div className="mt-3">
                              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                                Fecha y hora de envío
                              </label>
                              <input
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={e => setScheduleDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 transition-all"
                              />
                                                        {scheduleMode === 'scheduled' && scheduleDate && (
                            <p className="text-[10px] text-purple-400 mt-1">
                              📅 Se enviará: {new Date(scheduleDate).toLocaleString('es-AR', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                timeZoneName: 'short'
                              })}
                            </p>
                          )}
                          <p className="text-[10px] text-[var(--text-muted)]">
  Zona horaria: {user?.timezone || 'America/Argentina/Buenos_Aires'}
</p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                La campaña se ejecutará automáticamente. El servidor debe estar activo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mensaje */}
                      <div>
                       
                                              {/* Mensaje */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                            isSimulationActive ? 'text-amber-400' : 'text-[var(--text-secondary)]'
                          }`}>
                            <Send size={14} /> 
                            {isSimulationActive ? 'Mensaje deshabilitado (Simulacro activo)' : 'Mensaje'}
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <select
  value=""
  onChange={e => {
    if (isSimulationActive) return
    const t = templates.find((x: any) => x.id === e.target.value)
    if (t) {
      setMessage(t.content)
      // ✅ Si el template tiene imagen, la cargamos. Si no, limpiamos la anterior.
      setImageUrl(t.imageUrl || '')
    }
    e.target.value = ""
  }}
                                disabled={isSimulationActive}
                                className={`appearance-none w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 transition-colors ${
                                  isSimulationActive ? 'text-slate-600 cursor-not-allowed' : 'text-[var(--text-secondary)] cursor-pointer hover:border-slate-600'
                                }`}
                              >
                                <option value="">📄 Cargar template...</option>
                                {templates.map((t: any) => (
                                  <option key={t.id} value={t.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={copyMessage} 
                              disabled={isSimulationActive}
                              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                                isSimulationActive ? 'text-slate-600 cursor-not-allowed' : 'text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/30'
                              }`}
                            >
                              📋 Copiar
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={isSimulationActive ? 'Modo simulacro: verificación de números activa' : message}
                          readOnly={isSimulationActive || isDemo}
                          onChange={e => !isDemo && !isSimulationActive && setMessage(e.target.value)}
                          placeholder={isSimulationActive ? '' : "Escribí tu mensaje aquí..."}
                          rows={4}
                          className={`w-full bg-[var(--bg-input)] border rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none ${
                            isSimulationActive ? 'border-amber-500/30 cursor-not-allowed opacity-60' : 'border-[var(--border-color)]'
                          }`}
                        />

                        {/* ─── Auditor Anti-Ban ─── */}
{message && (
  <div className="mt-3">
    <button
    onClick={async () => {
    if (!hasAiKey && !isDemo) {
      toast.error("Configurá tu API key de IA primero")
      return
    }
    if (!aiFeatures.ai_audit_enabled && !isDemo) {
      toast.error("Activá el Auditor Anti-Ban desde IA → Implementaciones")
      return
    }
    if (isDemo) {
      setAuditing(true)
      setTimeout(() => {
        setAuditResult({
          score: 87,
          checks: [
            { ok: true, label: "Sin enlaces sospechosos" },
            { ok: true, label: "Longitud óptima para WhatsApp" },
            { ok: true, label: "Sin palabras spam detectadas" },
            { ok: false, label: "Falta personalización con nombre" },
            { ok: true, label: "No excede límite de emojis" },
          ],
          suggestion: "💡 Agregá el nombre del contacto para mejorar la tasa de apertura en un 23%."
        })
        setAuditing(false)
        toast.success(" Auditoría demo completada")
      }, 1200)
      return
    }
    setAuditing(true)
        try {
          const t = localStorage.getItem('mb_token') || ''
          const res = await fetch('/api/ai/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ message })
          })
          const data = await res.json()
          setAuditResult(data)
        } catch {
          toast.error("Error auditando mensaje")
        } finally {
          setAuditing(false)
        }
      }}
      disabled={auditing}
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
    >
      {auditing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
      {auditing ? 'Analizando...' : 'Auditar mensaje'}
    </button>

    {auditResult && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/60"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${auditResult.score >= 80 ? 'bg-emerald-400' : auditResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
          <span className="text-xs font-bold text-[var(--text-primary)]">
            Score: {auditResult.score}/100
          </span>
        </div>
        <ul className="space-y-1">
          {auditResult.checks.map((check: any, i: number) => (
            <li key={i} className={`text-[10px] flex items-start gap-1.5 ${check.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {check.ok ? <Check size={10} className="shrink-0 mt-0.5" /> : <X size={10} className="shrink-0 mt-0.5" />}
              {check.label}
            </li>
          ))}
        </ul>
        {auditResult.suggestion && (
          <p className="text-[10px] text-amber-400 mt-2 border-t border-[var(--border-color)]/30 pt-2">
            💡 {auditResult.suggestion}
          </p>
        )}
      </motion.div>
    )}
  </div>
)}

                        {isSimulationActive && (
                          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-amber-400 font-medium">Modo Simulacro activo</p>
                              <p className="text-[10px] text-amber-400/70">
                                Se verificarán {targetsCount} número{targetsCount !== 1 ? 's' : ''} sin enviar mensajes reales. 
                                {!isBusiness && ' Máximo 1 número en modo Lite.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {!isSimulationActive && hasUrl(message) && (
                          <div className="mt-2 p-3 bg-[var(--bg-card)] border border-blue-500/20 rounded-xl">
                            <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Link size={10} /> Link detectado
                            </p>
                            <MessagePreview text={message} />
                          </div>
                        )}

                        {!isSimulationActive && (
                          <div className="flex items-center gap-3 mt-2">
                            <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                              <Eye size={12} /> Ver preview
                            </button>
                            <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-1 rounded border border-[var(--border-color)]">{`Spintax: {{hola|buenas|hey}}`}</span>
                            <button type="button" onClick={() => setShowSpintaxHelp(true)} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center gap-1">
                              <Sparkles size={10} /> ¿Qué es Spintax?
                            </button>
                          </div>
                        )}

                        {!isSimulationActive && (
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-[10px] text-[var(--text-muted)]">Insertar:</span>
                            <button type="button" onClick={() => insertSpintax('saludo')} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">👋 Saludo</button>
                            <button type="button" onClick={() => insertSpintax('despedida')} className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">✌️ Despedida</button>
                            {tierConfig.hasAdvancedSpintax && (
                              <>
                                <button type="button" onClick={() => insertSpintax('emoji')} className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">🔥 Emoji</button>
                                <button type="button" onClick={() => insertSpintax('nombre')} className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">🏷️ Nombre</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                     
                      </div>

                      

                      {tierConfig.hasHumanMode ? (
  <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${humanMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[var(--bg-card)] border-[var(--border-color)]/60'}`}>
    <input 
      type="checkbox" 
      id="humanMode"
      checked={humanMode}
      onChange={(e) => setHumanMode(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded-full border-slate-500 bg-[var(--bg-input)] text-purple-500 focus:ring-purple-500/50"
    />
    <div className="flex-1">
      <label htmlFor="humanMode" className={`text-sm font-bold cursor-pointer flex items-center gap-2 ${humanMode ? 'text-purple-400' : 'text-[var(--text-secondary)]'}`}>
        <UserCheck size={14} /> Modo Humano PRO
      </label>
      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
        Simula el indicador <span className="text-purple-400 font-medium">"escribiendo..."</span> con delay proporcional al texto. 
        Ideal para mensajes VIP personalizados 1-a-1.
      </p>
      {humanMode && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 w-fit">
          <AlertTriangle size={10} /> No recomendado para campañas masivas
        </div>
      )}
    </div>
  </div>
) : (
  <div className="p-4 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-card)]/50 flex items-center justify-between">
    <div>
      <p className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><UserCheck size={14} /> Modo Humano</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">Simula escritura real para mensajes VIP</p>
    </div>
    <button onClick={() => openUpgrade('business')} className="text-[10px] px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-bold flex items-center gap-1">
      <Zap size={10} /> Pro 
    </button>
  </div>
)}

{/* ─── BLACKLIST ─── */}
{(tierConfig?.hasBlacklist || isDemo) ? (
  <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${skipBlacklist ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[var(--bg-card)] border-[var(--border-color)]/60'}`}>
    <input 
      type="checkbox" 
      id="skipBlacklist"
      checked={skipBlacklist}
      onChange={(e) => {
        if (isDemo) {
          toast.info(" Blacklist demo: solo visual")
          return
        }
        setSkipBlacklist(e.target.checked)
      }}
      className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-[var(--bg-input)] text-purple-500 focus:ring-purple-500/50"
    />
    <div className="flex-1">
      <label htmlFor="skipBlacklist" className={`text-sm font-bold cursor-pointer flex items-center gap-2 ${skipBlacklist ? 'text-purple-400' : 'text-[var(--text-secondary)]'}`}>
        <Ban size={14} /> Saltar contactos en blacklist
      </label>
      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
        {blacklistCount > 0 
          ? <><span className="text-purple-400 font-bold">{blacklistCount}</span> contactos bloqueados serán omitidos automáticamente.</>
          : "No tenés contactos en blacklist. Se agregan automáticamente si responden con palabras clave de baja."}
      </p>
      {skipBlacklist && blacklistCount > 0 && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 w-fit">
          <Shield size={10} /> Protección anti-spam activa
        </div>
      )}
    </div>
  </div>
) : (
  <div className="p-4 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-card)]/50 flex items-center justify-between">
    <div>
      <p className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Ban size={14} /> Blacklist / Anti-spam</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">Bloqueá números y palabras clave de baja automática</p>
    </div>
    <button onClick={() => openUpgrade('business')} className="text-[10px] px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-bold flex items-center gap-1">
      <Zap size={10} /> Pro
    </button>
  </div>
)}

                      {/* ─── PROXY ROTATE (Business only) ─── */}
                                            {(isBusiness || isDemo) ? (
                        <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${(proxyRotateEnabled || isDemo) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--bg-card)] border-[var(--border-color)]/60'}`}>
                          <input 
                            type="checkbox" 
                            id="proxyRotate"
                            checked={proxyRotateEnabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProxyRotateEnabled(true)
                                if (!proxyLocation) setShowProxyModal(true)
                              } else {
                                clearProxy()
                              }
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-[var(--bg-input)] text-emerald-500 focus:ring-emerald-500/50"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <label htmlFor="proxyRotate" className={`text-sm font-bold cursor-pointer flex items-center gap-2 ${proxyRotateEnabled ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                                <Globe size={14} /> Proxy Rotate
                              </label>
                              {proxyRotateEnabled && (
                                <button 
                                  onClick={() => {
    setShowProxyModal(true)
    loadProxyHistory()
  }}
                                  className="text-[10px] px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition-colors flex items-center gap-1"
                                >
                                  <Crosshair size={10} /> Configurar
                                </button>
                              )}
                            </div>
                                                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                              {isDemo ? (
                                <><span className="text-emerald-400 font-bold">Frankfurt, Alemania</span> · Latencia: 34ms · IP: 185.220.101.42</>
                              ) : proxyLocation ? (
                                <><span className="text-emerald-400 font-bold">{proxyLocation.city}, {proxyLocation.country}</span> · Latencia: {proxyLocation.latency}ms</>
                              ) : (
                                "Rutea la campaña a través de nodos globales para evitar baneos por IP."
                              )}
                            </p>
                            {proxyRotateEnabled && (
                              <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                <p className="text-[10px] text-amber-300/80 flex items-start gap-1.5">
                                  <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                                  <span>Función agresiva anti-ban. Enviá de a pocos números y controlado. WhatsApp detecta patrones de spam. Recomendado: máximo 50-100 mensajes por hora con proxy activo.</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-card)]/50 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2"><Globe size={14} /> Proxy Rotate</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Ruteo dinámico de IP para evitar baneos</p>
                          </div>
                          <button onClick={() => openUpgrade('business')} className="text-[10px] px-2.5 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg font-bold flex items-center gap-1">
                            <Zap size={10} /> Business
                          </button>
                        </div>
                      )}

                      {/* Imagen + Delay */}
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
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <Clock size={14} /> Delay (ms) - Predeterminado
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="number" value={delayMin} onChange={e => setDelayMin(Number(e.target.value))} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-all" />
                            <span className="text-[var(--text-muted)]">-</span>
                            <input type="number" value={delayMax} onChange={e => setDelayMax(Number(e.target.value))} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-all" />
                          </div>
                        </div>
                      </div>

                      {/* Botón */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                                                                        onClick={() => {
                          if (isDemo) {
                            toast.info(" No podés enviar campañas en modo demo")
                            return
                          }
                          if (!verifyCampaign()) return
                          if (isSimulationActive) {
                            sendSimulation()
                          } else {
                            sendCampaign()
                          }
                        }}
                        disabled={isSending || selectedLineIds.length === 0 || isVerifying || validationErrors.length > 0 || duplicateNumbers.length > 0 || targetsCount === 0 || (scheduleMode === 'scheduled' && !scheduleDate)}
                        className={`w-full font-bold py-4 rounded-xl transition-all relative overflow-hidden ${
                          isSending || isSimulating || selectedLineIds.length === 0 || isVerifying || validationErrors.length > 0 || duplicateNumbers.length > 0 || targetsCount === 0 || (scheduleMode === 'scheduled' && !scheduleDate)
                            ? "bg-[#1E293B] text-[var(--text-muted)] cursor-not-allowed"
                            : isSimulationActive
                            ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                            : scheduleMode === 'pending'
                            ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                        }`}
                      >
                        {isSimulationActive ? (
                          <span className="flex items-center justify-center gap-2">
                            {isSimulating ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                Simulando...
                              </>
                            ) : (
                              <>
                                <Activity size={18} /> Lanzar Simulacro {targetsCount > 0 && `· ${targetsCount} pings`}
                              </>
                            )}
                          </span>
                        ) : isSending ? (
                            
  <span className="flex items-center justify-center gap-2">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
    {scheduleMode === 'pending' ? 'Guardando...' : 'Enviando...'}
  </span>
) : isVerifying ? (
  <span className="flex items-center justify-center gap-2">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
    Verificando...
  </span>
) : validationErrors.length > 0 ? (          // ← NUEVO
  <span className="flex items-center justify-center gap-2 text-red-300">
    <AlertTriangle size={18} /> Solucioná errores antes de continuar
  </span>
) : duplicateNumbers.length > 0 ? (
  <span className="flex items-center justify-center gap-2 text-red-300">
    <AlertTriangle size={18} /> Eliminá duplicados para continuar
  </span>
) : selectedLineIds.length === 0 ? (
  <span className="flex items-center justify-center gap-2">
    <Users size={18} /> Seleccioná al menos una línea
  </span>
) : targetsCount === 0 ? (
  <span className="flex items-center justify-center gap-2">
    <Edit3 size={18} /> Agregá números para enviar
  </span>
) : (
   <span className="flex items-center justify-center gap-2">
    {isEditMode ? <Edit3 size={18} /> : scheduleMode === 'pending' ? <Clock size={18} /> : scheduleMode === 'scheduled' ? <Calendar size={18} /> : <Play size={18} />}
    {isEditMode ? 'Guardar cambios' : scheduleMode === 'pending' ? 'Guardar' : scheduleMode === 'scheduled' ? 'Programar' : 'Disparar'} {targetsCount} mensajes · {selectedLineIds.length} línea(s)
  </span>
)

}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LOGS */}
                            {/* TAB: LOGS */}
              {activeTab === "logs" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Logs en vivo</h2>
                    <div className="flex items-center gap-2">
                      {!isPro && <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-500/20 text-amber-400 border border-amber-500/30"><Zap size={10} className="inline" /> PRO</span>}
                      <button onClick={() => isPro ? clearLiveLogs() : setShowUpgrade(true)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${isPro ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed'}`}>
  <Trash2 size={14} /> Limpiar
</button>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                    <div ref={logsContainerRef} className="bg-[var(--bg-input)] rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-xs space-y-1.5 border border-[var(--border-color)]/40">
                      <AnimatePresence initial={false}>
                        {logs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <Activity size={24} className="mb-2" />
                            <span>Esperando acciones...</span>
                          </div>
                        ) : (
                                                 logs.map((log, i) => {
                          const { icon: LogIcon, color } = getLogMeta(log)
                          const text = log.replace(/^\[\w+\]\s*/, '')
                          const isSeparator = log === ''
                          
                          return (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              className={`flex items-center gap-2 ${isSeparator ? 'h-2' : color}`}
                            >
                              {!isSeparator && (
                                <>
                                  {LogIcon && <LogIcon size={12} className="shrink-0 opacity-80" />}
                                  <span className="text-[var(--text-muted)] mr-1">{new Date().toLocaleTimeString()}</span>
                                  <span>{text}</span>
                                </>
                              )}
                            </motion.div>
                          )
                        })
                        )}
                      </AnimatePresence>
                      <div ref={logsEndRef} /> 
                    </div >
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

            {/* ─── MODAL BLACKLIST ─── */}
      {/* ─── MODAL BLACKLIST ─── */}
{showBlacklistModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBlacklistModal(false)}>
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Ban size={16} className="text-purple-400" /> Blacklist
        </h3>
        <button onClick={() => setShowBlacklistModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <X size={16} className="text-[var(--text-muted)]" />
        </button>
      </div>
      
      <div className="p-4">
        {isLoadingBlacklist && !isDemo ? (
          <div className="flex items-center justify-center py-8 gap-2 text-xs text-[var(--text-muted)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border border-purple-400 border-t-transparent rounded-full" />
            Cargando...
          </div>
        ) : blacklistNumbers.length === 0 && !isDemo ? (
          <div className="text-center py-8">
            <Shield size={32} className="text-purple-500/20 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">No hay números en blacklist</p>
            <p className="text-[10px] text-[var(--text-muted)]/60 mt-1">Se agregan automáticamente cuando un contacto responde con palabras clave de baja.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              <span className="text-purple-400 font-bold">{blacklistNumbers.length || (isDemo ? 2 : 0)}</span> contactos bloqueados
            </p>
            <div className="bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] max-h-80 overflow-y-auto">
              {(blacklistNumbers.length > 0 ? blacklistNumbers : (isDemo ? ["54911125475", "54922144541"] : [])).map((phone, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-[var(--border-color)]/50 last:border-0">
                  <span className="text-sm text-[var(--text-primary)] font-mono">{phone}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Bloqueado</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-[var(--border-color)] flex justify-end">
        <button 
          onClick={() => setShowBlacklistModal(false)}
          className="px-4 py-2 bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] text-xs font-bold rounded-lg transition-colors border border-[var(--border-color)]"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}


      {showSummaryModal && campaignSummary && (
  <PremiumModal open={showSummaryModal} onClose={() => setShowSummaryModal(false)} title="Resumen Caleb">
    <div className="p-4">
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{campaignSummary}</p>
      <button onClick={() => setShowSummaryModal(false)} className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg">Cerrar</button>
    </div>
  </PremiumModal>
)}

      {/* MODALS */}
      <PremiumModal open={showImportNumbers} onClose={() => !importLoading && setShowImportNumbers(false)} title="Importar Números">
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-400 font-medium flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Estos números se usarán <strong>solo para esta campaña</strong> y <strong>NO se guardarán como contactos</strong>.</span>
            </p>
          </div>
          {importLoading ? (
            <div className="space-y-4 py-6">
              <div className="w-full h-3 bg-[#1E293B] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${importProgress}%` }} transition={{ ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-[var(--text-secondary)] font-medium">{importProgress < 100 ? 'Procesando...' : '¡Listo!'}</p>
                <p className="text-xs text-[var(--text-muted)]">{importProgress < 100 ? `${Math.round(importProgress)}%` : `${importedCount} números`}</p>
              </div>
            </div>
          ) : importedCount > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2"><CheckCircle2 size={16} /> {importedCount} números válidos</p>
              </div>
              <div className="bg-[var(--bg-input)] rounded-xl p-3 h-32 overflow-y-auto border border-[var(--border-color)]">
                <div className="flex flex-wrap gap-1.5">
                  {previewNumbers.map((num, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">{num}</span>
                  ))}
                  {importedCount > previewNumbers.length && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--border-color)] text-[var(--text-muted)]">+{importedCount - previewNumbers.length} más</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setImportedCount(0); setPreviewNumbers([]) }} className="flex-1 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--border-hover)] transition-colors">Cancelar</button>
                <button onClick={confirmImportNumbers} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors">Agregar a campaña</button>
              </div>
            </div>
          ) : (
            <>
              <div onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} onClick={() => document.getElementById('number-file-input')?.click()} className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border-color)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-input)]'}`}>
                <input id="number-file-input" type="file" accept=".xlsx,.csv,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleNumberFile(e.target.files[0])} />
                <div className="mx-auto h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <Upload size={24} className="text-blue-400" />
                </div>
                <p className="text-sm text-[var(--text-primary)] font-medium mb-1">Arrastrá un archivo o hacé clic</p>
                <p className="text-xs text-[var(--text-muted)]">Excel (.xlsx), CSV o TXT</p>
              </div>
              <div className="relative">
                <textarea
                  value={numbersText}
                  onChange={e => setNumbersText(e.target.value)}
                  placeholder="5491123456789&#10;5491165432109&#10;..."
                  rows={6}
                  className={`w-full bg-[var(--bg-input)] border rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none font-mono ${duplicateNumbers.length > 0 ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-500/50'}`}
                />
                {isVerifying && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-blue-400 bg-[var(--bg-card)]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-3 w-3 border border-blue-400 border-t-transparent rounded-full" />
                    Verificando...
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{numbersText.split("\n").filter(Boolean).length} números</span>
                  {duplicateNumbers.length === 0 && !isVerifying && numbersText && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Todo ok</span>
                  )}
                </div>
                {duplicateNumbers.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-400 font-medium flex items-center gap-1.5"><AlertTriangle size={12} /> {duplicateNumbers.length} duplicado(s)</p>
                      <button onClick={removeAllDuplicates} className="text-[10px] px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors flex items-center gap-1"><Trash2 size={10} /> Eliminar duplicados</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {duplicateNumbers.map((num, i) => (
                        <button key={i} onClick={() => removeSpecificNumber(num)} className="group flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono hover:bg-red-500/30 transition-colors">
                          {num} <X size={10} className="opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PremiumModal>

            {/* ─── MODAL PROXY ROTATE ─── */}
      <AnimatePresence>
        {showProxyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => !isScanningProxy && setShowProxyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Globe size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Proxy Rotate</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Selección de nodo óptimo</p>
                  </div>
                </div>
                {!isScanningProxy && (
                  <button onClick={() => setShowProxyModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={16} className="text-[var(--text-muted)]" />
                  </button>
                )}
              </div>

              {/* Mapa / Radar */}
              <div className="relative h-64 bg-[#0a0f1c] overflow-hidden">
                {/* Grid de fondo */}
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }} />
                
                {/* Nodos */}
                {PROXY_NODES.map((node, i) => (
                  <motion.div
                    key={node.code}
                    className="absolute"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    animate={isScanningProxy ? {
                      scale: [1, 1.8, 1],
                      opacity: [0.4, 1, 0.4]
                    } : proxyLocation?.code === node.code ? {
                      scale: [1, 1.3, 1],
                      opacity: 1
                    } : {
                      opacity: 0.3
                    }}
                    transition={isScanningProxy ? { 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    } : { duration: 2, repeat: Infinity }}
                  >
                    <div className={`w-3 h-3 rounded-full ${proxyLocation?.code === node.code ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-slate-500'}`} />
                    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap ${proxyLocation?.code === node.code ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {node.code}
                    </div>
                  </motion.div>
                ))}

                {/* Líneas de conexión (svg overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  {PROXY_NODES.map((node, i) => 
                    PROXY_NODES.slice(i + 1).map((target, j) => (
                      <line
                        key={`${i}-${j}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke={proxyLocation?.code === node.code || proxyLocation?.code === target.code ? '#34d399' : '#475569'}
                        strokeWidth="0.5"
                        strokeDasharray="4 4"
                      />
                    ))
                  )}
                </svg>

                {/* Radar scan */}
                {isScanningProxy && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20"
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                {isScanningProxy && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 3], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* Status central */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
                    {isScanningProxy && (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-3 w-3 border border-emerald-400 border-t-transparent rounded-full" />
                    )}
                    {proxyScanText}
                  </p>
                  {proxyLocation && !isScanningProxy && (
                    <p className="text-[10px] text-emerald-400/70 mt-1">
                      {proxyLocation.city}, {proxyLocation.country} · {proxyLocation.latency}ms
                    </p>
                  )}
                </div>
              </div>

                                          {/* Footer */}
              <div className="p-5 border-t border-[var(--border-color)]">
                {/* Historial */}
                {proxyHistory.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Últimas ubicaciones</p>
                    <div className="flex flex-wrap gap-2">
                      {proxyHistory.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const node = PROXY_NODES.find(n => n.city === h.city) || h
                            setProxyLocation(node)
                            localStorage.setItem('wabisend_proxy_location', JSON.stringify(node))
                            saveProxyToHistory(node)
                            setProxyScanText(`Ruta óptima: ${node.city} (${node.latency}ms)`)
                            setShowProxyModal(false)
                          }}
                          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                        >
                          <Globe size={10} />
                          {h.city} ({h.code}) · {h.fakeIp} · {h.timesUsed > 1 ? `${h.timesUsed}x` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-[var(--text-muted)] max-w-[200px] leading-relaxed">
                    {isScanningProxy ? 'No cierres esta ventana durante el escaneo...' : 
                     proxyLocation ? `Nodo ${proxyLocation.city} seleccionado. IP: ${proxyLocation.fakeIp}` :
                     'El sistema analizará latencia y disponibilidad de nodos globales.'}
                  </div>
                  <div className="flex items-center gap-2">
                    {proxyLocation && !isScanningProxy && (
                      <button
                        onClick={selectOptimalProxy}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-emerald-500/30 hover:text-emerald-400"
                      >
                        <RefreshCw size={14} /> Relocalizar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!proxyLocation && !isScanningProxy) {
                          selectOptimalProxy()
                        } else if (!isScanningProxy) {
                          setShowProxyModal(false)
                        }
                      }}
                      disabled={isScanningProxy}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isScanningProxy
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : proxyLocation
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      {isScanningProxy ? (
                        <><Loader2 size={14} className="animate-spin" /> Escaneando...</>
                      ) : proxyLocation ? (
                        <><CheckCircle2 size={14} /> Confirmar {proxyLocation.city}</>
                      ) : (
                        <><Crosshair size={14} /> Elegir ubicación óptima</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal open={showPreview} onClose={() => setShowPreview(false)} title="Vista previa">
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">3 simulaciones de cómo llegaría el mensaje:</p>
          <div className="space-y-3">
            {[1, 2, 3].map(i => {
              const preview = generatePreview(message)
              return (
                <div key={i} className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] relative">
                  <span className="absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Variante {i}</span>
                  <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap mt-1 font-mono">{preview}</p>
                </div>
              )
            })}
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
              <p className="text-sm text-amber-400 flex items-center gap-2"><Zap size={14} /> Tu plan Starter permite 1 línea. Upgrade a Pro para 3 líneas.</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-[var(--text-primary)] rounded-xl transition-colors">Cancelar</button>
            <button onClick={addLine} disabled={!isPro && lines.length >= 1} className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${!isPro && lines.length >= 1 ? 'bg-[#1E293B] text-[var(--text-muted)] cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>Guardar</button>
          </div>
        </div>
      </PremiumModal>

      <PremiumModal open={showSpintaxHelp} onClose={() => setShowSpintaxHelp(false)} title="¿Qué es Spintax?">
        <div className="space-y-4 text-sm">
          <p className="text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Spintax</strong> permite que cada mensaje sea <span className="text-emerald-400">ligeramente diferente</span>, evitando bans.</p>
          <div className="bg-[var(--bg-input)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Sintaxis</p>
            <code className="block text-xs font-mono text-blue-400 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">{"{{"}opción 1|opción 2|opción 3{"}}"}</code>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-xs text-amber-400 flex items-start gap-2"><Zap size={14} className="shrink-0 mt-0.5" /><span><strong>Consejo Pro:</strong> Más variantes = menos spam reports.</span></p>
          </div>
        </div>
      </PremiumModal>

      <PremiumModal open={showSettings} onClose={() => setShowSettings(false)} title="Configuración">
        <form onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          const t = localStorage.getItem('mb_token')
          try {
            const res = await fetch("/api/auth/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
              body: JSON.stringify({ nombre: form.get("nombre"), email: form.get("email"), current_password: form.get("current_password") || undefined, new_password: form.get("new_password") || undefined }),
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">Guardar cambios</button>
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
          <p className="text-2xl font-bold text-[var(--text-primary)]">$250 <span className="text-sm font-normal text-[var(--text-muted)]">USD / único</span></p>
          <button onClick={() => openUpgrade('pro')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all">Quiero upgrade</button>
        </div>
      </PremiumModal>

      <AnimatePresence>
        {showUpgradeModal && (
          <PremiumModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Upgrade a Pro">
            <div className="text-center space-y-4">
              <div className="text-5xl mb-2">✦</div>
              <h3 className="text-xl font-bold text-white">Upgrade a Pro</h3>
              <p className="text-sm text-[var(--text-secondary)]">Pegá acá tu licencia Pro para desbloquear todo.</p>
              <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)] mb-2">Tu plan actual</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Starter</span>
              </div>
              <textarea value={upgradeKey} onChange={e => setUpgradeKey(e.target.value)} placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." rows={4} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-500 resize-none" />
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
                      const res = await fetch("/api/setup/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ licenseKey: upgradeKey.trim() }) })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || "Licencia inválida")
                      if (data.tier !== 'pro' && data.tier !== 'business') throw new Error("Licencia no es Pro.")
                      toast.success("🎉 ¡Pro activado!")
                      setShowUpgradeModal(false)
                      setTimeout(() => router.push("/dashboard"), 1500)
                    } catch (e: any) {
                      toast.error(e.message)
                      setUpgrading(false)
                    }
                  }}
                  disabled={!upgradeKey.trim()}
                  className={`w-full font-bold py-3 rounded-xl transition-all ${upgradeKey.trim() ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' : 'bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed'}`}
                >
                  ✦ Activar Pro
                </button>
              )}
            </div>
          </PremiumModal>
        )}
      </AnimatePresence>

      <QRModal open={qrModalOpen} onOpenChange={(v) => setQrModalOpen(v)} line={qrTargetLine} />
      <ConfirmDialog open={isOpen} onClose={onCancel} onConfirm={onConfirm} {...options} />
    </div>
  )
}

function PlanFeature({ icon: Icon, label, value, active, pro }: { icon: any, label: string, value: string, active?: boolean, pro?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-color)]/30">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-[var(--text-muted)]'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className={`text-sm font-medium ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{value}</p>
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