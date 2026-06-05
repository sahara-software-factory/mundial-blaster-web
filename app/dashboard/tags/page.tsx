"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Tag, 
  Plus, 
  Search, 
  Users, 
  Trash2, 
  X,
  Palette
} from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "../../components/ui/sidebar"
import { PremiumModal } from "../../components/ui/modal"
import { useConfirm } from "@/hooks/useConfirm"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"
import { useDemoMode } from "@/hooks/useDemo"

interface TagItem {
  id: string
  name: string
  color: string
  count: number
}

const PRESET_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444", "#F97316", "#F59E0B", 
  "#84CC16", "#10B981", "#06B6D4", "#06B6D4", "#6366F1", "#64748B"
]

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])
  const { isOpen, options, confirm: askConfirm, onConfirm, onCancel } = useConfirm()
  const [showTagContacts, setShowTagContacts] = useState(false)
const [selectedTagName, setSelectedTagName] = useState("")
const [selectedTagColor, setSelectedTagColor] = useState("")
const [tagContacts, setTagContacts] = useState<any[]>([])
const [loadingContacts, setLoadingContacts] = useState(false)
const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''
const { isDemo } = useDemoMode()

  const fetchTags = useCallback(async () => {
    setLoading(true)

    if (isDemo) {
      // DEMO: 8 tags con counts reales basados en los 30 contactos demo
      setTags([
        { id: "tag-1", name: "Cliente", color: "#3b82f6", count: 17 },
        { id: "tag-2", name: "Lead", color: "#10b981", count: 11 },
        { id: "tag-3", name: "VIP", color: "#f59e0b", count: 7 },
        { id: "tag-4", name: "Hot", color: "#ef4444", count: 8 },
        { id: "tag-5", name: "Prospecto", color: "#ec4899", count: 4 },
        { id: "tag-6", name: "Inactivo", color: "#64748b", count: 3 },
        { id: "tag-7", name: "Whatsapp", color: "#06b6d4", count: 5 },
        { id: "tag-8", name: "Proveedor", color: "#8b5cf6", count: 2 },
      ])
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/tags/stats", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setTags(data.tags || [])
    } catch {
      toast.error("Error cargando etiquetas")
    } finally {
      setLoading(false)
    }
  }, [token, isDemo])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const openTagContacts = async (tag: TagItem) => {
    setSelectedTagName(tag.name)
    setSelectedTagColor(tag.color)
    setShowTagContacts(true)
    setLoadingContacts(true)

    if (isDemo) {
      // DEMO: Contactos filtrados por tag (mismos 30 del demo)
      const allDemoContacts = [
        { id: "c-1", name: "Juan Pérez", phone: "5491130012345", email: "juan.perez@gmail.com", tags: ["Cliente", "VIP"] },
        { id: "c-2", name: "María González", phone: "5491130023456", email: "maria.g@hotmail.com", tags: ["Cliente", "Hot"] },
        { id: "c-3", name: "Carlos Rodríguez", phone: "5491130034567", email: "crodriguez@empresa.com", tags: ["Lead", "Whatsapp"] },
        { id: "c-4", name: "Ana Martínez", phone: "5491130045678", email: "ana.martinez@outlook.com", tags: ["Cliente"] },
        { id: "c-5", name: "Luis Fernández", phone: "5491130056789", email: "luis.f@yahoo.com", tags: ["Prospecto", "Lead"] },
        { id: "c-6", name: "Laura López", phone: "5491130067890", email: "laura.lopez@gmail.com", tags: ["Cliente", "VIP", "Hot"] },
        { id: "c-7", name: "Pedro Sánchez", phone: "5491130078901", email: "pedro.sanchez@corp.com", tags: ["Proveedor"] },
        { id: "c-8", name: "Sofía Torres", phone: "5491130089012", email: "sofia.torres@mail.com", tags: ["Lead", "Whatsapp"] },
        { id: "c-9", name: "Diego Ramírez", phone: "5491130090123", email: "diego.ramirez@gmail.com", tags: ["Cliente", "Inactivo"] },
        { id: "c-10", name: "Valentina Flores", phone: "5491130101234", email: "valen.flores@hotmail.com", tags: ["Cliente", "Hot"] },
        { id: "c-11", name: "Martín Acosta", phone: "5491130112345", email: "martin.acosta@gmail.com", tags: ["Lead"] },
        { id: "c-12", name: "Camila Ruiz", phone: "5491130123456", email: "camila.ruiz@outlook.com", tags: ["Cliente", "VIP"] },
        { id: "c-13", name: "Julián Castro", phone: "5491130134567", email: "julian.castro@empresa.com", tags: ["Prospecto"] },
        { id: "c-14", name: "Paula Medina", phone: "5491130145678", email: "paula.medina@gmail.com", tags: ["Cliente", "Whatsapp"] },
        { id: "c-15", name: "Tomás Herrera", phone: "5491130156789", email: "tomas.herrera@mail.com", tags: ["Lead", "Hot"] },
        { id: "c-16", name: "Lucía Silva", phone: "5491130167890", email: "lucia.silva@hotmail.com", tags: ["Cliente"] },
        { id: "c-17", name: "Nicolás Vargas", phone: "5491130178901", email: "nico.vargas@gmail.com", tags: ["Inactivo"] },
        { id: "c-18", name: "Emilia Rojas", phone: "5491130189012", email: "emilia.rojas@outlook.com", tags: ["Cliente", "VIP", "Hot"] },
        { id: "c-19", name: "Bruno Molina", phone: "5491130190123", email: "bruno.molina@corp.com", tags: ["Lead"] },
        { id: "c-20", name: "Antonella Cruz", phone: "5491130201234", email: "anto.cruz@gmail.com", tags: ["Cliente", "Whatsapp"] },
        { id: "c-21", name: "Facundo Ortiz", phone: "5491130212345", email: "facu.ortiz@hotmail.com", tags: ["Prospecto", "Lead"] },
        { id: "c-22", name: "Morena Luna", phone: "5491130223456", email: "morena.luna@gmail.com", tags: ["Cliente"] },
        { id: "c-23", name: "Santiago Reyes", phone: "5491130234567", email: "santi.reyes@outlook.com", tags: ["Proveedor", "VIP"] },
        { id: "c-24", name: "Victoria Peña", phone: "5491130245678", email: "vicky.pena@gmail.com", tags: ["Lead", "Hot"] },
        { id: "c-25", name: "Mateo Giménez", phone: "5491130256789", email: "mateo.gimenez@mail.com", tags: ["Cliente", "Inactivo"] },
        { id: "c-26", name: "Julieta Navarro", phone: "5491130267890", email: "juli.navarro@hotmail.com", tags: ["Cliente", "VIP"] },
        { id: "c-27", name: "Franco Ibáñez", phone: "5491130278901", email: "franco.ibanez@gmail.com", tags: ["Prospecto"] },
        { id: "c-28", name: "Milagros Sosa", phone: "5491130289012", email: "mili.sosa@outlook.com", tags: ["Cliente", "Whatsapp", "Hot"] },
        { id: "c-29", name: "Agustín Morales", phone: "5491130290123", email: "agus.morales@corp.com", tags: ["Lead"] },
        { id: "c-30", name: "Rocío Mendoza", phone: "5491130301234", email: "rocio.mendoza@gmail.com", tags: ["Cliente", "VIP", "Hot"] },
      ]
      const filtered = allDemoContacts.filter(c => c.tags.includes(tag.name))
      setTagContacts(filtered)
      setLoadingContacts(false)
      return
    }

    try {
      const res = await fetch(`/api/contacts?tag=${encodeURIComponent(tag.name)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setTagContacts(data.contacts || [])
    } catch {
      toast.error("Error cargando contactos")
      setTagContacts([])
    } finally {
      setLoadingContacts(false)
    }
  }

  const createTag = async () => {
       if (isDemo) { toast.info("🎮 Crear tags disponible en modo real"); return }
    if (!newTagName.trim()) return toast.error("Nombre requerido")
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Etiqueta creada")
        setNewTagName("")
        setShowCreate(false)
        fetchTags()
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

const deleteTag = async (id: string) => {
    if (isDemo) { toast.info("🎮 Eliminar tags disponible en modo real"); return }

  const ok = await askConfirm({
    title: "Eliminar etiqueta",
    description: "¿Eliminar esta etiqueta? Se quitará de todos los contactos que la tengan.",
    confirmText: "Eliminar",
    variant: "danger",
  })
  if (!ok) return
  try {
    await fetch(`/api/tags/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    toast.success("Etiqueta eliminada")
    fetchTags()
  } catch {
    toast.error("Error eliminando")
  }
}

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        
        <header className="h-16 bg-[var(--bg-secondary)]/60 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Tag size={20} className="text-blue-400" /> Etiquetas
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Organizá tus contactos por categorías</p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus size={16} /> Crear Etiqueta
          </button>
        </header>

        <main className="p-6">
          {/* Search + Sort */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar etiqueta..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Grid de Tags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredTags.map((tag) => (
                <motion.div
  key={tag.id}
  layout
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  onClick={() => openTagContacts(tag)}
  className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:shadow-lg transition-all cursor-pointer"
>
                  {/* Badge de cantidad */}
                  <div 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.count}
                  </div>

                  {/* Círculo color */}
                  <div 
                    className="h-10 w-10 rounded-full mb-3 shadow-inner"
                    style={{ backgroundColor: tag.color + '20', border: `2px solid ${tag.color}` }}
                  >
                    <div className="h-full w-full rounded-full" style={{ backgroundColor: tag.color }} />
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{tag.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Users size={10} /> {tag.count} contactos
                  </p>

                  {/* Hover actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTag(tag.id) }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredTags.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center">
                <Tag size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[var(--text-secondary)] text-sm">No hay etiquetas</p>
                <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                  + Crear la primera
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: Crear Tag */}
      <PremiumModal open={showCreate} onClose={() => setShowCreate(false)} title="Crear Etiqueta">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre</label>
            <input 
              value={newTagName} 
              onChange={e => setNewTagName(e.target.value)} 
              placeholder="Ej: Lead Caliente"
              className="input-field"
              onKeyDown={e => e.key === 'Enter' && createTag()}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${newTagColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: newTagColor }} />
            <span className="text-sm text-[var(--text-primary)]">{newTagName || "Vista previa"}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl transition-colors">Cancelar</button>
            <button onClick={createTag} className="flex-1 py-2.5 btn-primary rounded-xl">Guardar</button>
          </div>
        </div>
      </PremiumModal>
      {/* MODAL: Contactos de la etiqueta */}
<PremiumModal 
  open={showTagContacts} 
  onClose={() => setShowTagContacts(false)} 
  title={
    <div className="flex items-center gap-2">
      <Users size={18} className="text-blue-400" />
      Contactos Etiquetados
    </div>
  }
>
  <div className="space-y-4">
    {/* Header de tag */}
    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
      <span 
        className="px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: selectedTagColor }}
      >
        {selectedTagName}
      </span>
      <span className="text-xs text-[var(--text-muted)]">
        {tagContacts.length} contactos
      </span>
    </div>

    {/* Lista de contactos */}
    <div className="max-h-80 overflow-y-auto space-y-2">
      {loadingContacts ? (
        <div className="py-8 text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
        </div>
      ) : tagContacts.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          No hay contactos con esta etiqueta
        </div>
      ) : (
        tagContacts.map((contact) => (
          <div 
            key={contact.id}
            className="flex items-center gap-3 p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
          >
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: selectedTagColor + '80' }}
            >
              {contact.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {contact.name || "Sin nombre"}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {contact.phone}
              </p>
            </div>
            {contact.email && (
              <span className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                {contact.email}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
</PremiumModal>

{/* ConfirmDialog */}
<ConfirmDialog
  open={isOpen}
  onClose={onCancel}
  onConfirm={onConfirm}
  {...options}
/>
    </div>
  )
}