"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Plus,
  Search,
  Users,
  Trash2,
  X,
  Palette,
  Eye,
  Edit3,
  Copy,
  Download,
  Save,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "../../components/ui/sidebar"
import { PremiumModal } from "../../components/ui/modal"
import { useConfirm } from "@/hooks/useConfirm"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"
import { useDemoMode } from "@/hooks/useDemo"

interface BaseDatos {
  id: string
  nombre: string
  color: string
  contenido: string
  total: number
  duplicados: number
  created_at: string
  updated_at: string
}

function smartCleanNumbers(text: string): {
  numbers: string[]
  cleaned: number
  noise: number
  rejected: string[]
  duplicates: string[]
  duplicatesRemoved: number
} {
  const LETTER = /[A-Za-z\u00C0-\u024F]/
  const lines = text.replace(/[;,\t]/g, '\n').split('\n').map(l => l.trim()).filter(Boolean)

  const rawNumbers: string[] = []
  const rejected: string[] = []
  let cleaned = 0
  let noise = 0

  const pushIfValid = (digits: string, original: string) => {
    if (digits.length < 7 || digits.length > 14) {
      rejected.push(`"${original.slice(0, 20)}" → ${digits.length} dígitos (debe tener 7-14)`)
      return
    }
    rawNumbers.push(digits)
  }

  for (const line of lines) {
    if (LETTER.test(line)) {
      // ─── Línea con letras: separar en límites letra↔dígito, quitar tokens con letras, quedarse con el número más largo ───
      const spaced = line
        .replace(/(\d)([A-Za-z\u00C0-\u024F])/g, '$1 $2')
        .replace(/([A-Za-z\u00C0-\u024F])(\d)/g, '$1 $2')
      const candidates = spaced.split(/\s+/)
        .filter(t => !LETTER.test(t))
        .map(t => t.replace(/\D/g, ''))
        .filter(Boolean)
      const best = candidates.sort((a, b) => b.length - a.length)[0] || ''
      if (!best) { noise++; continue }          // línea solo nombre → se elimina en silencio
      const antes = rawNumbers.length
      pushIfValid(best, line)
      if (rawNumbers.length > antes) cleaned++  // número rescatado de línea mixta
    } else {
      // ─── Línea solo numérica: puede ser un número con espacios (351 234 5678) o varios números ───
      const groups = line.split(/\s+/).map(g => g.replace(/\D/g, '')).filter(Boolean)
      if (groups.length === 0) { noise++; continue }
      if (groups.every(g => g.length < 7)) {
        pushIfValid(groups.join(''), line)      // grupos cortos = un solo número con espacios
      } else {
        groups.forEach(g => { if (g.length >= 7) pushIfValid(g, line) }) // varios números en una línea
      }
    }
  }

  // Dedupe preservando orden
  const seen = new Set<string>()
  const numbers: string[] = []
  const duplicates: string[] = []
  let duplicatesRemoved = 0
  for (const n of rawNumbers) {
    if (seen.has(n)) {
      duplicatesRemoved++
      if (!duplicates.includes(n)) duplicates.push(n)
    } else {
      seen.add(n)
      numbers.push(n)
    }
  }

  return { numbers, cleaned, noise, rejected, duplicates, duplicatesRemoved }
}

const PRESET_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444", "#F97316", "#F59E0B",
  "#84CC16", "#10B981", "#06B6D4", "#06B6D4", "#6366F1", "#64748B"
]

