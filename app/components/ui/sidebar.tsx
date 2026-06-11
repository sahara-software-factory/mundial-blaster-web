// components/ui/sidebar.tsx
"use client"

import { useEffect, useState, memo } from "react"
import { motion } from "framer-motion"
import { 
  Send, 
  Users, 
  BarChart3, 
  RotateCcw, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Tag,
  Globe,
  Sparkles,
  Lock,
  DollarSign
} from "lucide-react"
import { useTheme } from "./theme-provider"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"
import { useRouter, usePathname } from "next/navigation"
import { useUpgradeModal } from "../UpgradeModalProvider"
import { useDemoMode } from "@/hooks/useDemo"

interface SidebarProps {
  onSettings: () => void
  onUpgrade?: () => void
}

const SidebarItem = memo(function SidebarItem({ 
  icon: Icon, 
  label, 
  active, 
  locked, 
  collapsed, 
  onClick,
  tourId,
}: {
  icon: any
  label: string
  active: boolean
  locked: boolean
  collapsed: boolean
  onClick: () => void
  tourId?: string
}) {
  const isGold = label === 'Ganá plata'

  return (
    <button
      data-tour={tourId}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group overflow-hidden ${
        active 
          ? isGold
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          : isGold
            ? 'text-emerald-400 border border-transparent hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:scale-[1.02] hover:bg-gradient-to-r hover:from-emerald-500/20 hover:via-amber-500/10 hover:to-emerald-500/20'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/50'
      } ${locked ? 'opacity-60' : 'cursor-pointer'}`}
      title={label}
    >
      {/* Efecto shine sweep para "Ganá plata" */}
      {isGold && !active && (
        <span className="absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent z-0 pointer-events-none" />
      )}
      
      <Icon size={20} className={`shrink-0 relative z-10 ${isGold && !active ? 'group-hover:animate-[pulse_1s_ease-in-out_infinite]' : ''}`} />
      {!collapsed && (
        <>
          <span className={`font-medium truncate relative z-10 ${isGold && !active ? 'group-hover:text-emerald-300' : ''}`}>
            {label}
          </span>
          {locked && (
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-white border border-purple-500/30 flex items-center gap-1 relative z-10">
              <Lock size={8} /> BUSINESS
            </span>
          )}
        </>
      )}
    </button>
  )
})

export function Sidebar({ onSettings, onUpgrade }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle } = useTheme()
  const { logout } = useAuth()
  const { license } = useLicense()
  const router = useRouter()
  const pathname = usePathname()
  const { openUpgrade } = useUpgradeModal()
  const { isDemo } = useDemoMode()
  const [confirmedTier, setConfirmedTier] = useState<'starter' | 'pro' | 'business' | 'loading'>('loading')

  useEffect(() => {
    if (license && license.tier) {
      const tier = license.tier
      if (tier === 'business') setConfirmedTier('business')
      else if (tier === 'pro') setConfirmedTier('pro')
      else setConfirmedTier('starter')
    }
  }, [license?.tier])

  const isBusiness = confirmedTier === 'business'
  const isPro = confirmedTier === 'pro'
  const isLoadingTier = confirmedTier === 'loading'

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '240px')
  }, [collapsed])

  const menuItems = [
    { id: "landing", icon: Globe, label: "Volver al sitio", path: "/", tourId: undefined },
    { id: "campaigns", icon: Send, label: "Campañas", path: "/dashboard", tourId: "nav-campaigns" },
    { id: "contacts", icon: Users, label: "Contactos", path: "/dashboard/contacts", tourId: "nav-contacts" },
    { id: "reports", icon: BarChart3, label: "Reportes", path: "/dashboard/reports", tourId: "nav-reports" },
    { id: "templates", icon: RotateCcw, label: "Templates", path: "/dashboard/templates", tourId: "nav-templates" },
    { id: "tags", icon: Tag, label: "Tags", path: "/dashboard/tags", tourId: "nav-tags" },
     
    { 
      id: "ai", 
      icon: Sparkles, 
      label: "IA", 
      path: "/dashboard/ai", 
      tourId: undefined,
      locked: !isBusiness,
      businessOnly: true 
    },
    { id: "affiliates", icon: DollarSign, label: "Ganá plata", path: "/dashboard/affiliates", tourId: "nav-affiliates" },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      style={{ width: 'var(--sidebar-width)' }}
      className="fixed left-0 top-0 h-screen bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border-r border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 flex flex-col z-40 transition-all duration-300"
    >
{/* Logo */}
<div className="h-16 flex items-center justify-center px-2 border-b border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200">
  {collapsed ? (
    <img 
      src="/images/isotipo.png" 
      alt="WabiSend" 
      className="h-10 w-auto shrink-0"
    />
  ) : (
    <div className="relative mt-3 flex items-center">
      <img 
        src={theme === "dark" ? "/images/logo_light.png" : "/images/logo_dark.png"} 
        alt="WabiSend" 
        className="h-12 w-auto shrink-0"
      />
      {/* Badge flotante arriba a la derecha del logo */}
      <div className="absolute -top-2 -right-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isLoadingTier ? (
            <div className="h-3 w-10 bg-gray-700/40 rounded animate-pulse" />
          ) : isBusiness ? (
            <span className="text-[9px] font-bold text-purple-400 flex items-center gap-0.5 whitespace-nowrap bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
              <Sparkles size={8} /> BUSINESS
            </span>
          ) : isPro ? (
            <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5 whitespace-nowrap bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
              <Zap size={8} /> PRO
            </span>
          ) : (
            <span className="text-[9px] text-blue-400 font-medium whitespace-nowrap bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
              Starter
            </span>
          )}
        </motion.div>
      </div>
    </div>
  )}
</div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={pathname === item.path || pathname.startsWith(item.path + '/')}
            locked={!!item.locked}
            collapsed={collapsed}
            onClick={() => {
  if (item.locked) {
    openUpgrade('business')  // ← PASAR 'business'
    return
  }
  router.push(item.path)
}}
            tourId={item.tourId}
          />
        ))}

        {!isBusiness && !isPro && !collapsed && (
          <button
  onClick={() => openUpgrade('pro')}
  className="mt-4 w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500/60 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-orange-500/30 transition-all"
>
            <Sparkles size={16} className="text-white-400 group-hover:scale-110 transition-transform" />
  <div className="text-left">
    <p className="text-xs font-bold">Upgrade</p>
    <p className="text-[10px] opacity-60">Desbloqueá todo</p>
  </div>
</button>
        )}

        
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 space-y-1">
        <button 
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-500 hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:text-gray-900 hover:bg-[var(--border-color)] dark:hover:bg-[var(--border-color)] hover:bg-gray-100 transition-all"
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="text-sm"> Switch {theme === "dark" ? "Claro" : "Oscuro"}</span>}
        </button>
        
                <button 
          onClick={() => router.push("/dashboard/settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            pathname === "/dashboard/settings" 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-500 hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:text-gray-900 hover:bg-[var(--border-color)] dark:hover:bg-[var(--border-color)] hover:bg-gray-100'
          }`}
          title="Configuración"
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm">Configuración</span>}
        </button>
        {!isDemo && (
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Salir"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">Salir</span>}
        </button>
        )}
        {isDemo && (
  <div className="text-xs text-amber-400 px-3 py-2">
    🎮 Modo demo
  </div>
)}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 bg-[#1E293B] dark:bg-[#1E293B] bg-gray-200 border border-[var(--border-hover)] dark:border-[var(--border-hover)] border-gray-300 rounded-full flex items-center justify-center text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-600 hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:text-gray-900 transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  )
}