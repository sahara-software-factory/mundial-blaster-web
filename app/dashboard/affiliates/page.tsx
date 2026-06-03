"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  Users,
  MousePointerClick,
  ShoppingCart,
  Wallet,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ArrowLeft,
  X,
  Search,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "../../components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://old-bar-56fe.cursosluckylabmarketing.workers.dev"
const ADMIN_EMAIL = "yas479304@gmail.com"

interface Sale {
  id: string
  tier: string
  amount: number
  commission: number
  status: string
  created_at: string
  buyer_name?: string
  buyer_email?: string
}

interface AffiliateRow {
  code: string
  clicks: number
  sales: number
  total_earned: number
  total_paid: number
  pending: number
  sales_list: Sale[]
}

export default function AdminAffiliatesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([])
  const [search, setSearch] = useState("")
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payCode, setPayCode] = useState("")
  const [paySaleId, setPaySaleId] = useState("")

  const [saleForm, setSaleForm] = useState({
    code: "",
    tier: "pro",
    amount: 750,
    buyer_name: "",
    buyer_email: "",
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  const fetchAll = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/affiliates`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Error del worker")
      const data = await res.json()
      setAffiliates(data.affiliates || [])
      setLastRefresh(new Date())
    } catch (e) {
      if (!silent) toast.error("No se pudo cargar el listado de afiliados")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) fetchAll()
    else setLoading(false)
  }, [isAdmin, fetchAll])

  useEffect(() => {
    if (!isAdmin) return
    const interval = setInterval(() => fetchAll(true), 10000)
    return () => clearInterval(interval)
  }, [isAdmin, fetchAll])

  const registerSale = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WORKER_SECRET || "WABI_SECRET_2026_NUNCA_LO_COMPARTAS"}`,
        },
        body: JSON.stringify(saleForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Venta registrada")
        setModalOpen(false)
        setSaleForm({ code: "", tier: "pro", amount: 750, buyer_name: "", buyer_email: "" })
        fetchAll(true)
      } else {
        toast.error(data.error || "Error registrando venta")
      }
    } catch {
      toast.error("Error de red al registrar venta")
    }
  }

  const markPaid = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/sale/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WORKER_SECRET || "WABI_SECRET_2026_NUNCA_LO_COMPARTAS"}`,
        },
        body: JSON.stringify({ code: payCode, sale_id: paySaleId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Marcado como pagado")
        setPayModalOpen(false)
        setPayCode("")
        setPaySaleId("")
        fetchAll(true)
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const totalClicks = affiliates.reduce((sum, a) => sum + (a.clicks || 0), 0)
  const totalSales = affiliates.reduce((sum, a) => sum + (a.sales || 0), 0)
  const totalPending = affiliates.reduce((sum, a) => sum + (a.pending || 0), 0)
  const totalPaid = affiliates.reduce((sum, a) => sum + (a.total_paid || 0), 0)

  const filtered = affiliates.filter((a) =>
    a.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        <Sidebar onSettings={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: "var(--sidebar-width)" }}>
          <div className="animate-pulse text-[var(--text-muted)]">Cargando admin...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        <Sidebar onSettings={() => {}} />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: "var(--sidebar-width)" }}>
          <div className="text-center p-10">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso restringido</h2>
            <p className="text-[var(--text-muted)]">Solo administradores pueden ver esta sección.</p>
            <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
              <ArrowLeft size={16} /> Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      <div className="flex-1 min-w-0" style={{ marginLeft: "var(--sidebar-width)", transition: "margin-left 0.3s ease" }}>
        <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-cyan-400" />
              Admin — Afiliados
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {affiliates.length} activos
            </span>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <RefreshCw size={10} /> {lastRefresh.toLocaleTimeString("es")}
              </span>
            )}
            <button
              onClick={() => fetchAll()}
              className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-cyan-500/50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw size={16} className="text-cyan-400" />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> Registrar venta
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={MousePointerClick} label="Clicks totales" value={totalClicks} color="text-blue-400" bg="bg-blue-500/10" />
            <StatCard icon={ShoppingCart} label="Ventas totales" value={totalSales} color="text-purple-400" bg="bg-purple-500/10" />
            <StatCard icon={Wallet} label="Comisiones pagadas" value={`$${totalPaid}`} color="text-emerald-400" bg="bg-emerald-500/10" />
            <StatCard icon={Clock} label="Pendiente global" value={`$${totalPending}`} color="text-amber-400" bg="bg-amber-500/10" />
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por código de afiliado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-12 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" />
                Todos los afiliados
              </h3>
              <span className="text-xs text-[var(--text-muted)]">{filtered.length} resultados</span>
            </div>

            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-left">
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Código</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Clicks</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Ventas</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Ganado</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Pagado</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Pendiente</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((aff) => (
                        <motion.tr
                          key={aff.code}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)]/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-cyan-400">{aff.code}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">{aff.sales_list?.length || 0} ventas</span>
                            </div>
                          </td>
                          <td className="p-4 text-center text-sm text-[var(--text-secondary)]">{aff.clicks || 0}</td>
                          <td className="p-4 text-center text-sm font-bold text-[var(--text-primary)]">{aff.sales || 0}</td>
                          <td className="p-4 text-center text-sm font-bold text-emerald-400">${aff.total_earned || 0}</td>
                          <td className="p-4 text-center text-sm text-emerald-400">${aff.total_paid || 0}</td>
                          <td className="p-4 text-center text-sm font-bold text-amber-400">${aff.pending || 0}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSaleForm((prev) => ({ ...prev, code: aff.code }))
                                  setModalOpen(true)
                                }}
                                className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                title="Registrar venta"
                              >
                                <Plus size={14} className="text-emerald-400" />
                              </button>
                              {aff.sales_list?.some((s) => s.status === "pending") && (
                                <button
                                  onClick={() => {
                                    setPayCode(aff.code)
                                    const pendingSale = aff.sales_list.find((s) => s.status === "pending")
                                    setPaySaleId(pendingSale?.id || "")
                                    setPayModalOpen(true)
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                  title="Marcar como pagado"
                                >
                                  <CheckCircle2 size={14} className="text-blue-400" />
                                </button>
                              )}
                            </div>
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
                <p className="text-sm text-[var(--text-muted)]">No hay afiliados registrados</p>
              </div>
            )}
          </motion.div>

          {filtered.map(
            (aff) =>
              aff.sales_list &&
              aff.sales_list.length > 0 && (
                <motion.div
                  key={`detail-${aff.code}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
                >
                  <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <ShoppingCart size={16} className="text-purple-400" />
                      Ventas de {aff.code}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] text-left">
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Fecha</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Plan</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Cliente</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">Venta</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">Comisión</th>
                          <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aff.sales_list.map((sale) => (
                          <tr key={sale.id} className="border-b border-[var(--border-color)]/30">
                            <td className="p-4 text-sm text-[var(--text-secondary)]">
                              {new Date(sale.created_at).toLocaleDateString("es")}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  sale.tier === "business"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : sale.tier === "pro"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-blue-500/10 text-blue-400"
                                }`}
                              >
                                {sale.tier}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-[var(--text-secondary)]">
                              {sale.buyer_name || "—"} <br />
                              <span className="text-[10px] text-[var(--text-muted)]">{sale.buyer_email || ""}</span>
                            </td>
                            <td className="p-4 text-sm font-bold text-[var(--text-primary)] text-right">${sale.amount}</td>
                            <td className="p-4 text-sm font-bold text-emerald-400 text-right">+${sale.commission}</td>
                            <td className="p-4">
                              {sale.status === "paid" ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <CheckCircle2 size={12} /> Pagado
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <Clock size={12} /> Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
          )}
        </main>
      </div>

      {/* Modal Registrar Venta */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plus size={20} className="text-emerald-400" />
                  Registrar venta
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                >
                  <X size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">
                    Código afiliado
                  </label>
                  <input
                    type="text"
                    value={saleForm.code}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                    placeholder="WS-XXXXXX"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Plan</label>
                  <select
                    value={saleForm.tier}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, tier: e.target.value }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="starter">Starter ($500)</option>
                    <option value="pro">Pro ($750)</option>
                    <option value="business">Business ($1.290)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">Monto</label>
                  <input
                    type="number"
                    value={saleForm.amount}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">
                    Nombre comprador
                  </label>
                  <input
                    type="text"
                    value={saleForm.buyer_name}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, buyer_name: e.target.value }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1 block">
                    Email comprador
                  </label>
                  <input
                    type="email"
                    value={saleForm.buyer_email}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, buyer_email: e.target.value }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={registerSale}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
                >
                  Confirmar venta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Marcar como Pagado */}
      <AnimatePresence>
        {payModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <CheckCircle2 size={48} className="mx-auto text-blue-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Marcar como pagado</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                ¿Confirmás que pagaste las comisiones pendientes de{" "}
                <span className="font-mono font-bold text-cyan-400">{payCode}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPayModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={markPaid}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                >
                  Sí, pagado
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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