export default function BasesDatosPage() {
  const [bases, setBases] = useState<BaseDatos[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingBase, setEditingBase] = useState<BaseDatos | null>(null)
  const [previewBase, setPreviewBase] = useState<BaseDatos | null>(null)
  const { isOpen, options, confirm: askConfirm, onConfirm, onCancel } = useConfirm()
  const { isDemo } = useDemoMode()
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  // Form
  const [formNombre, setFormNombre] = useState("")
  const [formColor, setFormColor] = useState(PRESET_COLORS[0])
  const [formContenido, setFormContenido] = useState("")
  const [formStats, setFormStats] = useState({ total: 0, duplicados: 0 })

  const parsearNumeros = (texto: string) => {
    const raw = texto
      .replace(/[^\d\s,\n;]/g, '')
      .split(/[\s,\n;]+/)
      .map(n => n.trim())
      .filter(n => n.length >= 8 && n.length <= 15)

    const unicos = [...new Set(raw)]
    return { total: unicos.length, duplicados: raw.length - unicos.length }
  }

  // DEMO DATA
  const DEMO_BASES: BaseDatos[] = [
    {
      id: "demo-1",
      nombre: "Clientes Fidelizados",
      color: "#10B981",
      contenido: "5493512345678\n5493512345679\n5493512345680\n5493512345681\n5493512345682",
      total: 5,
      duplicados: 0,
      created_at: "2026-07-01T10:00:00Z",
      updated_at: "2026-07-05T14:30:00Z",
    },
    {
      id: "demo-2",
      nombre: "Leads Fríos Casino",
      color: "#F59E0B",
      contenido: "5491161234567\n5491161234568\n5491161234569",
      total: 3,
      duplicados: 0,
      created_at: "2026-07-03T08:15:00Z",
      updated_at: "2026-07-03T08:15:00Z",
    },
    {
      id: "demo-3",
      nombre: "VIP High Rollers",
      color: "#8B5CF6",
      contenido: "5492612345678\n5492612345679",
      total: 2,
      duplicados: 0,
      created_at: "2026-06-28T16:45:00Z",
      updated_at: "2026-07-04T11:20:00Z",
    },
    {
      id: "demo-4",
      nombre: "Base Santa Fe BPLAY",
      color: "#EF4444",
      contenido: "5493421234567\n5493421234568\n5493421234569\n5493421234570",
      total: 4,
      duplicados: 0,
      created_at: "2026-07-05T09:00:00Z",
      updated_at: "2026-07-05T09:00:00Z",
    },
    {
      id: "demo-5",
      nombre: "Re-engagement Julio",
      color: "#06B6D4",
      contenido: "5493812345678\n5493812345679\n5493812345680\n5493812345681\n5493812345682\n5493812345683",
      total: 6,
      duplicados: 0,
      created_at: "2026-07-06T07:30:00Z",
      updated_at: "2026-07-06T07:30:00Z",
    },
  ]

  const fetchBases = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setBases(DEMO_BASES)
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/bases-datos", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setBases(data.bases || [])
    } catch {
      toast.error("Error cargando bases de datos")
    } finally {
      setLoading(false)
    }
  }, [token, isDemo])

  useEffect(() => {
    fetchBases()
  }, [fetchBases])

  useEffect(() => {
    const stats = parsearNumeros(formContenido)
    setFormStats(stats)
  }, [formContenido])

  const openCreate = () => {
    setEditingBase(null)
    setFormNombre("")
    setFormColor(PRESET_COLORS[0])
    setFormContenido("")
    setFormStats({ total: 0, duplicados: 0 })
    setShowCreate(true)
  }

  const openEdit = (base: BaseDatos) => {
    setEditingBase(base)
    setFormNombre(base.nombre)
    setFormColor(base.color)
    setFormContenido(base.contenido)
    setFormStats({ total: base.total, duplicados: base.duplicados })
    setShowCreate(true)
  }

  const openPreview = (base: BaseDatos) => {
    setPreviewBase(base)
    setShowPreview(true)
  }

  const handleSave = async () => {
        if (!formNombre.trim()) return toast.error("Nombre requerido")

    const res = smartCleanNumbers(formContenido)
    if (res.numbers.length === 0) return toast.error("No hay números válidos para guardar")
    const contenidoLimpio = res.numbers.join('\n')
    setFormContenido(contenidoLimpio)

    if (isDemo) {
      if (editingBase) {
        const updated = bases.map(b => b.id === editingBase.id ? {
          ...b,
          nombre: formNombre,
          color: formColor,
          contenido: formContenido,
          total: formStats.total,
          duplicados: formStats.duplicados,
          updated_at: new Date().toISOString(),
        } : b)
        setBases(updated)
        toast.success("Base actualizada")
      } else {
        const newBase: BaseDatos = {
          id: `demo-${Date.now()}`,
          nombre: formNombre,
          color: formColor,
          contenido: contenidoLimpio,
          total: formStats.total,
          duplicados: formStats.duplicados,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setBases([newBase, ...bases])
        toast.success("Base creada")
      }
      setShowCreate(false)
      return
    }

    try {
      if (editingBase) {
        const res = await fetch(`/api/bases-datos/${editingBase.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: formNombre, color: formColor, contenido: contenidoLimpio }),
          cache: "no-store",
        })
        const data = await res.json()
        if (res.ok) {
          toast.success("Base actualizada")
          setShowCreate(false)
          fetchBases()
        } else {
          toast.error(data.error || "Error")
        }
      } else {
        const res = await fetch("/api/bases-datos", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: formNombre, color: formColor, contenido: contenidoLimpio }),
          cache: "no-store",
        })
        const data = await res.json()
        if (res.ok) {
          toast.success("Base creada")
          setShowCreate(false)
          fetchBases()
        } else {
          toast.error(data.error || "Error")
        }
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await askConfirm({
      title: "Eliminar base",
      description: "¿Eliminar permanentemente esta base de datos? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      variant: "danger",
    })
    if (!ok) return

    if (isDemo) {
      setBases(bases.filter(b => b.id !== id))
      toast.success("Base eliminada")
      return
    }

    try {
      const res = await fetch(`/api/bases-datos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      if (res.ok) {
        toast.success("Base eliminada")
        fetchBases()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const copyToClipboard = (contenido: string) => {
    navigator.clipboard.writeText(contenido)
    toast.success("Números copiados al portapapeles")
  }

  const exportTXT = (base: BaseDatos) => {
    const blob = new Blob([base.contenido], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${base.nombre.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Base exportada")
  }

  const filtered = bases.filter(b =>
    b.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const totalNumeros = bases.reduce((acc, b) => acc + b.total, 0)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />

      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>

        <header className="h-16 bg-[var(--bg-secondary)]/60 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Database size={20} className="text-indigo-400" /> Bases de Datos
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Gestiona tus listas de contactos como bloques de texto</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500/100 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus size={16} /> Nueva Base
          </button>
        </header>

        <main className="p-6">
          {/* Stats + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <Database size={14} className="text-indigo-400" />
                <span className="text-xs text-[var(--text-secondary)]">{bases.length} bases</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <Users size={14} className="text-emerald-400" />
                <span className="text-xs text-[var(--text-secondary)]">{totalNumeros} números</span>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar base..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-40 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse" />
                ))
              ) : filtered.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <Database size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)] text-sm">No hay bases de datos</p>
                  <button onClick={openCreate} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                    + Crear la primera
                  </button>
                </div>
              ) : (
                filtered.map((base) => (
                  <motion.div
                    key={base.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-hover)] hover:shadow-lg transition-all"
                  >
                    {/* Color stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80"
                      style={{ backgroundColor: base.color }}
                    />

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: base.color + '30', color: base.color }}
                        >
                          {base.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{base.nombre}</h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            {new Date(base.updated_at).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(base.id)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                        <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Números</p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">{base.total}</p>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                        <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Duplicados</p>
                        <p className={`text-lg font-bold ${base.duplicados > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {base.duplicados}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(base)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors"
                      >
                        <Eye size={14} /> Ver
                      </button>
                      <button
                        onClick={() => openEdit(base)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors"
                      >
                        <Edit3 size={14} /> Editar
                      </button>
                      <button
                        onClick={() => copyToClipboard(base.contenido)}
                        className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Copiar"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => exportTXT(base)}
                        className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Exportar .txt"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* MODAL: Crear / Editar */}
      <PremiumModal open={showCreate} onClose={() => setShowCreate(false)} title={editingBase ? "Editar Base" : "Nueva Base de Datos"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre</label>
            <input
              value={formNombre}
              onChange={e => setFormNombre(e.target.value)}
              placeholder="Ej: Clientes Fidelizados"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-2">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFormColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${formColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
              <Palette size={12} /> Números de WhatsApp
            </label>
            <p className="text-[10px] text-[var(--text-muted)] mb-2">
              Pegá los números en cualquier formato (coma, espacio, salto de línea). Se filtran duplicados y caracteres inválidos automáticamente.
            </p>
            <textarea
  value={formContenido}
  className="input-field font-mono text-xs resize-none"
  onChange={e => setFormContenido(e.target.value)}
  onPaste={e => {
    e.preventDefault()
    const res = smartCleanNumbers(e.clipboardData.getData('text'))
    if (res.numbers.length === 0) return toast.error('No se detectaron números válidos')
    setFormContenido(prev => {
      const merged = smartCleanNumbers((prev ? prev.trim() + '\n' : '') + res.numbers.join('\n'))
      return merged.numbers.join('\n')
    })
    toast.success(`${res.numbers.length} números · ${res.noise} nombres eliminados`)
  }}
  />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <CheckCircle2 size={10} /> {formStats.total} únicos
              </div>
              {formStats.duplicados > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-amber-400">
                  <AlertCircle size={10} /> {formStats.duplicados} duplicados filtrados
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 btn-primary rounded-xl flex items-center justify-center gap-2">
              <Save size={14} /> {editingBase ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      </PremiumModal>

      {/* MODAL: Preview */}
      <PremiumModal open={showPreview} onClose={() => setShowPreview(false)} title={
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-400" />
          {previewBase?.nombre}
        </div>
      }>
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: previewBase?.color }}
            >
              {previewBase?.total} números
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {previewBase?.duplicados ? `${previewBase.duplicados} duplicados filtrados` : "Sin duplicados"}
            </span>
          </div>
          <div className="relative">
            <textarea
              readOnly
              value={previewBase?.contenido || ""}
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono resize-none"
            />
            <button
              onClick={() => previewBase && copyToClipboard(previewBase.contenido)}
              className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => previewBase && exportTXT(previewBase)}
              className="flex-1 py-2.5 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Exportar .txt
            </button>
            <button
              onClick={() => { setShowPreview(false); previewBase && openEdit(previewBase) }}
              className="flex-1 py-2.5 btn-primary rounded-xl flex items-center justify-center gap-2"
            >
              <Edit3 size={14} /> Editar
            </button>
          </div>
        </div>
      </PremiumModal>

      {/* ConfirmDialog */}
      <ConfirmDialog open={isOpen} onClose={onCancel} onConfirm={onConfirm} {...options} />
    </div>
  )
}