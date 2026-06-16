"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from "react"
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
  Users,
  Ban,
  ShieldCheck
} from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"
import { useConfirm } from "@/hooks/useConfirm" // si usás el hook
import { useRouter } from "next/navigation"
import { Sidebar } from "../../components/ui/sidebar"
import { PremiumModal } from "../../components/ui/modal"
import { useDemoMode } from "@/hooks/useDemo"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  tags: string[]
  notes?: string
  createdAt: string
  isBlacklisted?: boolean
}

interface TagItem {
  id: string
  name: string
  color: string
}

type ContactRow = Contact & { isBlacklisted?: boolean }

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
const { isDemo } = useDemoMode()

const [showBlacklistOnly, setShowBlacklistOnly] = useState(false)
const [showBulkTagModal, setShowBulkTagModal] = useState(false)


  const fetchContacts = useCallback(async () => {
    setLoading(true)

    if (isDemo) {
      // DEMO: 30 contactos enriquecidos
      const demoContacts: Contact[] = [
        { id: "c-1", name: "Juan Pérez", phone: "5491130012345", email: "juan.perez@gmail.com", company: "Pérez & Asoc.", tags: ["Cliente", "VIP"], notes: "Cliente desde 2023. Compra mensual.", createdAt: "2026-05-28T10:00:00Z" },
        { id: "c-2", name: "María González", phone: "5491130023456", email: "maria.g@hotmail.com", company: "González Logistics", tags: ["Cliente", "Hot"], notes: "Interesada en volumen mayorista.", createdAt: "2026-05-27T14:30:00Z" },
        { id: "c-3", name: "Carlos Rodríguez", phone: "5491130034567", email: "crodriguez@empresa.com", company: "TechFlow SA", tags: ["Lead", "Whatsapp"], notes: "", createdAt: "2026-05-26T09:15:00Z" },
        { id: "c-4", name: "Ana Martínez", phone: "5491130045678", email: "ana.martinez@outlook.com", company: "Martinez Design", tags: ["Cliente"], notes: "Paga siempre a término.", createdAt: "2026-05-25T16:00:00Z" },
        { id: "c-5", name: "Luis Fernández", phone: "5491130056789", email: "luis.f@yahoo.com", company: "Fernández Group", tags: ["Prospecto", "Lead"], notes: "Llamar la semana que viene.", createdAt: "2026-05-24T11:20:00Z" },
        { id: "c-6", name: "Laura López", phone: "5491130067890", email: "laura.lopez@gmail.com", company: "López Studio", tags: ["Cliente", "VIP", "Hot"], notes: "Top 5 compradores del mes.", createdAt: "2026-05-23T08:45:00Z" },
        { id: "c-7", name: "Pedro Sánchez", phone: "5491130078901", email: "pedro.sanchez@corp.com", company: "Sánchez Industries", tags: ["Proveedor"], notes: "Distribuidor exclusivo zona norte.", createdAt: "2026-05-22T13:10:00Z" },
        { id: "c-8", name: "Sofía Torres", phone: "5491130089012", email: "sofia.torres@mail.com", company: "Torres Moda", tags: ["Lead", "Whatsapp"], notes: "", createdAt: "2026-05-21T17:30:00Z" },
        { id: "c-9", name: "Diego Ramírez", phone: "5491130090123", email: "diego.ramirez@gmail.com", company: "Ramirez Digital", tags: ["Cliente", "Inactivo"], notes: "No compra hace 3 meses. Reactivar.", createdAt: "2026-05-20T10:00:00Z" },
        { id: "c-10", name: "Valentina Flores", phone: "5491130101234", email: "valen.flores@hotmail.com", company: "Flores Beauty", tags: ["Cliente", "Hot"], notes: "", createdAt: "2026-05-19T15:45:00Z" },
        { id: "c-11", name: "Martín Acosta", phone: "5491130112345", email: "martin.acosta@gmail.com", company: "Acosta Motors", tags: ["Lead"], notes: "Presupuesto aprobado.", createdAt: "2026-05-18T09:00:00Z" },
        { id: "c-12", name: "Camila Ruiz", phone: "5491130123456", email: "camila.ruiz@outlook.com", company: "Ruiz Consulting", tags: ["Cliente", "VIP"], notes: "Requiere factura A.", createdAt: "2026-05-17T12:20:00Z" },
        { id: "c-13", name: "Julián Castro", phone: "5491130134567", email: "julian.castro@empresa.com", company: "Castro Tech", tags: ["Prospecto"], notes: "", createdAt: "2026-05-16T14:00:00Z" },
        { id: "c-14", name: "Paula Medina", phone: "5491130145678", email: "paula.medina@gmail.com", company: "Medina Legal", tags: ["Cliente", "Whatsapp"], notes: "Contactar solo por WhatsApp.", createdAt: "2026-05-15T11:10:00Z" },
        { id: "c-15", name: "Tomás Herrera", phone: "5491130156789", email: "tomas.herrera@mail.com", company: "Herrera Construcciones", tags: ["Lead", "Hot"], notes: "Obra nueva en Córdoba.", createdAt: "2026-05-14T16:30:00Z" },
        { id: "c-16", name: "Lucía Silva", phone: "5491130167890", email: "lucia.silva@hotmail.com", company: "Silva Arquitectura", tags: ["Cliente"], notes: "", createdAt: "2026-05-13T08:00:00Z" },
        { id: "c-17", name: "Nicolás Vargas", phone: "5491130178901", email: "nico.vargas@gmail.com", company: "Vargas Sports", tags: ["Inactivo"], notes: "Dado de baja temporalmente.", createdAt: "2026-05-12T13:45:00Z" },
        { id: "c-18", name: "Emilia Rojas", phone: "5491130189012", email: "emilia.rojas@outlook.com", company: "Rojas Alimentos", tags: ["Cliente", "VIP", "Hot"], notes: "Pedido recurrente semanal.", createdAt: "2026-05-11T10:30:00Z" },
        { id: "c-19", name: "Bruno Molina", phone: "5491130190123", email: "bruno.molina@corp.com", company: "Molina Seguros", tags: ["Lead"], notes: "", createdAt: "2026-05-10T17:00:00Z" },
        { id: "c-20", name: "Antonella Cruz", phone: "5491130201234", email: "anto.cruz@gmail.com", company: "Cruz Fashion", tags: ["Cliente", "Whatsapp"], notes: "Influencer. Potencial embajadora.", createdAt: "2026-05-09T09:15:00Z" },
        { id: "c-21", name: "Facundo Ortiz", phone: "5491130212345", email: "facu.ortiz@hotmail.com", company: "Ortiz Software", tags: ["Prospecto", "Lead"], notes: "Evaluando propuesta técnica.", createdAt: "2026-05-08T14:20:00Z" },
        { id: "c-22", name: "Morena Luna", phone: "5491130223456", email: "morena.luna@gmail.com", company: "Luna Wellness", tags: ["Cliente"], notes: "", createdAt: "2026-05-07T11:00:00Z" },
        { id: "c-23", name: "Santiago Reyes", phone: "5491130234567", email: "santi.reyes@outlook.com", company: "Reyes Transporte", tags: ["Proveedor", "VIP"], notes: "Logística nacional.", createdAt: "2026-05-06T16:45:00Z" },
        { id: "c-24", name: "Victoria Peña", phone: "5491130245678", email: "vicky.pena@gmail.com", company: "Peña Educación", tags: ["Lead", "Hot"], notes: "Curso de capacitación corporativa.", createdAt: "2026-05-05T08:30:00Z" },
        { id: "c-25", name: "Mateo Giménez", phone: "5491130256789", email: "mateo.gimenez@mail.com", company: "Giménez Audio", tags: ["Cliente", "Inactivo"], notes: "Migró a competencia. Rescatar.", createdAt: "2026-05-04T12:00:00Z" },
        { id: "c-26", name: "Julieta Navarro", phone: "5491130267890", email: "juli.navarro@hotmail.com", company: "Navarro Deco", tags: ["Cliente", "VIP"], notes: "Compra por mayor.", createdAt: "2026-05-03T15:15:00Z" },
        { id: "c-27", name: "Franco Ibáñez", phone: "5491130278901", email: "franco.ibanez@gmail.com", company: "Ibáñez Muebles", tags: ["Prospecto"], notes: "", createdAt: "2026-05-02T10:45:00Z" },
        { id: "c-28", name: "Milagros Sosa", phone: "5491130289012", email: "mili.sosa@outlook.com", company: "Sosa Fitness", tags: ["Cliente", "Whatsapp", "Hot"], notes: "Franquicias.", createdAt: "2026-05-01T09:00:00Z" },
        { id: "c-29", name: "Agustín Morales", phone: "5491130290123", email: "agus.morales@corp.com", company: "Morales Electrónica", tags: ["Lead"], notes: "Presupuesto enviado.", createdAt: "2026-04-30T14:30:00Z" },
        { id: "c-30", name: "Rocío Mendoza", phone: "5491130301234", email: "rocio.mendoza@gmail.com", company: "Mendoza Turismo", tags: ["Cliente", "VIP", "Hot"], notes: "Paquetes corporativos.", createdAt: "2026-04-29T11:20:00Z" },
                { id: "c-31", name: "Roberto Spam", phone: "5491130312345", email: "roberto.spam@gmail.com", company: "Spam Corp", tags: ["blacklist"], notes: "Auto-blacklist: respondió 'basta'", createdAt: "2026-06-10T10:00:00Z", isBlacklisted: true },
        { id: "c-32", name: "Luciana No Molestar", phone: "5491130323456", email: "luciana.nm@hotmail.com", company: "", tags: ["blacklist", "Lead"], notes: "Auto-blacklist: respondió 'no molesten'", createdAt: "2026-06-09T14:00:00Z", isBlacklisted: true },
        { id: "c-33", name: "Mario Eliminar", phone: "5491130334567", email: "mario.eliminar@outlook.com", company: "Eliminar SA", tags: ["blacklist"], notes: "Auto-blacklist: pidió 'eliminar'", createdAt: "2026-06-08T09:30:00Z", isBlacklisted: true },
      ]

      // Filtrar por búsqueda
      let filtered = demoContacts
            if (search) {
  const q = search.toLowerCase()
  filtered = filtered.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.phone.includes(q) || 
    c.email?.toLowerCase().includes(q) ||
    c.company?.toLowerCase().includes(q)
  )
}
      // Filtrar por tags múltiples
      if (selectedTags.length > 0) {
        filtered = filtered.filter(c => 
          selectedTags.some(tag => c.tags.includes(tag))
        )
      }

      setContacts(filtered)
      setLoading(false)
      return
    }

    // CÓDIGO ORIGINAL
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (selectedTags.length > 0) {
        selectedTags.forEach(t => params.append("tag", t))
      }
      
      const res = await fetch(`/api/contacts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      const contacts = data.contacts || []
setContacts(contacts)
    } catch {
      toast.error("Error cargando contactos")
    } finally {
      setLoading(false)
    }
  }, [search, selectedTags, token, isDemo])

   const fetchTags = useCallback(async () => {
    if (isDemo) {
      setTags([
        { id: "tag-1", name: "Cliente", color: "#3b82f6" },
        { id: "tag-2", name: "Lead", color: "#10b981" },
        { id: "tag-3", name: "VIP", color: "#f59e0b" },
        { id: "tag-4", name: "Proveedor", color: "#8b5cf6" },
        { id: "tag-5", name: "Prospecto", color: "#ec4899" },
        { id: "tag-6", name: "Inactivo", color: "#64748b" },
        { id: "tag-7", name: "Hot", color: "#ef4444" },
        { id: "tag-8", name: "Whatsapp", color: "#06b6d4" },
      ])
      return
    }
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
  }, [token, isDemo])

  useEffect(() => {
    fetchContacts()
    fetchTags()
  }, [fetchContacts, fetchTags])

  const toggleSelect = (id: string) => {
      if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
  if (isDemo) { toast.info("🎮 Acción disponible en modo real"); return }
  if (selectedIds.size === displayedContacts.length && displayedContacts.length > 0) {
    setSelectedIds(new Set())
  } else {
    setSelectedIds(new Set(displayedContacts.map(c => c.id)))
  }
}

  const deleteSelected = async () => {
      if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
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
      if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
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
      if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
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

  const handleAddBlacklist = async (phone: string) => {
  if (isDemo) { toast.info("🎮 Blacklist disponible en modo real"); return }
  try {
    const res = await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ phone, reason: 'manual desde contactos' })
    })
    if (res.ok) {
      toast.success('🚫 Agregado a blacklist')
      fetchContacts()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Error')
    }
  } catch {
    toast.error('Error de red')
  }
}

const handleRemoveBlacklist = async (phone: string) => {
  if (isDemo) { toast.info("🎮 Blacklist disponible en modo real"); return }
  try {
    const res = await fetch(`/api/blacklist/${phone.replace(/\D/g, '')}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      toast.success('✅ Removido de blacklist')
      fetchContacts()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Error')
    }
  } catch {
    toast.error('Error de red')
  }
}

