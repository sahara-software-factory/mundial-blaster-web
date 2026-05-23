// app/settings/page.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { user, refetch } = useAuth()
  const [tab, setTab] = useState<"profile" | "security">("profile")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    setError("")
    
    const form = new FormData(e.currentTarget)
    const token = localStorage.getItem('mb_token')
    
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          email: form.get("email"),
          current_password: form.get("current_password"),
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setMessage("Perfil actualizado")
      refetch()
    } catch (e: any) {
      setError(e.message)
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">⚙️ Configuración</h1>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("profile")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "profile" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setTab("security")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "security" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Seguridad
          </button>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-4 text-sm">
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm">
            {error}
          </motion.div>
        )}

        {tab === "profile" && (
          <form onSubmit={updateProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input name="nombre" defaultValue={user.nombre} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input name="email" type="email" defaultValue={user.email} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña actual (requerida para cambiar email)</label>
              <input name="current_password" type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">
              Guardar cambios
            </button>
          </form>
        )}

        {tab === "security" && (
          <form onSubmit={updatePassword} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña actual</label>
              <input name="current" type="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nueva contraseña</label>
              <input name="new" type="password" required minLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirmar nueva contraseña</label>
              <input name="confirm" type="password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">
              Cambiar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}