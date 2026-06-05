"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign, 
  Link2, 
  Copy, 
  TrendingUp, 
  MousePointerClick, 
  ShoppingCart, 
  Wallet,
  Clock,
  CheckCircle2,
  ExternalLink,
  Send,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "../../components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useDemoMode } from "@/hooks/useDemo"

const WORKER_URL = "https://old-bar-56fe.cursosluckylabmarketing.workers.dev"

interface AffiliateStats {
  code: string
  clicks: number
  sales: number
  total_earned: number
  total_paid: number
  pending: number
  sales_list: Array<{
    id: string
    tier: string
    amount: number
    commission: number
    status: string
    created_at: string
  }>
}

const DEMO_STATS: AffiliateStats = {
  code: "WS-DEMO99",
  clicks: 47,
  sales: 3,
  total_earned: 450,
  total_paid: 150,
  pending: 300,
  sales_list: [
    {
      id: "sale_demo_1",
      tier: "starter",
      amount: 500,
      commission: 100,
      status: "paid",
      created_at: "2026-06-01T10:00:00Z"
    },
    {
      id: "sale_demo_2",
      tier: "pro",
      amount: 750,
      commission: 150,
      status: "pending",
      created_at: "2026-06-03T14:30:00Z"
    },
    {
      id: "sale_demo_3",
      tier: "business",
      amount: 1290,
      commission: 258,
      status: "pending",
      created_at: "2026-06-04T09:15:00Z"
    }
  ]
}

