"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Lock,
  Eye, 
  RotateCcw, 
  Trash2,
  Calendar,
  Zap,
  Play,
  Square,
  Users,
  Download,
  Edit3,
    MessageCircleReply, 
    ShieldBan, 
    Timer, 
    Layers, 
    X, 
    Sparkles,
    CalendarClock,
    FlaskConical,
    Globe,
    MessageCircle,
    Phone,
    Copy,
    Ban,
    Pencil,
    AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"
import { useConfirm } from "@/hooks/useConfirm"
import { useLicense } from "@/hooks/useLicense"

import { useAuth } from "@/hooks/useAuth"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Sidebar } from "../../components/ui/sidebar"
import { PremiumModal } from "../../components/ui/modal"
import { useRouter } from "next/navigation"
import { io } from "socket.io-client"
import { useUpgradeModal } from "../../components/UpgradeModalProvider"
import { useDemoMode } from "@/hooks/useDemo"


interface Campaign {
  id: string
  name: string
  line_id: string
  message: string
  total: number
  proxy_node?: string
  proxy_ip?: string
  sent: number
  summary?: string
  failed: number
  status: string
  created_at: string
  finished_at?: string
  scheduled?: {
    execute_at: string
    status: string
  } | null
}

interface ReportStats {
  totalCampaigns: number
  totalSent: number
  totalFailed: number
  totalMessages: number
  deliveryRate: number
  activeNow: number
  uniqueDelivered?: number
  // 👇 NUEVOS
  openRate?: number
  repliesReceived?: number
  blacklistCount?: number
  avgDeliveryTime?: number
  scheduledCount?: number
  pendingCount?: number
}

interface ChartPoint {
  date: string
  sent: number
  failed: number
  total: number
}

const COLORS = {
  sent: "#10B981",
  failed: "#EF4444",
  primary: "#3B82F6",
  accent: "#8B5CF6"
}


export default function ReportsPage() {
  const router = useRouter()
  const { license } = useLicense()
  const { user } = useAuth()
  const [period, setPeriod] = useState("30d")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetail, setShowDetail] = useState(false)
 const [showProFeaturesModal, setShowProFeaturesModal] = useState(false)

 const [showRepliesModal, setShowRepliesModal] = useState(false)
// const [globalReplies, setGlobalReplies] = useState<any[]>([])
const [replyDetailList, setReplyDetailList] = useState<any[]>([])
const [showReplyDetail, setShowReplyDetail] = useState(false)

  // FIX 1: Mapa de logs por campaign_id en vez de array global único