const handleBulkTag = async (tagName: string) => {
  if (isDemo) { toast.info("🎮 Etiquetado masivo disponible en modo real"); return }
  if (selectedIds.size === 0) return
  try {
    const ids = Array.from(selectedIds)
    const updates = ids.map(id => {
      const contact = contacts.find(c => c.id === id)
      if (!contact || contact.tags.includes(tagName)) return Promise.resolve()
      return fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ tags: [...contact.tags, tagName] })
      })
    })
    await Promise.all(updates)
    toast.success(`Etiqueta "${tagName}" aplicada a ${ids.length} contactos`)
    setShowBulkTagModal(false)
    setSelectedIds(new Set())
    fetchContacts()
  } catch {
    toast.error('Error aplicando etiquetas')
  }
}

  const handleCSVImport = async (csvText: string) => {
      if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
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
    if (isDemo) { toast.info("🎮 Eliminar contactos disponible en modo real"); return }
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


const displayedContacts = useMemo(() => {
  let result = contacts
  if (showBlacklistOnly) {
    result = result.filter(c => c.isBlacklisted)
  }
  if (selectedTags.length > 0) {
    result = result.filter(c => selectedTags.some(tag => c.tags.includes(tag)))
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    )
  }
  return result
}, [contacts, showBlacklistOnly, selectedTags, search])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
      <Sidebar onSettings={() => {}} />
      
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <header className="h-16 bg-[var(--bg-card)]/60 backdrop-blur-md border-b border-[var(--border-color)]/60 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Contactos</h1>
                      <p className="text-xs text-[var(--text-muted)]">{displayedContacts.length} contactos encontrados {selectedTags.length > 0 && `· ${selectedTags.length} filtros`} {showBlacklistOnly && '· Blacklist'}</p>
          </div>
          <div className="flex items-center gap-2">
         
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
    onClick={() => { setSelectedTags([]); setShowBlacklistOnly(false); }}
    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${selectedTags.length === 0 && !showBlacklistOnly ? 'bg-blue-600 text-[var(--text-primary)] border-blue-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}
  >
    Todos
  </button>

  {/* Tag Blacklist */}
  <button
    onClick={() => {
      setShowBlacklistOnly(!showBlacklistOnly)
      setSelectedTags([])
    }}
    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${showBlacklistOnly ? 'bg-red-500/10 text-red-400 border-red-500' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-red-500/50'}`}
  >
    <Ban size={10} className={showBlacklistOnly ? 'text-red-400' : 'text-red-400/50'} />
    Blacklist
    {showBlacklistOnly && <span className="ml-1 text-[10px]">✓</span>}
  </button>

  {tags.map(tag => {
    const isSelected = selectedTags.includes(tag.name)
    return (
      <button
        key={tag.id}
        onClick={() => {
          if (isSelected) {
            setSelectedTags(prev => prev.filter(t => t !== tag.name))
          } else {
            setSelectedTags(prev => [...prev, tag.name])
          }
        }}
        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${isSelected ? 'text-[var(--text-primary)] border-white/30' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-slate-600'}`}
        style={isSelected ? { backgroundColor: tag.color + '30', borderColor: tag.color } : {}}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
        {tag.name}
        {isSelected && <span className="ml-1 text-[10px]">✓</span>}
      </button>
    )
  })}
</div>
          </div>

          {selectedIds.size > 0 && (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
  >
    <span className="text-sm text-blue-400 font-medium">{selectedIds.size} seleccionados</span>
    
    <button 
      onClick={() => setShowBulkTagModal(true)} 
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
    >
      <Tag size={14} /> Etiquetar
    </button>
    
    <button 
      onClick={deleteSelected} 
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
    >
      <Trash2 size={14} /> Eliminar
    </button>
    
    <button 
      onClick={() => setSelectedIds(new Set())} 
      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    >
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
                    {displayedContacts.map((contact) => (

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
      {contact.name?.charAt(0).toUpperCase() || '?'}
    </div>
    <div>
      <div className="flex items-center gap-2">
  <p className="text-sm font-medium text-[var(--text-primary)]">{contact.name}</p>
  {contact.isBlacklisted && (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
      <Ban size={10} /> BLACKLIST
    </span>
  )}
</div>
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
                            {contact.tags.map((t, i) => {
  const tagObj = tags.find(tag => tag.name === t)
  return (
    <span 
      key={i} 
      className="px-2 py-0.5 text-[10px] rounded-full border"
      style={{ 
        backgroundColor: tagObj ? tagObj.color + '25' : 'var(--bg-input)', 
        borderColor: tagObj ? tagObj.color + '50' : 'var(--border-color)',
        color: tagObj ? tagObj.color : 'var(--text-secondary)'
      }}
    >
      {t}
    </span>
  )
})}
                            {contact.tags.length === 0 && <span className="text-xs text-slate-700">Sin tags</span>}
                          </div>
                        </td>
                        <td className="p-4">
  <div className="flex items-center gap-1">
    {contact.isBlacklisted ? (
      <button 
        onClick={() => handleRemoveBlacklist(contact.phone)}
        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
        title="Quitar de blacklist"
      >
        <ShieldCheck size={16} />
      </button>
    ) : (
      <button 
        onClick={() => handleAddBlacklist(contact.phone)}
        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Agregar a blacklist"
      >
        <Ban size={16} />
      </button>
    )}
    <button 
      onClick={() => setShowEdit(contact)}
      className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
      title="Editar"
    >
      <Edit3 size={16} />
    </button>
  </div>
</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {displayedContacts.length === 0 && !loading && (

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

      {/* MODAL: Bulk Tag */}
<PremiumModal 
  open={showBulkTagModal} 
  onClose={() => setShowBulkTagModal(false)} 
  title={`Etiquetar ${selectedIds.size} contactos`}
>
  <div className="space-y-4">
    <p className="text-sm text-[var(--text-secondary)]">Seleccioná la etiqueta a aplicar:</p>
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleBulkTag(tag.name)}
          className="px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 hover:scale-105"
          style={{ 
            backgroundColor: tag.color + '25', 
            borderColor: tag.color + '50', 
            color: tag.color 
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
          {tag.name}
        </button>
      ))}
    </div>
    {tags.length === 0 && (
      <p className="text-sm text-[var(--text-muted)] text-center py-4">
        No hay etiquetas creadas. Creá una primero en <strong>Tags</strong>.
      </p>
    )}
  </div>
</PremiumModal>


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