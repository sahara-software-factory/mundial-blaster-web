"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Edit3, 
  Send, 
  Eye, 
  Tag,
  X,
  Sparkles,
  Clock,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { Sidebar } from "../components/ui/sidebar"
import { PremiumModal } from "../components/ui/modal"

interface Template {
  id: string
  name: string
  content: string
  category: string
  variables: string[]
  usageCount: number
  createdAt: string
}

const CATEGORIES = ["General", "Promociones", "Recordatorios", "Bienvenida", "Seguimiento", "Reactivación"]

// Resolver spintax para preview: {{a|b|c}} → elige uno aleatorio
function resolveSpintax(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, options) => {
    const variants = options.split("|").map((s: string) => s.trim())
    return variants[Math.floor(Math.random() * variants.length)]
  })
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState<Template | null>(null)
  const [showUse, setShowUse] = useState<Template | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      
      const res = await fetch(`/api/templates?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch {
      toast.error("Error cargando templates")
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, token])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/templates/categories", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      // silent
    }
  }, [token])

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
  }, [fetchTemplates, fetchCategories])

  const handleCreate = async (form: any) => {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Template creado")
        setShowCreate(false)
        fetchTemplates()
        fetchCategories()
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const handleEdit = async (form: any) => {
    if (!showEdit) return
    try {
      const res = await fetch(`/api/templates/${showEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Template actualizado")
        setShowEdit(null)
        fetchTemplates()
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar template?")) return
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success("Template eliminado")
        fetchTemplates()
      }
    } catch {
      toast.error("Error eliminando")
    }
  }

  const handleClone = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}/clone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Template duplicado")
        fetchTemplates()
      }
    } catch {
      toast.error("Error duplicando")
    }
  }

  const handleUse = async (template: Template, variables: Record<string, string>) => {
    try {
      // Incrementar contador
      await fetch(`/api/templates/${template.id}/use`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Construir mensaje final reemplazando variables
      let finalMessage = template.content
      Object.entries(variables).forEach(([key, val]) => {
        finalMessage = finalMessage.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
      })
      
      // Guardar en localStorage para que la campaña lo recupere
      localStorage.setItem('mb_template_message', finalMessage)
      
      toast.success("Template cargado en campaña")
      setShowUse(null)
      
      // Redirigir a campaña
      router.push("/?tab=campaign")
      
    } catch {
      toast.error("Error usando template")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        
        {/* Header */}
        <header className="h-16 bg-[var(--bg-secondary)]/60 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText size={20} className="text-blue-400" /> Templates
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Biblioteca de mensajes reutilizables</p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus size={16} /> Nuevo Template
          </button>
        </header>

        <main className="p-6 space-y-6">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar templates..."
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${selectedCategory === "all" ? 'bg-blue-600 text-[var(--text-primary)] border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]'}`}
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-[var(--text-primary)] border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-hover)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        {template.category}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] mt-2">{template.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setShowEdit(template)} className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Editar">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleClone(template.id)} className="p-1.5 text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Duplicar">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => handleDelete(template.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-3 font-mono bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-color)]">
                    {template.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {template.variables.length > 0 && (
                        <div className="flex gap-1">
                          {template.variables.map(v => (
                            <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]">
                              {"{{"}{v}{"}}"}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <Clock size={10} /> {template.usageCount} usos
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowPreview(template)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)] hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button 
                        onClick={() => setShowUse(template)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-lg shadow-lg shadow-blue-500/20 transition-all"
                      >
                        <Send size={12} /> Usar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {templates.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center">
                <FileText size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-secondary)] text-sm">No hay templates</p>
                <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                  + Crear el primero
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: Crear Template */}
      <TemplateFormModal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSubmit={handleCreate}
        categories={CATEGORIES}
      />

      {/* MODAL: Editar Template */}
      {showEdit && (
        <TemplateFormModal 
          open={!!showEdit} 
          onClose={() => setShowEdit(null)} 
          onSubmit={handleEdit}
          categories={CATEGORIES}
          initial={showEdit}
        />
      )}

      {/* MODAL: Preview */}
      {showPreview && (
        <PremiumModal open={!!showPreview} onClose={() => setShowPreview(null)} title="Preview de Template">
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-400 font-medium">{showPreview.name}</p>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Estas son 3 variantes aleatorias de cómo se vería el mensaje:</p>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
                  <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{resolveSpintax(showPreview.content)}</p>
                </div>
              ))}
            </div>
            {showPreview.variables.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-[var(--text-muted)]">Variables detectadas:</span>
                {showPreview.variables.map(v => (
                  <span key={v} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {"{{"}{v}{"}}"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </PremiumModal>
      )}

      {/* MODAL: Usar Template */}
      {showUse && (
        <UseTemplateModal 
          open={!!showUse} 
          onClose={() => setShowUse(null)} 
          template={showUse}
          onConfirm={handleUse}
        />
      )}
    </div>
  )
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function TemplateFormModal({ open, onClose, onSubmit, categories, initial }: any) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    content: initial?.content || "",
    category: initial?.category || "General",
  })
  const [detectedVars, setDetectedVars] = useState<string[]>(initial?.variables || [])

const detectVariables = (text: string) => {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g)
  const vars = Array.from(matches).map(m => m[1])
  setDetectedVars(Array.from(new Set(vars)))
}



  return (
    <PremiumModal open={open} onClose={onClose} title={initial ? "Editar Template" : "Nuevo Template"}>
      <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ ...form, variables: detectedVars })
      }} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre *</label>
          <input 
            required 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="input-field" 
            placeholder="Ej: Promo Black Friday"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Categoría</label>
          <select 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})}
            className="input-field"
          >
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Contenido *</label>
          <textarea 
            required 
            rows={6}
            value={form.content} 
            onChange={e => {
              setForm({...form, content: e.target.value})
              detectVariables(e.target.value)
            }}
            className="input-field resize-none font-mono"
            placeholder="Hola {{nombre}}, tenemos 50% OFF en {{producto}}. Escribí YA para reservar. {{saludo|atentamente|un abrazo}}"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[var(--text-muted)]">
              Spintax: {"{{"}opcion1|opcion2|opcion3{"}}"}{" "} | Variables: {"{{"}nombre{"}}"}
            </span>
            {detectedVars.length > 0 && (
              <div className="flex gap-1">
                {detectedVars.map(v => (
                  <span key={v} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {"{{"}{v}{"}}"} detectado
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 btn-primary rounded-xl">{initial ? "Guardar" : "Crear"}</button>
        </div>
      </form>
    </PremiumModal>
  )
}

function UseTemplateModal({ open, onClose, template, onConfirm }: any) {
  const [values, setValues] = useState<Record<string, string>>({})

  return (
    <PremiumModal open={open} onClose={onClose} title="Usar Template">
      <div className="space-y-4">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm font-bold text-blue-400">{template.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{template.category}</p>
        </div>

        <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-mono">{template.content}</p>
        </div>

        {template.variables.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Completar variables</p>
            {template.variables.map((v: string) => (
              <div key={v}>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">{"{{"}{v}{"}}"}</label>
                <input
                  value={values[v] || ""}
                  onChange={e => setValues(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={`Valor para ${v}...`}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => onConfirm(template, values)}
          className="w-full btn-primary rounded-xl flex items-center justify-center gap-2"
        >
          <Send size={16} /> Cargar en Campaña
        </button>
      </div>
    </PremiumModal>
  )
}