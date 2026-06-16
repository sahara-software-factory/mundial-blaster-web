"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUpgradeModal } from "../../components/UpgradeModalProvider"

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
  CheckCircle2,
  Star,
  ImageIcon,
  Zap
} from "lucide-react"
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { Sidebar } from "../../components/ui/sidebar"
import { PremiumModal } from "../../components/ui/modal"
import { useLicense } from "@/hooks/useLicense"
import { useDemoMode } from "@/hooks/useDemo"

interface Template {
  id: string
  name: string
  content: string
  category: string
  variables: string[]
  usageCount: number
  createdAt: string
  imageUrl?: string | null      // ← NUEVO Pro
  isFavorite?: boolean           // ← NUEVO Pro
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
  const { license } = useLicense()
const isPro = license?.tier === 'pro' || license?.tier === 'business'

  
  const [templates, setTemplates] = useState<Template[]>([])
  // const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState<Template | null>(null)
  const [showUse, setShowUse] = useState<Template | null>(null)
  const { openUpgrade } = useUpgradeModal()
const { isDemo } = useDemoMode()
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

   const fetchTemplates = useCallback(async () => {
    setLoading(true)

    if (isDemo) {
      const demoTemplates: Template[] = [
        {
          id: "tpl-demo-1",
          name: "🔥 Black Friday Masivo",
          content: "{{Hola|Buenas|Hey}} {{nombre|amigo|crack}}, ¡tenemos 70% OFF en TODO el catálogo! Solo por hoy. {{Aprovechá|No te lo pierdas|Corré que vuela}} → https://mundialblaster.com/oferta\n\n⚡ Stock limitado. Respondé STOP para darte de baja.",
          category: "Promociones",
          variables: ["nombre"],
          usageCount: 1248,
          createdAt: "2026-05-28T10:00:00Z",
          imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600",
          isFavorite: true,
        },
        {
          id: "tpl-demo-2",
          name: "☀️ Promo Verano",
          content: "¡Hola {{nombre}}! Llegó el verano y con él nuestros descuentos de temporada. Hasta 50% OFF en productos seleccionados. Mirá acá: https://mundialblaster.com/verano 🏖️",
          category: "Promociones",
          variables: ["nombre"],
          usageCount: 892,
          createdAt: "2026-05-25T14:00:00Z",
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
          isFavorite: false,
        },
        {
          id: "tpl-demo-3",
          name: "🚀 Lanzamiento Producto X",
          content: "{{¡Atención|¡Ey|¡Hola}} {{nombre}}, el producto que esperabas YA está disponible. {{Reservá el tuyo|Pedí ahora|Comprá antes que se agote}} → https://mundialblaster.com/nuevo\n\n🎁 Primeros 100 compradores: envío gratis.",
          category: "Promociones",
          variables: ["nombre"],
          usageCount: 567,
          createdAt: "2026-05-22T09:00:00Z",
          imageUrl: null,
          isFavorite: true,
        },
        {
          id: "tpl-demo-4",
          name: "👋 Bienvenida Nuevos Leads",
          content: "¡Bienvenido a bordo {{nombre}}! 🎉 Gracias por confiar en nosotros. Acá tenés tu guía de inicio: https://mundialblaster.com/guia\n\n¿Tenés dudas? Escribinos por WhatsApp y te ayudamos.",
          category: "Bienvenida",
          variables: ["nombre"],
          usageCount: 145,
          createdAt: "2026-05-20T10:00:00Z",
          imageUrl: null,
          isFavorite: false,
        },
        {
          id: "tpl-demo-5",
          name: "⏰ Recordatorio de Pagos",
          content: "Hola {{nombre}}, te recordamos que tenés un pago pendiente. Podés abonar desde acá: https://mundialblaster.com/pagar\n\n💳 Tarjeta, transferencia o efectivo. ¿Necesitás ayuda? Respondé este mensaje.",
          category: "Recordatorios",
          variables: ["nombre"],
          usageCount: 2100,
          createdAt: "2026-05-18T08:00:00Z",
          imageUrl: null,
          isFavorite: true,
        },
        {
          id: "tpl-demo-6",
          name: "📢 Reactivación Clientes",
          content: "{{Te extrañamos|Hace tiempo no nos vemos|¿Dónde andás?}} {{nombre}}. Volvemos con un 20% OFF exclusivo para clientes VIP como vos. {{Aprovechá|No dejes pasar|Asegurá}} tu descuento → https://mundialblaster.com/vip",
          category: "Reactivación",
          variables: ["nombre"],
          usageCount: 756,
          createdAt: "2026-05-15T11:00:00Z",
          imageUrl: null,
          isFavorite: false,
        },
        {
          id: "tpl-demo-7",
          name: "📅 Seguimiento Post-Venta",
          content: "Hola {{nombre}}, ¿cómo te fue con tu compra? Tu opinión nos ayuda a mejorar. Dejanos una reseña acá: https://mundialblaster.com/review\n\n⭐⭐⭐⭐⭐",
          category: "Seguimiento",
          variables: ["nombre"],
          usageCount: 423,
          createdAt: "2026-05-10T16:00:00Z",
          imageUrl: null,
          isFavorite: false,
        },
        {
          id: "tpl-demo-8",
          name: "🎁 Oferta Relámpago 24hs",
          content: "⚡ FLASH SALE ⚡ {{nombre}}, solo por las próximas 24 horas: 50% OFF en TODO. {{Corré|Apurate|Andá ya}} → https://mundialblaster.com/flash\n\n⏰ Termina a medianoche.",
          category: "Promociones",
          variables: ["nombre"],
          usageCount: 1834,
          createdAt: "2026-05-05T09:00:00Z",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
          isFavorite: true,
        },
        {
          id: "tpl-demo-9",
          name: "📋 Confirmación de Pedido",
          content: "¡Gracias por tu compra {{nombre}}! Tu pedido #{{pedido}} está confirmado. Te avisamos cuando esté en camino. 📦\n\nConsultá el estado acá: https://mundialblaster.com/seguimiento",
          category: "General",
          variables: ["nombre", "pedido"],
          usageCount: 312,
          createdAt: "2026-04-28T10:00:00Z",
          imageUrl: null,
          isFavorite: false,
        },
        {
          id: "tpl-demo-10",
          name: "🎉 Cumpleaños Cliente VIP",
          content: "¡Feliz cumpleaños {{nombre}}! 🎂🎈 Como cliente VIP tenés un regalo especial: 30% OFF en tu próxima compra. Validá acá: https://mundialblaster.com/cumple\n\n🎁 Te lo merecés.",
          category: "General",
          variables: ["nombre"],
          usageCount: 89,
          createdAt: "2026-04-20T08:00:00Z",
          imageUrl: null,
          isFavorite: false,
        },
      ]

      // Filtrar por búsqueda y categoría
      // Filtrar por búsqueda y categoría
let filtered = demoTemplates
if (search) {
  const q = search.toLowerCase()
  filtered = filtered.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.content.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  )
}
if (selectedCategory === "favorites") {
  filtered = filtered.filter(t => t.isFavorite)
} else if (selectedCategory !== "all") {
  filtered = filtered.filter(t => t.category === selectedCategory)
}

      setTemplates(filtered)
      setLoading(false)
      return
    }

    // CÓDIGO ORIGINAL
    try {
      const params = new URLSearchParams()
if (search) params.append("search", search)
if (selectedCategory === "favorites") {
  params.append("favorite", "true")
} else if (selectedCategory !== "all") {
  params.append("category", selectedCategory)
}
      
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
  }, [search, selectedCategory, token, isDemo])

