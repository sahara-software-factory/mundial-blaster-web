"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Tag,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Filter,
  Download,
  Users
} from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { useConfirm } from "@/hooks/useConfirm" // si usás el hook
import { useRouter } from "next/navigation"
import { Sidebar } from "../components/ui/sidebar"
import { PremiumModal } from "../components/ui/modal"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  tags: string[]
  notes?: string
  createdAt: string
}

interface TagItem {
  id: string
  name: string
  color: string
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Contact | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const { isOpen, options, confirm, onConfirm, onCancel } = useConfirm()
  const [importFileLoading, setImportFileLoading] = useState(false)
const [importFileProgress, setImportFileProgress] = useState(0)
const [importPreview, setImportPreview] = useState<any[]>([])
const [importDragActive, setImportDragActive] = useState(false)
const [pendingImportData, setPendingImportData] = useState<any[]>([])
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedTag) params.append("tag", selectedTag)
      
      const res = await fetch(`/api/contacts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setContacts(data.contacts || [])
    } catch {
      toast.error("Error cargando contactos")
    } finally {
      setLoading(false)
    }
  }, [search, selectedTag, token])

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      setTags(data.tags || [])
    } catch {
      // silent
    }
  }, [token])

  useEffect(() => {
    fetchContacts()
    fetchTags()
  }, [fetchContacts, fetchTags])

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)))
    }
  }

  const deleteSelected = async () => {
  const ok = await confirm({
    title: "Eliminar contactos",
    description: `¿Eliminar ${selectedIds.size} contactos seleccionados? Esta acción no se puede deshacer.`,
    confirmText: "Eliminar",
    variant: "danger",
  })
  if (!ok) return
    try {
      const res = await fetch("/api/contacts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        toast.success(`${selectedIds.size} contactos eliminados`)
        setSelectedIds(new Set())
        fetchContacts()
      }
    } catch {
      toast.error("Error eliminando")
    }
  }

  const handleCreate = async (form: any) => {
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Contacto creado")
        setShowCreate(false)
        fetchContacts()
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
      const res = await fetch(`/api/contacts/${showEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Contacto actualizado")
        setShowEdit(null)
        fetchContacts()
      } else {
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const handleCSVImport = async (csvText: string) => {
    setIsImporting(true)
    setImportProgress(0)
    
    const lines = csvText.split("\n").filter(l => l.trim())
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
    const rows = lines.slice(1)
    
    const contactsToImport = rows.map(row => {
      const cols = row.split(",").map(c => c.trim())
      const obj: any = {}
      headers.forEach((h, i) => obj[h] = cols[i])
      return {
        name: obj.name || obj.nombre || "Sin nombre",
        phone: obj.phone || obj.telefono || obj.numero || "",
        email: obj.email || obj.correo || "",
        company: obj.company || obj.empresa || "",
        tags: obj.tags ? obj.tags.split(";") : [],
      }
    }).filter(c => c.phone)

    // Simular progreso
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setImportProgress(Math.min(progress, 90))
    }, 200)

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contacts: contactsToImport }),
      })
      const data = await res.json()
      clearInterval(interval)
      setImportProgress(100)
      
      setTimeout(() => {
        setIsImporting(false)
        setShowImport(false)
        setImportProgress(0)
        toast.success(`Importados: ${data.created || 0} contactos${data.errors ? `, ${data.errors} errores` : ''}`)
        fetchContacts()
      }, 500)
    } catch {
      clearInterval(interval)
      setIsImporting(false)
      toast.error("Error importando")
    }
  }

  const extractContactsFromSheet = (data: any[][]): any[] => {
  if (!data || data.length < 2) return []
  
  const headers = data[0].map((h: any) => String(h || '').toLowerCase().trim())
  const contacts: any[] = []
  
  // Mapeo flexible de columnas
  const getCol = (row: any[], possibleNames: string[]) => {
    for (const name of possibleNames) {
      const idx = headers.indexOf(name)
      if (idx !== -1 && row[idx] !== undefined) return String(row[idx]).trim()
    }
    return ''
  }
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || row.every((c: any) => !c)) continue
    
    const name = getCol(row, ['name', 'nombre', 'nombres', 'contacto', 'cliente'])
    const phone = getCol(row, ['phone', 'telefono', 'teléfono', 'numero', 'número', 'celular', 'mobile', 'whatsapp'])
    const email = getCol(row, ['email', 'correo', 'mail', 'e-mail'])
    const company = getCol(row, ['company', 'empresa', 'organizacion', 'organización', 'negocio'])
    const tagsRaw = getCol(row, ['tags', 'etiquetas', 'tag', 'categoria', 'categoría', 'grupo'])
    
    const cleanedPhone = phone.replace(/\D/g, '')
    if (!name && !cleanedPhone) continue
    
    contacts.push({
      name: name || 'Sin nombre',
      phone: cleanedPhone,
      email,
      company,
      tags: tagsRaw ? tagsRaw.split(/[;,]/).map((t: string) => t.trim()).filter(Boolean) : [],
    })
  }
  
  return contacts
}