export default function AffiliatesPage() {
  const { user } = useAuth()
  const { isDemo } = useDemoMode()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [code, setCode] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Generar o recuperar código del usuario
  useEffect(() => {
    if (isDemo) {
      setCode("WS-DEMO99")
      setStats(DEMO_STATS)
      setLastRefresh(new Date())
      setLoading(false)
      return
    }

    if (user?.affiliate_code) {
      setCode(user.affiliate_code)
      fetchStats(user.affiliate_code)
    } else {
      setLoading(false)
    }
  }, [user, isDemo])


  // POLLING: cada 5 segundos refrescar stats si hay código
  useEffect(() => {
    if (!code) return
    const interval = setInterval(() => {
      fetchStats(code, true) // true = silent (sin toast de error)
    }, 5000)
    return () => clearInterval(interval)
  }, [code])

    const fetchStats = useCallback(async (affiliateCode: string, silent = false) => {
    if (isDemo) {
      setStats(DEMO_STATS)
      setLastRefresh(new Date())
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${WORKER_URL}/affiliate/${affiliateCode}/stats`, {
        cache: "no-store"
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (!silent) toast.error(err.error || "Error del worker")
        return
      }

      const data = await res.json()
      setStats(data)
      setLastRefresh(new Date())
    } catch (e) {
      if (!silent) toast.error("No se pudo conectar con el servidor de afiliados")
      console.error("Affiliate fetch error:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const generateCode = async () => {
     if (isDemo) {
      toast.info("En modo demo no se puede generar un nuevo código")
      return
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codeStr = ''
    for (let i = 0; i < 6; i++) {
      codeStr += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const fullCode = `WS-${codeStr}`

    try {
      const token = localStorage.getItem('mb_token')
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ affiliate_code: fullCode })
      })

      if (res.ok) {
        setCode(fullCode)
        toast.success("¡Código generado!")
        fetchStats(fullCode)
      } else {
        const data = await res.json()
        if (data.error?.includes('Unique constraint') || data.error?.includes('P2002')) {
          toast.error("Código en uso, intentá de nuevo")
        } else {
          toast.error(data.error || "Error guardando código")
        }
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const affiliateLink = `https://wabisend.com/?ref=${code}`
  
  const whatsappMessage = encodeURIComponent(
    `Hola, quiero WabiSend. Me enviaron con el código: ${code}`
  )
  const whatsappLink = `https://wa.me/5490000000000?text=${whatsappMessage}`

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    toast.success("Link copiado")
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success("Código copiado")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        <Sidebar onSettings={() => {}} />
        <div className="flex-1 min-w-0 p-6 lg:p-10 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width)' }}>
          <div className="animate-pulse text-[var(--text-muted)]">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-400" />
            Ganá plata con WabiSend
          </h1>
          {lastRefresh && (
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <RefreshCw size={10} /> Actualizado {lastRefresh.toLocaleTimeString('es')}
            </span>
          )}
        </header>

        <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">

          {!code ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Programa de Afiliados</h2>
              <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
                Compartí WabiSend y ganá <span className="text-emerald-400 font-bold">20% de comisión</span> por cada licencia vendida. 
                Sin límites, sin techo.
              </p>
              <button
                onClick={generateCode}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                Generar mi código de afiliado
              </button>
            </motion.div>
          ) : (
            <>
              {/* Tarjeta principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-bold">Tu link de afiliado</h2>
                    <p className="text-xs text-[var(--text-muted)]">Compartilo donde quieras</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-secondary)] truncate">
                    {affiliateLink}
                  </div>
                  <button onClick={copyLink} className="p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl hover:border-emerald-500/50 transition-colors" title="Copiar link">
                    <Copy size={18} className="text-emerald-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-bold text-emerald-400 tracking-wider">
                    {code}
                  </div>
                  <button onClick={copyCode} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-colors" title="Copiar código">
                    <Copy size={18} className="text-emerald-400" />
                  </button>
                </div>

                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all">
                  <Send size={18} /> Compartir por WhatsApp
                </a>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={MousePointerClick} label="Clicks" value={stats?.clicks ?? 0} color="text-blue-400" bg="bg-blue-500/10" />
                <StatCard icon={ShoppingCart} label="Ventas" value={stats?.sales ?? 0} color="text-purple-400" bg="bg-purple-500/10" />
                <StatCard icon={Wallet} label="Ganado" value={`$${stats?.total_earned ?? 0}`} color="text-emerald-400" bg="bg-emerald-500/10" />
                <StatCard icon={Clock} label="Pendiente" value={`$${stats?.pending ?? 0}`} color="text-amber-400" bg="bg-amber-500/10" />
              </div>

              {/* Tabla de ventas — SIEMPRE visible, con estado vacío */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    Historial de ventas
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    {stats?.sales_list?.length ?? 0} registros
                  </span>
                </div>

                {stats?.sales_list && stats.sales_list.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] text-left">
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Fecha</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Plan</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Venta</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Comisión</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {stats.sales_list.map((sale, index) => (
                            <motion.tr 
                              key={sale.id} 
                              initial={index === 0 ? { backgroundColor: 'rgba(16,185,129,0.15)' } : { opacity: 0 }}
                              animate={{ backgroundColor: 'transparent', opacity: 1 }}
                              transition={{ duration: 1.5 }}
                              className="border-b border-[var(--border-color)]/30"
                            >
                              <td className="p-4 text-sm text-[var(--text-secondary)]">
                                {new Date(sale.created_at).toLocaleDateString('es')}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  sale.tier === 'business' ? 'bg-purple-500/10 text-purple-400' :
                                  sale.tier === 'pro' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {sale.tier}
                                </span>
                              </td>
                              <td className="p-4 text-sm font-bold text-[var(--text-primary)]">${sale.amount}</td>
                              <td className="p-4 text-sm font-bold text-emerald-400">+${sale.commission}</td>
                              <td className="p-4">
                                {sale.status === 'paid' ? (
                                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                                    <CheckCircle2 size={12} /> Pagado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-amber-400">
                                    <Clock size={12} /> Pendiente
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">Todavía no hay ventas registradas</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Compartí tu link y las verás acá</p>
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
                <p className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                  <ExternalLink size={14} className="shrink-0 mt-0.5" />
                  Las comisiones se acreditan en estado "Pendiente". Una vez que confirmemos el pago del cliente, pasan a "Pagado" y te contactamos para coordinar la transferencia.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}