const [campaignLogsMap, setCampaignLogsMap] = useState<Record<string, any[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wabisend_campaign_logs')
        return saved ? JSON.parse(saved) : {}
      } catch { return {} }
    }
    return {}
  })

  

  const { isOpen, options, confirm: askConfirm, onConfirm, onCancel } = useConfirm()

  const isPro = license?.tier === 'pro' || license?.tier === 'business'
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''
  const { openUpgrade } = useUpgradeModal()
  const { isDemo } = useDemoMode()
  // FIX 2: Precargar logs de campañas completadas/en ejecución para métricas en tabla
   const fetchReports = useCallback(async () => {
    setLoading(true)

    // ========== DEMO: Métricas infladas + filtro por período ==========
    if (isDemo) {
      const allCampaigns: Campaign[] = [
                {
          id: "demo-camp-1",
          name: "🔥 Black Friday 2026",
          line_id: "demo-line-1",
          message: "70% OFF en todo el catálogo · Solo 24hs",
          total: 5000,
          sent: 4995,
          failed: 5,
          status: "completed",
          created_at: "2026-05-28T10:00:00Z",
          finished_at: "2026-05-28T11:30:00Z",
          summary: "La campaña reciente logró una tasa de entrega del 99.8% con 4995 envíos exitosos. Se recomienda aumentar la cantidad de envíos para evaluar la respuesta del público y optimizar el contenido.",
          proxy_node: "Frankfurt",
          proxy_ip: "85.214.56.112",
        },
        {
          id: "demo-camp-2",
          name: "☀️ Promo Verano",
          line_id: "demo-line-2",
          message: "Descuentos de verano hasta 50%",
          total: 3200,
          sent: 3198,
          failed: 2,
          status: "completed",
          created_at: "2026-05-25T14:00:00Z",
          finished_at: "2026-05-25T15:20:00Z",
        },
        {
          id: "demo-camp-3",
          name: "🚀 Lanzamiento Producto X",
          line_id: "demo-line-1",
          message: "Nuevo producto ya disponible",
          total: 1800,
          sent: 1795,
          failed: 5,
          status: "completed",
          created_at: "2026-05-22T09:00:00Z",
          finished_at: "2026-05-22T09:45:00Z",
        },
        {
                  
          id: "demo-camp-4",
          name: "📢 Reactivación Clientes",
          line_id: "demo-line-3",
          message: "Te extrañamos, volvé con 20% OFF",
          total: 890,
          sent: 456,
          failed: 3,
          status: "running",
          created_at: "2026-05-30T08:00:00Z",
          proxy_node: "Londres",
          proxy_ip: "51.104.92.11",
        },
        {
          id: "demo-camp-5",
          name: "⏰ Recordatorio Pagos",
          line_id: "demo-line-2",
          message: "Recordatorio de pago pendiente",
          total: 2100,
          sent: 0,
          failed: 0,
          status: "pending",
          created_at: "2026-05-30T16:00:00Z",
          scheduled: { execute_at: "2026-05-31T09:00:00Z", status: "pending" },
        },
        {
          id: "demo-camp-6",
          name: "👋 Bienvenida Nuevos Leads",
          line_id: "demo-line-4",
          message: "Bienvenido a nuestro servicio VIP",
          total: 1500,
          sent: 0,
          failed: 0,
          status: "pending",
          created_at: "2026-05-29T11:00:00Z",
        },
        {
          id: "demo-camp-7",
          name: "⚡ Flash Sale 24hs",
          line_id: "demo-line-1",
          message: "Solo por hoy 50% OFF en todo",
          total: 4200,
          sent: 4198,
          failed: 2,
          status: "completed",
          created_at: "2026-05-20T10:00:00Z",
          finished_at: "2026-05-20T11:00:00Z",
        },
        {
          id: "demo-camp-8",
          name: "🧪 Test Interno",
          line_id: "demo-line-5",
          message: "Test de conectividad",
          total: 100,
          sent: 50,
          failed: 1,
          status: "cancelled",
          created_at: "2026-05-15T10:00:00Z",
          finished_at: "2026-05-15T10:30:00Z",
        },
      ]

      // ========== FILTRAR POR PERÍODO ==========
      const now = new Date()
      const filtered = allCampaigns.filter(c => {
        const date = new Date(c.created_at)
        if (period === "7d") return now.getTime() - date.getTime() <= 7 * 86400000
        if (period === "30d") return now.getTime() - date.getTime() <= 30 * 86400000
        return true
      })

      const totalSent = filtered.reduce((sum, c) => sum + (c.sent || 0), 0)
      const totalFailed = filtered.reduce((sum, c) => sum + (c.failed || 0), 0)
      const totalMessages = totalSent + totalFailed

      const demoStats: ReportStats = {
  totalCampaigns: filtered.length,
  totalSent,
  totalFailed,
  totalMessages,
  deliveryRate: totalMessages > 0 ? Math.round((totalSent / totalMessages) * 1000) / 10 : 0,
  activeNow: filtered.filter(c => c.status === 'running').length,
  uniqueDelivered: Math.round(totalSent * 0.75),
  // Métricas avanzadas
  openRate: 68.5,
  repliesReceived: 1243,
  blacklistCount: 23,
  avgDeliveryTime: 4.2,
  // NUEVO: Programadas / Pendientes
  scheduledCount: filtered.filter(c => c.status === 'pending' && c.scheduled).length,
  pendingCount: filtered.filter(c => c.status === 'pending' && !c.scheduled).length,
}

      // Chart data filtrado por período
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 60
      const demoChartData: ChartPoint[] = Array.from({ length: days }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (days - 1 - i))
        const dateStr = d.toISOString().split('T')[0]
        const base = Math.max(0, 500 - i * 8)
        const sent = Math.floor(base + Math.random() * 200)
        const failed = Math.floor(Math.random() * 5)
        return { date: dateStr, sent, failed, total: sent + failed }
      })

      // Logs para el modal de detalle
      const demoLogsMap: Record<string, any[]> = {}
      filtered.forEach(c => {
        if (c.sent > 0) {
          const logs: any[] = []
          const count = Math.min(c.sent, 25)
                    for (let i = 0; i < count; i++) {
            const phone = `54911${String(30000000 + i).slice(-8)}`
            // 1 de cada 15 es blacklist
            const isBlacklist = i % 15 === 0
            // 1 de cada 10 es fallido (y luego reintentado exitoso para el recovered)
            const isFailed = i % 10 === 0
            
            if (isBlacklist) {
              logs.push({
                contact_phone: phone,
                status: 'skipped_blacklist',
                delayMs: 0,
                humanMode: false,
                has_reply: false,
                contact_name: null,
              })
            } else if (isFailed) {
              // Fallido primero
              logs.push({
                contact_phone: phone,
                status: 'failed',
                delayMs: 0,
                humanMode: false,
                has_reply: false,
                contact_name: null,
              })
              // Y reintentado exitoso (recovered)
              logs.push({
                contact_phone: phone,
                status: 'sent',
                delayMs: Math.floor(Math.random() * 8000) + 2000,
                humanMode: false,
                has_reply: false,
                contact_name: null,
              })
            } else {
              logs.push({
                contact_phone: phone,
                status: 'sent',
                delayMs: Math.floor(Math.random() * 12000) + 3000,
                humanMode: i % 4 === 0,
                has_reply: i % 7 === 0,
                replied_at: i % 7 === 0 ? new Date().toISOString() : null,
                contact_name: i % 3 === 0 ? `Contacto Demo ${i}` : null,
              })
            }
          }
          for (let i = 0; i < Math.min(c.failed, 3); i++) {
            logs.push({
              contact_phone: `54911${String(40000000 + i).slice(-8)}`,
              status: 'failed',
              delayMs: 0,
              humanMode: false,
            })
          }
          demoLogsMap[c.id] = logs
        }
      })

      setCampaigns(filtered)
      setStats(demoStats)
      setChartData(demoChartData)
      setCampaignLogsMap(demoLogsMap)
      setLoading(false)
      return
    }

    // ========== CÓDIGO ORIGINAL ==========
    try {
      const res = await fetch(`/api/campaigns/report?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setStats(data.stats || null)
      setChartData(data.chartData || [])

      data.campaigns?.forEach((c: Campaign) => {
        if (c.status !== 'pending' && c.status !== 'draft') {
          fetchCampaignLogs(c.id)
        }
      })
    } catch {
      toast.error("Error cargando reportes")
    } finally {
      setLoading(false)
    }
  }, [period, token, isDemo])


  useEffect(() => {
    if (!showDetail || !selectedCampaign || isDemo) return  // ← agregar isDemo
    
    // Polling siempre activo mientras el modal está abierto
    // (no filtramos por status porque el estado local puede estar desactualizado)
    const interval = setInterval(() => {
      fetchCampaignLogs(selectedCampaign.id)
      fetchReports()
    }, 3000)

    return () => clearInterval(interval)
  }, [showDetail, selectedCampaign?.id, isDemo])

  // Socket.IO: escuchar logs y finalización en tiempo real
  useEffect(() => {
     if (isDemo) return
    const backendUrl = process.env.BACKEND_URL || window.location.origin
    const s = io(backendUrl, { transports: ['websocket'] })

    s.on('campaign_log', (data: any) => {
      // Agregar log al mapa (evitando duplicados exactos)
      setCampaignLogsMap(prev => {
        const existing = prev[data.campaign_id] || []
        const alreadyExists = existing.some(
          (l: any) => l.contact_phone === data.contact_phone && l.status === data.status
        )
        if (alreadyExists) return prev
        return {
          ...prev,
          [data.campaign_id]: [...existing, data]
        }
      })

      // Actualizar sent/failed de la campaña en vivo (sin esperar fetch)
      setCampaigns(prev => prev.map(c => {
        if (c.id !== data.campaign_id) return c
        return {
          ...c,
          sent: data.status === 'sent' ? (c.sent || 0) + 1 : c.sent,
          failed: data.status === 'failed' ? (c.failed || 0) + 1 : c.failed
        }
      }))
    })

    s.on('campaign_complete', (data: any) => {
      setCampaigns(prev => prev.map(c => {
        if (c.id !== data.campaign_id) return c
        return {
          ...c,
          status: data.status || 'completed',
          finished_at: new Date().toISOString()
        }
      }))
      toast.success(`Campaña finalizada`)
    })

    return () => { s.disconnect() }
  }, [])

  // FIX 1 (continuación): Guardar logs en mapa por campaign_id
  const fetchCampaignLogs = async (campaignId: string) => {
      if (isDemo) return // ← AGREGAR ESTA LÍNEA
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCampaignLogsMap(prev => ({ ...prev, [campaignId]: data.logs || [] }))
    } catch {
      // Silencioso: si falla, queda vacío para esa campaña
    }
  }

     const startCampaign = async (id: string) => {
    if (isDemo) {
      toast.info(" Acción disponible en modo real")
      return
    }
    // Limpiar logs previos de esta campaña antes de iniciar nueva ejecución
    setCampaignLogsMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const res = await fetch(`/api/campaigns/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Campaña iniciada. Abriendo sala de control...")
        await fetchReports()
        
        // Abrir modal automáticamente para ver logs en vivo
        const campaign = campaigns.find(c => c.id === id)
        if (campaign) {
          setSelectedCampaign(campaign)
          fetchCampaignLogs(id)
          setShowDetail(true)
        }
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const openDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    fetchCampaignLogs(campaign.id)
    setShowDetail(true)
  }

  const cloneCampaign = async (id: string) => {
    if (isDemo) {
  toast.info(" Acción disponible en modo real")
  return
}
    if (!isPro) {
      toast.error("Requiere plan Pro")
      return
    }

    const ok = await askConfirm({
      title: "Duplicar campaña",
      description: "¿Duplicar esta campaña? Se creará una copia en estado 'En espera' para que la edites antes de enviar.",
      confirmText: "Duplicar",
      variant: "warning",
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/campaigns/${id}/clone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.campaign) {
        localStorage.setItem('mb_clone_campaign', JSON.stringify(data.campaign))
        toast.success("Campaña duplicada. Redirigiendo al editor...")
        router.push("/dashboard")
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const deleteCampaign = async (id: string, status: string) => {
    if (isDemo) {
  toast.info(" Acción disponible en modo real")
  return
}
    if (status === 'running') {
      toast.error("No se puede eliminar una campaña en ejecución. Parala primero.")
      return
    }

    const ok = await askConfirm({
      title: "Eliminar campaña",
      description: "¿Eliminar esta campaña y todo su historial? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      variant: "danger",
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success("Campaña eliminada")
        fetchReports()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error eliminando")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const handleBlacklist = async (phone: string, reason: string) => {
  if (!isPro) {
    toast.error("Blacklist requiere plan Business")
    return
  }
  try {
    const res = await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ phone, reason })
    })
    if (res.ok) {
      toast.success(`🚫 ${phone} agregado a blacklist`)
    } else {
      const data = await res.json()
      toast.error(data.error || 'Error al agregar a blacklist')
    }
  } catch {
    toast.error('Error de red')
  }
}

  const cancelCampaign = async (id: string) => {
    if (isDemo) {
  toast.info(" Acción disponible en modo real")
  return
}
    const ok = await askConfirm({
      title: "Parar campaña",
      description: "¿Detener esta campaña? Los mensajes pendientes no se enviarán.",
      confirmText: "Parar",
      variant: "warning",
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/campaigns/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success("Campaña detenida")
        fetchReports()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const pieData = stats ? [
    { name: "Entregados", value: stats.totalSent, color: COLORS.sent },
    { name: "Fallidos", value: stats.totalFailed, color: COLORS.failed },
  ] : []

  const openEditRedirect = async (campaign: Campaign) => {
  try {
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
    const data = await res.json()
    if (!data.campaign) return toast.error("Error cargando campaña")
    
    localStorage.setItem('mb_edit_campaign', JSON.stringify(data.campaign))
    toast.info("Cargando editor...")
    router.push("/dashboard")
  } catch {
    toast.error("Error cargando campaña")
  }
}

const handleExport = async (campaignId: string) => {
  if (isDemo) {
  toast.info(" Acción disponible en modo real")
  return
}
  if (!isPro) {
    toast.error("Exportar números válidos requiere plan Pro")
    return
  }
  try {
    const res = await fetch(`/api/campaigns/${campaignId}/export`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campana_${campaignId}_validos.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
    toast.success("CSV exportado")
  } catch {
    toast.error("Error exportando campaña")
  }
}
const globalReplies = useMemo<any[]>(() => {
  const allLogs = Object.values(campaignLogsMap).flat()
  const seen = new Set()
  return allLogs
    .filter((l: any) => l.has_reply)
    .filter((l: any) => {
      if (seen.has(l.contact_phone)) return false
      seen.add(l.contact_phone)
      return true
    })
    .map((l: any) => ({
      contact_phone: l.contact_phone,
      isBlacklisted: l.isBlacklisted,
      contact_name: l.contact_name || null,
      replied_at: l.replied_at || l.created_at,
      campaign_id: l.campaign_id
    }))
}, [campaignLogsMap])

   useEffect(() => {
    fetchReports()
  }, [fetchReports])

// Persistir campaignLogsMap en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wabisend_campaign_logs', JSON.stringify(campaignLogsMap))
    }
  }, [campaignLogsMap])
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />

      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>

        {/* Header */}
<header 
  className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between px-6 z-30 fixed"
  style={{ 
    top: 0, 
    left: 'var(--sidebar-width)', 
    right: 0,
    transition: 'left 0.3s ease'
  }}
>
  <div>
    <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
      <BarChart3 size={20} className="text-cyan-400" /> Reportes
    </h1>
    <p className="text-xs text-[var(--text-muted)]">Métricas y rendimiento de campañas</p>
  </div>
  <div className="flex items-center gap-2">
    {[
      { id: "7d", label: "7 días" },
      { id: "30d", label: "30 días" },
      { id: "90d", label: "90 días", proOnly: true },
      { id: "all", label: "Todo", proOnly: true },
    ].map(p => {
      const locked = p.proOnly && !isPro
      return (
        <button
          key={p.id}
          onClick={() => {
            if (locked) {
              setShowProFeaturesModal(true)
              return
            }
            setPeriod(p.id)
          }}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            period === p.id && !locked
              ? 'bg-cyan-600 text-[var(--text-primary)]'
              : locked
              ? 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] opacity-50 cursor-not-allowed'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-cyan-500/50'
          }`}
          title={locked ? "Disponible en Pro y Business" : ""}
        >
          {p.label}
          {locked && <Lock size={10} className="inline ml-1 text-amber-400" />}
        </button>
      )
    })}
  </div>
</header>

        <main className="p-6 mt-4 space-y-6 pt-16">

          {/* Stats Cards — 4 arriba */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={Send} 
              label="Total enviados" 
              value={stats?.totalSent || 0} 
              color="text-emerald-400" 
              bg="bg-emerald-500/10" 
            />
            <StatCard 
              icon={XCircle} 
              label="Fallidos" 
              value={stats?.totalFailed || 0} 
              color="text-red-400" 
              bg="bg-red-500/10" 
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Tasa de entrega" 
              value={`${stats?.deliveryRate || 0}%`} 
              color="text-blue-400" 
              bg="bg-blue-500/10" 
            />
            <StatCard 
  icon={CalendarClock} 
  label="Campañas" 
  value={
    <div className="flex items-center gap-3">
      <span className="text-purple-400 font-bold">{stats?.scheduledCount || 0}</span>
      <span className="text-[var(--text-muted)] text-xs">/</span>
      <span className="text-amber-400 font-bold">{stats?.pendingCount || 0}</span>
    </div>
  } 
  color="text-[var(--text-primary)]" 
  bg="bg-[var(--bg-input)]" 
  sub={
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] text-purple-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Programadas
      </span>
      <span className="text-[10px] text-amber-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pendientes
      </span>
    </div>
  }
/>
          </div>

        {/* Card ancha "Contactos únicos alcanzados" */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex items-center justify-between"
>
  <div className="flex items-center gap-4">
    <div className="h-14 w-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
      <Users size={28} className="text-cyan-400" />
    </div>
    <div>
      <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">Contactos únicos alcanzados</p>
      <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
        {stats?.uniqueDelivered ?? campaigns.reduce((acc, c) => {
          const logs = campaignLogsMap[c.id] || []
          const unique = new Set(logs.filter((l: any) => l.status === 'sent').map((l: any) => l.contact_phone)).size
          return acc + unique
        }, 0)}
      </p>
    </div>
  </div>
  <div className="hidden sm:block text-right">
    <p className="text-xs text-[var(--text-muted)]">Números distintos que recibieron al menos 1 mensaje</p>
    <p className="text-xs text-cyan-400/60 mt-1">Sin contar reintentos ni duplicados</p>
  </div>
</motion.div>

                    {/* ========== CARDS PRO OFUSCADAS ========== */}
          {!isPro && (
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowProFeaturesModal(true)}
            >
              {/* Overlay blur */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[var(--bg-card)]/30 z-10 rounded-2xl transition-all group-hover:bg-[var(--bg-card)]/40" />
              
              {/* Centro overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Lock size={24} className="text-amber-400" />
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Métricas avanzadas</p>
                <p className="text-xs text-[var(--text-muted)] mb-3">Tocá para ver todo lo que incluye Pro</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowProFeaturesModal(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  Ver funciones Pro
                </button>
              </div>

              {/* Cards fantasmas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-30 pointer-events-none">
  <StatCard icon={Eye} label="Tasa de apertura" value="—" color="text-cyan-400" bg="bg-cyan-500/10" />

<StatCard icon={MessageCircleReply} label="Respuestas recibidas" value="—" color="text-pink-400" bg="bg-pink-500/10" />

  <StatCard icon={ShieldBan} label="Blacklist activos" value="—" color="text-orange-400" bg="bg-orange-500/10" />
  <StatCard icon={Timer} label="Tiempo promedio" value="—" color="text-sky-400" bg="bg-sky-500/10" />
</div>
            </div>
          )}

          {/* Si es Pro, mostramos las cards reales (por ahora en 0) */}
                            {isPro && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard 
      icon={Eye} 
      label="Tasa de apertura" 
      value={`${stats?.openRate || 0}%`} 
      color="text-cyan-400" 
      bg="bg-cyan-500/10" 
    />
    <button
  type="button"
  onClick={() => setShowRepliesModal(true)}
  className="text-left w-full p-0 m-0 bg-transparent border-none"
>
  <StatCard 
    icon={MessageCircleReply} 
    label="Respuestas recibidas" 
    value={globalReplies.length} 
    color="text-pink-400" 
    bg="bg-pink-500/10" 
  />
</button>
    <StatCard 
      icon={ShieldBan} 
      label="Blacklist activos" 
      value={stats?.blacklistCount || 0} 
      color="text-orange-400" 
      bg="bg-orange-500/10" 
    />
    <StatCard 
      icon={Timer} 
      label="Tiempo promedio" 
      value={`${stats?.avgDeliveryTime || 0}s`} 
      color="text-cyan-400" 
      bg="bg-cyan-500/10" 
    />
  </div>
)}

          {/* ========== GRÁFICOS (TU CÓDIGO EXISTENTE, NO SE TOCA) ========== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ... tu código de gráficos ... */}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Gráfico de línea: Envíos por día */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
  <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
    <TrendingUp size={16} /> Envíos por período
  </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.sent} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.sent} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.failed} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.failed} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)"  />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-muted)" 
                      fontSize={12}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                     <Tooltip 
    contentStyle={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-color)', 
      borderRadius: '12px',
      color: 'var(--text-primary)'
    }}
  />
                    <Area 
                      type="monotone" 
                      dataKey="sent" 
                      stroke={COLORS.sent} 
                      fill="url(#sentGradient)" 
                      strokeWidth={2}
                      name="Entregados"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed" 
                      stroke={COLORS.failed} 
                      fill="url(#failedGradient)" 
                      strokeWidth={2}
                      name="Fallidos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart: Distribución */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} /> Distribución
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
  contentStyle={{ 
    backgroundColor: 'var(--bg-card)', 
    border: '1px solid var(--border-color)', 
    borderRadius: '12px',
    color: 'var(--text-primary)'
  }}
/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[var(--text-secondary)]">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de campañas */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)]/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} /> Historial de campañas
              </h3>
              <span className="text-xs text-[var(--text-muted)]">{campaigns.length} campañas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]/60 text-left">
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Campaña</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fecha</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Progreso</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Estado</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {campaigns.map((campaign) => {
                                           // --- Variables calculadas por campaña usando campaignLogsMap ---
                      const total = campaign.total || 1
                      const sent = campaign.sent || 0
                      const failed = campaign.failed || 0

                      // FIX 1: Usar logs de esta campaña específica desde el mapa
                      const logsForThisCampaign = campaignLogsMap[campaign.id] || []

                      // === CÁLCULO HONESTO (igual que Sala de Control) ===
                      const phonesWithSuccess = new Set(
                        logsForThisCampaign.filter((l: any) => l.status === 'sent').map((l: any) => l.contact_phone)
                      )
                      const phonesWithFailure = new Set(
                        logsForThisCampaign.filter((l: any) => l.status === 'failed').map((l: any) => l.contact_phone)
                      )
                      const phonesWithBlacklist = new Set(
                        logsForThisCampaign.filter((l: any) => l.status === 'skipped_blacklist').map((l: any) => l.contact_phone)
                      )

                      const pureDelivered = new Set(Array.from(phonesWithSuccess).filter(p => !phonesWithFailure.has(p))).size
                      const recoveredCount = new Set(Array.from(phonesWithFailure).filter(p => phonesWithSuccess.has(p))).size
                      const pureFailed = new Set(Array.from(phonesWithFailure).filter(p => !phonesWithSuccess.has(p))).size
                      const uniqueDelivered = phonesWithSuccess.size

                      // Barra de progreso: contactos únicos procesados (tocados al menos una vez)
                      const uniquePhonesProcessed = new Set(
                        logsForThisCampaign.map((l: any) => l.contact_phone)
                      ).size
                      const processed = logsForThisCampaign.length > 0 
                        ? uniquePhonesProcessed 
                        : Math.min((sent + failed), total)
                      const progress = Math.min(100, Math.round((processed / total) * 100))

                      const isCompleted = campaign.status === 'completed'
                      return (
                        <motion.tr
                          key={campaign.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-input)]/20 transition-colors"
                        >
                                  <td className="p-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{campaign.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{campaign.total} destinatarios</p>
            {campaign.proxy_node && (
              <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <Globe size={10} /> Enviada desde {campaign.proxy_node} ({campaign.proxy_ip})
              </p>
            )}
                        {campaign.summary && (
              <p title="Resumen Caleb AI" className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                <Sparkles size={12} /> Resumen Caleb
              </p>
            )}
            {recoveredCount > 0 && (
              <p className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                <RotateCcw size={10} /> {recoveredCount} recuperados
              </p>
            )}
            {phonesWithBlacklist.size > 0 && (
              <p className="text-[10px] text-purple-400 mt-0.5 flex items-center gap-1">
                <ShieldBan size={10} /> {phonesWithBlacklist.size} saltados
              </p>
            )}
            {/* {campaign.human_mode && (
              <p className="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
                <Pencil size={10} /> Modo humano
              </p>
            )} */}
            {campaign.scheduled?.execute_at && campaign.status === 'pending' && campaign.scheduled?.status === 'pending' && (
  <p className="text-[10px] text-purple-400 mt-0.5 flex items-center gap-1">
    <Calendar size={10} /> 
    {new Date(campaign.scheduled.execute_at).toLocaleString('es-AR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })}
  </p>
)}
          </div>
        </td>


 <td className="p-4">
                            <p className="text-sm text-[var(--text-secondary)]">
                              {new Date(campaign.created_at).toLocaleDateString('es')}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {new Date(campaign.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                                                    <td className="p-4">
                            {campaign.status === 'simulated' ? (
                              <div className="flex items-center gap-2">
                                <FlaskConical size={14} className="text-amber-400" />
                                <span className="text-xs text-amber-400 font-medium">{campaign.total} pings verificados</span>
                              </div>
                            ) : (
                                                            <div className="w-full max-w-[200px]">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-[var(--text-secondary)]">{processed} / {total} procesados</span>
                                  <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
                                    {progress}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${
                                      isCompleted 
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                                        : 'bg-gradient-to-r from-blue-500 to-blue-400'
                                    }`}
                                  />
                                </div>
                                                               <div className="flex items-center gap-2 mt-1">
                                  {pureDelivered > 0 && (
                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 size={10} /> {pureDelivered}
                                    </span>
                                  )}
                                  {phonesWithFailure.size > 0 && (
                                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                                      <XCircle size={10} /> {phonesWithFailure.size}
                                    </span>
                                  )}
                                  {recoveredCount > 0 && (
                                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                      <RotateCcw size={10} /> {recoveredCount}
                                    </span>
                                  )}
                                  {phonesWithBlacklist.size > 0 && (
                                    <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                      <ShieldBan size={10} /> {phonesWithBlacklist.size}
                                    </span>
                                  )}
                                  {uniqueDelivered > 0 && (
                                    <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                      <Users size={10} /> {uniqueDelivered}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                         
                                                    <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              campaign.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : campaign.status === 'running'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : campaign.status === 'simulated'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : campaign.status === 'pending' && campaign.scheduled?.status === 'pending'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : campaign.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : campaign.status === 'cancelled'
                                ? 'bg-slate-500/10 text-[var(--text-muted)] border-slate-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                              {campaign.status === 'completed' ? 'Completada' 
                                : campaign.status === 'running' ? 'Enviando...' 
                                : campaign.status === 'simulated' ? 'Simulado'
                                : campaign.status === 'pending' && campaign.scheduled?.status === 'pending' ? 'Programada'
                                : campaign.status === 'pending' ? 'En espera'
                                : campaign.status === 'cancelled' ? 'Detenida'
                                : 'Error'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
  <div className="flex items-center justify-end gap-1">
    {/* EDITAR: solo pendientes/programadas */}
    {(campaign.status === 'pending') && (
      <button 
        onClick={() => openEditRedirect(campaign)}
        className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
        title="Editar campaña"
      >
        <Edit3 size={16} />
      </button>
    )}

    {campaign.status === 'running' && (
      <button 
        onClick={() => cancelCampaign(campaign.id)}
        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Parar campaña"
      >
        <Square size={16} />
      </button>
    )}

    {campaign.status === 'pending' && (
      <button 
        onClick={() => startCampaign(campaign.id)}
        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
        title="Ejecutar ahora"
      >
        <Play size={16} />
      </button>
    )}

    <button 
      onClick={() => openDetail(campaign)}
      className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
      title="Ver detalle"
    >
      <Eye size={16} />
    </button>

    {/* EXPORTAR: blindado Pro */}
    <button 
      onClick={() => handleExport(campaign.id)}
      className={`p-1.5 rounded-lg transition-colors ${
        isPro 
          ? 'text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10' 
          : 'text-[var(--text-muted)] cursor-not-allowed'
      }`}
      title={isPro ? "Exportar válidos (CSV)" : "Exportar: Requiere Pro"}
    >
      <Download size={16} />
    </button>

    {/* CLONAR: blindado Pro (visual + funcional) */}
    <button 
      onClick={() => isPro ? cloneCampaign(campaign.id) : toast.error("Clonar requiere plan Pro")}
      className={`p-1.5 rounded-lg transition-colors ${
        isPro 
          ? 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10' 
          : 'text-[var(--text-muted)] cursor-not-allowed'
      }`}
      title={isPro ? "Repetir campaña" : "Duplicar: Requiere Pro"}
    >
      <RotateCcw size={16} />
    </button>

    <button 
      onClick={() => deleteCampaign(campaign.id, campaign.status)}
      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      title="Eliminar"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {campaigns.length === 0 && !loading && (
              <div className="py-16 text-center">
                <BarChart3 size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-muted)] text-sm">No hay campañas en este período</p>
              </div>
            )}
          </div>
                    {/* ========== MODAL: FEATURES PRO ========== */}
          <AnimatePresence>
            {showProFeaturesModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowProFeaturesModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-bold text-white">Métricas avanzadas</h3>
                    </div>
                    <button 
                      onClick={() => setShowProFeaturesModal(false)} 
                      className="text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-[var(--text-muted)] text-center mb-6">
                      Desbloqueá estas métricas y funciones con tu licencia Pro
                    </p>

                    {/* Grid 8 features */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <Eye size={22} className="text-cyan-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Tasa de apertura</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Saber quién abrió</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <MessageCircleReply size={22} className="text-pink-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Respuestas</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Tracking de replies</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <ShieldBan size={22} className="text-orange-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Blacklist</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Bloqueo de números</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <Timer size={22} className="text-cyan-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Tiempo promedio</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Velocidad de entrega</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <CalendarClock size={22} className="text-purple-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Programación</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Campañas agendadas</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <BarChart3 size={22} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Funnels</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Conversión paso a paso</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <Download size={22} className="text-blue-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Export CSV</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Descargar reportes</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center hover:bg-slate-800/70 transition-colors">
                        <Layers size={22} className="text-amber-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-white">Multi-línea</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Hasta 3 WhatsApp</p>
                      </div>
                    </div>

                    {/* CTA Licencia */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg mb-4">
                      <p className="text-xs text-amber-200/80 text-center">
                        ¿Ya tenés tu licencia? Activá Pro ahora mismo.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProFeaturesModal(false)
                        openUpgrade()
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
                    >
                      <Zap size={18} />
                      Upgrade a Pro
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      

      {/* MODAL: Detalle de campaña */}
      <AnimatePresence>
        {showDetail && selectedCampaign && (
          <PremiumModal
            open={showDetail}
            onClose={() => setShowDetail(false)}
            title={`Sala de Control: ${selectedCampaign.name}`}
            
          >
            {(() => {
                          // FIX 1: Usar logs de la campaña seleccionada desde el mapa
              const logsForSelected = campaignLogsMap[selectedCampaign.id] || []
              const total = selectedCampaign.total || 1

              // === CÁLCULO HONESTO DE ALCANZADOS ===
              const phonesWithSuccess = new Set(
                logsForSelected.filter((l: any) => l.status === 'sent').map((l: any) => l.contact_phone)
              )
              const phonesWithFailure = new Set(
                logsForSelected.filter((l: any) => l.status === 'failed').map((l: any) => l.contact_phone)
              )
              const phonesWithBlacklist = new Set(
                logsForSelected.filter((l: any) => l.status === 'skipped_blacklist').map((l: any) => l.contact_phone)
              )

              // Contactos entregados LIMPIOS (sin ningún fallo previo)
              const pureDelivered = new Set(Array.from(phonesWithSuccess).filter(p => !phonesWithFailure.has(p))).size
              // Contactos que fallaron al menos una vez pero luego se recuperaron
              const recoveredCount = new Set(Array.from(phonesWithFailure).filter(p => phonesWithSuccess.has(p))).size
              // Contactos que solo fallaron (nunca llegaron)
              const pureFailed = new Set(Array.from(phonesWithFailure).filter(p => !phonesWithSuccess.has(p))).size

              const sentCount = logsForSelected.filter((l: any) => l.status === 'sent').length
              const failedCount = logsForSelected.filter((l: any) => l.status === 'failed').length
              const blacklistCount = logsForSelected.filter((l: any) => l.status === 'skipped_blacklist').length

              const repliesCount = logsForSelected.filter((l: any) => l.has_reply).length
              const repliesList = logsForSelected.filter((l: any) => l.has_reply)

              const deliveryRate = total > 0 ? Math.min(100, Math.round((pureDelivered / total) * 100)) : 0
              const progress = Math.min(100, Math.round(((sentCount + failedCount) / total) * 100))


              return (
                <div className="space-y-6">
                  {/* Stats grandes */}
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="text-center p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <p className="text-2xl font-bold text-emerald-400">{pureDelivered}</p>
                      <p className="text-xs text-emerald-400/70 tracking-wider">Contactos alcanzados</p>
                    </div>
                     <div className="text-center p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      {/* <RotateCcw size={16} className="mx-auto text-amber-400 mb-1" /> */}
                      <p className="text-2xl font-bold text-amber-400">{recoveredCount}</p>
                      <p className="text-xs text-amber-400/70 tracking-wider">Recuperados</p>
                    </div>
                    <div className="text-center p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-2xl font-bold text-blue-400">{sentCount}</p>
                      <p className="text-xs text-blue-400/70 tracking-wider">Intentos totales</p>
                    </div>
                    <div 
                      onClick={() => {
                        setReplyDetailList(repliesList)
                        setShowReplyDetail(true)
                      }}
                      className="text-center p-2 bg-pink-500/10 rounded-xl border border-pink-500/20 cursor-pointer hover:bg-pink-500/20 transition"
                    >
                      <p className="text-2xl font-bold text-pink-400">{repliesCount}</p>
                      <p className="text-xs text-pink-400/70 tracking-wider">Respuestas</p>
                    </div>
                    <div 
                      onClick={() => {
                        const failedPhones = Array.from(phonesWithFailure).map(phone => {
                          const hasSuccess = phonesWithSuccess.has(phone)
                          return { phone, recovered: hasSuccess }
                        })
                        setReplyDetailList(failedPhones)
                        setShowReplyDetail(true)
                      }}
                      className="text-center p-2 bg-red-500/10 rounded-xl border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition"
                    >
                      <p className="text-2xl font-bold text-red-400">{phonesWithFailure.size}</p>
                      <p className="text-xs text-red-400/70 tracking-wider">Fallidos</p>
                      {recoveredCount > 0 && (
                        <p className="text-[10px] text-amber-400 mt-0.5">{recoveredCount} recuperados</p>
                      )}
                    </div>
                    <div className="text-center p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <p className="text-2xl font-bold text-purple-400">{blacklistCount}</p>
                      <p className="text-xs text-purple-400/70 tracking-wider">Saltados (Blacklist)</p>
                    </div>
                  </div>

                  {/* Progreso circular */}
                  <div className="flex items-center justify-center py-4">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#1E293B" strokeWidth="8" fill="none" />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#10B981"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - deliveryRate / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[var(--text-primary)]">{deliveryRate}%</span>
                        <span className="text-[10px] text-[var(--text-muted)]">alcanzados</span>
                      </div>
                    </div>
                  </div>

                  {selectedCampaign?.summary && (
                    <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <p className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1">
                        <Sparkles size={12} /> Resumen Caleb
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedCampaign.summary}</p>
                    </div>
                  )}

                  {/* Logs individuales */}
                  {logsForSelected.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Logs individuales</h4>
                      <div className="bg-[var(--bg-input)] rounded-xl p-3 h-40 overflow-y-auto border border-[var(--border-color)] space-y-1">
                        {logsForSelected.map((log, i) => {
                          const isSent = log.status === 'sent'
                          const isBlacklist = log.status === 'skipped_blacklist'
                          const isFailed = log.status === 'failed'
                          const hadFailure = isSent && phonesWithFailure.has(log.contact_phone)
                          const hadSuccess = isFailed && phonesWithSuccess.has(log.contact_phone)
                          
                          return (
                                                        <div key={i} className={`text-xs flex items-center gap-2 ${
                              isSent ? 'text-emerald-400' : isBlacklist ? 'text-purple-400' : 'text-red-400'
                            }`}>
                              <span className="text-[var(--text-muted)]">{log.contact_phone}</span>
                              <span className="flex items-center gap-1">
                                {isSent ? <CheckCircle2 size={10} /> : isBlacklist ? <ShieldBan size={10} /> : <XCircle size={10} />}
                                {isSent ? 'Entregado' : isBlacklist ? 'Blacklist' : 'Fallido'}
                              </span>
                              {hadFailure && (
                                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                  <AlertTriangle size={10} /> reintentado
                                </span>
                              )}
                              {hadSuccess && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                  <RotateCcw size={10} /> luego entregado
                                </span>
                              )}
                              {log.delayMs > 0 && isSent && (
                                <span className="text-[10px] text-amber-400 ml-auto flex items-center gap-1">
                                  <Clock size={10} /> +{Math.round(log.delayMs / 1000)}s
                                </span>
                              )}
                              {log.humanMode && isSent && (
                                <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                  <Pencil size={10} /> humano
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCampaignLogsMap(prev => {
                          const next = { ...prev }
                          delete next[selectedCampaign.id]
                          return next
                        })
                        toast.success("Logs de campaña limpiados")
                      }}
                      className="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Limpiar logs
                    </button>
                    <button
                      onClick={() => setShowDetail(false)}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold rounded-xl transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )
            })()}
          </PremiumModal>
        )}
      </AnimatePresence>


<AnimatePresence>
  {showRepliesModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowRepliesModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Números que respondieron</h3>
              <p className="text-sm text-[var(--text-muted)]">{globalReplies.length} contactos</p>
            </div>
          </div>
          <button onClick={() => setShowRepliesModal(false)} className="text-[var(--text-muted)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-[var(--border-color)]">
          <button
            onClick={() => navigator.clipboard.writeText(globalReplies.map(r => r.contact_phone).join('\n'))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-color)] text-xs text-[var(--text-secondary)] transition"
          >
            <Copy size={14} /> Copiar
          </button>
          <button
            onClick={() => {
              const csv = 'Teléfono,Fecha\n' + globalReplies.map(r => `${r.contact_phone},${new Date(r.replied_at).toLocaleString()}`).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `respuestas-${new Date().toISOString().split('T')[0]}.csv`; a.click()
              URL.revokeObjectURL(url)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-color)] text-xs text-[var(--text-secondary)] transition"
          >
            <Download size={14} /> CSV
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {globalReplies.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)]">
              <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
              <p>Aún no hay respuestas registradas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {globalReplies.map((reply: any, i: number) => (
  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-input)]/50 group">
    <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
      <Phone size={14} className="text-pink-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
  {reply.contact_phone}
  {reply.contact_name && (
    <span className="text-emerald-400">({reply.contact_name})</span>
  )}
  {reply.isBlacklisted && (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
      <Ban size={10} /> BLACKLIST
    </span>
  )}
</p>
      <p className="text-xs text-[var(--text-muted)]">
        {reply.replied_at ? new Date(reply.replied_at).toLocaleString() : '—'}
      </p>
    </div>
    <button
      onClick={() => handleBlacklist(reply.contact_phone, 'Respuesta recibida - marcado manual')}
      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
      title="Marcar como blacklist"
    >
      <ShieldBan size={14} />
    </button>
  </div>
))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* ========== MODAL: Replies de UNA campaña ========== */}
<AnimatePresence>
  {showReplyDetail && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowReplyDetail(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Respuestas de campaña</h3>
              <p className="text-sm text-[var(--text-muted)]">{replyDetailList.length} respondieron</p>
            </div>
          </div>
          <button onClick={() => setShowReplyDetail(false)} className="text-[var(--text-muted)] hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {replyDetailList.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)]">Sin respuestas en esta campaña</div>
          ) : (
            <div className="space-y-1">
              {replyDetailList.map((reply: any, i: number) => (
  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-input)]/50 group">
    <Phone size={14} className="text-pink-400 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
  {reply.contact_phone}
  {reply.contact_name && (
    <span className="text-emerald-400">({reply.contact_name})</span>
  )}
  {reply.isBlacklisted && (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
      <Ban size={10} /> BLACKLIST
    </span>
  )}
</p>
      <p className="text-xs text-[var(--text-muted)]">
        {reply.replied_at ? new Date(reply.replied_at).toLocaleString() : '—'}
      </p>
    </div>
    <button
      onClick={() => handleBlacklist(reply.contact_phone, 'Respuesta en campaña - marcado manual')}
      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
      title="Marcar como blacklist"
    >
      <ShieldBan size={14} />
    </button>
  </div>
))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      
      <ConfirmDialog open={isOpen} onClose={onCancel} onConfirm={onConfirm} {...options} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </motion.div>
  )
}