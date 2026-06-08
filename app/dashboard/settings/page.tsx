// app/dashboard/settings/page.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { 
  User, Building2, Phone, Globe, Clock, Briefcase, Users, 
  Shield, Mail, Lock, CheckCircle2, ArrowLeft, Save
} from "lucide-react"

const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (GMT-3)" },
  { value: "America/Santiago", label: "Chile (GMT-4/-3)" },
  { value: "America/Mexico_City", label: "México (GMT-6)" },
  { value: "America/Bogota", label: "Colombia (GMT-5)" },
  { value: "America/Lima", label: "Perú (GMT-5)" },
  { value: "America/Caracas", label: "Venezuela (GMT-4)" },
  { value: "America/Montevideo", label: "Uruguay (GMT-3)" },
  { value: "America/Sao_Paulo", label: "Brasil (GMT-3)" },
  { value: "Europe/Madrid", label: "España (GMT+1/+2)" },
]

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "pt", label: "Portugués" },
  { value: "en", label: "English" },
]

const INDUSTRIES = [
  { value: "ecommerce", label: "E-commerce / Retail" },
  { value: "servicios", label: "Servicios Profesionales" },
  { value: "educacion", label: "Educación / Cursos" },
  { value: "salud", label: "Salud / Bienestar" },
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "otro", label: "Otro / General" },
]

const VOLUMES = [
  { value: "0-500", label: "0 - 500 contactos" },
  { value: "500-2000", label: "500 - 2.000 contactos" },
  { value: "2000-10000", label: "2.000 - 10.000" },
  { value: "10000+", label: "10.000+" },
]

export default function SettingsPage() {
  const { user, refetch } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"profile" | "security">("profile")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setSaving(true)

    const form = new FormData(e.currentTarget)
    const token = localStorage.getItem('mb_token')

    const body: any = {
      nombre: form.get("nombre"),
      email: form.get("email"),
      company_name: form.get("company_name"),
      phone: form.get("phone"),
      timezone: form.get("timezone"),
      language: form.get("language"),
      industry: form.get("industry"),
      expected_volume: form.get("expected_volume"),
    }

    const currentPw = form.get("current_password") as string
    if (currentPw) body.current_password = currentPw

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage("Perfil actualizado correctamente")
      refetch()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    setError("")

    const form = new FormData(e.currentTarget)
    const current = form.get("current") as string
    const newPass = form.get("new") as string
    const confirm = form.get("confirm") as string

    if (newPass !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    const token = localStorage.getItem('mb_token')

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: current,
          new_password: newPass,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage("Contraseña actualizada")
      e.currentTarget.reset()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 md:p-8">
  <div className="max-w-3xl mx-auto">
        {/* Header */}
                <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">⚙️ Configuración</h1>
            <p className="text-sm text-[#3D5060]">Gestioná tu perfil y seguridad</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("profile")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            tab === "profile" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <User size={14} className="inline mr-1.5 -mt-0.5" />
            Perfil
          </button>
          <button
            onClick={() => setTab("security")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "security" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#0A1020] text-[#3D5060] border border-white/5 hover:text-[#7A90A0]"
            }`}
          >
            <Shield size={14} className="inline mr-1.5 -mt-0.5" />
            Seguridad
          </button>
        </div>

        {/* Alerts */}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <CheckCircle2 size={14} /> {message}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm">
            {error}
          </motion.div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <form onSubmit={updateProfile} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.avatar || 'Felix'}&backgroundColor=transparent`} 
                  alt="avatar" 
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#EEF2FF]">{user.nombre}</p>
                <p className="text-xs text-[#3D5060]">{user.email}</p>
                {user.expected_volume && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                    <Users size={10} /> {user.expected_volume}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Nombre</label>
                <input name="nombre" defaultValue={user.nombre} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Email</label>
                <input name="email" type="email" defaultValue={user.email} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Empresa / Marca</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                <input name="company_name" defaultValue={user.company_name || ""} placeholder="Mi Empresa S.A." className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                  <input name="phone" defaultValue={user.phone || ""} placeholder="+54 9 11 1234-5678" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Zona horaria</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                  <select name="timezone" defaultValue={user.timezone || "America/Argentina/Buenos_Aires"} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors">
                    {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Idioma</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                  <select name="language" defaultValue={user.language || "es"} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Rubro</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                  <select name="industry" defaultValue={user.industry || ""} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors">
                    <option value="">Seleccionar...</option>
                    {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Volumen estimado</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                <select name="expected_volume" defaultValue={user.expected_volume || ""} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors">
                  <option value="">Seleccionar...</option>
                  {VOLUMES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-4">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Contraseña actual (requerida para guardar cambios)</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5060]" />
                <input name="current_password" type="password" required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 pl-10 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-[#021210] font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <form onSubmit={updatePassword} className="bg-[#0A1020] border border-white/5 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Contraseña actual</label>
              <input name="current" type="password" required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Nueva contraseña</label>
              <input name="new" type="password" required minLength={6} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Confirmar nueva contraseña</label>
              <input name="confirm" type="password" required className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none transition-colors" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
              Cambiar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}