  // const fetchCategories = useCallback(async () => {
  //   try {
  //     const res = await fetch("/api/templates/categories", {
  //       headers: { Authorization: `Bearer ${token}` },
  //       cache: "no-store",
  //     })
  //     const data = await res.json()
  //     setCategories(data.categories || [])
  //   } catch {
  //     // silent
  //   }
  // }, [token])

  useEffect(() => {
    fetchTemplates()
    
  }, [fetchTemplates])

const handleCreate = async (form: any) => {
    if (isDemo) { toast.info("🎮 Crear templates disponible en modo real"); return }

  // 🔒 Starter: máximo 5 templates
  if (!isPro && templates.length >= 5) {
    toast.error("Límite alcanzado: Starter permite 5 templates. Upgrade a Pro para ilimitados.")
    return
  }
  // 🔒 Starter: sin variables dinámicas
  if (!isPro && /\{\{.*?\}\}/.test(form.content)) {
    toast.error("Las variables {{...}} son exclusivas del plan Pro.")
    return
  }

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
    } else {
      toast.error(data.error || "Error")
    }
  } catch {
    toast.error("Error de red")
  }
}

  const handleEdit = async (form: any) => {
        if (isDemo) { toast.info("🎮 Editar templates disponible en modo real"); return }

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
        if (isDemo) { toast.info("🎮 Eliminar templates disponible en modo real"); return }

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
        if (isDemo) { toast.info("🎮 Duplicar templates disponible en modo real"); return }

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
  if (isDemo) { 
    toast.success(`🎮 Template "${template.name}" cargado en demo`)
    setShowUse(null)
    return 
  }
  
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
    
    // ✅ Guardar TODO el contexto del template (mensaje + imagen)
    localStorage.setItem('mb_template_payload', JSON.stringify({
      message: finalMessage,
      imageUrl: template.imageUrl || null,
      templateName: template.name,
      templateId: template.id,
      timestamp: Date.now()
    }))
    
    toast.success(`Template "${template.name}" cargado`)
    setShowUse(null)
    
    // ✅ Redirigir al dashboard con query param para activar tab campaña
    router.push("/dashboard?tab=campaign")
    
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

        <div className="px-6 pt-4 relative">
  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">Métricas</p>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <TemplateMetricCard 
      label="Template más usado" 
      value={templates.length > 0 ? templates.reduce((max, t) => (t.usageCount || 0) > (max.usageCount || 0) ? t : max, templates[0]).name : '-'} 
      sub={templates.length > 0 ? `${templates.reduce((max, t) => (t.usageCount || 0) > (max.usageCount || 0) ? t : max, templates[0]).usageCount || 0} usos` : ''}
    />
    <TemplateMetricCard 
      label="Total de usos acumulados" 
      value={templates.reduce((sum, t) => sum + (t.usageCount || 0), 0).toString()} 
    />
    <TemplateMetricCard 
      label="Recomendado del sistema" 
      value={templates.length > 0 ? templates.reduce((max, t) => (t.usageCount || 0) > (max.usageCount || 0) ? t : max, templates[0]).name : '-'} 
      sub="Basado en frecuencia de uso"
      highlight
    />
  </div>

  {/* Overlay esfumado para Starter */}
  {!isPro && (
    <div className="absolute inset-0 top-7 flex flex-col items-center justify-center bg-[var(--bg-primary)]/40 backdrop-blur-[3px] rounded-xl z-10">
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Métricas</p>
      <button 
        onClick={() => openUpgrade('pro')}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition-all"
      >
        <Zap size={14} /> Upgrade a Pro
      </button>
    </div>
  )}
</div>

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
  
  {/* Tab Favoritos */}
  <button
    onClick={() => setSelectedCategory("favorites")}
    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedCategory === "favorites" ? 'bg-amber-500/10 text-amber-400 border-amber-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-amber-500/50'}`}
  >
    <Star size={12} className={selectedCategory === "favorites" ? 'text-amber-400 fill-amber-400' : 'text-amber-400/50'} />
    Favoritos
    {selectedCategory === "favorites" && <span className="ml-1 text-[10px]">✓</span>}
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
           <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {templates.map((template) => (
                <motion.div
  key={template.id}
  layout
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-hover)] transition-all group relative"
>
  {/* Imagen Pro */}
  {isPro && template.imageUrl && (
    <div className="mb-3 rounded-xl overflow-hidden h-32 bg-[var(--bg-input)] border border-[var(--border-color)]">
      <img src={template.imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
    </div>
  )}

  <div className="flex items-start justify-between mb-3">
    <div className="flex-1 min-w-0">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
        {template.category}
      </span>
      <h3 className="text-sm font-bold text-[var(--text-primary)] mt-2 truncate">{template.name}</h3>
    </div>
    <div className="flex items-center gap-1 ml-2">
      {/* Favorito Pro */}
      {isPro && (
  <button 
    onClick={async () => {
      if (isDemo) { toast.info("🎮 Favoritos en modo real"); return }
      try {
        const res = await fetch(`/api/templates/${template.id}/favorite`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          // Actualizar estado local
          setTemplates(prev => prev.map(t => 
            t.id === template.id ? { ...t, isFavorite: data.isFavorite } : t
          ))
          toast.success(data.isFavorite ? 'Agregado a favoritos' : 'Removido de favoritos')
        }
      } catch {
        toast.error('Error actualizando favorito')
      }
    }}
    className={`p-1.5 rounded-lg transition-colors ${template.isFavorite ? 'text-amber-400 bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/10'}`}
    title="Favorito"
  >
    <Star size={14} className={template.isFavorite ? 'fill-amber-400' : ''} />
  </button>
)}
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
  </div>

  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-3 font-mono bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-color)]">
    {template.content}
  </p>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {(template.variables || []).length > 0 && (
        <div className="flex gap-1">
          {(template.variables || []).map(v => (
            <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]">
              {"{{"}{v}{"}}"}
            </span>
          ))}
        </div>
      )}
      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
        <Clock size={10} /> {template.usageCount || 0} usos
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
          </div>

        </main>
      </div>

      {/* MODAL: Crear Template */}
      <TemplateFormModal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSubmit={handleCreate}
        categories={CATEGORIES}
        isPro={isPro}
      />

      {/* MODAL: Editar Template */}
      {showEdit && (
        <TemplateFormModal 
          open={!!showEdit} 
          onClose={() => setShowEdit(null)} 
          onSubmit={handleEdit}
          categories={CATEGORIES}
          initial={showEdit}
          isPro={isPro}

        />
      )}

      {/* MODAL: Preview */}
      {showPreview && (
  <PremiumModal open={!!showPreview} onClose={() => setShowPreview(null)} title="Preview de Template">
  <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <p className="text-xs text-blue-400 font-medium">{showPreview.name}</p>
    </div>
    
    {isPro && (showPreview.variables || []).length > 0 && (
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2">Simulación con variables</p>
        <div className="grid grid-cols-2 gap-2">
          {(showPreview.variables || []).map((v: string) => (
            <div key={v} className="bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)]">{"{{"}{v}{"}}"}</span>
              <p className="text-xs text-[var(--text-primary)]">
                {v === 'nombre' ? 'Juan Pérez' : v === 'telefono' ? '5491123456789' : v === 'empresa' ? 'Acme Inc' : `Valor de ${v}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    <p className="text-xs text-[var(--text-muted)]">Variantes aleatorias con Spintax:</p>
    <div className="space-y-3">
      {[1, 2, 3].map(i => {
        let previewText = resolveSpintax(showPreview.content)
        if (isPro) {
          previewText = previewText.replace(/\{\{nombre\}\}/g, 'Juan Pérez')
          previewText = previewText.replace(/\{\{telefono\}\}/g, '5491123456789')
          previewText = previewText.replace(/\{\{empresa\}\}/g, 'Acme Inc')
        }
        return (
          <div key={i} className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] relative">
            <span className="absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Variante {i}</span>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap mt-1">{previewText}</p>
          </div>
        )
      })}
    </div>
    
    {(showPreview.variables || []).length > 0 && (
      <div className="flex gap-2 flex-wrap pb-2">
        <span className="text-xs text-[var(--text-muted)]">Variables:</span>
        {(showPreview.variables || []).map(v => (
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
function TemplateMetricCard({ label, value, sub, highlight }: any) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}>
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-amber-400' : 'text-[var(--text-primary)]'}`}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}

function TemplateFormModal({ open, onClose, onSubmit, categories, initial, isPro  }: any) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    content: initial?.content || "",
    category: initial?.category || "General",
    imageUrl: initial?.imageUrl || "",
  })
  const [detectedVars, setDetectedVars] = useState<string[]>(initial?.variables || [])

  const detectVariables = (text: string) => {
    const matches = text.matchAll(/\{\{(\w+)\}\}/g)
    const vars = Array.from(matches).map(m => m[1])
    setDetectedVars(Array.from(new Set(vars)))
  }

  // Detectar variables del template inicial al abrir edición
  useEffect(() => {
    if (initial?.content) detectVariables(initial.content)
  }, [initial?.content])

  return (
    <PremiumModal open={open} onClose={onClose} title={initial ? "Editar Template" : "Nuevo Template"}>
      <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ ...form, variables: detectedVars })
      }} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Nombre *</label>
          <input 
            required 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
            placeholder="Ej: Promo Black Friday"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Categoría</label>
          <div className="relative">
            <select 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
              className="appearance-none w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer hover:border-slate-600"
            >
              {categories.map((c: string) => (
                <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{c}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Imagen: solo Pro */}
        {isPro && (
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <ImageIcon size={12} /> URL de imagen (opcional)
            </label>
            <input 
              type="text"
              value={form.imageUrl} 
              onChange={e => setForm({...form, imageUrl: e.target.value})} 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="https://tusitio.com/imagen.jpg"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Contenido *</label>
          <textarea 
            required 
            rows={6}
            value={form.content} 
            onChange={e => {
              setForm({...form, content: e.target.value})
              detectVariables(e.target.value)
            }}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all resize-none font-mono"
            placeholder={isPro ? "Hola {{nombre}}, tenemos 50% OFF en {{producto}}. Escribí YA para reservar. {{saludo|atentamente|un abrazo}}" : "Hola, tenemos 50% OFF. Escribí YA para reservar. (Las variables {{...}} son Pro)"
            }
          />

                  {/* ─── Spintax Presets ─── */}
        <div className="pt-1">
          <p className="text-[10px] text-[var(--text-muted)] mb-2">Insertar Spintax:</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "👋 Saludo", value: "{{Hola|Buenas|Hey|Qué tal|Saludos}}" },
              { label: "👋 Despedida", value: "{{Saludos|Un abrazo|Atentamente|Gracias|Nos vemos}}" },
              { label: "🔥 Emoji", value: "{{👋|✨|🚀|💪|🔥|👍|🎯}}" },
              { label: "👤 Nombre", value: "{{nombre|amigo|cliente|crack}}" },
              { label: "🎁 Producto", value: "{{producto|artículo|item|mercadería}}" },
              { label: "⚡ Urgencia", value: "{{Aprovechá|No te lo pierdas|Corré que vuela|Última chance}}" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setForm(prev => ({ 
                    ...prev, 
                    content: prev.content ? `${prev.content} ${preset.value}` : preset.value 
                  }))
                  detectVariables((form.content ? form.content + ' ' : '') + preset.value)
                }}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center gap-1"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[var(--text-muted)]">
              Spintax: Generá hasta 3 diferentes variables de texto por linea, de esta forma evitas spam por repeticion.
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

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/25">{initial ? "Guardar" : "Crear"}</button>
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