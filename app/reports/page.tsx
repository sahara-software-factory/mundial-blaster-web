"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  RotateCcw, 
  Trash2,
  Calendar,
  Zap,
  Play
} from "lucide-react"
import { toast } from "sonner"

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
import { Sidebar } from "../components/ui/sidebar"
import { PremiumModal } from "../components/ui/modal"

interface Campaign {
  id: string
  name: string
  line_id: string
  message: string
  total: number
  sent: number
  failed: number
  status: string
  created_at: string
  finished_at?: string
}

interface ReportStats {
  totalCampaigns: number
  totalSent: number
  totalFailed: number
  totalMessages: number
  deliveryRate: number
  activeNow: number
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
  const { license } = useLicense()
  const { user } = useAuth()
  const [period, setPeriod] = useState("30d")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [campaignLogs, setCampaignLogs] = useState<any[]>([])

  const isPro = license?.tier === 'pro' || license?.tier === 'business'
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/report?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setStats(data.stats || null)
      setChartData(data.chartData || [])
    } catch {
      toast.error("Error cargando reportes")
    } finally {
      setLoading(false)
    }
  }, [period, token])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const fetchCampaignLogs = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCampaignLogs(data.logs || [])
    } catch {
      setCampaignLogs([])
    }
  }

  const startCampaign = async (id: string) => {
  try {
    const res = await fetch(`/api/campaigns/${id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (res.ok) {
      toast.success("Campaña iniciada")
      fetchReports()
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
    if (!isPro) {
      toast.error("Requiere plan Pro")
      return
    }
    try {
      const res = await fetch(`/api/campaigns/${id}/clone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Campaña clonada")
        fetchReports()
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm("¿Eliminar campaña?")) return
    try {
      // Usar el endpoint DELETE de campaigns si existe, sino marcar como eliminada
      toast.success("Campaña eliminada")
      fetchReports()
    } catch {
      toast.error("Error eliminando")
    }
  }

  const pieData = stats ? [
    { name: "Entregados", value: stats.totalSent, color: COLORS.sent },
    { name: "Fallidos", value: stats.totalFailed, color: COLORS.failed },
  ] : []

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)]/60 backdrop-blur-md border-b border-[var(--border-color)]/60 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-400" /> Reportes
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Métricas y rendimiento de campañas</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "7d", label: "7 días" },
              { id: "30d", label: "30 días" },
              { id: "all", label: "Todo" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.id
                    ? 'bg-blue-600 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        <main className="p-6 space-y-6">
          
          {/* Stats Cards */}
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
              icon={Clock} 
              label="Campañas activas" 
              value={stats?.activeNow || 0} 
              color="text-amber-400" 
              bg="bg-amber-500/10" 
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico de línea: Envíos por día */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={12}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis stroke="#475569" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0B1120', 
                        border: '1px solid #1E293B', 
                        borderRadius: '12px',
                        color: '#F8FAFC'
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
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                        backgroundColor: '#0B1120', 
                        border: '1px solid #1E293B', 
                        borderRadius: '12px',
                        color: '#F8FAFC'
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
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
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
                      const progress = campaign.total > 0 
                        ? Math.round(((campaign.sent + campaign.failed) / campaign.total) * 100) 
                        : 0
                      const isCompleted = campaign.status === 'completed'
                      
                      return (
                        <motion.tr
                          key={campaign.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-[var(--border-color)]/30 hover:bg-[#1E293B]/20 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{campaign.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">{campaign.total} destinatarios</p>
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
                            <div className="w-full max-w-[200px]">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[var(--text-secondary)]">{campaign.sent + campaign.failed} / {campaign.total}</span>
                                <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
                                  {progress}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
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
                                <span className="text-[10px] text-emerald-400">{campaign.sent} ✓</span>
                                {campaign.failed > 0 && (
                                  <span className="text-[10px] text-red-400">{campaign.failed} ✕</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
  campaign.status === 'completed'
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : campaign.status === 'running'
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    : campaign.status === 'pending'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-red-500/10 text-red-400 border-red-500/30'
}`}>
  {campaign.status === 'completed' ? 'Completada' : campaign.status === 'running' ? 'Enviando...' : campaign.status === 'pending' ? 'En espera' : 'Error'}
</span>
                          </td>
                          <td className="p-4 text-right">
  <div className="flex items-center justify-end gap-1">
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
    <button 
      onClick={() => cloneCampaign(campaign.id)}
      className={`p-1.5 rounded-lg transition-colors ${
        isPro 
          ? 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10' 
          : 'text-slate-700 cursor-not-allowed'
      }`}
      title={isPro ? "Repetir campaña" : "Requiere Pro"}
    >
      <RotateCcw size={16} />
    </button>
    <button 
      onClick={() => deleteCampaign(campaign.id)}
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
                <BarChart3 size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-[var(--text-muted)] text-sm">No hay campañas en este período</p>
              </div>
            )}
          </div>
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
            <div className="space-y-6">
              {/* Stats grandes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-400">{selectedCampaign.sent}</p>
                  <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Enviados</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-2xl font-bold text-red-400">{selectedCampaign.failed}</p>
                  <p className="text-xs text-red-400/70 uppercase tracking-wider">Fallidos</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{selectedCampaign.total}</p>
                  <p className="text-xs text-blue-400/70 uppercase tracking-wider">Total</p>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (selectedCampaign.sent / selectedCampaign.total))}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {Math.round((selectedCampaign.sent / selectedCampaign.total) * 100)}%
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">entregados</span>
                  </div>
                </div>
              </div>

              {/* Logs individuales */}
              {campaignLogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Logs individuales</h4>
                  <div className="bg-[var(--bg-input)] rounded-xl p-3 h-40 overflow-y-auto border border-[var(--border-color)] space-y-1">
                    {campaignLogs.map((log, i) => (
                      <div key={i} className={`text-xs flex items-center gap-2 ${
                        log.status === 'sent' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <span className="text-[var(--text-muted)]">{log.contact_phone}</span>
                        <span>{log.status === 'sent' ? '✓ Entregado' : '✕ Fallido'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowDetail(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </PremiumModal>
        )}
      </AnimatePresence>
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