"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const AVATARS = [
  { id: "avatar1", emoji: "👤", color: "bg-blue-500" },
  { id: "avatar2", emoji: "🧑‍💼", color: "bg-emerald-500" },
  { id: "avatar3", emoji: "👩‍💻", color: "bg-purple-500" },
  { id: "avatar4", emoji: "🦸", color: "bg-red-500" },
  { id: "avatar5", emoji: "🧙", color: "bg-amber-500" },
  { id: "avatar6", emoji: "🤖", color: "bg-cyan-500" },
  { id: "avatar7", emoji: "👽", color: "bg-green-500" },
  { id: "avatar8", emoji: "🎩", color: "bg-indigo-500" },
  { id: "avatar9", emoji: "🦁", color: "bg-orange-500" },
  { id: "avatar10", emoji: "🐺", color: "bg-slate-500" },
]

const SECURITY_QUESTIONS = [
  "¿Nombre de tu primera mascota?",
  "¿Ciudad donde naciste?",
  "¿Nombre de tu escuela primaria?",
  "¿Comida favorita de chico?",
  "¿Nombre de tu mejor amigo de la infancia?",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "avatar1",
    security_question: SECURITY_QUESTIONS[0],
    security_answer: "",
    line_phone: "",
    line_name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.nombre.trim()) return "Nombre completo requerido"
      if (!form.email.trim() || !form.email.includes("@")) return "Email válido requerido"
    }
    if (step === 2) {
      if (!form.password || form.password.length < 6) return "Mínimo 6 caracteres"
      if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden"
    }
    if (step === 3) {
      if (!form.security_answer.trim()) return "Respuesta de seguridad requerida"
    }
    return null
  }

  const nextStep = () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError("")
    setStep(s => Math.min(s + 1, 4))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          avatar: form.avatar,
          security_question: form.security_question,
          security_answer: form.security_answer,
          line_phone: form.line_phone || undefined,
          line_name: form.line_name || undefined,
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error en registro")
      
      // Guardar token
      localStorage.setItem('mb_token', data.token)
      
      // Ir al dashboard
      router.push("/")
      
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${step >= s ? "bg-blue-500" : "bg-slate-800"}`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold text-white">👤 Tu cuenta</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => update("nombre", e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email de registro</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update("email", e.target.value)}
                      placeholder="juan@email.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-bold text-white">🔐 Seguridad</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => update("confirmPassword", e.target.value)}
                      placeholder="Repetí la contraseña"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-bold text-white">🛡️ Recuperación</h2>
                <p className="text-sm text-slate-400">Si olvidás tu contraseña, esto te salva.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Pregunta de seguridad</label>
                    <select
                      value={form.security_question}
                      onChange={e => update("security_question", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    >
                      {SECURITY_QUESTIONS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tu respuesta</label>
                    <input
                      type="text"
                      value={form.security_answer}
                      onChange={e => update("security_answer", e.target.value)}
                      placeholder="Solo vos sabés esto..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-3">Elegí tu avatar</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => update("avatar", a.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                          form.avatar === a.id
                            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-110"
                            : "hover:scale-105 opacity-60 hover:opacity-100"
                        } ${a.color}`}
                      >
                        {a.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-bold text-white">📱 Línea WhatsApp (opcional)</h2>
                <p className="text-sm text-slate-400">Podés agregarla ahora o después desde el dashboard.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Número (con código país)</label>
                    <input
                      type="text"
                      value={form.line_phone}
                      onChange={e => update("line_phone", e.target.value)}
                      placeholder="5491123456789"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre de la línea</label>
                    <input
                      type="text"
                      value={form.line_name}
                      onChange={e => update("line_name", e.target.value)}
                      placeholder="Línea Principal"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  ← Atrás
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? "Creando cuenta..." : "🚀 Crear cuenta y entrar"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}