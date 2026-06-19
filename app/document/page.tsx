"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  BookOpen,
  Rocket,
  Brain,
  Send,
  Users,
  BarChart3,
  Bot,
  Gem,
  Wrench,
  Settings,
  ChevronRight,
  ChevronDown,
  X,
  Command,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Zap,
  Lock,
  Globe,
  FileText,
  Terminal,
  Image as ImageIcon,
  PlayCircle,
  Star,
  BadgeCheck,
  HelpCircle,
  LayoutDashboard,
  Phone,
  Tag,
  Calendar,
  FlaskConical,
  RotateCcw,
  Timer,
  Layers,
  Eye,
  MessageCircleReply,
  ShieldBan,
  Sparkles,
  TrendingUp,
  Download,
  Wifi,
  Ban,
  ListChecks,
  ArrowUpRight,
  Hash
} from "lucide-react"
import { toast } from "sonner"

// ============================================================
// TIPOS
// ============================================================
interface DocArticle {
  id: string
  title: string
  slug: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  plan?: "free" | "pro" | "business"
  readTime?: string
  updated?: string
  isNew?: boolean
}

interface DocSection {
  id: string
  title: string
  icon: React.ElementType
  articles: DocArticle[]
}

// ============================================================
// DATA: ÁRBOL DE DOCUMENTACIÓN
// ============================================================
const DOC_TREE: DocSection[] = [
  {
    id: "start",
    title: "Comenzar",
    icon: Rocket,
    articles: [
      { id: "welcome", title: "Bienvenida a WabiSend", slug: "welcome", difficulty: "beginner", plan: "free", readTime: "3 min", isNew: false },
      { id: "requirements", title: "Requisitos técnicos", slug: "requirements", difficulty: "beginner", plan: "free", readTime: "4 min" },
      { id: "install", title: "Instalación self-hosted", slug: "install", difficulty: "intermediate", plan: "free", readTime: "8 min" },
      { id: "setup-wizard", title: "Setup Wizard", slug: "setup-wizard", difficulty: "beginner", plan: "free", readTime: "5 min" },
      { id: "license", title: "Activar licencia", slug: "license", difficulty: "beginner", plan: "free", readTime: "3 min" },
      { id: "first-line", title: "Conectar tu primera línea", slug: "first-line", difficulty: "beginner", plan: "free", readTime: "5 min" },
    ],
  },
  // {
  //   id: "concepts",
  //   title: "Fundamentos",
  //   icon: Brain,
  //   articles: [
  //     { id: "glossary", title: "Glosario WabiSend", slug: "glossary", difficulty: "beginner", plan: "free", readTime: "6 min" },
  //     { id: "architecture", title: "Arquitectura del sistema", slug: "architecture", difficulty: "intermediate", plan: "free", readTime: "7 min" },
  //     { id: "limits", title: "Límites y anti-ban", slug: "limits", difficulty: "intermediate", plan: "free", readTime: "5 min" },
  //     { id: "states", title: "Estados de campaña", slug: "states", difficulty: "beginner", plan: "free", readTime: "4 min" },
  //   ],
  // },
  {
    id: "campaigns",
    title: "Campañas",
    icon: Send,
    articles: [
      { id: "create-basic", title: "Crear campaña básica", slug: "create-basic", difficulty: "beginner", plan: "free", readTime: "6 min" },
      { id: "schedule", title: "Programar campaña", slug: "schedule", difficulty: "intermediate", plan: "pro", readTime: "4 min" },
      { id: "sim-lite", title: "Modo Simulacro Lite", slug: "sim-lite", difficulty: "beginner", plan: "free", readTime: "3 min" },
      { id: "sim-full", title: "Modo Simulacro Full", slug: "sim-full", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
      { id: "human-mode", title: "Modo Humano", slug: "human-mode", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
      { id: "round-robin", title: "Round Robin", slug: "round-robin", difficulty: "advanced", plan: "business", readTime: "6 min" },
      { id: "spintax", title: "Spintax avanzado", slug: "spintax", difficulty: "intermediate", plan: "pro", readTime: "7 min" },
      { id: "proxy-rotate", title: "Proxy Rotate", slug: "proxy-rotate", difficulty: "advanced", plan: "business", readTime: "6 min" },
      { id: "clone", title: "Clonación 1-click", slug: "clone", difficulty: "beginner", plan: "pro", readTime: "2 min" },
      { id: "cancel", title: "Cancelación en vivo", slug: "cancel", difficulty: "beginner", plan: "free", readTime: "2 min" },
      { id: "recurrent", title: "Campañas recurrentes", slug: "recurrent", difficulty: "advanced", plan: "business", readTime: "5 min" },
    ],
  },
  {
    id: "contacts",
    title: "Contactos & Tags",
    icon: Users,
    articles: [
       { id: "manage-contacts", title: "Crear y editar contactos", slug: "manage-contacts", difficulty: "beginner", plan: "free", readTime: "3 min" },
      { id: "import-csv", title: "Importar contactos (CSV)", slug: "import-csv", difficulty: "beginner", plan: "free", readTime: "4 min" },
     
      { id: "tags", title: "Sistema de Tags", slug: "tags", difficulty: "beginner", plan: "free", readTime: "4 min" },
      { id: "blacklist", title: "Blacklist vs Whitelist", slug: "blacklist", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
    ],
  },
  {
    id: "reports",
    title: "Reportes & Inteligencia",
    icon: BarChart3,
    articles: [
      { id: "dashboard-read", title: "Reportes de campañas", slug: "dashboard-read", difficulty: "beginner", plan: "free", readTime: "4 min" },
      { id: "basic-metrics", title: "Métricas básicas", slug: "basic-metrics", difficulty: "beginner", plan: "free", readTime: "3 min" },
      { id: "pro-metrics", title: "Métricas Pro", slug: "pro-metrics", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
      { id: "control-room", title: "Sala de Control", slug: "control-room", difficulty: "beginner", plan: "free", readTime: "4 min" },
      { id: "replies", title: "Respuestas recibidas", slug: "replies", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
      { id: "export-data", title: "Exportar datos", slug: "export-data", difficulty: "beginner", plan: "pro", readTime: "3 min" },
    ],
  },
  {
    id: "ai",
    title: "IA & Automatización",
    icon: Bot,
    articles: [
      { id: "caleb", title: "Asistente Caleb", slug: "caleb", difficulty: "intermediate", plan: "pro", readTime: "6 min" },
      { id: "auto-replies", title: "Respuestas automáticas", slug: "auto-replies", difficulty: "intermediate", plan: "pro", readTime: "5 min" },
      { id: "prompts", title: "Prompts guardados", slug: "prompts", difficulty: "beginner", plan: "pro", readTime: "4 min" },
    ],
  },
  {
    id: "pro",
    title: "Pro & Business",
    icon: Gem,
    articles: [
      { id: "plans", title: "Comparativa de planes", slug: "plans", difficulty: "beginner", plan: "free", readTime: "4 min" },
      { id: "multi-line", title: "Multi-línea", slug: "multi-line", difficulty: "intermediate", plan: "business", readTime: "5 min" },
      { id: "affiliate", title: "Affiliate / Ganá plata", slug: "affiliate", difficulty: "beginner", plan: "free", readTime: "6 min" },
    ],
  },
  {
    id: "troubleshoot",
    title: "Troubleshooting",
    icon: Wrench,
    articles: [
      { id: "disconnected", title: "Línea desconectada", slug: "disconnected", difficulty: "beginner", plan: "free", readTime: "3 min" },
      { id: "anti-ban", title: "Evitar baneos", slug: "anti-ban", difficulty: "intermediate", plan: "free", readTime: "7 min" },
      { id: "errors", title: "Errores comunes", slug: "errors", difficulty: "beginner", plan: "free", readTime: "5 min" },
      { id: "faq", title: "FAQ", slug: "faq", difficulty: "beginner", plan: "free", readTime: "8 min" },
    ],
  },
  {
    id: "reference",
    title: "Referencia técnica",
    icon: FileText,
    articles: [
      { id: "env-vars", title: "Variables de entorno", slug: "env-vars", difficulty: "advanced", plan: "free", readTime: "6 min" },
      { id: "api-endpoints", title: "Endpoints API clave", slug: "api-endpoints", difficulty: "advanced", plan: "free", readTime: "8 min" },
      { id: "changelog", title: "Changelog", slug: "changelog", difficulty: "beginner", plan: "free", readTime: "4 min", isNew: true },
    ],
  },
]

const ALL_ARTICLES = DOC_TREE.flatMap(s => s.articles.map(a => ({ ...a, sectionId: s.id, sectionTitle: s.title })))

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function DifficultyBadge({ level }: { level?: string }) {
  const map: Record<string, { color: string; label: string }> = {
    beginner: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Principiante" },
    intermediate: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Intermedio" },
    advanced: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Avanzado" },
  }
  const cfg = map[level || "beginner"]
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan?: string }) {
  const map: Record<string, { color: string; label: string }> = {
    free: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Free" },
    pro: { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Pro" },
    business: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Business" },
  }
  const cfg = map[plan || "free"]
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function DocHero({ article, sectionTitle }: { article: DocArticle; sectionTitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span className="hover:text-slate-300 cursor-pointer transition">Docs</span>
        <ChevronRight size={12} />
        <span className="hover:text-slate-300 cursor-pointer transition">{sectionTitle}</span>
        <ChevronRight size={12} />
        <span className="text-slate-300">{article.title}</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">{article.title}</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <DifficultyBadge level={article.difficulty} />
        <PlanBadge plan={article.plan} />
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={12} /> {article.readTime}
        </span>
        {article.isNew && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Nuevo v3.12
          </span>
        )}
      </div>
    </motion.div>
  )
}

function DocCallout({ type, children }: { type: "info" | "warning" | "tip" | "danger"; children: React.ReactNode }) {
  const styles = {
    info: { bg: "bg-blue-500/5", border: "border-blue-500/20", icon: Globe, color: "text-blue-400" },
    warning: { bg: "bg-amber-500/5", border: "border-amber-500/20", icon: AlertTriangle, color: "text-amber-400" },
    tip: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: Lightbulb, color: "text-emerald-400" },
    danger: { bg: "bg-red-500/5", border: "border-red-500/20", icon: ShieldAlert, color: "text-red-400" },
  }
  const s = styles[type]
  const Icon = s.icon
  return (
    <div className={`my-6 p-4 rounded-xl border ${s.bg} ${s.border}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={s.color + " shrink-0 mt-0.5"} />
        <div className={`text-sm leading-relaxed ${type === "danger" ? "text-red-200" : "text-slate-300"}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

function DocCode({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copiado al portapapeles")
  }
  return (
    <div className="my-6 relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 rounded-t-xl border border-slate-700/50 border-b-0">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="bg-slate-900/80 p-4 rounded-b-xl border border-slate-700/50 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function DocImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="my-8">
      <div className="relative rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/50 flex items-center justify-center min-h-[200px]">
        <img src={src} alt={alt} className="w-full h-auto object-cover" />
      </div>
      {caption && <p className="text-xs text-slate-500 mt-2 text-center">{caption}</p>}
    </div>
  )
}

function DocStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-400 shrink-0">
          {number}
        </div>
        <div className="w-px flex-1 bg-slate-700/30 my-2" />
      </div>
      <div className="flex-1 pb-2">
        <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
        <div className="text-sm text-slate-400 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function DocChecklist({ items }: { items: { label: string; checked?: boolean }[] }) {
  return (
    <div className="my-6 space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${item.checked ? "bg-emerald-500/20 border-emerald-500/40" : "border-slate-600"}`}>
            {item.checked && <Check size={12} className="text-emerald-400" />}
          </div>
          <span className={`text-sm ${item.checked ? "text-slate-300 line-through" : "text-slate-400"}`}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function DocNextUp({ title, slug, section, onSelect }: { title: string; slug: string; section: string; onSelect: (slug: string) => void }) {
  return (
    <div className="mt-10 pt-8 border-t border-slate-700/30">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">Siguiente paso</p>
      <button 
        onClick={() => onSelect(slug)}
        className="w-full group flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-cyan-500/30 hover:bg-slate-800/60 transition"
      >
        <div className="text-left">
          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition">{title}</p>
          <p className="text-xs text-slate-500">{section}</p>
        </div>
        <ArrowRight size={18} className="text-slate-500 group-hover:text-cyan-400 transition" />
      </button>
    </div>
  )
}

// ============================================================
// SEARCH MODAL
// ============================================================
function SearchModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (slug: string) => void }) {
  const [query, setQuery] = useState("")
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.sectionTitle.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query])

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[15vh] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
              <Search size={18} className="text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar en la documentación..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 border border-slate-700/50">
                <Command size={10} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 font-bold">K</span>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && query.trim() && (
                <div className="p-6 text-center text-sm text-slate-500">
                  No se encontraron resultados para "{query}"
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => { onSelect(r.slug); onClose() }}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 transition group"
                >
                  <FileText size={16} className="text-slate-500 group-hover:text-cyan-400 transition" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 group-hover:text-white transition truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-500">{r.sectionTitle}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition" />
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50 text-[10px] text-slate-500 flex items-center justify-between">
              <span>{ALL_ARTICLES.length} artículos</span>
              <span>ESC para cerrar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// CONTENIDO DE ARTÍCULOS
// ============================================================
function ArticleContent({ slug, onSelectArticle }: { slug: string; onSelectArticle: (slug: string) => void }) {
  switch (slug) {
    case "welcome":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "welcome")!} sectionTitle="Comenzar" />
          <DocImage src="/images/dashboard_principal.png" alt="WabiSend Dashboard" caption="Dashboard principal de WabiSend v3.12" />
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong className="text-white">WabiSend</strong> es la plataforma de envío masivo de WhatsApp más avanzada del mercado. 
            Diseñada para agencias, marketers, e-commerce y cualquier negocio que necesite comunicarse a escala sin depender de APIs oficiales ni costos por mensaje.
          </p>
          <DocCallout type="info">
            WabiSend es <strong>self-hosted</strong>. Tú controlás tu infraestructura, tus datos y tus líneas. No hay intermediarios, no hay limitaciones de Meta.
          </DocCallout>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">¿Qué podés hacer con WabiSend?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { icon: Send, title: "Campañas masivas", desc: "Hasta miles de mensajes con control total de velocidad y proxy." },
              { icon: Bot, title: "IA integrada", desc: "Caleb responde automáticamente y califica leads en tiempo real." },
              { icon: BarChart3, title: "Reportes avanzados", desc: "Tasa de apertura, respuestas, blacklist y métricas de conversión." },
              { icon: ShieldBan, title: "Anti-ban", desc: "Proxy rotate, modo humano, simulacro y blacklist inteligente." },
              { icon: Calendar, title: "Programación", desc: "Agendá campañas para ejecutarse automáticamente en el futuro." },
              { icon: Layers, title: "Multi-línea", desc: "Conectá hasta 3 números de WhatsApp y rotalos con Round Robin." },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition">
                <f.icon size={20} className="text-cyan-400 mb-2" />
                <p className="text-sm font-bold text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <DocCallout type="tip">
            Si llegaste acá sin haber instalado WabiSend, empezá por <strong>Instalación self-hosted</strong>. Si ya tenés todo listo, saltá directo a <strong>Conectar tu primera línea</strong>.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Requisitos técnicos" slug="requirements" section="Comenzar" />
        </>
      )

    case "requirements":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "requirements")!} sectionTitle="Comenzar" />
          <p className="text-slate-300 leading-relaxed mb-4">
            WabiSend está diseñado para ser desplegado en minutos. No necesitás ser un experto en DevOps, pero sí tener acceso a algunos servicios básicos.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Stack requerido</h2>
          <div className="space-y-3 mb-6">
            {[
              { label: "Node.js 18+", desc: "Backend principal (Railway, VPS o local)", ok: true },
              { label: "PostgreSQL 14+", desc: "Base de datos (Neon, Supabase, local)", ok: true },
              { label: "Next.js 14+", desc: "Frontend (Vercel, Netlify o local)", ok: true },
              { label: "Redis (opcional)", desc: "Para sesiones y rate limiting avanzado", ok: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-emerald-500/10" : "bg-slate-700/30"}`}>
                  {item.ok ? <Check size={14} className="text-emerald-400" /> : <span className="text-[10px] text-slate-500">OP</span>}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <DocCallout type="warning">
            WabiSend usa <strong>Baileys</strong> (librería no oficial) para conectarse a WhatsApp. Esto significa que no pagás por mensaje, pero también que debés respetar los límites de volumen para evitar baneos.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Instalación self-hosted" slug="install" section="Comenzar" />
        </>
      )

    case "install":
  return (
    <>
      <DocHero article={ALL_ARTICLES.find(a => a.slug === "install")!} sectionTitle="Comenzar" />

      <DocStep number={1} title="Crear tu cuenta en GitHub">
        Si no tenés una, andá a <a href="https://github.com" className="text-cyan-400 underline" target="_blank" rel="noreferrer">github.com</a> y registrate con tu email. Es gratis y dura 2 minutos.
      </DocStep>
      <DocCallout type="tip">
        Usá el mismo email con el que compraste WabiSend. Así podemos darte acceso al repositorio privado automáticamente.
      </DocCallout>

      <DocStep number={2} title="Hacer FORK del repositorio">
        Una vez que te damos acceso al repo privado, entrá a la página del proyecto y hacé clic en el botón <code className="text-cyan-400 bg-slate-800 px-1 rounded">Fork</code> (arriba a la derecha). Esto copia el código a tu cuenta de GitHub.
      </DocStep>
      <DocCode code="# URL del repo (te la enviamos por email tras la compra)\nhttps://github.com/wabisend/wabisend" lang="bash" />
      <DocCallout type="warning">
        Si no ves el botón "Fork", es porque aún no te dimos acceso. Escribinos por WhatsApp con tu usuario de GitHub.
      </DocCallout>

      <DocStep number={3} title="Crear cuenta en Railway (backend)">
        Railway es donde corre el "cerebro" de WabiSend: el servidor de WhatsApp, la base de datos y la lógica de campañas.
      </DocStep>
      <DocCode code='# Andá a railway.app\n# Hacé clic en "Login with GitHub"\n# Seleccioná tu cuenta\n# Listo, ya estás dentro.' lang="bash" />
      <DocCallout type="tip">
        Railway te da $5 de crédito gratis mensual. Con eso cubrís el servidor sin pagar nada extra.
      </DocCallout>

      <DocStep number={4} title="Deployar el backend en Railway">
        Dentro de Railway:
        <ol className="list-decimal list-inside space-y-1 mt-2 text-sm text-slate-300">
          <li>Hacé clic en <strong>New Project</strong></li>
          <li>Elegí <strong>Deploy from GitHub repo</strong></li>
          <li>Seleccioná <code>wabisend</code> (el que hiciste fork)</li>
          <li>Hacé clic en <strong>Deploy</strong></li>
        </ol>
      </DocStep>
      <DocCode code="# Railway va a detectar automáticamente que es un proyecto Node.js\n# Esperá 2-3 minutos a que termine el build\n# Vas a ver una URL tipo:\nhttps://wabisend-production.up.railway.app\n\n# Guardá esa URL. La necesitás en el paso 7." lang="bash" />

      <DocStep number={5} title="Crear la base de datos en Neon">
        Neon es la base de datos PostgreSQL donde se guardan tus campañas, contactos y logs.
      </DocStep>
      <DocCode code='# Andá a neon.tech\n# Registrate con GitHub (el mismo email)\n# Creá un nuevo proyecto (el plan Free es suficiente)\n# Elegí la región más cercana (us-east-1 si estás en Latinoamérica)\n# Copiá el "Connection String" que te da Neon. Se ve así:' lang="bash" />
      <DocCode code="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/wabisend?sslmode=require" lang="bash" />
      <DocCallout type="warning">
        Guardá ese string en un bloc de notas. Es la <code className="text-cyan-400">DATABASE_URL</code> que vas a usar en Railway.
      </DocCallout>

      <DocStep number={6} title="Crear cuenta en Vercel (frontend)">
        Vercel es donde vive la página web que ves en el navegador: el dashboard, los reportes y el editor de campañas.
      </DocStep>
      <DocCode code='# Andá a vercel.com\n# Hacé clic en "Sign Up" → "Continue with GitHub"\n# Usá la misma cuenta de GitHub\n# Elegí el plan Hobby (gratis para proyectos personales)' lang="bash" />

      <DocStep number={7} title="Deployar el frontend en Vercel">
        Dentro de Vercel:
        <ol className="list-decimal list-inside space-y-1 mt-2 text-sm text-slate-300">
          <li>Hacé clic en <strong>Add New Project</strong></li>
          <li>Importá el repo <code>wabisend</code> desde GitHub</li>
          <li>En <strong>Framework Preset</strong>, dejá <code>Next.js</code> (lo detecta solo)</li>
          <li>Hacé clic en <strong>Deploy</strong></li>
        </ol>
      </DocStep>
      <DocCode code="# Esperá 1-2 minutos\n# Vercel te va a dar una URL tipo:\nhttps://wabisend-xxx.vercel.app\n\n# Esa es tu panel de control. Guardala." lang="bash" />

      <DocStep number={8} title="Conectar Neon a Vercel (Storage)">
        Esto enlaza automáticamente tu base de datos con el frontend.
      </DocStep>
      <DocCode 
  code='# En Vercel, andá a la pestaña Storage\n# Hacé clic en "Connect Store" → "Neon"\n# Seleccioná tu proyecto Neon creado en el paso 5\n# Vercel va a crear automáticamente una variable DATABASE_URL\n# No hace falta copiarla manualmente.' 
  lang="bash" 
/>
      <DocCallout type="tip">
        Si no ves la pestaña Storage, andá a <strong>Settings → Integrations</strong> y buscá Neon.
      </DocCallout>

      <DocStep number={9} title="Configurar variables de entorno">
        Estas son las "contraseñas" que conectan todos los servicios. Las agregás en dos lugares: Railway y Vercel.
      </DocStep>

      <p className="text-sm font-bold text-slate-200 mt-4 mb-2">En Railway (Settings → Variables):</p>
      <DocCode code={'DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/wabisend?sslmode=require\nWHATSAPP_SECRET=WABI_SECRET_2026_NUNCA_LO_COMPARTAS'} lang="bash" />
      <DocCallout type="warning">
        El <code className="text-cyan-400">WHATSAPP_SECRET</code> lo inventás vos. Tiene que ser largo, random, y <strong>exactamente igual</strong> en Railway y en Vercel.
      </DocCallout>

      <p className="text-sm font-bold text-slate-200 mt-4 mb-2">En Vercel (Settings → Environment Variables):</p>
      <DocCode code={'BACKEND_URL=https://wabisend-production.up.railway.app\nWHATSAPP_SECRET=WABI_SECRET_2026_NUNCA_LO_COMPARTAS\nJWT_SECRET=otra-clave-larga-y-random-que-inventas-vos\nNEXT_PUBLIC_WHATSAPP_SERVER_URL=https://wabisend-production.up.railway.app'} lang="bash" />
      <DocCallout type="tip">
        <code className="text-cyan-400">JWT_SECRET</code> la inventás vos también. Usá una frase larga y random. No la compartas con nadie.
      </DocCallout>

            <DocStep number={10} title="Campañas programadas (ya incluido)">
        El sistema de campañas programadas corre automáticamente en tu servidor de Railway. No necesitás configurar nada extra.
      </DocStep>
      <DocCode code={'# El cron revisa cada 5 minutos si hay campañas que deben ejecutarse\n# Ya viene activado en el backend. Cero configuración.'} lang="bash" />
      <DocCallout type="tip">
        Las campañas programadas usan la zona horaria de tu cuenta (configurable en Settings). El servidor sincroniza automáticamente en UTC.
      </DocCallout>

      <DocStep number={11} title="Reiniciar y probar">
        Una vez que cargaste todas las variables:
        <ol className="list-decimal list-inside space-y-1 mt-2 text-sm text-slate-300">
          <li>En Railway, hacé clic en <strong>Restart</strong></li>
          <li>En Vercel, hacé clic en <strong>Redeploy</strong></li>
          <li>Esperá 2 minutos</li>
          <li>Entrá a tu URL de Vercel</li>
        </ol>
      </DocStep>

      <DocChecklist items={[
        { label: "Cuenta de GitHub creada", checked: false },
        { label: "Fork del repo hecho", checked: false },
        { label: "Railway conectado a GitHub", checked: false },
        { label: "Backend deployado en Railway", checked: false },
        { label: "Base de datos Neon creada", checked: false },
        { label: "Vercel conectado a GitHub", checked: false },
        { label: "Frontend deployado en Vercel", checked: false },
        { label: "Variables de entorno cargadas", checked: false },
        { label: "Worker de Cloudflare (opcional)", checked: false },
        { label: "WabiSend funcionando en producción", checked: false },
      ]} />

      <DocNextUp onSelect={onSelectArticle} title="Setup Wizard" slug="setup-wizard" section="Comenzar" />
    </>
  )

    case "setup-wizard":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "setup-wizard")!} sectionTitle="Comenzar" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El <strong>Setup Wizard</strong> es un flujo de 4 pasos que guía la primera configuración de WabiSend. Aparece automáticamente al iniciar sesión por primera vez.
          </p>
          <DocImage src="/images/setup_inicial.png" alt="Setup Wizard" caption="Pantalla inicial del wizard de configuración" />
          <DocStep number={1} title="Perfil de empresa">
            Completá el nombre de tu empresa, teléfono, zona horaria e industria. Esto personaliza la experiencia y mejora las sugerencias de IA.
          </DocStep>
          <DocStep number={2} title="Conectar línea WhatsApp">
            Escaneá el código QR con tu celular. En 5 segundos la línea estará activa y lista para enviar.
          </DocStep>
          <DocStep number={3} title="Activar licencia">
            Ingresá tu license key. Si aún no la tenés, podés usar el modo demo con funciones limitadas.
          </DocStep>
          <DocStep number={4} title="Primer contacto de prueba">
            Enviá un mensaje de prueba a un número de confianza para validar que todo funciona correctamente.
          </DocStep>
          <DocCallout type="tip">
            Podés saltar el wizard y acceder al dashboard directamente, pero recomendamos completarlo para desbloquear todas las funciones.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Activar licencia" slug="license" section="Comenzar" />
        </>
      )

    case "license":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "license")!} sectionTitle="Comenzar" />
          <p className="text-slate-300 leading-relaxed mb-4">
            WabiSend opera con un sistema de <strong>licencias self-hosted</strong>. Cada licencia está vinculada a un dominio y desbloquea funciones según el tier.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">Tiers disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              { name: "Starter", price: "$250", color: "border-slate-600", features: ["1 línea WhatsApp", "Campañas básicas", "Reportes simples", "Blacklist manual"] },
              { name: "Pro", price: "$500", color: "border-cyan-500/40", features: ["3 líneas WhatsApp", "Programación", "Spintax", "Proxy rotate", "Modo humano", "Export CSV"] },
              { name: "Business", price: "$750", color: "border-purple-500/40", features: ["Todo lo de Pro", "Round Robin", "Multi-usuario", "Asistente IA", "Campañas recurrentes", "Whitelist"] },
            ].map((plan, i) => (
              <div key={i} className={`p-4 rounded-xl bg-slate-800/30 border ${plan.color} hover:bg-slate-800/50 transition`}>
                <p className="text-lg font-bold text-white">{plan.name}</p>
                <p className="text-2xl font-bold text-cyan-400 mb-3">{plan.price}<span className="text-xs text-slate-500 font-normal">/único</span></p>
                <ul className="space-y-1.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check size={12} className="text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DocCallout type="info">
            Las licencias son <strong>de por vida</strong> para el dominio vinculado. Incluyen actualizaciones de seguridad y parches de compatibilidad con Baileys.
          </DocCallout>
          {/* <DocCode code=`POST /api/license/activate\nBody: { key: "WB-PRO-XXXX-XXXX", domain: "tudominio.com }" lang="http" /> */}
          <DocNextUp onSelect={onSelectArticle} title="Conectar tu primera línea" slug="first-line" section="Comenzar" />
        </>
      )

    case "first-line":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "first-line")!} sectionTitle="Comenzar" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Conectar una línea de WhatsApp en WabiSend es instantáneo gracias a Baileys. No necesitás API Business ni aprobación de Meta.
          </p>
          <DocStep number={1} title="Ir a Líneas">
            Desde el sidebar, hacé clic en <strong>Líneas</strong> y luego en <strong>Conectar nueva</strong>.
          </DocStep>
          <DocImage src="/images/lines.png" alt="Página de líneas" />
          <DocStep number={2} title="Escanear QR">
            Se mostrará un código QR. Abrí WhatsApp en tu celular, andá a <em>Dispositivos vinculados → Vincular dispositivo</em> y escanealo.
          </DocStep>
          <DocStep number={3} title="Verificar estado">
            La línea pasará de <span className="text-amber-400">Conectando...</span> a <span className="text-emerald-400">Conectada</span>. El keep-alive se activa automáticamente.
          </DocStep>
          <DocCallout type="warning">
            No cerrés sesión de WhatsApp Web desde el celular mientras WabiSend esté activo. Eso rompe la conexión y deberás re-escanear.
          </DocCallout>
          <DocCallout type="tip">
            El <strong>ConnectionMonitor</strong> detecta desconexiones en tiempo real y muestra un modal de alerta para que reconectes sin perder campañas activas.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Crear campaña básica" slug="create-basic" section="Campañas" />
        </>
      )

    case "create-basic":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "create-basic")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Una campaña básica es el envío de un mensaje de texto (con o sin imagen) a una lista de contactos. Es el núcleo de WabiSend.
          </p>
          <DocImage src="/images/campana.png" alt="Crear campaña" />
          <DocStep number={1} title="Seleccionar contactos">
            Podés elegir contactos por tags, importar un CSV o seleccionar manualmente desde la lista. El sistema muestra el total de destinatarios en tiempo real.
          </DocStep>
          <DocStep number={2} title="Redactar el mensaje">
            Escribí tu mensaje en el editor. Podés usar variables como <code className="text-cyan-400 bg-slate-800 px-1 rounded">{'{nombre}'}</code> que se reemplazan automáticamente por el nombre del contacto.
          </DocStep>
          <DocCode code="Hola {nombre}, tenemos una oferta especial para vos.\n\nEscribinos INFO para más detalles." lang="text" />
          <DocStep number={3} title="Adjuntar imagen (opcional)">
            Subí una imagen desde tu dispositivo o pegá una URL pública. El sistema valida que la imagen sea accesible antes de iniciar el envío.
          </DocStep>
          <DocStep number={4} title="Elegir línea y enviar">
            Seleccioná la línea WhatsApp activa y hacé clic en <strong>Enviar campaña</strong>. La Sala de Control se abrirá automáticamente para monitorear el progreso.
          </DocStep>
          <DocCallout type="danger">
            Antes de enviar a miles de contactos, usá siempre el <strong>Modo Simulacro Lite</strong> para calentar la línea  .
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Modo Simulacro Lite" slug="sim-lite" section="Campañas" />
        </>
      )

    case "sim-lite":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "sim-lite")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El <strong>Simulacro Lite</strong> envía un único mensaje de prueba al primer contacto de la lista. Sirve para validar calentar las lineas, formato, imagen y conectividad sin riesgo.
          </p>
          <DocImage src="/images/simulacro.png" alt="Simulacro Lite" />
          <DocStep number={1} title="Activar Simulacro Lite">
            En el formulario de campaña, activá el toggle <strong>Simulacro Lite</strong> antes de presionar enviar.
          </DocStep>
          <DocStep number={2} title="Verificar resultado">
            El sistema envía 1 mensaje y muestra el resultado inmediatamente: <span className="text-emerald-400">✓ Entregado</span> o <span className="text-red-400">✕ Fallido</span>.
          </DocStep>
          <DocCallout type="tip">
            Si el simulacro falla, no iniciés la campaña completa. Revisá la conexión de la línea, el formato del número y la accesibilidad de la imagen.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Modo Simulacro Full" slug="sim-full" section="Campañas" />
        </>
      )

    case "sim-full":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "sim-full")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El <strong>Simulacro Full</strong> verifica <em>todos</em> los números de la campaña antes de enviar. Detecta números inválidos, baneados o inexistentes.
          </p>
          <DocStep number={1} title="Activar Simulacro Full">
            Seleccioná <strong>Simulacro Full</strong> en el dropdown de modo de envío. Requiere plan Pro o superior.
          </DocStep>
          <DocStep number={2} title="Esperar verificación">
            El sistema envía un ping invisible a cada número. Esto puede tardar varios minutos dependiendo del volumen.
          </DocStep>
          <DocStep number={3} title="Revisar informe">
            Al finalizar, se muestra un resumen: cuántos números son válidos, cuántos están bloqueados y cuántos no existen. Podés exportar el informe.
          </DocStep>
          <DocCallout type="warning">
            El Simulacro Full consume recursos de la línea. No lo uses más de 2-3 veces por día en la misma línea para evitar patrones de detección.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Modo Humano" slug="human-mode" section="Campañas" />
        </>
      )

    case "human-mode":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "human-mode")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El <strong>Modo Humano</strong> introduce pausas aleatorias entre mensajes para simular comportamiento humano y reducir el riesgo de ban en un 90%.
          </p>
          <DocStep number={1} title="Activar Modo Humano">
            En la configuración avanzada de la campaña, activá el toggle <strong>Modo Humano</strong>.
          </DocStep>
          <DocStep number={2} title="Configurar rangos">
            Definí el rango de pausa entre mensajes (por defecto: 3-12 segundos) y el rango de pausa entre lotes (por defecto: 30-90 segundos cada 50 mensajes).
          </DocStep>
          <DocCode code="delayMin: 3000,      // 3 segundos\ndelayMax: 12000,     // 12 segundos\nbatchSize: 50,       // cada 50 mensajes\nbatchPauseMin: 30000, // 30 segundos\nbatchPauseMax: 90000  // 90 segundos" lang="javascript" />
          <DocCallout type="tip">
            Para campañas de más de 1,000 contactos, recomendamos aumentar el batch size a 100 y las pausas a 60-180 segundos.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Spintax avanzado" slug="spintax" section="Campañas" />
        </>
      )

    case "spintax":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "spintax")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong>Spintax</strong> permite que cada contacto reciba una variación única del mensaje. WhatsApp no detecta patrones repetidos y tu entrega mejora drásticamente.
          </p>
          <DocStep number={1} title="Sintaxis básica">
            Usá llaves con opciones separadas por pipe:
          </DocStep>
          <DocCode code="Hola {nombre|amigo|querido cliente}, tenemos {una super oferta|descuentos increíbles|promociones exclusivas} para vos." lang="text" />
          <DocStep number={2} title="Anidamiento">
            Podés anidar spintax dentro de spintax para miles de combinaciones:
          </DocStep>
          <DocCode code="{Hola|Buenas|Hey} {nombre}, {tenemos|preparamos|armamos} {una|la mejor|la única} {oferta|promo|oportunidad} del mes." lang="text" />
          <DocStep number={3} title="Preview antes de enviar">
            El editor muestra un preview con 5 variaciones aleatorias para que verifiques que todo se ve natural.
          </DocStep>
          <DocCallout type="tip">
            Cuanto más variado sea el spintax, menor es la probabilidad de ban. Recomendamos al menos 20 combinaciones únicas por cada 100 contactos.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Round Robin" slug="round-robin" section="Campañas" />
        </>
      )

    case "round-robin":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "round-robin")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong>Round Robin</strong> distribuye el envío entre múltiples líneas WhatsApp conectadas. Ideal para volúmenes altos y redundancia.
          </p>
          <DocStep number={1} title="Conectar múltiples líneas">
            Andá a <strong>Líneas</strong> y conectá hasta 3 números. Requiere plan Business.
          </DocStep>
          <DocStep number={2} title="Seleccionar modo Round Robin">
            En la campaña, elegí <strong>Round Robin</strong> como modo de distribución. El sistema alternará líneas automáticamente.
          </DocStep>
          <DocStep number={3} title="Estrategias de distribución">
            Podés elegir entre distribución equitativa (50/50) o por capacidad (la línea más rápida recibe más carga).
          </DocStep>
          <DocCallout type="info">
            Si una línea se desconecta durante el envío, Round Robin redistribuye automáticamente el remanente a las líneas activas sin detener la campaña.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Proxy Rotate" slug="proxy-rotate" section="Campañas" />
        </>
      )

    case "proxy-rotate":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "proxy-rotate")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong>Proxy Rotate</strong> cambia la IP de origen de cada campaña o incluso durante el envío, haciendo que WhatsApp no detecte un patrón fijo.
          </p>
          <DocStep number={1} title="Configurar proxy">
            Andá a <strong>Configuración → Proxy</strong> y agregá tus proxies SOCKS5 o HTTP. Podés agregar múltiples y el sistema rotará entre ellos.
          </DocStep>
          <DocCode code="PROXY_LIST=\n  socks5://user:pass@host1:1080,\n  http://user:pass@host2:8080" lang="env" />
          <DocStep number={2} title="Activar rotación">
            En la campaña, activá <strong>Proxy Rotate</strong>. Elegí rotar por campaña (1 proxy por campaña) o por lote (cambia cada 50 mensajes).
          </DocStep>
          <DocCallout type="warning">
            Usá proxies residenciales o móviles, nunca datacenter. Los proxies de datacenter tienen alta probabilidad de ban por IP compartida.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Programar campaña" slug="schedule" section="Campañas" />
        </>
      )

    case "schedule":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "schedule")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Programá campañas para que se ejecuten automáticamente en una fecha y hora futura. Ideal para lanzamientos coordinados o flujos nocturnos.
          </p>
          <DocStep number={1} title="Crear campaña normalmente">
            Completá todos los campos de la campaña (contactos, mensaje, línea, etc.).
          </DocStep>
          <DocStep number={2} title="Seleccionar fecha y hora">
            En vez de "Enviar ahora", elegí "Programar" y seleccioná la fecha y hora de ejecución. El sistema usa tu zona horaria configurada.
          </DocStep>
          <DocStep number={3} title="Monitorear pendientes">
            Las campañas programadas aparecen en el dashboard con estado <span className="text-purple-400">Programada</span> y un contador regresivo.
          </DocStep>
          <DocCallout type="tip">
            Podés cancelar una campaña programada en cualquier momento antes de la ejecución. Una vez iniciada, solo podés detenerla con <strong>Cancelación en vivo</strong>.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Clonación 1-click" slug="clone" section="Campañas" />
        </>
      )

    case "clone":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "clone")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La <strong>Clonación 1-click</strong> duplica una campaña existente con todos sus parámetros, lista para editar y reenviar.
          </p>
          <DocStep number={1} title="Buscar campaña histórica">
            Andá a <strong>Reportes</strong>, encontrá la campaña que querés repetir y hacé clic en el ícono de <strong>Repetir</strong>.
          </DocStep>
          <DocStep number={2} title="Editar antes de enviar">
            El sistema te redirige al editor con todos los campos pre-cargados. Modificá lo que necesites: mensaje, contactos, línea, etc.
          </DocStep>
          <DocCallout type="tip">
            La clonación es perfecta para campañas recurrentes con leves modificaciones. Ej: "Oferta de Viernes" que se repite cada semana con un descuento diferente.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Cancelación en vivo" slug="cancel" section="Campañas" />
        </>
      )

    case "cancel":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "cancel")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La <strong>Cancelación en vivo</strong> permite detener una campaña en ejecución sin perder el progreso ya enviado.
          </p>
          <DocStep number={1} title="Abrir Sala de Control">
            Durante el envío, la Sala de Control muestra un botón <strong>Parar</strong> en rojo.
          </DocStep>
          <DocStep number={2} title="Confirmar detención">
            El sistema pide confirmación. Los mensajes ya entregados quedan registrados. Los pendientes se marcan como cancelados.
          </DocStep>
          <DocCallout type="info">
            Los contactos que ya recibieron el mensaje no reciben duplicados si reiniciás la campaña. El sistema trackea por message_id.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Campañas recurrentes" slug="recurrent" section="Campañas" />
        </>
      )

    case "recurrent":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "recurrent")!} sectionTitle="Campañas" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Las <strong>Campañas recurrentes</strong> se ejecutan automáticamente en intervalos definidos: diario, semanal, mensual o personalizado.
          </p>
          <DocStep number={1} title="Crear campaña base">
            Diseñá la campaña maestra con mensaje, contactos y configuración deseada.
          </DocStep>
          <DocStep number={2} title="Definir recurrencia">
            En la sección avanzada, activá <strong>Recurrente</strong> y elegí el patrón: cada lunes a las 9am, cada 1ro de mes, etc.
          </DocStep>
          <DocStep number={3} title="Gestión de series">
            Todas las instancias de la serie aparecen agrupadas en Reportes. Podés pausar la serie completa o editar la campaña base para que futuras instancias usen la nueva versión.
          </DocStep>
          <DocCallout type="warning">
            Requiere plan Business. Las campañas recurrentes no se duplican entre sí: si una instancia no terminó antes de que inicie la siguiente, el sistema espera.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Importar contactos (CSV)" slug="import-csv" section="Contactos & Tags" />
        </>
      )

      case "manage-contacts":
  return (
    <>
      <DocHero article={ALL_ARTICLES.find(a => a.slug === "manage-contacts")!} sectionTitle="Contactos & Tags" />
      
      <DocStep number={1} title="Ir al módulo Contactos">
        Desde el sidebar del dashboard, hacé clic en <strong>Contactos</strong>. Si no lo ves, asegurate de estar en el plan Pro o Business.
      </DocStep>
      <DocCallout type="tip">
        También podés acceder directamente desde <code className="text-cyan-400">/dashboard/contacts</code> en la barra de direcciones.
      </DocCallout>

      <DocStep number={2} title="Abrir el formulario de nuevo contacto">
        En la esquina superior derecha de la pantalla, hacé clic en el botón <strong>Nuevo Contacto</strong>. Se va a abrir un modal con el formulario.
      </DocStep>

      <DocStep number={3} title="Completar los datos obligatorios">
        Los únicos campos obligatorios son <strong>Nombre</strong> y <strong>Teléfono</strong>. El resto es opcional pero recomendado.
      </DocStep>
      <DocCode code={'Nombre: Juan Pérez\nTeléfono: 5491123456789\nEmail: juan@ejemplo.com (opcional)\nEmpresa: Ejemplo S.A. (opcional)'} lang="bash" />
      <DocCallout type="warning">
        El teléfono debe incluir el código de país. Para Argentina: <code className="text-cyan-400">54</code> + código de área sin el <code className="text-cyan-400">0</code> + número sin el <code className="text-cyan-400">15</code>. Ejemplo correcto: <code className="text-cyan-400">5491123456789</code>.
      </DocCallout>

      <DocStep number={4} title="Agregar etiquetas (opcional)">
        Si ya creaste etiquetas en el módulo <strong>Tags</strong>, podés seleccionarlas desde el desplegable. Sirven para segmentar contactos y luego filtrar campañas por tag.
      </DocStep>
      <DocCallout type="tip">
        Si no tenés etiquetas creadas, el campo va a mostrar: <em>"No hay etiquetas creadas. Primero creá etiquetas en el módulo Tags."</em>
      </DocCallout>

      <DocStep number={5} title="Agregar notas (opcional)">
        En el campo <strong>Notas</strong> podés escribir cualquier información extra: historial de conversaciones, preferencias del cliente, dirección, etc.
      </DocStep>

      <DocStep number={6} title="Guardar el contacto">
        Revisá que el nombre y teléfono estén correctos, y hacé clic en <strong>Crear</strong>. El modal se cierra automáticamente y el contacto aparece en la lista.
      </DocStep>

      <DocChecklist items={[
        { label: "Entré al módulo Contactos", checked: false },
        { label: "Abrí el modal Nuevo Contacto", checked: false },
        { label: "Completé Nombre y Teléfono", checked: false },
        { label: "Verifiqué el formato del teléfono (código de país)", checked: false },
        { label: "Agregué etiquetas (si aplica)", checked: false },
        { label: "Guardé con el botón Crear", checked: false },
        { label: "El contacto aparece en la lista", checked: false },
      ]} />

      <DocNextUp onSelect={onSelectArticle} title="Importar contactos (CSV)" slug="import-contacts" section="Contactos & Tags" />
    </>
  )

    case "import-csv":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "import-csv")!} sectionTitle="Contactos & Tags" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Importá contactos masivamente desde un archivo CSV. El sistema detecta automáticamente columnas de nombre, teléfono, email y tags.
          </p>
          <DocStep number={1} title="Preparar CSV">
            Tu archivo debe tener al menos una columna <code className="text-cyan-400 bg-slate-800 px-1 rounded">phone</code>. Las columnas opcionales son <code className="text-cyan-400 bg-slate-800 px-1 rounded">name</code>, <code className="text-cyan-400 bg-slate-800 px-1 rounded">email</code>, <code className="text-cyan-400 bg-slate-800 px-1 rounded">company</code>, <code className="text-cyan-400 bg-slate-800 px-1 rounded">tags</code>.
          </DocStep>
          <DocCode code="name,phone,email,tags\ncliente,54911245145,cliente@mail.com,cliente;vip\nLaura,5491123456789,laura@mail.com,lead" lang="csv" />
          <DocStep number={2} title="Subir archivo">
            Arrastrá el archivo al área de importación o seleccionalo manualmente. El sistema muestra una preview con los primeros 10 registros.
          </DocStep>
          <DocStep number={3} title="Mapear columnas">
            Si el CSV usa nombres de columna diferentes, el modal de importación te permite mapearlas manualmente.
          </DocStep>
          <DocCallout type="tip">
            Los números se normalizan automáticamente. Si incluís el prefijo internacional (54, 52, etc.), se respeta. Si no, se usa el prefijo por defecto configurado en tu cuenta.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Sistema de Tags" slug="tags" section="Contactos & Tags" />
        </>
      )

    case "tags":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "tags")!} sectionTitle="Contactos & Tags" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Los <strong>Tags</strong> organizan tus contactos por categorías visuales. Podés filtrar campañas por tags, ver estadísticas por grupo y asignar colores distintivos.
          </p>
          <DocStep number={1} title="Crear un tag">
            Andá a <strong>Tags</strong> y hacé clic en <strong>Nuevo tag</strong>. Elegí nombre, color e ícono (opcional).
          </DocStep>
          <DocStep number={2} title="Asignar a contactos">
            En la tabla de contactos, seleccioná múltiples filas y usá el botón <strong>Asignar tags</strong> para aplicar en bulk.
          </DocStep>
          <DocStep number={3} title="Filtrar campañas">
            Al crear una campaña, en el selector de contactos podés elegir "Todos los contactos con tag X" en vez de seleccionar manualmente.
          </DocStep>
          <DocCallout type="info">
            Los tags son privados por usuario (multitenancy). Un tag "VIP" tuyo no se mezcla con el "VIP" de otro usuario en la misma instalación.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Blacklist vs Whitelist" slug="blacklist" section="Contactos & Tags" />
        </>
      )



    case "blacklist":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "blacklist")!} sectionTitle="Contactos & Tags" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La <strong>Blacklist</strong> impide que ciertos números reciban mensajes. La <strong>Whitelist</strong> (Business) limita el envío a solo contactos pre-aprobados.
          </p>
          <DocStep number={1} title="Agregar a blacklist">
            Desde el panel de <strong>Blacklist</strong>, agregá números manualmente o marcá "Auto-blacklist" para que números que respondan "STOP" o "BAJA" se agreguen automáticamente.
          </DocStep>
          <DocStep number={2} title="Verificar antes de enviar">
            Antes de cada campaña, el sistema cruza la lista de destinatarios con la blacklist y muestra cuántos serán saltados.
          </DocStep>
          <DocStep number={3} title="Whitelist (Business)">
            Activá el modo Whitelist desde Configuración. A partir de ese momento, solo los contactos explícitamente aprobados podrán recibir campañas.
          </DocStep>
          <DocCallout type="danger">
            El auto-blacklist requiere que el sistema esté escuchando mensajes entrantes. Si la línea está desconectada, no detectará las palabras clave de baja.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Leer el dashboard" slug="dashboard-read" section="Reportes & Inteligencia" />
        </>
      )

    case "dashboard-read":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "dashboard-read")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La sección de <strong>Reportes</strong> es el centro de control de WabiSend. Desde acá controlás campañas activas, respuestas, estadísticas en tiempo real, eficiencia, entre mas.
          </p>
          <DocImage src="/images/dashboard-overview.png" alt="Dashboard WabiSend" />
          <h2 className="text-lg font-bold text-white mt-6 mb-3">Secciones principales</h2>
          <div className="space-y-3 mb-6">
            {[
              { icon: LayoutDashboard, title: "Stats cards", desc: "Métricas clave: enviados, fallidos, tasa de entrega, programadas/pendientes." },
              { icon: BarChart3, title: "Gráficos", desc: "Área chart de envíos por período y pie chart de distribución entregados/fallidos." },
              { icon: Calendar, title: "Historial de campañas", desc: "Tabla con todas las campañas, estados, progreso y acciones rápidas." },
              { icon: Wifi, title: "Estado de líneas", desc: "Indicadores de conexión en tiempo real con keep-alive." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <item.icon size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <DocNextUp onSelect={onSelectArticle} title="Métricas básicas" slug="basic-metrics" section="Reportes & Inteligencia" />
        </>
      )

    case "basic-metrics":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "basic-metrics")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Las métricas básicas están disponibles en todos los planes y te dan una visión clara del rendimiento de tus campañas.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Total enviados", desc: "Mensajes entregados exitosamente", color: "text-emerald-400" },
              { label: "Fallidos", desc: "Mensajes que no llegaron", color: "text-red-400" },
              { label: "Tasa de entrega", desc: "Porcentaje de éxito", color: "text-blue-400" },
              { label: "Campañas", desc: "Programadas / Pendientes", color: "text-purple-400" },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>—</p>
                <p className="text-[10px] text-slate-500">{m.desc}</p>
              </div>
            ))}
          </div>
          <DocCallout type="info">
            La tasa de entrega se calcula sobre <strong>contactos únicos alcanzados</strong>, no sobre intentos totales. Si enviás 2 veces al mismo número, cuenta como 1.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Métricas Pro" slug="pro-metrics" section="Reportes & Inteligencia" />
        </>
      )

    case "pro-metrics":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "pro-metrics")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Las <strong>Métricas Pro</strong> desbloquean inteligencia avanzada: apertura, respuestas, tiempo promedio de entrega y blacklist activos.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Eye, label: "Tasa de apertura", desc: "Quién abrió el mensaje", color: "text-cyan-400" },
              { icon: MessageCircleReply, label: "Respuestas", desc: "Números que contestaron", color: "text-pink-400" },
              { icon: ShieldBan, label: "Blacklist", desc: "Contactos bloqueados", color: "text-orange-400" },
              { icon: Timer, label: "Tiempo promedio", desc: "Segundos por mensaje", color: "text-sky-400" },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <m.icon size={16} className={`${m.color} mb-2`} />
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>—</p>
                <p className="text-[10px] text-slate-500">{m.desc}</p>
              </div>
            ))}
          </div>
          <DocCallout type="tip">
            Hacé clic en la card de <strong>Respuestas recibidas</strong> para ver la lista completa de números que respondieron. Podés copiarlos o exportarlos a CSV para crear campañas personalizadas de alto valor.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Sala de Control" slug="control-room" section="Reportes & Inteligencia" />
        </>
      )

    case "control-room":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "control-room")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La <strong>Sala de Control</strong> es el modal que se abre automáticamente al iniciar una campaña. Muestra logs en vivo, progreso circular y estadísticas actualizadas cada 3 segundos.
          </p>
          <DocImage src="/images/control-room.png" alt="Sala de Control" />
          <h2 className="text-lg font-bold text-white mt-6 mb-3">Métricas en vivo</h2>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {["Contactos", "Intentos", "Respuestas", "Fallidos", "Blacklist"].map((label, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <p className="text-lg font-bold text-white">—</p>
                <p className="text-[10px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <DocCallout type="info">
            La Sala de Control usa <strong>Socket.IO</strong> para actualizaciones en tiempo real. Si ves un retraso, verificá tu conexión de red.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Respuestas recibidas" slug="replies" section="Reportes & Inteligencia" />
        </>
      )

    case "replies":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "replies")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El sistema <strong>detecta automáticamente</strong> cuando un contacto responde a tu campaña. Estos números son tus leads más calificados.
          </p>
          <DocStep number={1} title="Dónde ver las respuestas">
            En el dashboard, hacé clic en la card <strong>Respuestas recibidas</strong> (Pro). Se abre un modal con todos los números que respondieron históricamente.
          </DocStep>
          <DocStep number={2} title="Por campaña">
            Dentro de la Sala de Control, la card de <strong>Respuestas</strong> es clickeable y muestra solo los que respondieron a esa campaña específica.
          </DocStep>
          <DocStep number={3} title="Exportar leads calificados">
            Desde el modal global, copiá los números o descargá un CSV. Usá esa lista para crear una campaña de seguimiento ultra-personalizada.
          </DocStep>
          <DocCallout type="tip">
            Los números que respondieron se cruzan automáticamente con tu tabla de <strong>Contactos</strong>. Si el número está agendado, se muestra el nombre al lado: <span className="text-emerald-400">54911245145 (cliente)</span>.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Exportar datos" slug="export-data" section="Reportes & Inteligencia" />
        </>
      )

    case "export-data":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "export-data")!} sectionTitle="Reportes & Inteligencia" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Exportá tus datos en cualquier momento. WabiSend nunca te retiene la información.
          </p>
          <DocStep number={1} title="Exportar contactos">
            Desde la página de Contactos, hacé clic en <strong>Exportar CSV</strong>. Se descarga un archivo con nombre, teléfono, email, tags y notas.
          </DocStep>
          <DocStep number={2} title="Exportar campaña">
            En Reportes, cada campaña completada tiene un botón de descarga que exporta los números válidos entregados (excluye fallidos y blacklist).
          </DocStep>
          <DocStep number={3} title="Exportar respuestas">
            Desde el modal de Respuestas recibidas, descargá un CSV con teléfono, fecha de respuesta y nombre del contacto (si está agendado).
          </DocStep>
          <DocCallout type="info">
            Todos los exports usan formato CSV UTF-8 con separador de coma. Compatible con Excel, Google Sheets y cualquier CRM.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Asistente Caleb" slug="caleb" section="IA & Automatización" />
        </>
      )

    case "caleb":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "caleb")!} sectionTitle="IA & Automatización" />
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong>Caleb</strong> es el asistente de IA integrado en WabiSend. Responde automáticamente a mensajes entrantes, califica leads y ejecuta prompts personalizados.
          </p>
          <DocImage src="/images/caleb-ai.png" alt="Asistente Caleb" />
          <DocStep number={1} title="Configurar API key">
            Andá a <strong>IA → Configuración</strong> e ingresá tu API key de OpenAI. Recomendamos <code className="text-cyan-400 bg-slate-800 px-1 rounded">gpt-4o-mini</code> para respuestas rápidas y económicas.
          </DocStep>
          <DocStep number={2} title="Crear prompt">
            Definí el comportamiento de Caleb: tono, objetivo, reglas de respuesta y formato de salida. Podés guardar múltiples prompts y activarlos según el contexto.
          </DocStep>
          <DocStep number={3} title="Activar auto-respuesta">
            En la configuración de la línea, activá <strong>Responder con Caleb</strong>. Ahora cada mensaje entrante recibirá una respuesta automática inteligente.
          </DocStep>
          <DocCode code="Eres un asistente de ventas amable. Responde en español.\nSi el cliente pregunta precios, pedile su email.\nSi dice gracias, despidete cordialmente." lang="text" />
          <DocCallout type="warning">
            Caleb consume tokens de OpenAI. Monitoreá tu uso desde el panel de IA para controlar costos. Un promedio de 500 conversaciones/día cuesta aproximadamente USD 2-3 con gpt-4o-mini.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Respuestas automáticas" slug="auto-replies" section="IA & Automatización" />
        </>
      )

    case "auto-replies":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "auto-replies")!} sectionTitle="IA & Automatización" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Las <strong>respuestas automáticas</strong> funcionan incluso sin IA. Podés definir reglas simples basadas en palabras clave.
          </p>
          <DocStep number={1} title="Crear regla">
            Andá a <strong>IA → Respuestas automáticas</strong> y hacé clic en <strong>Nueva regla</strong>.
          </DocStep>
          <DocStep number={2} title="Definir trigger">
            Escribí las palabras clave que activan la respuesta. Ej: <code className="text-cyan-400 bg-slate-800 px-1 rounded">precio, costo, cuánto</code>.
          </DocStep>
          <DocStep number={3} title="Redactar respuesta">
            Escribí el mensaje que se enviará automáticamente. Podés usar variables como <code className="text-cyan-400 bg-slate-800 px-1 rounded">{'{nombre}'}</code>.
          </DocStep>
          <DocCallout type="tip">
            Las reglas se evalúan en orden. Si una regla coincide, no se evalúan las siguientes. Ordená tus reglas de más específica a más general.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Prompts guardados" slug="prompts" section="IA & Automatización" />
        </>
      )

    case "prompts":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "prompts")!} sectionTitle="IA & Automatización" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Guardá tus prompts más efectivos para reutilizarlos en diferentes campañas o líneas sin tener que reescribirlos.
          </p>
          <DocStep number={1} title="Guardar prompt">
            Desde el editor de IA, hacé clic en <strong>Guardar como...</strong> y asignale un nombre descriptivo. Ej: "Onboarding agresivo", "Soporte técnico", "Cierre de venta".
          </DocStep>
          <DocStep number={2} title="Reutilizar">
            Al configurar Caleb o una respuesta automática, aparecerá un dropdown con todos tus prompts guardados. Seleccioná uno y se carga instantáneamente.
          </DocStep>
          <DocCallout type="info">
            Los prompts guardados son privados por usuario. No se comparten entre cuentas de la misma instalación.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Comparativa de planes" slug="plans" section="Pro & Business" />
        </>
      )

    case "plans":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "plans")!} sectionTitle="Pro & Business" />
          <p className="text-slate-300 leading-relaxed mb-4">
            WabiSend ofrece 3 tiers diseñados para escalar con tu negocio. Todos son <strong>licencias de por vida</strong> para un dominio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
  {
    name: "Starter",
    price: "$500",
    color: "border-slate-600",
    badge: "Starter",
    features: [
      "1 licencia de por vida",
      "Hasta 2 líneas WhatsApp",
      "Envíos masivos ilimitados",
      "5 templates de mensajes",
      "10 campañas en espera",
      "Spintax básico",
      "Reportes estándar",
      "Soporte por email",
      "Actualizaciones 6 meses",
    ],
  },
  {
    name: "Pro",
    price: "$750",
    color: "border-amber-500/40",
    badge: "Pro",
    popular: true,
    features: [
      "Todo lo de Starter",
      "Hasta 3 líneas WhatsApp",
      "Templates ilimitados",
      "50 campañas en espera",
      "Spintax avanzado + variables",
      "Programación de campañas (cron)",
      "Modo humano",
      "Round Robin (hasta 3 líneas)",
      "Export CSV",
      "Blacklist + Whitelist",
      "Métricas avanzadas",
      "Simulacro Lite",
      "Tracking de respuestas",
      "Soporte prioritario WhatsApp",
      "Actualizaciones de por vida",
    ],
  },
  {
    name: "Business",
    price: "$1.290",
    color: "border-purple-500/40",
    badge: "Business",
    features: [
      "Todo lo de Pro",
      "Líneas WhatsApp ilimitadas",
      "Campañas en espera ilimitadas",
      "Multi-usuario (multi-agente)",
      "Asistente IA (Caleb)",
      "Proxy Rotate",
      "Simulacro Full",
      "Campañas recurrentes",
      "Backup automático diario",
      "Soporte 1-a-1 dedicado",
      "Acceso anticipado a betas",
      "Instalación remota incluida",
    ], },
            ].map((plan, i) => (
              <div key={i} className={`relative p-5 rounded-xl bg-slate-800/30 border ${plan.color} ${plan.popular ? "ring-1 ring-cyan-500/20" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    Más popular
                  </div>
                )}
                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">{plan.name}</p>
                <p className="text-3xl font-bold text-white mb-1">{plan.price}</p>
                <p className="text-xs text-slate-500 mb-4">Licencia de por vida · 1 dominio</p>
                <ul className="space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check size={12} className="text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <DocCallout type="info">
            Todas las licencias incluyen actualizaciones de seguridad y compatibilidad con nuevas versiones de Baileys. No hay costos mensuales ocultos.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Multi-línea" slug="multi-line" section="Pro & Business" />
        </>
      )

    case "multi-line":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "multi-line")!} sectionTitle="Pro & Business" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Conectá hasta <strong>3 líneas WhatsApp</strong> simultáneas y distribuí la carga entre ellas. Ideal para agencias que manejan múltiples clientes o territorios.
          </p>
          <DocStep number={1} title="Conectar líneas">
            Repetí el proceso de conexión QR por cada número que querés agregar. Cada línea aparece en el panel con su propio nombre y estado.
          </DocStep>
          <DocStep number={2} title="Asignar campañas">
            Al crear una campaña, seleccioná qué línea usar. O activá Round Robin para que el sistema elija automáticamente.
          </DocStep>
          <DocStep number={3} title="Monitorear independiente">
            Cada línea tiene su propio keep-alive, logs y métricas. Si una cae, las demás siguen operando sin interrupción.
          </DocStep>
          <DocCallout type="warning">
            Cada línea adicional aumenta el riesgo de ban si no usás Modo Humano y Proxy Rotate. No conectés 3 líneas y enviés a 3,000 contactos/hora sin protección.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Affiliate / Ganá plata" slug="affiliate" section="Pro & Business" />
        </>
      )

    case "affiliate":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "affiliate")!} sectionTitle="Pro & Business" />
          <p className="text-slate-300 leading-relaxed mb-4">
            El programa <strong>Affiliate</strong> te permite ganar comisiones por cada licencia que vendas. Obtené tu código único y compartilo.
          </p>
          <DocStep number={1} title="Obtener código">
            Andá a <strong>Ganá plata</strong> en el sidebar. Tu código affiliate se muestra automáticamente. Ej: <code className="text-cyan-400 bg-slate-800 px-1 rounded">WS-cliente-2026</code>.
          </DocStep>
          <DocStep number={2} title="Compartir link">
            Copiá tu link de referido y compartilo en redes, email o WhatsApp. Cuando alguien compre usando tu link, el sistema registra la venta automáticamente.
          </DocStep>
          <DocStep number={3} title="Seguimiento de comisiones">
            El panel de Affiliate muestra clicks, conversiones, ventas completadas y comisiones pendientes de pago.
          </DocStep>
          <DocCallout type="tip">
            Las comisiones se pagan una vez que el cliente confirma la activación de la licencia. El período de hold es de 7 días para evitar fraudes.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Línea desconectada" slug="disconnected" section="Troubleshooting" />
        </>
      )

    case "disconnected":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "disconnected")!} sectionTitle="Troubleshooting" />
          <p className="text-slate-300 leading-relaxed mb-4">
            La línea se desconecta por diversos motivos: cierre de sesión en el celular, cambio de número, bloqueo temporal o reinicio del servidor.
          </p>
          <DocStep number={1} title="Detectar el problema">
            El <strong>ConnectionMonitor</strong> muestra un modal automático cuando detecta desconexión. No necesitás estar mirando el dashboard.
          </DocStep>
          <DocStep number={2} title="Reconectar">
            Andá a <strong>Líneas</strong> y hacé clic en <strong>Reconectar</strong>. Se genera un nuevo QR. Escanealo con tu celular.
          </DocStep>
          <DocStep number={3} title="Verificar keep-alive">
            Si la desconexión es recurrente, revisá que el servidor no se esté reiniciando. El keep-alive de Baileys requiere que el proceso Node.js esté activo 24/7.
          </DocStep>
          <DocCallout type="danger">
            Si desconectás la línea durante una campaña activa, los mensajes pendientes se marcan como fallidos. Reconectá y reiniciá la campaña desde el punto de corte.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Evitar baneos" slug="anti-ban" section="Troubleshooting" />
        </>
      )

    case "anti-ban":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "anti-ban")!} sectionTitle="Troubleshooting" />
          <p className="text-slate-300 leading-relaxed mb-4">
            WhatsApp detecta patrones de uso masivo y banea números. Seguí este checklist para minimizar el riesgo al mínimo.
          </p>
          <DocChecklist items={[
            { label: "Usar Modo Humano siempre", checked: true },
            { label: "Activar Proxy Rotate (Pro+)", checked: true },
            { label: "Usar Spintax en todos los mensajes", checked: true },
            { label: "No enviar más de 500 mensajes/hora por línea", checked: true },
            { label: "Verificar números con Simulacro Full antes", checked: false },
            { label: "Mantener la línea conectada 24/7", checked: true },
            { label: "No enviar links sospechosos en el primer mensaje", checked: true },
            { label: "Respetar blacklist y respuestas de baja", checked: true },
            { label: "Usar Round Robin si tenés múltiples líneas", checked: false },
            { label: "Esperar 24-48h entre campañas masivas a la misma lista", checked: false },
          ]} />
          <DocCallout type="warning">
            Incluso siguiendo todas las recomendaciones, existe un riesgo residual de ban. WabiSend no garantiza la permanencia de la línea, pero sí minimiza la probabilidad en un 90%.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Errores comunes" slug="errors" section="Troubleshooting" />
        </>
      )

    case "errors":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "errors")!} sectionTitle="Troubleshooting" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Tabla de errores frecuentes, sus causas y soluciones rápidas.
          </p>
          <div className="space-y-3 mb-6">
            {[
              { code: "500", msg: "Error en campaña", cause: "Línea desconectada o Prisma timeout", fix: "Reconectar línea, revisar conexión a DB" },
              { code: "401", msg: "Unauthorized", cause: "Token JWT expirado o inválido", fix: "Reiniciar sesión, verificar JWT_SECRET" },
              { code: "403", msg: "License inactive", cause: "Licencia no activada o expirada", fix: "Activar licencia en /license" },
              { code: "429", msg: "Rate limit", cause: "Demasiadas requests por minuto", fix: "Reducir velocidad de envío, activar Modo Humano" },
              { code: "E_CONN_CLOSED", msg: "Connection Closed", cause: "Baileys perdió la conexión con WhatsApp", fix: "Reconectar línea, verificar keep-alive" },
              { code: "E_BLACKLIST", msg: "Número en blacklist", cause: "El contacto está bloqueado", fix: "Remover de blacklist si fue error" },
            ].map((err, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">{err.code}</span>
                  <span className="text-sm font-bold text-white">{err.msg}</span>
                </div>
                <p className="text-xs text-slate-400"><span className="text-slate-500">Causa:</span> {err.cause}</p>
                <p className="text-xs text-slate-400"><span className="text-slate-500">Solución:</span> {err.fix}</p>
              </div>
            ))}
          </div>
          <DocNextUp onSelect={onSelectArticle} title="FAQ" slug="faq" section="Troubleshooting" />
        </>
      )

    case "faq":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "faq")!} sectionTitle="Troubleshooting" />
          <div className="space-y-4 mb-6">
            {[
              { q: "¿Es legal usar WabiSend?", a: "WabiSend es una herramienta de comunicación. La legalidad depende de cómo la uses. No envíes spam ni mensajes no solicitados. Respetá las leyes de protección de datos de tu país (LGPD, GDPR, etc.)." },
              { q: "¿Puedo usar mi número personal?", a: "Sí, pero no recomendado. Usá números dedicados para campañas. Si el número se banea, perdés tu WhatsApp personal." },
              { q: "¿Cuántos mensajes puedo enviar por día?", a: "Teóricamente ilimitado. Prácticamente, recomendamos máximo 2,000 por línea/día con Modo Humano activo. Sin protección, 500/día es el límite seguro." },
              { q: "¿Necesito API oficial de WhatsApp Business?", a: "No. WabiSend usa Baileys, que se conecta directamente como si fuera WhatsApp Web. No hay costos por mensaje." },
              { q: "¿Puedo cambiar de dominio después de activar?", a: "No sin reactivar la licencia. Cada licencia está vinculada a un dominio específico para evitar clonación. Contactá soporte para migraciones." },
              { q: "¿Funciona en Argentina, México, España?", a: "Sí. WabiSend funciona en cualquier país donde WhatsApp esté disponible. El idioma y la zona horaria se configuran en el setup wizard." },
              { q: "¿Puedo instalarlo en un VPS compartido?", a: "Sí, pero recomendamos VPS dedicado o Railway/DigitalOcean para mejor rendimiento. El keep-alive de Baileys necesita estabilidad." },
              { q: "¿Qué pasa si se cae el servidor durante un envío?", a: "Los mensajes ya enviados quedan registrados. Los pendientes se marcan como fallidos. Al reiniciar, podés clonar la campaña y reenviar desde el punto de corte." },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <HelpCircle size={14} className="text-cyan-400" /> {item.q}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <DocNextUp onSelect={onSelectArticle} title="Variables de entorno" slug="env-vars" section="Referencia técnica" />
        </>
      )

    case "env-vars":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "env-vars")!} sectionTitle="Referencia técnica" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Variables de entorno necesarias para el correcto funcionamiento de WabiSend.
          </p>
          <DocCode code={`DATABASE_URL=postgresql://user:pass@host:5432/db\nJWT_SECRET=tu_secreto_super_seguro_min_32_chars\nNEXT_PUBLIC_API_URL=https://api.tudominio.com\nBACKEND_URL=https://api.tudominio.com\nREDIS_URL=redis://default:pass@host:6379  # opcional\nOPENAI_API_KEY=sk-...  # opcional, para IA\nPROXY_LIST=socks5://...  # opcional, para rotate`} lang="env" />
          <DocCallout type="info">
            <code className="text-cyan-400">JWT_SECRET</code> debe tener al menos 32 caracteres. Si es muy corto, la autenticación fallará silenciosamente.
          </DocCallout>
          <DocNextUp onSelect={onSelectArticle} title="Endpoints API clave" slug="api-endpoints" section="Referencia técnica" />
        </>
      )

    case "api-endpoints":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "api-endpoints")!} sectionTitle="Referencia técnica" />
          <p className="text-slate-300 leading-relaxed mb-4">
            Endpoints principales del backend. Todos requieren <code className="text-cyan-400 bg-slate-800 px-1 rounded">Authorization: Bearer TOKEN</code> excepto login y registro.
          </p>
          <div className="space-y-4 mb-6">
            {[
              { method: "POST", path: "/api/auth/login", desc: "Autenticación de usuario" },
              { method: "POST", path: "/api/auth/register", desc: "Registro de nuevo usuario" },
              { method: "GET", path: "/api/me", desc: "Datos del usuario autenticado" },
              { method: "POST", path: "/api/license/activate", desc: "Activar licencia con key" },
              { method: "GET", path: "/api/license/status", desc: "Estado de licencia actual" },
              { method: "GET", path: "/api/campaigns", desc: "Listar campañas del usuario" },
              { method: "POST", path: "/api/campaigns", desc: "Crear nueva campaña" },
              { method: "POST", path: "/api/campaigns/:id/start", desc: "Iniciar campaña" },
              { method: "POST", path: "/api/campaigns/:id/cancel", desc: "Cancelar campaña en vivo" },
              { method: "GET", path: "/api/campaigns/:id/logs", desc: "Logs de campaña (enriquecidos)" },
              { method: "GET", path: "/api/campaigns/report", desc: "Reportes con métricas" },
              { method: "GET", path: "/api/replies/global", desc: "Respuestas globales (Pro)" },
              { method: "GET", path: "/api/contacts", desc: "Listar contactos" },
              { method: "POST", path: "/api/contacts/import", desc: "Importar CSV" },
              { method: "GET", path: "/api/tags", desc: "Listar tags" },
              { method: "GET", path: "/api/lineas", desc: "Listar líneas WhatsApp" },
              { method: "POST", path: "/api/lineas/connect", desc: "Conectar nueva línea (QR)" },
            ].map((ep, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {ep.method}
                </span>
                <code className="text-sm text-cyan-400 font-mono">{ep.path}</code>
                <span className="text-xs text-slate-500 ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
          <DocNextUp onSelect={onSelectArticle} title="Changelog" slug="changelog" section="Referencia técnica" />
        </>
      )

    case "changelog":
      return (
        <>
          <DocHero article={ALL_ARTICLES.find(a => a.slug === "changelog")!} sectionTitle="Referencia técnica" />
          <div className="space-y-6 mb-6">
            <div className="relative pl-6 border-l-2 border-cyan-500/30">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <p className="text-xs text-cyan-400 font-bold mb-1">v3.12 — Junio 2026</p>
              <ul className="space-y-1.5">
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> ConnectionMonitor con modal de desconexión</li>
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> Proxy Rotate dinámico por campaña</li>
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> Blacklist auto con detección de keywords</li>
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> Tracking de respuestas con cruce de contactos</li>
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> LID mappings para identificación robusta</li>
                <li className="text-sm text-slate-300 flex items-start gap-2"><Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" /> Baileys v7 upgrade</li>
              </ul>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-700/30">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-600" />
              <p className="text-xs text-slate-500 font-bold mb-1">v3.9 — Mayo 2026</p>
              <ul className="space-y-1.5">
                <li className="text-sm text-slate-400">Modo simulacro lite y full</li>
                <li className="text-sm text-slate-400">Modo humano con pausas aleatorias</li>
                <li className="text-sm text-slate-400">Spintax avanzado con preview</li>
                <li className="text-sm text-slate-400">Programación de campañas</li>
              </ul>
            </div>
            <div className="relative pl-6 border-l-2 border-slate-700/30">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-600" />
              <p className="text-xs text-slate-500 font-bold mb-1">v3.0 — Abril 2026</p>
              <ul className="space-y-1.5">
                <li className="text-sm text-slate-400">Lanzamiento inicial WabiSend</li>
                <li className="text-sm text-slate-400">Campañas masivas con Baileys</li>
                <li className="text-sm text-slate-400">Dashboard con métricas básicas</li>
                <li className="text-sm text-slate-400">Sistema de licencias self-hosted</li>
              </ul>
            </div>
          </div>
        </>
      )

    default:
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-bold text-white mb-2">Seleccioná un artículo</p>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Elegí una sección del sidebar para empezar a aprender. O usá <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">Ctrl K</kbd> para buscar.
          </p>
        </div>
      )
  }
}

