// components/UpgradeModalProvider.tsx
"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Zap, X, Sparkles, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { useLicense } from "@/hooks/useLicense"

interface UpgradeModalContextType {
  openUpgrade: (targetTier?: 'pro' | 'business') => void
  closeUpgrade: () => void
}

const UpgradeModalContext = createContext<UpgradeModalContextType | null>(null)

export function useUpgradeModal() {
  const ctx = useContext(UpgradeModalContext)
  if (!ctx) throw new Error("useUpgradeModal must be inside UpgradeModalProvider")
  return ctx
}

const PLAN_LABELS: Record<string, { name: string; color: string; bg: string; border: string }> = {
  starter: { name: "Starter", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
  pro: { name: "Pro", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" },
  business: { name: "Business", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
}

const UPGRADE_OPTIONS: Record<string, { target: 'pro' | 'business'; label: string; price: string; extra: string; features: string[] }[]> = {
  starter: [
    {
      target: 'pro',
      label: "Upgrade a Pro",
      price: "$250",
      extra: "USD / único",
      features: [
        "Líneas WhatsApp ilimitadas",
        "Rotación Round-Robin",
        "Spintax avanzado + variables",
        "Programación de campañas",
        "Reportes avanzados + export",
        "Soporte prioritario WhatsApp",
        "Actualizaciones de por vida",
      ],
    },
    {
      target: 'business',
      label: "Upgrade a Business",
      price: "$790",
      extra: "USD / único (desde Starter)",
      features: [
        "TODO lo de Pro",
        "Agentes / usuarios ilimitados",
        "Asistente IA integrado",
        "Blacklist global + Whitelist",
        "Backup automático",
        "Soporte 1-a-1 dedicado",
        "Acceso anticipado a betas",
      ],
    },
  ],
  pro: [
    {
      target: 'business',
      label: "Upgrade a Business",
      price: "$540",
      extra: "USD / único (desde Pro)",
      features: [
        "Agentes / usuarios ilimitados",
        "Asistente IA integrado",
        "Blacklist global + Whitelist",
        "Backup automático",
        "Soporte 1-a-1 dedicado",
        "Acceso anticipado a betas",
        "Instalación remota incluida",
      ],
    },
  ],
  business: [],
}

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [targetTier, setTargetTier] = useState<'pro' | 'business'>('pro')
  const [upgradeKey, setUpgradeKey] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const [activated, setActivated] = useState(false)
  const [activatedTier, setActivatedTier] = useState<'starter' | 'pro' | 'business'>('starter')
  const router = useRouter()
  const { license } = useLicense()

  const currentTier = (license?.tier || 'starter') as 'starter' | 'pro' | 'business'
  const currentPlan = PLAN_LABELS[currentTier] || PLAN_LABELS.starter

  const openUpgrade = useCallback((tier?: 'pro' | 'business') => {
    if (currentTier === 'business') {
      toast.info("Ya tenés el plan más alto")
      return
    }
    if (currentTier === 'pro' && tier === 'pro') {
      setTargetTier('business')
    } else if (tier) {
      setTargetTier(tier)
    } else {
      setTargetTier(currentTier === 'starter' ? 'pro' : 'business')
    }
    setIsOpen(true)
  }, [currentTier])

  const closeUpgrade = useCallback(() => {
    setIsOpen(false)
    setUpgradeKey("")
    setUpgrading(false)
    setActivated(false)
    setActivatedTier('starter')
  }, [])

  const handleActivate = async () => {
    const cleanKey = upgradeKey.trim().replace(/^["']|["']$/g, '').replace(/\s/g, '')
    
    if (!cleanKey) return toast.error("Pegá la licencia")
    if (cleanKey.split('.').length !== 3) {
      return toast.error("La licencia no tiene formato válido. Asegurate de copiarla completa.")
    }
    
    setUpgrading(true)
    try {
      const res = await fetch("/api/setup/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: cleanKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Licencia inválida")

      const newTier = data.tier
      
      if (currentTier === 'starter' && newTier !== 'pro' && newTier !== 'business') {
        throw new Error("Esta licencia no es válida para upgrade desde Starter.")
      }
      if (currentTier === 'pro' && newTier !== 'business') {
        throw new Error("Desde Pro solo podés upgradear a Business.")
      }

      setActivatedTier(newTier)
      setActivated(true)
      window.dispatchEvent(new Event('license-updated'))

    } catch (e: any) {
      toast.error(e.message)
      setUpgrading(false)
    }
  }

  const options = UPGRADE_OPTIONS[currentTier] || []
  const selectedOption = options.find(o => o.target === targetTier) || options[0]

  return (
    <UpgradeModalContext.Provider value={{ openUpgrade, closeUpgrade }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeUpgrade}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  {activated ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="text-lg font-bold text-white">
                    {activated ? "¡Licencia activada!" : "Upgrade"}
                  </h3>
                </div>
                {!activated && (
                  <button onClick={closeUpgrade} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-5">
                
                {/* ═══ VISTA DE ÉXITO ═══ */}
                {activated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto"
                      style={{ boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}
                    >
                      <CheckCircle2 size={40} className="text-emerald-400" />
                    </motion.div>

                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        ¡Felicitaciones!
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Ahora sos <span className={`font-bold ${PLAN_LABELS[activatedTier]?.color || 'text-emerald-400'}`}>
                          {PLAN_LABELS[activatedTier]?.name || activatedTier.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 text-left">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Desbloqueado</p>
                      <ul className="space-y-2">
                        {(UPGRADE_OPTIONS[currentTier]?.find(o => o.target === activatedTier)?.features || []).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
    closeUpgrade()
    // 🔄 Soft redirect: no hard reload, evita race condition con JWT_SECRET
    router.push("/dashboard")
    // Forzar refetch de licencia después de un instante
    setTimeout(() => {
      window.dispatchEvent(new Event('license-updated'))
    }, 500)
  }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-[#021210] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={18} />
                      Continuar al dashboard
                    </button>
                    
                    <p className="text-[10px] text-slate-600">
                      La página se recargará para aplicar los cambios
                    </p>
                  </motion.div>
                ) : (
                  /* ═══ VISTA NORMAL (formulario) ═══ */
                  <>
                    {/* Plan actual */}
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                      <p className="text-xs text-slate-400 mb-2">Tu plan actual</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentPlan.bg} ${currentPlan.color} border ${currentPlan.border}`}>
                        {currentPlan.name}
                      </span>
                    </div>

                    {/* Selector de plan objetivo */}
                    {options.length > 1 && (
                      <div className="flex gap-2">
                        {options.map((opt) => (
                          <button
                            key={opt.target}
                            onClick={() => setTargetTier(opt.target)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              targetTier === opt.target
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Features del plan objetivo */}
                    {selectedOption && (
                      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{selectedOption.label}</span>
                          <span className="text-lg font-bold text-purple-400">
                            {selectedOption.price} <span className="text-xs text-slate-400 font-normal">{selectedOption.extra}</span>
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {selectedOption.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Input licencia */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium">
                        Licencia {selectedOption?.label.replace("Upgrade a ", "")}
                      </label>
                      <textarea
                        value={upgradeKey}
                        onChange={(e) => setUpgradeKey(e.target.value)}
                        placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all"
                      />
                    </div>

                    {/* CTA Ventas */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <p className="text-xs text-amber-200/80 text-center leading-relaxed">
                        ¿No tenés licencia aún?{" "}
                        <a
                          href={`https://wa.me/#?text=Hola,%20tengo%20el%20plan%20${currentPlan.name}%20y%20quiero%20upgradear%20a%20${selectedOption?.label.replace('Upgrade a ', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300"
                        >
                          Contactá al equipo de ventas
                        </a>
                      </p>
                    </div>

                    {/* Botón activar */}
                    {upgrading ? (
                      <div className="flex items-center justify-center gap-2 py-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-amber-400 border-t-transparent rounded-full"
                        />
                        <span className="text-sm text-amber-400">Activando...</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleActivate}
                        disabled={!upgradeKey.trim()}
                        className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          upgradeKey.trim()
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <Zap size={18} />
                        Activar {selectedOption?.label.replace("Upgrade a ", "")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UpgradeModalContext.Provider>
  )
}