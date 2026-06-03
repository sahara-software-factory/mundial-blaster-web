"use client"

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
  Lock
} from "lucide-react"
import { useLicense } from "@/hooks/useLicense"
import { useUpgradeModal } from "../../components/UpgradeModalProvider"
import { Sidebar } from "@/app/components/ui/sidebar"

interface Prompt {
  id: string
  title: string
  instruction: string
  results: string[]
  createdAt: string
}

export default function AIPage() {
  const { license } = useLicense()
  const { openUpgrade } = useUpgradeModal()
  const tier = license?.tier || 'starter'
  const isBusiness = tier === 'business'

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

  // Cargar API key y prompts guardados
  useEffect(() => {
    const key = localStorage.getItem("wabisend_openai_key")
    if (key) {
      setSavedKey(key)
      setHasKey(true)
    }
    const raw = localStorage.getItem("wabisend_ai_prompts")
    if (raw) {
      try { setPrompts(JSON.parse(raw)) } catch {}
    }
  }, [])

  const verifyAndSaveKey = async () => {
    if (!apiKey.trim()) return toast.error("Pegá tu API key de OpenAI")
    setVerifying(true)
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5
        })
      })
      if (!res.ok) throw new Error("API key inválida")
      localStorage.setItem("wabisend_openai_key", apiKey.trim())
      setSavedKey(apiKey.trim())
      setHasKey(true)
      toast.success("API key verificada y guardada")
    } catch (e: any) {
      toast.error(e.message || "Error verificando la API key")
    } finally {
      setVerifying(false)
    }
  }

  const removeKey = () => {
    localStorage.removeItem("wabisend_openai_key")
    setSavedKey(null)
    setHasKey(false)
    setApiKey("")
    toast.success("API key eliminada")
  }

  const generateMessages = async () => {
    if (!instruction.trim()) return toast.error("Escribí una instrucción")
    if (!savedKey) return toast.error("Configurá tu API key primero")
    setGenerating(true)
    setResults([])
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${savedKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Sos un asistente experto en marketing por WhatsApp. Generá 5 variantes de mensajes cortos (máximo 2 líneas cada uno) usando spintax con la sintaxis {{opción1|opción2|opción3}}. Incluí emojis naturales. Usá {{nombre}} para personalización. Respondé SOLO con los 5 mensajes, uno por línea, sin numerar, sin explicaciones.`
            },
            { role: "user", content: instruction }
          ],
          temperature: 0.9,
          max_tokens: 800
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || "Error de OpenAI")
      const text = data.choices?.[0]?.message?.content || ""
      const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean)
      setResults(lines)
      toast.success(`${lines.length} mensajes generados`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const savePrompt = () => {
    if (!title.trim() || !instruction.trim()) return toast.error("Completá título e instrucción")
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
    toast.success("Prompt guardado")
  }

  const deletePrompt = (id: string) => {
    const updated = prompts.filter(p => p.id !== id)
    setPrompts(updated)
    localStorage.setItem("wabisend_ai_prompts", JSON.stringify(updated))
    if (activePrompt?.id === id) {
      setActivePrompt(null)
      setTitle("")
      setInstruction("")
      setResults([])
    }
  }

  const loadPrompt = (prompt: Prompt) => {
    setActivePrompt(prompt)
    setTitle(prompt.title)
    setInstruction(prompt.instruction)
    setResults(prompt.results)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado")
  }

  const newPrompt = () => {
    setActivePrompt(null)
    setTitle("")
    setInstruction("")
    setResults([])
  }

  // Si no es Business, mostrar upgrade
  if (!isBusiness) {
return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        <Sidebar onSettings={() => {}} />
        <div className="flex-1 min-w-0 p-6 lg:p-10" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Asistente IA</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Generá mensajes de venta con inteligencia artificial, spintax automático y variantes ilimitadas. 
              Solo disponible en el plan Business.
            </p>
            <div className="space-y-3 max-w-sm mx-auto text-left mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                Generá mensajes con un click
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                Spintax automático incluido
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Save className="w-4 h-4 text-purple-400 shrink-0" />
                Guardá prompts ilimitados
              </div>
            </div>
            <button
              onClick={() => openUpgrade('pro')}
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      <div className="flex-1 min-w-0 p-6 lg:p-10" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo prompt
            </button>
          )}
        </div>

        {/* CONFIGURACIÓN DE API KEY */}
        <AnimatePresence>
          {!hasKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-8 mb-8"
            >
              <div className="max-w-xl mx-auto text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <KeyRound className="w-7 h-7 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Configurá tu API key de OpenAI
                </h2>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  NEXA no cobra por el uso de IA. Vos pagás directamente a OpenAI lo que consumís. 
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
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Verificar y guardar
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-left">
                  <p className="text-xs text-amber-200/80 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      Tu API key se guarda encriptada en tu navegador. Nunca la compartimos. 
                      Podés obtener una en{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-1"
                      >
                        platform.openai.com <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ASISTENTE (cuando hay API key) */}
        <AnimatePresence>
          {hasKey && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Sidebar de prompts guardados */}
              <div className="lg:col-span-1">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Prompts guardados</h3>
                    <span className="text-xs text-[var(--text-muted)]">{prompts.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {prompts.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)] text-center py-4">
                        No hay prompts guardados
                      </p>
                    )}
                    {prompts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => loadPrompt(p)}
                        className={`p-3 rounded-xl cursor-pointer transition-all group ${
                          activePrompt?.id === p.id
                            ? "bg-purple-500/10 border border-purple-500/20"
                            : "bg-[var(--bg-input)]/50 border border-transparent hover:border-[var(--border-color)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {p.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); deletePrompt(p.id) }}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                          {p.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info API key */}
                <div className="mt-4 p-4 bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">API key activa</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mb-3">
                    {savedKey?.slice(0, 8)}...{savedKey?.slice(-4)}
                  </p>
                  <button
                    onClick={removeKey}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    Eliminar key
                  </button>
                </div>
              </div>

              {/* Área de trabajo */}
              <div className="lg:col-span-2 space-y-6">
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
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
                        Instrucción
                      </label>
                      <textarea
                        value={instruction}
                        onChange={e => setInstruction(e.target.value)}
                        placeholder="Quiero vender zapatillas con 20% OFF. Tono informal, argentino, con emojis. Incluir spintax."
                        rows={4}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                      />
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
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Generar mensajes
                          </>
                        )}
                      </button>

                      <button
                        onClick={savePrompt}
                        disabled={!title.trim() || !instruction.trim()}
                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                          title.trim() && instruction.trim()
                            ? "bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-purple-500/30"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          {results.length} variantes generadas
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {results.map((result, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]/40 group"
                          >
                            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap mb-3 leading-relaxed">
                              {result}
                            </p>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => copyToClipboard(result)}
                                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                Copiar
                              </button>
                              <button
                                onClick={() => {
                                  localStorage.setItem("wabisend_ai_message", result)
                                  toast.success("Mensaje cargado en campaña")
                                }}
                                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                Usar en campaña
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>

  )
}