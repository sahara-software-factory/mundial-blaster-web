"use client"

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
import { Sidebar } from "../components/ui/sidebar"
import { PremiumModal } from "../components/ui/modal"

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

  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  const fetchTags = useCallback(async () => {
    setLoading(true)
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
  }, [token])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = async () => {
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
    if (!confirm("¿Eliminar etiqueta? Los contactos la perderán.")) return
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
    </div>
  )
}