const handleContactFile = (file: File) => {
  if (!file) return
  setImportFileLoading(true)
  setImportFileProgress(0)
  setImportPreview([])

  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 12
    setImportFileProgress(Math.min(progress, 85))
  }, 150)

  const reader = new FileReader()

  reader.onload = (e) => {
    clearInterval(interval)
    setImportFileProgress(100)
    
    const buffer = e.target?.result
    let contacts: any[] = []

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const XLSX = require('xlsx')
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        contacts = extractContactsFromSheet(jsonData as any[][])
      } else {
        const text = String(buffer || '')
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0]?.split(',').map((h: string) => h.trim().toLowerCase()) || []
        const hasHeaders = headers.some(h => ['name','nombre','phone','telefono'].includes(h))
        
        const startIdx = hasHeaders ? 1 : 0
        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c: string) => c.trim())
          if (cols.length < 2 && !cols[0]) continue
          
          contacts.push({
            name: cols[0] || 'Sin nombre',
            phone: String(cols[1] || '').replace(/\D/g, ''),
            email: cols[2] || '',
            company: cols[3] || '',
            tags: cols[4] ? cols[4].split(/[;,]/).map((t: string) => t.trim()).filter(Boolean) : [],
          })
        }
      }
    } catch (err) {
      console.error('Error parseando:', err)
      toast.error('Error leyendo el archivo')
      setImportFileLoading(false)
      return
    }

    setTimeout(() => {
      setImportFileLoading(false)
      setImportFileProgress(0)
      setImportPreview(contacts.slice(0, 5))
      setPendingImportData(contacts)
      
      if (contacts.length === 0) {
        toast.error('No se encontraron contactos válidos')
      } else {
        toast.success(`${contacts.length} contactos encontrados`)
      }
    }, 400)
  }

  reader.onerror = () => {
    clearInterval(interval)
    setImportFileLoading(false)
    toast.error('Error leyendo archivo')
  }

  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    reader.readAsArrayBuffer(file)
  } else {
    reader.readAsText(file)
  }
}

const confirmImportContacts = async () => {
  if (pendingImportData.length === 0) return
  
  setImportFileLoading(true)
  let created = 0
  let errors = 0
  
  for (const item of pendingImportData) {
    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: item.name,
          phone: item.phone,
          email: item.email,
          company: item.company,
          tags: item.tags,
          source: 'csv'
        }),
      })
      created++
    } catch {
      errors++
    }
  }
  
  setImportFileLoading(false)
  setShowImport(false)
  setImportPreview([])
  setPendingImportData([])
  toast.success(`Importados: ${created} contactos${errors > 0 ? `, ${errors} errores` : ''}`)
  fetchContacts()
}

const onContactDrag = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.type === "dragenter" || e.type === "dragover") setImportDragActive(true)
  else if (e.type === "dragleave") setImportDragActive(false)
}

