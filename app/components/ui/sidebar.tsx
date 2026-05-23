// components/ui/sidebar.tsx
"use client"

import { useEffect, useState } from "react"
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
  Tag
} from "lucide-react"
import { useTheme } from "./theme-provider"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"
import { useRouter, usePathname } from "next/navigation"

interface SidebarProps {
  onSettings: () => void
  onUpgrade?: () => void
}

export function Sidebar({ onSettings, onUpgrade }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle } = useTheme()
  const { logout } = useAuth()
  const { license } = useLicense()
  const router = useRouter()
  const pathname = usePathname()

  const isPro = license?.tier === 'pro' || license?.tier === 'business'

  useEffect(() => {
  document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '240px')
}, [collapsed])

  const menuItems = [
    { id: "campaigns", icon: Send, label: "Campañas", path: "/" },
    { id: "contacts", icon: Users, label: "Contactos", path: "/contacts", locked: !isPro },
    { id: "reports", icon: BarChart3, label: "Reportes", path: "/reports", locked: !isPro },
    { id: "templates", icon: RotateCcw, label: "Templates", path: "/templates", locked: !isPro },
    { id: "tags", icon: Tag, label: "Tags", path: "/tags", locked: !isPro },

  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      style={{ width: 'var(--sidebar-width)' }}
  className="fixed left-0 top-0 h-screen bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border-r border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 flex flex-col z-40 transition-all duration-300"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200">
        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-[var(--text-primary)] shadow-lg shadow-blue-500/30 shrink-0">
          <Zap size={18} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-sm font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">Mundial Blaster</h1>
            {isPro ? (
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                <Zap size={10} /> PRO
              </span>
            ) : (
              <span className="text-[10px] text-blue-400 font-medium">Starter</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
  const Icon = item.icon
  const active = pathname === item.path
  return (
    <button
      key={item.id}
      onClick={() => !item.locked ? router.push(item.path) : onUpgrade?.()}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group ${
        active 
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/50'
      } ${item.locked ? 'opacity-60' : 'cursor-pointer'}`}
      title={item.label}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="font-medium truncate">{item.label}</span>}
      {item.locked && !collapsed && (
        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Zap size={8} /> PRO
        </span>
      )}
    </button>
  )
})}

{/* // Agregá ESTO al final del nav, antes del div de bottom: */}
{!isPro && !collapsed && (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onUpgrade?.()}
    className="mt-4 w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
  >
    <Zap size={20} className="text-amber-400" />
    <div className="text-left">
      <p className="text-xs font-bold text-amber-400">Upgrade a Pro</p>
      <p className="text-[10px] text-amber-400/60">Desbloqueá todo</p>
    </div>
  </motion.button>
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
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-500 hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:text-gray-900 hover:bg-[var(--border-color)] dark:hover:bg-[var(--border-color)] hover:bg-gray-100 transition-all"
          title="Configuración"
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm">Configuración</span>}
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Salir"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">Salir</span>}
        </button>
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