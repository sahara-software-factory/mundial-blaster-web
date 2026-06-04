"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  Split
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

// === TIER CONFIG ===
const TIER_CONFIG = {
  starter: { maxLines: 2, maxTemplates: 5, hasCron: false, 
hasExport: false, hasRoundRobin: false, hasHumanMode: false, hasClone: false, hasAdvancedSpintax: false, hasTemplateVars: false,hasAI: false,
  },
  pro: { maxLines: 5, maxTemplates: Infinity, hasCron: true, hasExport: true, hasRoundRobin: true, hasHumanMode: true, hasClone: true, hasAdvancedSpintax: true, hasTemplateVars: true,hasAI: false,
  },
  business: { maxLines: Infinity, maxTemplates: Infinity, hasCron: true, hasExport: true, hasRoundRobin: true, hasHumanMode: true, hasClone: true, hasAdvancedSpintax: true, hasTemplateVars: true,hasAI: true,
  },
}

function useTier(license: any) {
  const tier = (license?.tier || 'starter') as keyof typeof TIER_CONFIG
  return TIER_CONFIG[tier] || TIER_CONFIG.starter
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
  const [numbersText, setNumbersText] = useState("")
  const [message, setMessage] = useState("")

  const [isEditMode, setIsEditMode] = useState(false)
const [editCampaignId, setEditCampaignId] = useState<string | null>(null)

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

  const [duplicateNumbers, setDuplicateNumbers] = useState<string[]>([])
  const [verifyTimeout, setVerifyTimeout] = useState<NodeJS.Timeout | null>(null)

  // Contactos + Tags
  const [contactList, setContactList] = useState<Contact[]>([])
  const [tags, setTags] = useState<TagItem[]>([])

  // Logs
  const [logs, setLogs] = useState<string[]>([])
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
  const tier = useTier(license)
  const isBusiness = license?.tier === 'business'
  const isPro = license?.tier === 'pro' || license?.tier === 'business'
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') || '' : ''
  const [templates, setTemplates] = useState<any[]>([])
  const [showSpintaxHelp, setShowSpintaxHelp] = useState(false)

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

   const verifyCampaign = useCallback(() => {
    setIsVerifying(true)
    setValidationErrors([])
    
    const { valid, errors, numbers } = validateNumbers(numbersText)
    
    if (!valid) {
      setValidationErrors(errors)
      setIsVerifying(false)
      return false
    }
    
    // Chequear duplicados
    const seen = new Set<string>()
    const dups: string[] = []
    for (const n of numbers) {
      const clean = n.replace(/\D/g, '')
      if (seen.has(clean)) dups.push(n)
      else seen.add(clean)
    }
    setDuplicateNumbers(dups)
    
    if (dups.length > 0) {
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
  }, [numbersText, message, lines, selectedLineIds])




  const addLine = async () => {
    if (!newPhone.trim()) return toast.error("Escribí el número")
    if (lines.length >= tier.maxLines) {
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

  setIsSending(true)
  setLogs(prev => [...prev, `🚀 ${isEditMode ? 'Guardando cambios' : scheduleMode === 'now' ? 'Campaña iniciada' : 'Campaña guardada'}: ${targets.length} números · ${lineasConectadas.length} línea(s)`])

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
        ? new Date(scheduleDate).toISOString()
        : undefined,
      line_ids: lineasConectadas.map(l => l.id),
      distribution_mode: isRoundRobin ? 'round_robin' : 'single',
      human_mode: humanMode
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
        router.push("/reports")
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



useEffect(() => {
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
  }

  const removeSpecificNumber = (numToRemove: string) => {
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
    if (!tier.hasClone) return
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
  }, [tier.hasClone])


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
    if (licenseLoading || authLoading || !licenseChecked || !authChecked) return
    if (!isActive) { router.push("/setup"); return }
    if (!isAuthenticated) { router.push("/login"); return }
  }, [licenseLoading, authLoading, licenseChecked, authChecked, isActive, isAuthenticated, router])

  useEffect(() => {
    if (isActive && isAuthenticated) fetchLines()
  }, [isActive, isAuthenticated])

  useEffect(() => {
  if (isDemo) {
      setSocketConnected(true)
      return
    }
    if (!SOCKET_URL || !isActive) return
  const socket = io(SOCKET_URL)
  
  socket.on("connect", () => setSocketConnected(true))
  socket.on("disconnect", () => setSocketConnected(false))
  
  // ← NUEVO: Logs de campaña en tiempo real
  socket.on("campaign_log", (payload) => {
    const icon = payload.status === 'sent' ? '✅' : '❌'
    setLogs(prev => [...prev, `${icon} ${payload.progress} → ${payload.phone} [${payload.linePhone}]`])
  })
  
  socket.on("campaign_complete", (payload) => {
    setLogs(prev => [...prev, `🏁 Campaña ${payload.campaignId} finalizada · ${payload.sent} enviados · ${payload.failed} fallidos`])
  })

  return () => { socket.disconnect() }
}, [isActive])


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
      return
    }
    const t = localStorage.getItem('mb_token') || ''
    fetch("/api/contacts", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
      .then(r => r.json())
      .then(data => setContactList(data.contacts || []))
      .catch(() => { })
    fetch("/api/tags/stats", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
      .then(r => r.json())
      .then(data => setTags(data.tags || []))
      .catch(() => { })
    fetch("/api/templates", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })
      .then(r => r.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => { })
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


    // DEMO: Logs históricos
  useEffect(() => {
    if (isDemo && activeTab === "logs") {
      setLogs([
        "🚀 Campaña iniciada: 500 números · 5 líneas · Modo: Round-robin · Delay: 5-15s",
        "✅ 1/500 → 5491130000001 [Línea Principal] · 2.3s",
        "✅ 2/500 → 5491130000002 [Línea Ventas] · 4.1s",
        "✅ 3/500 → 5491130000003 [Línea Soporte] · 3.8s",
        "✅ 4/500 → 5491130000004 [Línea Marketing] · 2.9s",
        "✅ 5/500 → 5491130000005 [Línea Backup] · 5.2s",
        "🏁 Modo humano activado: simulando escritura letra por letra...",
        "✅ 6/500 → 5491130000006 [Línea Principal] · 12.4s (modo humano)",
        "✅ 7/500 → 5491130000007 [Línea Ventas] · 8.7s",
        "✅ 8/500 → 5491130000008 [Línea Soporte] · 6.3s",
        "❌ 9/500 → 5491130000009 [Línea Marketing] · Número inválido",
        "✅ 10/500 → 5491130000010 [Línea Backup] · 4.5s",
        "✅ 11/500 → 5491130000011 [Línea Principal] · 3.2s",
        "✅ 12/500 → 5491130000012 [Línea Ventas] · 7.1s (modo humano)",
        "✅ 13/500 → 5491130000013 [Línea Soporte] · 5.8s",
        "✅ 14/500 → 5491130000014 [Línea Marketing] · 4.2s",
        "✅ 15/500 → 5491130000015 [Línea Backup] · 6.9s",
        "🏁 Campaña #1 finalizada · 499 enviados · 1 fallido · Tasa: 99.8%",
        "🚀 Campaña iniciada: 1250 números · 3 líneas · Modo: Single",
        "✅ 1/1250 → 5491130005678 [Línea Principal] · 3.1s",
        "✅ 2/1250 → 5491130005679 [Línea Principal] · 2.8s",
        "✅ 3/1250 → 5491130005680 [Línea Ventas] · 4.5s",
        "🏁 Campaña #2 finalizada · 1248 enviados · 2 fallidos · Tasa: 99.8%",
        "🚀 Campaña iniciada: 890 números · 2 líneas · Modo: Round-robin",
        "✅ 1/890 → 5491130009001 [Línea Soporte] · 3.4s",
        "✅ 2/890 → 5491130009002 [Línea Marketing] · 5.1s",
        "🏁 Campaña #3 en ejecución · 456 enviados · 0 fallidos",
        "📅 Campaña programada: Reactivación Clientes · 2100 números · 30/05 09:00",
        "✅ Clonación 1-click: Campaña 'Promo Verano' duplicada",
        "🔄 Reconexión keep-alive: Línea Principal reconectada automáticamente",
        "📊 Export CSV: 3847 contactos descargados",
        "🛡️ Blacklist: 23 números bloqueados",
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
              <button onClick={() => setShowUpgrade(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-500/25 flex items-center gap-1.5">
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
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Clock size={140} className="text-[var(--text-primary)]" />
      </div>
      
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
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              ¡Buen día{user?.nombre ? ` ${user.nombre}` : ""}! 👋
            </h1>
            <SaludoAleatorio />
          </div>
        </div>
      </div>
    </div>

    {/* PLAN CARD — 6 features principales */}
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Tu Plan</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configuración actual</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isPro ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
          {isPro ? '✦ PRO' : 'STARTER'}
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
                 {isDemo ? 5 : lines.length} <span className="text-[var(--text-muted)] text-sm font-normal">/ {tier.maxLines === Infinity ? '∞' : tier.maxLines}</span>
              </p>
            </div>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${Math.min((lines.length / (tier.maxLines === Infinity ? Math.max(lines.length, 1) : tier.maxLines)) * 100, 100)}%` }}
            />
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
              <p className="text-lg font-bold text-[var(--text-primary)]">
                Ilimitados
              </p>
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
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {isPro ? "Avanzado" : "Básico"}
              </p>
            </div>
          </div>
          {!isPro && (
            <span className="text-[10px] text-[var(--text-muted)]">Upgrade para variables por línea</span>
          )}
        </div>

        {/* Rotación líneas */}
        <div className={`p-4 rounded-xl border transition-all group ${isPro ? 'bg-[var(--bg-input)]/50 border-[var(--border-color)]/40 hover:border-[var(--border-color)]/70' : 'bg-[var(--bg-input)]/30 border-[var(--border-color)]/20 opacity-60'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <RotateCcw size={20} className={isPro ? "text-amber-400" : "text-[var(--text-muted)]"} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Rotación líneas</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {isPro ? "Round Robin" : "No disponible"}
              </p>
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
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {isPro ? "Ilimitado" : "30 días"}
              </p>
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
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {isPro ? "1-60s" : "5-15s"}
              </p>
            </div>
          </div>
          {!isPro && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">PRO</span>}
        </div>
      </div>

      {/* CTA Upgrade */}
      {!isPro && (
        <button
          onClick={() => openUpgrade('pro')}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 hover:from-amber-500/20 hover:to-orange-500/20 transition-all group cursor-pointer"
        >
          <Zap size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-amber-400 font-bold">Desbloqueá todo con Pro por $250 USD extra</span>
          <ArrowUpRight size={16} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {isPro && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Sparkles size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">Tenés acceso completo</p>
            <p className="text-xs text-emerald-300/70">Todas las funciones Pro están activas</p>
          </div>
        </div>
      )}
    </div>

    {/* 🔥 NUEVA SECCIÓN: Todas las funciones del sistema */}
    {!isPro && (
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Lock size={18} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Funciones Pro</h2>
            <p className="text-xs text-[var(--text-muted)]">Todo lo que desbloqueás al hacer upgrade</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {/* Feature: Clonación de campañas */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <Copy size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Clonación 1-click</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Duplicá campañas exitosas al instante</p>
          </div>

          {/* Feature: Programación */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Programación</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Agendá envíos para cualquier fecha y hora</p>
          </div>

          {/* Feature: Modo humano */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Modo humano</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Envío con pausas aleatorias, anti-ban</p>
          </div>

          {/* Feature: Cancelación en vivo */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <OctagonX size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Cancelación en vivo</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Frená campañas activas en cualquier momento</p>
          </div>

          {/* Feature: Blacklist */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <Ban size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Blacklist</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Bloqueá números que no quieren recibir mensajes</p>
          </div>

          {/* Feature: Reportes avanzados */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Reportes avanzados</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Gráficos de entrega, apertura y conversión</p>
          </div>

          {/* Feature: Métricas de templates */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Métricas templates</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Analizá qué templates performan mejor</p>
          </div>

          {/* Feature: Exportación CSV */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <Download size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Export CSV</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Descargá contactos, reportes y logs</p>
          </div>

          {/* Feature: Reconexión keep-alive */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Reconexión auto</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Keep-alive automático de líneas 24/7</p>
          </div>

          {/* Feature: Spintax por línea */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <Split size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Spintax por línea</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Variables personalizadas por cada línea WhatsApp</p>
          </div>

          {/* Feature: Modo simulacro */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Modo simulacro</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Probá campañas sin enviar mensajes reales</p>
          </div>

          {/* Feature: Campañas recurrentes */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/30 opacity-70 hover:opacity-100 transition-opacity group">
            <div className="flex items-center gap-2 mb-2">
              <Repeat size={16} className="text-amber-400" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 leading-none">PRO</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Recurrentes</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Automatizá envíos diarios, semanales o mensuales</p>
          </div>
        </div>

        {/* CTA empujón final */}
        <button
          onClick={() => openUpgrade('pro')}
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/25 hover:to-orange-500/25 transition-all cursor-pointer group"
        >
          <Sparkles size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-amber-400">Upgrade a Pro y desbloqueá todo esto</span>
          <ArrowRight size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    )}

    {/* Si es Pro, mostramos las funciones como "Activas" */}
    {isPro && (
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Todas las funciones activas</h2>
            <p className="text-xs text-[var(--text-muted)]">Tenés acceso completo al sistema</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { icon: Copy, label: "Clonación 1-click", desc: "Duplicá campañas exitosas" },
            { icon: CalendarClock, label: "Programación", desc: "Agendá envíos futuros" },
            { icon: UserCheck, label: "Modo humano", desc: "Pausas aleatorias anti-ban" },
            { icon: OctagonX, label: "Cancelación en vivo", desc: "Frená campañas activas" },
            { icon: Ban, label: "Blacklist", desc: "Bloqueá números" },
            { icon: BarChart3, label: "Reportes avanzados", desc: "Gráficos de conversión" },
            { icon: FileText, label: "Métricas templates", desc: "Performance por template" },
            { icon: Download, label: "Export CSV", desc: "Descargá todo" },
            { icon: RefreshCw, label: "Reconexión auto", desc: "Keep-alive 24/7" },
            { icon: Split, label: "Spintax por línea", desc: "Variables personalizadas" },
            { icon: FlaskConical, label: "Modo simulacro", desc: "Prueba sin enviar" },
            { icon: Repeat, label: "Recurrentes", desc: "Envíos automáticos" },
          ].map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-1.5">
                <f.icon size={14} className="text-emerald-400" />
                <CheckCircle2 size={12} className="text-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">{f.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

              {/* TAB: LÍNEAS */}
              {activeTab === "lines" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Líneas WhatsApp</h2>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all">
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
                          <button onClick={(e) => { e.stopPropagation(); logoutLine(line.id) }} className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                            <Power size={14} />
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
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Conectá una línea primero</span>
                      ) : (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">Seleccioná al menos una línea</span>
                      )}
                    </div>

                    <div className="space-y-5">
                      {/* LINE SELECTOR */}
                      {tier.hasRoundRobin ? (
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
    <button onClick={() => setShowUpgrade(true)} className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg flex items-center gap-1">
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
                              {targetsCount} números
                              {duplicateNumbers.length > 0 && (
                                <span className="text-red-400 ml-2 font-medium">• {duplicateNumbers.length} duplicado{duplicateNumbers.length > 1 ? 's' : ''}</span>
                              )}
                            </span>
                            <button onClick={() => setShowImportNumbers(true)} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors">
                              <Upload size={12} /> Importar números
                            </button>
                          </div>
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
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                              <p className="text-xs text-amber-400">No hay contactos guardados.</p>
                              <p className="text-[10px] text-amber-400/60 mt-1">Agregalos desde la sección Contactos.</p>
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
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                              <p className="text-xs text-amber-400">No hay tags creados.</p>
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
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Ejecución</label>
                                                    <div className="flex gap-2">
                            <button type="button" onClick={() => setScheduleMode("now")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${scheduleMode === "now" ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}>
                              ⚡ Enviar ahora
                            </button>
                            <button type="button" onClick={() => setScheduleMode("pending")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${scheduleMode === "pending" ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/25' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}>
                              ⏸️ Guardar
                            </button>
                            {/* Programar: solo Pro */}
{ tier.hasCron ? (
  <button type="button" onClick={() => setScheduleMode("scheduled")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${scheduleMode === "scheduled" ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}>
    📅 Programar
  </button>
) : (
  <button type="button" onClick={() => setShowUpgrade(true)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:border-amber-500/30 hover:text-amber-400 transition-all flex items-center justify-center gap-1">
    📅 <Zap size={10} /> Pro
  </button>
)}
                          </div>

                          {/* Selector de fecha/hora */}
                          {scheduleMode === 'scheduled' && tier.hasCron && (
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
                              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                La campaña se ejecutará automáticamente. El servidor debe estar activo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mensaje */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                            <Send size={14} /> Mensaje
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative">
  <select
    value=""
    onChange={e => {
      const t = templates.find((x: any) => x.id === e.target.value)
      if (t) setMessage(t.content)
      e.target.value = "" // reset para poder re-seleccionar el mismo
    }}
    className="appearance-none w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl pl-3 pr-10 py-2.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-blue-500/50 cursor-pointer hover:border-slate-600 transition-colors"
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
                            <button type="button" onClick={copyMessage} className="flex items-center gap-1 text-[10px] px-2 py-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/30 transition-colors">
                              📋 Copiar
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={message}
                          readOnly={isDemo}
                          onChange={e => !isDemo && setMessage(e.target.value)}
                          placeholder="Escribí tu mensaje aquí..."
                          rows={4}
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all resize-none"
                        />

                           {hasUrl(message) && (
                          <div className="mt-2 p-3 bg-[var(--bg-card)] border border-blue-500/20 rounded-xl">
                            <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Link size={10} /> Link detectado
                            </p>
                            <MessagePreview text={message} />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                            <Eye size={12} /> Ver preview
                          </button>
                          <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-1 rounded border border-[var(--border-color)]">{`Spintax: {{hola|buenas|hey}}`}</span>
                          <button type="button" onClick={() => setShowSpintaxHelp(true)} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center gap-1">
                            <Sparkles size={10} /> ¿Qué es Spintax?
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[10px] text-[var(--text-muted)]">Insertar:</span>
                          <button type="button" onClick={() => insertSpintax('saludo')} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">👋 Saludo</button>
                          <button type="button" onClick={() => insertSpintax('despedida')} className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">✌️ Despedida</button>
                          {tier.hasAdvancedSpintax && (
                            <>
                          <button type="button" onClick={() => insertSpintax('emoji')} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">🔥 Emoji</button>
                          <button type="button" onClick={() => insertSpintax('nombre')} className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">🏷️ Nombre</button>
                          </>
  )}
                        </div>
                      </div>

                      

                      {tier.hasHumanMode ? (
  <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${humanMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[var(--bg-card)] border-[var(--border-color)]/60'}`}>
    <input 
      type="checkbox" 
      id="humanMode"
      checked={humanMode}
      onChange={(e) => setHumanMode(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded-full border-slate-500 bg-[var(--bg-input)] text-amber-500 focus:ring-amber-500/50"
    />
    <div className="flex-1">
      <label htmlFor="humanMode" className={`text-sm font-bold cursor-pointer flex items-center gap-2 ${humanMode ? 'text-amber-400' : 'text-[var(--text-secondary)]'}`}>
        <UserCheck size={14} /> Modo Humano PRO
      </label>
      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
        Simula el indicador <span className="text-amber-400 font-medium">"escribiendo..."</span> con delay proporcional al texto. 
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
    <button onClick={() => setShowUpgrade(true)} className="text-[10px] px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-bold flex items-center gap-1">
      <Zap size={10} /> Upgrade
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
                            <Clock size={14} /> Delay (ms)
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
                          if (!verifyCampaign()) return
                          sendCampaign()
                        }}
                        disabled={isSending || selectedLineIds.length === 0 || isVerifying || validationErrors.length > 0 || duplicateNumbers.length > 0 || targetsCount === 0 || (scheduleMode === 'scheduled' && !scheduleDate)}
                        className={`w-full font-bold py-4 rounded-xl transition-all relative overflow-hidden ${
                          isSending || selectedLineIds.length === 0 || isVerifying || duplicateNumbers.length > 0 || targetsCount === 0
                            ? "bg-[#1E293B] text-[var(--text-muted)] cursor-not-allowed"
                            : scheduleMode === 'pending'
                            ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
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
              {activeTab === "logs" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Logs en vivo</h2>
                    <div className="flex items-center gap-2">
                      {!isPro && <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"><Zap size={10} className="inline" /> PRO</span>}
                      <button onClick={() => isPro ? setLogs([]) : setShowUpgrade(true)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${isPro ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed'}`}>
                        <Trash2 size={14} /> Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                    <div className="bg-[var(--bg-input)] rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-xs space-y-1.5 border border-[var(--border-color)]/40">
                      <AnimatePresence initial={false}>
                        {logs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <Activity size={24} className="mb-2" />
                            <span>Esperando acciones...</span>
                          </div>
                        ) : (
                          logs.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`${log.includes("✅") ? "text-emerald-400" : log.includes("❌") ? "text-red-400" : log.includes("🚀") ? "text-blue-400" : "text-[var(--text-secondary)]"}`}>
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