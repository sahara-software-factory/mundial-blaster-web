"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Sparkles,
  KeyRound,
  Check,
  Loader2,
  Wand2,
  Copy,
  Send,
  Save,
  Trash2,
  Plus,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Clock,
  ChevronRight,
  Lightbulb,
  Zap,
  Flame,
  Smile,
  Smartphone,
  Bookmark,
  X,
  BarChart3,
  LayoutTemplate,
  History,
  Type,
  Globe,
  ShieldCheck,
} from "lucide-react"
import { useLicense } from "@/hooks/useLicense"
import { useUpgradeModal } from "../../components/UpgradeModalProvider"
import { Sidebar } from "@/app/components/ui/sidebar"

/* ═══════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════ */
interface Prompt {
  id: string
  title: string
  instruction: string
  results: string[]
  createdAt: string
}

interface DemoPrompt {
  title: string
  instruction: string
  results: string[]
}

/* ═══════════════════════════════════════
   HELPERS VISUALES
   ═══════════════════════════════════════ */
function WhatsAppPreview({ text }: { text: string }) {
  const demoName = "Juan Pérez"
  const preview = text
    .replace(/\{\{nombre\}\}/gi, demoName)
    .replace(/\{nombre\}/gi, demoName)
    .replace(/\{\{telefono\}\}/gi, "5491123456789")
    .replace(/\{telefono\}/gi, "5491123456789")

  return (
    <div className="bg-[#0b141a] rounded-2xl p-3 w-full max-w-[260px] border border-[#2a3942] shadow-xl shrink-0">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#2a3942]">
        <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">
          JP
        </div>
        <div className="text-[10px] text-[#8696a0] truncate">+54 9 11 2345-6789</div>
      </div>
      <div className="flex justify-end">
        <div className="bg-[#005c4b] text-white text-xs p-2.5 rounded-lg rounded-tr-none max-w-[90%] relative">
          <p className="leading-relaxed whitespace-pre-wrap break-words">{preview}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[9px] text-emerald-200">15:42</span>
            <svg className="w-3 h-3 text-emerald-300" fill="currentColor" viewBox="0 0 16 15">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879a.32.32 0 01-.484.033l-.358-.325a.319.319 0 00-.484.032l-.378.483a.418.418 0 00.036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 00-.064-.512zm-4.1 0l-.478-.372a.365.365 0 00-.51.063L4.566 9.879a.32.32 0 01-.484.033L1.891 7.769a.366.366 0 00-.515.006l-.423.433a.364.364 0 00.006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 00-.063-.51z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className={`p-4 rounded-xl border ${bg} border-[var(--border-color)]/40 flex items-center gap-3`}>
      <div className={`p-2 rounded-lg ${bg} ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   DATOS DEMO
   ═══════════════════════════════════════ */
const DEMO_PROMPTS: DemoPrompt[] = [
  {
    title: "Promo flash verano",
    instruction: "Promo flash 24hs: 30% OFF en zapatillas. Tono urgente, argentino, con emojis. Máximo 2 líneas. Usar {nombre}.",
    results: [
      "🔥 {nombre} ¡Últimas 24hs! 30% OFF en zapatillas. No te quedes sin las tuyas 👟⚡",
      "👟 {nombre}, se acaba el verano y las zapatillas con 30% OFF también. Aprovechá ahora 🏃‍♂️💨",
      "⚡ {nombre}: promo flash 30% OFF. Stock limitado. Escribí YA y reservá tu par 🔥",
      "🌞 {nombre}, el calor pasa pero el descuento se va. 30% OFF en zapatillas por hoy 👟✨",
      "🏃‍♂️ {nombre} ¡CORRE! 30% OFF en zapatillas solo por 24 horas. Te la vas a perder? 👟🔥"
    ]
  },
  {
    title: "Bienvenida tienda",
    instruction: "Mensaje de bienvenida para nuevos clientes. Tono cálido, light, sin emojis excesivos. Usar {nombre}.",
    results: [
      "Hola {nombre} 👋 Bienvenido a Miachik. Ya podés ver todas las novedades que tenemos para vos.",
      "{nombre}, gracias por sumarte 🙌 Cualquier duda escribinos por acá.",
      "¡Hola {nombre}! 🎉 Ya estás adentro. Te avisamos antes que nadie de las promos.",
      "{nombre}, bienvenido al club 👟✨ Envío gratis en tu primera compra.",
      "Hola {nombre} 👋 Gracias por confiar en nosotros. Estamos para lo que necesites."
    ]
  },
  {
    title: "Reactivación clientes",
    instruction: "Reactivar clientes que no compran hace 3 meses. Tono cercano, con emojis. Usar {nombre}. Máximo 2 líneas.",
    results: [
      "{nombre} 👋 Te extrañamos. Volvé con 20% OFF en tu próxima compra 🎁",
      "¡{nombre}! Hace rato que no nos escribís 👟 Tenemos novedades con tu nombre.",
      "{nombre} 💌 Te guardamos un descuento exclusivo por volver. ¿Hablamos?",
      "👋 {nombre}, el stock se renueva y vos faltás. 20% OFF por tiempo limitado.",
      "{nombre} 🏠 Tu lugar en Miachik sigue esperándote. 20% OFF para volver."
    ]
  }
]

/* ═══════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════ */
export default function AIPage() {
  const { license, checked } = useLicense()
  const { openUpgrade } = useUpgradeModal()
  const tier = license?.tier || 'starter'
  const isBusiness = tier === 'business'

  // Detectar demo desde token (igual que en otros módulos)
  const [isDemo] = useState(() => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('mb_token')
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.is_demo === true
    } catch { return false }
  })

  /* ─── Estados ─── */
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [hasKey, setHasKey] = useState(false)

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null)
  const [title, setTitle] = useState("")
  const [instruction, setInstruction] = useState("")
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'prompts' | 'tools' | 'history'>('generate')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [estCost, setEstCost] = useState("~$0.00")

  const [aiFeatures, setAiFeatures] = useState({
  ai_audit_enabled: false,
  ai_title_enabled: false,
  ai_summary_enabled: false,
  ai_translate_enabled: false
})

// Cargar features al montar
useEffect(() => {
  if (isDemo) return
  const loadFeatures = async () => {
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/me/ai-features', {
        headers: { Authorization: `Bearer ${t}` }
      })
      const data = await res.json()
      if (data.features) setAiFeatures(data.features)
    } catch {}
  }

  
  loadFeatures()
}, [isDemo])

const toggleFeature = async (feature: string, current: boolean) => {
  if (isDemo) { toast.info("🎮 Features en modo real"); return }
  try {
    const t = localStorage.getItem('mb_token') || ''
    const res = await fetch('/api/me/ai-features', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${t}` 
      },
      body: JSON.stringify({ feature, enabled: !current })
    })
    if (res.ok) {
      setAiFeatures(prev => ({ ...prev, [feature]: !current }))
      toast.success(!current ? 'Feature activada' : 'Feature desactivada')
    }
  } catch {
    toast.error('Error actualizando feature')
  }
}
  /* ─── Cargar desde localStorage / demo ─── */
  /* ─── Cargar desde localStorage / demo ─── */
  useEffect(() => {
    if (isDemo) {
      setHasKey(true)
      setSavedKey("sk-demo-wabisend")
      setEstCost("~$0.42")  // ← Demo: número realista
      const raw = localStorage.getItem("wabisend_ai_prompts")
      if (raw) {
        try { setPrompts(JSON.parse(raw)) } catch {}
      }
      return
    }

    const loadConfig = async () => {
      try {
        const t = localStorage.getItem('mb_token') || ''
        
        // API key
        const res = await fetch('/api/openai/config', {
          headers: { Authorization: `Bearer ${t}` },
          cache: 'no-store'
        })
        const data = await res.json()
        if (data.hasKey) {
          setHasKey(true)
          setSavedKey(data.keyPreview || 'sk-...•••')
        }

        // Estimación de costo
        const estRes = await fetch('/api/ai/estimate', {
          headers: { Authorization: `Bearer ${t}` },
          cache: 'no-store'
        })
        const estData = await estRes.json()
        if (estData.estimatedCost !== undefined) {
          setEstCost(estData.estimatedCost > 0 ? `~$${estData.estimatedCost.toFixed(2)}` : '~$0.00')
        }
      } catch {}
    }
    loadConfig()
    loadPromptsFromApi()
  }, [isDemo])

  const loadPromptsFromApi = async () => {
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/ai/prompts', {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      const mapped = (data.prompts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        instruction: p.instruction,
        results: Array.isArray(p.results) ? p.results : [],
        createdAt: p.createdAt
      }))
      setPrompts(mapped)
    } catch (e) {
      console.error('Error cargando prompts:', e)
    }
  }

    const verifyAndSaveKey = async () => {
    if (!apiKey.trim()) return toast.error("Pegá tu API key de OpenAI")
    if (isDemo) return toast.error("En modo demo usá los ejemplos pre-cargados")

    setVerifying(true)
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/openai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ apiKey: apiKey.trim(), model: 'gpt-4o-mini' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error guardando key')

      setSavedKey(data.keyPreview || 'sk-...•••')
      setHasKey(true)
      setApiKey('')
      toast.success("API key verificada y guardada en la nube")
    } catch (e: any) {
      toast.error(e.message || "Error verificando la API key")
    } finally {
      setVerifying(false)
    }
  }

    const removeKey = async () => {
    if (isDemo) {
      setSavedKey(null)
      setHasKey(false)
      setApiKey('')
      return
    }
    try {
      const t = localStorage.getItem('mb_token') || ''
      await fetch('/api/openai/config', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      })
      setSavedKey(null)
      setHasKey(false)
      setApiKey('')
      toast.success("API key eliminada")
    } catch {
      toast.error("Error eliminando key")
    }
  }

   const generateMessages = async () => {
    if (!instruction.trim()) return toast.error("Escribí una instrucción")
    if (!hasKey && !isDemo) return toast.error("Configurá tu API key primero")

    if (isDemo) {
      setGenerating(true)
      setResults([])
      setTimeout(() => {
        const demo = DEMO_PROMPTS.find(d => d.instruction === instruction) || DEMO_PROMPTS[0]
        setResults(demo.results)
        setGenerating(false)
        toast.success(`${demo.results.length} mensajes generados`)
      }, 1500)
      return
    }

    setGenerating(true)
    setResults([])
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({
          instruction: instruction.trim(),
          temperature: 0.9,
          maxTokens: 600
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error de generación')

      setResults(data.lines || [])
      toast.success(`${data.lines?.length || 0} mensajes generados`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

    const savePrompt = async () => {
    if (!title.trim() || !instruction.trim()) return toast.error("Completá título e instrucción")
    
    if (isDemo) {
      // Demo: localStorage como antes
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        title: title.trim(),
        instruction: instruction.trim(),
        results: [...results],
        createdAt: new Date().toISOString()
      }
      const updated = [newPrompt, ...prompts]
      setPrompts(updated)
      localStorage.setItem("wabisend_ai_prompts", JSON.stringify(updated))
      toast.success("Prompt guardado (demo)")
      return
    }

    setIsSaving(true)
    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch('/api/ai/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({
          title: title.trim(),
          instruction: instruction.trim(),
          results: [...results]
        })
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      if (data.success) {
        toast.success("Prompt guardado en la nube")
        await loadPromptsFromApi()
      }
    } catch (e) {
      toast.error("Error guardando prompt")
    } finally {
      setIsSaving(false)
    }
  }

   const deletePrompt = async (id: string) => {
    if (isDemo) {
      const updated = prompts.filter(p => p.id !== id)
      setPrompts(updated)
      localStorage.setItem("wabisend_ai_prompts", JSON.stringify(updated))
      if (activePrompt?.id === id) {
        setActivePrompt(null)
        setTitle("")
        setInstruction("")
        setResults([])
      }
      return
    }

    try {
      const t = localStorage.getItem('mb_token') || ''
      const res = await fetch(`/api/ai/prompts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      })
      if (!res.ok) throw new Error('fail')
      toast.success("Prompt eliminado")
      await loadPromptsFromApi()
      if (activePrompt?.id === id) {
        setActivePrompt(null)
        setTitle("")
        setInstruction("")
        setResults([])
      }
    } catch (e) {
      toast.error("Error eliminando prompt")
    }
  }

  const loadPrompt = (prompt: Prompt) => {
    setActivePrompt(prompt)
    setTitle(prompt.title)
    setInstruction(prompt.instruction)
    setResults(prompt.results)
    setActiveTab('generate')
  }

  const loadDemoInstruction = (demo: DemoPrompt) => {
    setTitle(demo.title)
    setInstruction(demo.instruction)
    setResults([])
    setActivePrompt(null)
    setActiveTab('generate')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const useInCampaign = (text: string) => {
    localStorage.setItem("wabisend_ai_message", text)
    toast.success("Mensaje cargado en campaña")
  }

  const insertVariable = (v: string) => {
    setInstruction(prev => prev ? prev + ' ' + v : v)
  }

  const newPrompt = () => {
    setActivePrompt(null)
    setTitle("")
    setInstruction("")
    setResults([])
    setPreviewIndex(null)
  }

  /* ─── Stats ─── */
  const todayCount = isDemo ? 12 : prompts.length
  const savedCount = isDemo ? 8 : prompts.length
  // const estCost = isDemo ? "~$0.42" : "~$0.00"

  /* ═══════════════════════════════════════
     RENDER: UPGRADE (no business)
     ═══════════════════════════════════════ */
  if (!isBusiness && checked) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        <Sidebar onSettings={() => {}} />
        <div className="flex-1 min-w-0 p-6 lg:p-10" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Asistente IA</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
                Generá mensajes de venta con inteligencia artificial, spintax automático y variantes ilimitadas. 
                Solo disponible en el plan Business.
              </p>
              <div className="space-y-3 max-w-sm mx-auto text-left mb-8">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                  Generá mensajes con un click
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                  Variables automáticas: nombre, telefono
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Save className="w-4 h-4 text-purple-400 shrink-0" />
                  Guardá prompts ilimitados
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                  Preview real de WhatsApp
                </div>
              </div>
              <button
                onClick={() => openUpgrade('business')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Upgrade a Business
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════
     RENDER: MAIN
     ═══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      <div className="flex-1 min-w-0 p-4 lg:p-8" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        <div className="max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Asistente IA
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Generá mensajes de venta con inteligencia artificial
              </p>
            </div>
            {hasKey && (
              <button
                onClick={newPrompt}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                Nuevo prompt
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={BarChart3} label="Generaciones hoy" value={todayCount} color="text-purple-400" bg="bg-purple-500/5" />
            <StatCard icon={LayoutTemplate} label="Prompts guardados" value={savedCount} color="text-blue-400" bg="bg-blue-500/5" />
            <StatCard icon={Zap} label="Variantes totales" value={isDemo ? 15 : results.length + prompts.reduce((a, p) => a + p.results.length, 0)} color="text-amber-400" bg="bg-amber-500/5" />
            <StatCard icon={Clock} label="Est. costo mensual" value={estCost} color="text-emerald-400" bg="bg-emerald-500/5" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[var(--bg-input)] rounded-xl mb-6 w-fit">
            {[
              { id: 'generate' as const, label: 'Generar', icon: Wand2 },
              { id: 'prompts' as const, label: 'Mis Prompts', icon: Bookmark },
              { id: 'tools' as const, label: 'Implementaciones', icon: Zap }, 
              { id: 'history' as const, label: 'Historial', icon: History },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB: GENERAR ═══ */}
          {activeTab === 'generate' && (
            <div className="grid xl:grid-cols-3 gap-6">
              {/* Columna izquierda: formulario */}
              <div className="xl:col-span-2 space-y-6">
                <AnimatePresence>
                  {!hasKey && !isDemo ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-8"
                    >
                      <div className="max-w-xl mx-auto text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                          <KeyRound className="w-7 h-7 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                          Configurá tu API key de OpenAI
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
                          WabiSend no cobra por el uso de IA. Vos pagás directamente a OpenAI lo que consumís.
                          Agregá tu API key y empezá a generar mensajes.
                        </p>
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="password"
                              value={apiKey}
                              onChange={e => setApiKey(e.target.value)}
                              placeholder="sk-..."
                              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 pr-12 text-sm text-[var(--text-primary)] placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                            />
                            <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                          </div>
                          <button
                            onClick={verifyAndSaveKey}
                            disabled={verifying || !apiKey.trim()}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                              apiKey.trim() && !verifying
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            {verifying ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                            ) : (
                              <><Check className="w-4 h-4" /> Verificar y guardar</>
                            )}
                          </button>
                        </div>
                        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-left">
                          <p className="text-xs text-amber-200/80 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                            <span>
                              Tu API key se guarda en tu navegador. Nunca la compartimos.
                              Podés obtener una en{" "}
                              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-1">
                                platform.openai.com <ExternalLink className="w-3 h-3" />
                              </a>
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Formulario */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                              Título del prompt
                            </label>
                            <input
                              type="text"
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                              placeholder="Ej: Promo verano zapatillas"
                              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                Instrucción
                              </label>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                Sé específico: producto, tono, descuento, urgencia
                              </span>
                            </div>

                            {/* Toolbar variables */}
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                              {['{nombre}', '{telefono}', '{producto}', '{precio}'].map(v => (
                                <button
                                  key={v}
                                  onClick={() => insertVariable(v)}
                                  className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors font-mono"
                                >
                                  {v}
                                </button>
                              ))}
                              <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
                              <button onClick={() => setInstruction(prev => prev + ' 🔥')} className="text-[10px] px-2 py-1 hover:bg-white/5 rounded-md transition-colors">🔥</button>
                              <button onClick={() => setInstruction(prev => prev + ' ⚡')} className="text-[10px] px-2 py-1 hover:bg-white/5 rounded-md transition-colors">⚡</button>
                              <button onClick={() => setInstruction(prev => prev + ' 👟')} className="text-[10px] px-2 py-1 hover:bg-white/5 rounded-md transition-colors">👟</button>
                              <button onClick={() => setInstruction(prev => prev + ' 🎉')} className="text-[10px] px-2 py-1 hover:bg-white/5 rounded-md transition-colors">🎉</button>
                            </div>

                            <textarea
                              value={instruction}
                              onChange={e => setInstruction(e.target.value)}
                              placeholder="Quiero vender zapatillas con 20% OFF. Tono informal, argentino, con emojis. Incluir {nombre}."
                              rows={4}
                              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                            />
                          </div>

                          {/* Modos predefinidos */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Modo urgencia", icon: Flame, text: "Promo flash 24hs. Tono urgente, argentino, con emojis. Usar {nombre}. Máximo 2 líneas." },
                              { label: "Más emojis", icon: Smile, text: "Mensaje divertido y visual con muchos emojis. Tono joven. Usar {nombre}. 2 líneas." },
                              { label: "Modo light", icon: Lightbulb, text: "Mensaje suave, sin emojis excesivos, tono profesional pero cercano. Usar {nombre}. 2 líneas." },
                              { label: "Reactivación", icon: Zap, text: "Reactivar cliente que no compra hace 3 meses. Tono cercano, con emojis. Usar {nombre}. 2 líneas." },
                            ].map(mode => (
                              <button
                                key={mode.label}
                                onClick={() => {
                                  setTitle(mode.label)
                                  setInstruction(mode.text)
                                }}
                                className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg border transition-all ${
                                  instruction === mode.text
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                    : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                }`}
                              >
                                <mode.icon size={10} /> {mode.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={generateMessages}
                              disabled={generating || !instruction.trim()}
                              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                instruction.trim() && !generating
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25"
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              {generating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                              ) : (
                                <><Wand2 className="w-4 h-4" /> Generar mensajes</>
                              )}
                            </button>
                                                        <button
                              onClick={savePrompt}
                              disabled={!title.trim() || !instruction.trim() || isSaving}
                              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                title.trim() && instruction.trim() && !isSaving
                                  ? "bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-purple-500/30"
                                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
                              }`}
                            >
                              {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                              ) : (
                                <><Save className="w-4 h-4" /> Guardar</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Skeleton loading */}
                      {generating && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-32 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] animate-pulse" />
                          ))}
                        </div>
                      )}

                      {/* Resultados */}
                      <AnimatePresence>
                        {results.length > 0 && !generating && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                {results.length} variantes generadas
                              </h3>
                              <button
                                onClick={() => setPreviewIndex(previewIndex === null ? 0 : null)}
                                className="text-[10px] px-2.5 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                              >
                                <Smartphone size={10} />
                                {previewIndex === null ? 'Ver en WhatsApp' : 'Ocultar preview'}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {results.map((result, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]/40 group relative"
                                >
                                  <div className="flex gap-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed mb-3">
                                        {result}
                                      </p>
                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => copyToClipboard(result)}
                                          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                        >
                                          <Copy className="w-3 h-3" /> Copiar
                                        </button>
                                       <button
  onClick={() => copyToClipboard(result)}
  className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
>
  <Copy className="w-3 h-3" /> Copiar
</button>
                                        <button
                                          onClick={() => setPreviewIndex(i)}
                                          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                                        >
                                          <Smartphone className="w-3 h-3" /> Preview
                                        </button>
                                      </div>
                                    </div>
                                    {previewIndex === i && (
                                      <div className="hidden xl:block">
                                        <WhatsAppPreview text={result} />
                                      </div>
                                    )}
                                  </div>
                                  {previewIndex === i && (
                                    <div className="xl:hidden mt-3">
                                      <WhatsAppPreview text={result} />
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Columna derecha: sidebar info */}
              <div className="space-y-4">
                {/* Info API key */}
                {hasKey && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        {isDemo ? 'Modo demo activo' : 'API key activa'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mb-3 font-mono">
                      {isDemo ? 'sk-demo-wabisend' : `${savedKey?.slice(0, 8)}...${savedKey?.slice(-4)}`}
                    </p>
                    {!isDemo && (
                      <button
                        onClick={removeKey}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Eliminar key
                      </button>
                    )}
                  </div>
                )}

                {/* Prompts recientes (mini lista) */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">Recientes</h3>
                    <span className="text-[10px] text-[var(--text-muted)]">{prompts.length}</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {prompts.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] text-center py-4">
                        No hay prompts guardados
                      </p>
                    ) : (
                      prompts.slice(0, 5).map(p => (
                        <button
                          key={p.id}
                          onClick={() => loadPrompt(p)}
                          className="w-full text-left p-2.5 rounded-lg bg-[var(--bg-input)]/50 hover:bg-[var(--bg-input)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                        >
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate">{p.instruction}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Consejos
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Usá {nombre} para personalizar automáticamente",
                      "Mensajes cortos = más lecturas en WhatsApp",
                      "1 emoji cada 3-4 palabras es el sweet spot",
                      "Probá el modo 'urgencia' para promos flash",
                    ].map((tip, i) => (
                      <li key={i} className="text-[10px] text-[var(--text-muted)] flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: MIS PROMPTS ═══ */}
          {activeTab === 'prompts' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Prompts guardados</h3>
                <span className="text-xs text-[var(--text-muted)]">{prompts.length} total</span>
              </div>
              {prompts.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-8 h-8 text-[var(--text-muted)]/30 mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">No tenés prompts guardados todavía</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {DEMO_PROMPTS.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => loadDemoInstruction(d)}
                        className="text-[10px] px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-colors"
                      >
                        {d.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prompts.map(p => (
                    <div
                      key={p.id}
                      className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]/40 hover:border-purple-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{p.title}</h4>
                        <button
                          onClick={() => deletePrompt(p.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mb-3 line-clamp-2">{p.instruction}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadPrompt(p)}
                          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          Cargar
                        </button>
                        <span className="text-[10px] text-[var(--text-muted)]">{p.results.length} variantes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


{activeTab === 'tools' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Card: Auditor Anti-Ban */}
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Auditor Anti-Ban</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">BETA</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Analiza tu mensaje antes de enviar y detecta riesgos de ban: mayúsculas excesivas, links en primer mensaje, falta de spintax, etc.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Zap size={10} className="text-amber-400" /> Consume ~150 tokens
        </span>
        <button
  onClick={() => toggleFeature('ai_audit_enabled', aiFeatures.ai_audit_enabled)}
  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
    aiFeatures.ai_audit_enabled 
      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
  }`}
>
  {aiFeatures.ai_audit_enabled ? 'Activado ✓' : 'Activar'}
</button>
      </div>
    </div>

    {/* Card: Traductor */}
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Traductor + Spintax</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">PRO</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Escribí en español y traducí a portugués, inglés o francés manteniendo el spintax y las variables.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Zap size={10} className="text-amber-400" /> Consume ~300 tokens
        </span>
       <button
  onClick={() => toggleFeature('ai_translate_enabled', aiFeatures.ai_translate_enabled)}
  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
    aiFeatures.ai_translate_enabled 
      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
  }`}
>
  {aiFeatures.ai_translate_enabled ? 'Activado ✓' : 'Activar'}
</button>
      </div>
    </div>

    {/* Card: Generador de Títulos */}
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Generador de Títulos</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">AUTO</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Genera automáticamente nombres de campaña basados en el mensaje y la fecha. Ej: "🔥 Flash Sale Junio 2026".
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Zap size={10} className="text-amber-400" /> Consume ~50 tokens
        </span>
        <button
  onClick={() => toggleFeature('ai_title_enabled', aiFeatures.ai_title_enabled)}
  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
    aiFeatures.ai_title_enabled 
      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
  }`}