// ============================================================
// PAGE PRINCIPAL
// ============================================================
export default function DocsPage() {
  const router = useRouter()
  const [activeSlug, setActiveSlug] = useState<string>("")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["start"]))
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Toggle sección
  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Seleccionar artículo
  const selectArticle = useCallback((slug: string) => {
    setActiveSlug(slug)
    // Expandir la sección correspondiente
    const section = ALL_ARTICLES.find(a => a.slug === slug)?.sectionId
    if (section) {
      setExpandedSections(prev => new Set(Array.from(prev).concat(section)))

    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  // Artículo activo actual
  const activeArticle = ALL_ARTICLES.find(a => a.slug === activeSlug)

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 bottom-0 z-40 bg-[#0f172a] border-r border-slate-700/30 overflow-hidden flex flex-col"
          >
            {/* Header sidebar */}
            <div className="p-4 border-b border-slate-700/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-cyan-400" />
                </div>
                <span className="font-bold text-sm">Docs</span>
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition"
              >
                <Search size={14} />
                <span className="flex-1 text-left">Buscar...</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50">
                  <Command size={10} />
                  <span className="text-[10px] font-bold">K</span>
                </div>
              </button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {DOC_TREE.map(section => {
                const isExpanded = expandedSections.has(section.id)
                const Icon = section.icon
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                        isExpanded ? "text-white bg-slate-800/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                      }`}
                    >
                      <Icon size={14} className={isExpanded ? "text-cyan-400" : "text-slate-500"} />
                      <span className="flex-1 text-left">{section.title}</span>
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-2 space-y-0.5 mt-1">
                            {section.articles.map(article => {
                              const isActive = activeSlug === article.slug
                              return (
                                <button
                                  key={article.id}
                                  onClick={() => selectArticle(article.slug)}
                                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                                    isActive
                                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                                  }`}
                                >
                                  <span className="flex-1 truncate">{article.title}</span>
                                  {article.isNew && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase">Nuevo</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Footer sidebar */}
            <div className="p-3 border-t border-slate-700/30">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <BadgeCheck size={12} className="text-emerald-400" />
                <span>WabiSend v3.12</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-700/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <Layers size={18} />
            </button>
            <span className="text-xs text-slate-500">Documentación</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-xs text-slate-400 hover:text-white transition"
            >
              <Search size={14} />
              <span>Buscar...</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-[10px] text-slate-500">Ctrl K</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 hover:bg-cyan-500/20 transition"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="max-w-3xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ArticleContent slug={activeSlug} onSelectArticle={selectArticle} />
            </motion.div>
          </AnimatePresence>

          {/* Footer docs */}
          {!activeSlug && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 pt-10 border-t border-slate-700/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Zap, title: "Empezar ahora", desc: "Setup wizard, licencia y primera línea en 10 minutos.", slug: "welcome" },
                  { icon: Send, title: "Crear campaña", desc: "Guía paso a paso para enviar tu primer mensaje masivo.", slug: "create-basic" },
                  { icon: ShieldAlert, title: "Anti-ban", desc: "Checklist completo para proteger tus líneas.", slug: "anti-ban" },
                ].map((card, i) => (
                  <button
                    key={i}
                    onClick={() => selectArticle(card.slug)}
                    className="text-left p-5 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition group"
                  >
                    <card.icon size={20} className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white mb-1">{card.title}</p>
                    <p className="text-xs text-slate-400">{card.desc}</p>
                  </button>
                ))}
              </div>

              {/* Legal / Bootstrap footer */}
              <div className="mt-10 p-6 rounded-2xl bg-slate-800/20 border border-slate-700/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <BadgeCheck size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">WabiSend es 100% self-hosted</p>
                    <p className="text-xs text-slate-400">Tus datos, tu infraestructura, tu control.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sin costos por mensaje. Sin intermediarios. Sin APIs oficiales.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instalación en 10 minutos con Docker, Railway o VPS.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Código abierto en tu servidor. Licencia de por vida por dominio.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Actualizaciones automáticas de seguridad y compatibilidad Baileys.</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/20 flex items-center justify-between text-[10px] text-slate-500">
                  <span>© 2026 WabiSend. Todos los derechos reservados.</span>
                  <span className="flex items-center gap-1">
                    <FileText size={10} /> Términos de uso · Política de privacidad
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={selectArticle} />
    </div>
  )
}