const onContactDrop = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setImportDragActive(false)
  if (e.dataTransfer.files?.[0]) handleContactFile(e.dataTransfer.files[0])
}

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)]/60 backdrop-blur-md border-b border-[var(--border-color)]/60 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Contactos</h1>
            <p className="text-xs text-[var(--text-muted)]">{contacts.length} contactos encontrados</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTagManager(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] rounded-xl transition-all">
              <Tag size={16} /> Tags
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] rounded-xl transition-all">
              <Upload size={16} /> Importar CSV
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all">
              <Plus size={16} /> Nuevo Contacto
            </button>
          </div>
        </header>

        <main className="p-6">
          {/* Stats + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono, email..."
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${!selectedTag ? 'bg-blue-600 text-[var(--text-primary)] border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}
              >
                Todos
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedTag === tag.name ? 'text-[var(--text-primary)] border-white/30' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}
                  style={selectedTag === tag.name ? { backgroundColor: tag.color + '30', borderColor: tag.color } : {}}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
            >
              <span className="text-sm text-blue-400 font-medium">{selectedIds.size} seleccionados</span>
              <button onClick={deleteSelected} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <Trash2 size={14} /> Eliminar
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                Cancelar
              </button>
            </motion.div>
          )}

          {/* Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)]/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]/60 text-left">
                    <th className="p-4 w-12">
                      <button onClick={selectAll} className="h-4 w-4 rounded border border-[var(--border-hover)] flex items-center justify-center transition-colors hover:border-blue-500">
                        {selectedIds.size === contacts.length && contacts.length > 0 && <Check size={12} className="text-blue-400" />}
                      </button>
                    </th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contacto</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tags</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider w-16">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {contacts.map((contact) => (
                      <motion.tr
                        key={contact.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-b border-[var(--border-color)]/30 hover:bg-[#1E293B]/20 transition-colors ${selectedIds.has(contact.id) ? 'bg-blue-500/5' : ''}`}
                      >
                        <td className="p-4">
                          <button 
                            onClick={() => toggleSelect(contact.id)}
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${selectedIds.has(contact.id) ? 'bg-blue-500 border-blue-500' : 'border-[var(--border-hover)] hover:border-blue-500'}`}
                          >
                            {selectedIds.has(contact.id) && <Check size={12} className="text-[var(--text-primary)]" />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{contact.name}</p>
                              {contact.company && <p className="text-xs text-[var(--text-muted)]">{contact.company}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                            <Phone size={14} className="text-[var(--text-muted)]" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {contact.email ? (
                            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                              <Mail size={14} className="text-[var(--text-muted)]" />
                              {contact.email}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-700">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {contact.tags.map((t, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#1E293B] text-[var(--text-secondary)] text-[10px] rounded-full border border-[var(--border-hover)]">
                                {t}
                              </span>
                            ))}
                            {contact.tags.length === 0 && <span className="text-xs text-slate-700">Sin tags</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => setShowEdit(contact)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {contacts.length === 0 && !loading && (
              <div className="py-16 text-center">
                <Users size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-[var(--text-muted)] text-sm">No hay contactos</p>
                <button onClick={() => setShowCreate(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                  + Crear el primero
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: Crear Contacto */}
      <ContactFormModal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSubmit={handleCreate}
        tags={tags}
      />

      {/* MODAL: Editar Contacto */}
      {showEdit && (
        <ContactFormModal 
          open={!!showEdit} 
          onClose={() => setShowEdit(null)} 
          onSubmit={handleEdit}
          tags={tags}
          initial={showEdit}
        />
      )}

      {/* MODAL: Importar CSV */}
      {/* MODAL: Importar CSV */}