>
  {aiFeatures.ai_title_enabled ? 'Activado ✓' : 'Activar'}
</button>
      </div>
    </div>

    {/* Card: Resumen Post-Campaña */}
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Resumen Post-Campaña</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AUTO</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        Al finalizar una campaña, Caleb genera un resumen ejecutivo con métricas, recomendaciones y alertas.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <Zap size={10} className="text-amber-400" /> Consume ~200 tokens
        </span>
        <button
  onClick={() => toggleFeature('ai_summary_enabled', aiFeatures.ai_summary_enabled)}
  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
    aiFeatures.ai_summary_enabled 
      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
  }`}
>
  {aiFeatures.ai_summary_enabled ? 'Activado ✓' : 'Activar'}
</button>
      </div>
    </div>

    {/* Banner tokens */}
    <div className="md:col-span-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
      <p className="text-xs text-amber-200/80">
        Todas las funciones de IA consumen tokens de tu API key de OpenAI. WabiSend no cobra por el uso de IA. Monitoreá tu consumo desde el dashboard de OpenAI.
      </p>
    </div>
  </div>
)}

          {/* ═══ TAB: HISTORIAL (demo / placeholder) ═══ */}
          {activeTab === 'history' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6">
              <div className="text-center py-12">
                <History className="w-8 h-8 text-[var(--text-muted)]/30 mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">Historial de generaciones</p>
                <p className="text-[10px] text-[var(--text-muted)]/60 mt-1">
                  Próximamente: estadísticas por prompt, tokens consumidos y costos reales.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}