<PremiumModal open={showImport} onClose={() => !importFileLoading && setShowImport(false)} title="Importar Contactos">
  <div className="space-y-4">
    {/* Plantilla + Dropzone */}
    <div className="flex items-center justify-between">
      <p className="text-sm text-[var(--text-secondary)]">
        Columnas: <code className="text-blue-400">name, phone, email, company, tags</code>
      </p>
      <button
        onClick={() => {
          const csvContent = `name,phone,email,company,tags
Juan Perez,5491123456789,juan@test.com,Empresa SA,cliente;hot
Maria Lopez,5491165432109,maria@test.com,Corp,lead`
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'plantilla-contactos.csv'
          link.click()
          toast.success("Plantilla descargada")
        }}
        className="text-xs px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
      >
        📥 Plantilla
      </button>
    </div>

    {importFileLoading ? (
      <div className="space-y-4 py-6">
        <div className="w-full h-3 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${importFileProgress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          />
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          {importFileProgress < 100 ? 'Procesando...' : 'Finalizando...'}
        </p>
      </div>
    ) : importPreview.length > 0 ? (
      <div className="space-y-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-sm text-emerald-400 font-medium">
            {pendingImportData.length} contactos listos para importar
          </p>
        </div>
        <div className="bg-[var(--bg-input)] rounded-xl p-3 max-h-40 overflow-y-auto border border-[var(--border-color)] space-y-2">
          {importPreview.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] truncate">{c.name}</p>
                <p className="text-[var(--text-muted)] font-mono">{c.phone}</p>
              </div>
            </div>
          ))}
          {pendingImportData.length > importPreview.length && (
            <p className="text-xs text-[var(--text-muted)] text-center">
              +{pendingImportData.length - importPreview.length} más
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setImportPreview([]); setPendingImportData([]) }}
            className="flex-1 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] rounded-xl text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={confirmImportContacts}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-xl text-sm font-bold"
          >
            Importar {pendingImportData.length}
          </button>
        </div>
      </div>
    ) : (
      <>
        <div
          onDragEnter={onContactDrag}
          onDragLeave={onContactDrag}
          onDragOver={onContactDrag}
          onDrop={onContactDrop}
          onClick={() => document.getElementById('contact-file-input')?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            importDragActive 
              ? 'border-blue-500 bg-blue-500/5' 
              : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
          }`}
        >
          <input
            id="contact-file-input"
            type="file"
            accept=".xlsx,.csv,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleContactFile(e.target.files[0])}
          />
          <Upload size={24} className="mx-auto text-blue-400 mb-3" />
          <p className="text-sm text-[var(--text-primary)] font-medium">Arrastrá o hacé clic</p>
          <p className="text-xs text-[var(--text-muted)]">Excel, CSV o TXT</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[var(--bg-card)] text-[var(--text-muted)]">O pegá CSV</span>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder={`name,phone,email,company,tags
Juan Perez,5491123456789,juan@test.com,Empresa SA,cliente`}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm font-mono placeholder:text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
          onChange={(e) => {
            if (e.target.value.includes('\n') && e.target.value.split('\n').length > 1) {
              handleCSVImport(e.target.value)
            }
          }}
        />
      </>
    )}
  </div>
</PremiumModal>

      {/* MODAL: Tag Manager */}
      <TagManagerModal 
        open={showTagManager} 
        onClose={() => setShowTagManager(false)} 
        tags={tags}
        onRefresh={fetchTags}
      />
      <ConfirmDialog
  open={isOpen}
  onClose={onCancel}
  onConfirm={onConfirm}
  {...options}
/>
    </div>
  )
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function ContactFormModal({ open, onClose, onSubmit, tags, initial }: any) {
    const [form, setForm] = useState({
    name: initial?.name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    company: initial?.company || "",
    tags: initial?.tags || [] as string[],
    notes: initial?.notes || "",
  })

  return (
    <PremiumModal open={open} onClose={onClose} title={initial ? "Editar Contacto" : "Nuevo Contacto"}>
       <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Teléfono *</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Empresa</label>
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Etiquetas</label>
          {tags.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              No hay etiquetas creadas. Primero creá etiquetas en el módulo <strong>Tags</strong>.
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {tags.map((t: any) => {
                const isSelected = form.tags.includes(t.name)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setForm({...form, tags: form.tags.filter((x: string) => x !== t.name)})
                      } else {
                        setForm({...form, tags: [...form.tags, t.name]})
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected 
                        ? 'text-[var(--text-primary)]' 
                        : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-slate-500'
                    }`}
                    style={isSelected ? { backgroundColor: t.color + '40', borderColor: t.color, color: t.color } : {}}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {t.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Notas</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500 resize-none" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-[var(--text-primary)] rounded-xl transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold rounded-xl transition-colors">{initial ? "Guardar" : "Crear"}</button>
        </div>
      </form>
      
    </PremiumModal>
    
  )
}

function TagManagerModal({ open, onClose, tags, onRefresh }: any) {
  const [newTag, setNewTag] = useState("")
  const [newColor, setNewColor] = useState("#3B82F6")
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''

  const createTag = async () => {
    if (!newTag.trim()) return
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTag, color: newColor }),
      })
      if (res.ok) {
        toast.success("Tag creado")
        setNewTag("")
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error")
      }
    } catch {
      toast.error("Error de red")
    }
  }

  const deleteTag = async (id: string) => {
    if (!confirm("¿Eliminar tag?")) return
    try {
      await fetch(`/api/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      onRefresh()
    } catch {
      toast.error("Error eliminando")
    }
  }

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

  return (
    <PremiumModal open={open} onClose={onClose} title="Gestionar Tags">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            value={newTag} 
            onChange={e => setNewTag(e.target.value)} 
            placeholder="Nuevo tag..." 
            className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`h-8 w-8 rounded-lg transition-all ${newColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={createTag} className="px-4 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] rounded-xl font-bold transition-colors">+</button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tags.map((tag: any) => (
            <div key={tag.id} className="flex items-center justify-between p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-sm text-[var(--text-primary)]">{tag.name}</span>
              </div>
              <button onClick={() => deleteTag(tag.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
              
            </div>
          ))}
          {tags.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-4">No hay tags</p>}
          
        </div>
        
      </div>
    </PremiumModal>
    
  )
}