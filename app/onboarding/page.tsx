"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import { motion, AnimatePresence } from "motion/react";


const STEPS = [
  { id: 1, title: "Bienvenido", subtitle: "Empecemos" },
  { id: 2, title: "Tu Perfil", subtitle: "¿Cómo te llamás?" },
  { id: 3, title: "Contacto", subtitle: "Email para soporte" },
  { id: 4, title: "Listo", subtitle: "Todo configurado" },
]

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Verificamos que haya licencia activa
  useEffect(() => {
    fetch("/api/license/status")
      .then(r => r.json())
      .then(data => {
        if (!data.active) router.push("/setup")
      })
  }, [router])

  const saveUser = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, avatar }),
      })
      const data = await res.json()
      if (data.success) {
        router.push("/")
      } else {
        setError(data.error || "Error guardando perfil")
      }
    } catch (e) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">🚀 Mundial Blaster</h1>
          <p className="text-slate-400">Configuración inicial</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s.id ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 flex-1 rounded ${step > s.id ? "bg-emerald-500" : "bg-slate-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-6">
                <div className="text-6xl">🎉</div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">¡Licencia activada!</h2>
                  <p className="text-slate-400">Tu Mundial Blaster Pro está listo. Configuremos tu perfil en 3 pasos.</p>
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                  Empezar →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold text-white">¿Cómo te llamás?</h2>
                <p className="text-slate-400 text-sm">Este nombre aparecerá en tu dashboard.</p>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!nombre.trim()}
                  className={`w-full font-bold py-3 rounded-xl transition-colors ${nombre.trim() ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                >
                  Continuar →
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold text-white">Tu email</h2>
                <p className="text-slate-400 text-sm">Lo usaremos solo para soporte técnico.</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button 
                  onClick={saveUser}
                  disabled={!email.trim() || loading}
                  className={`w-full font-bold py-3 rounded-xl transition-colors ${email.trim() && !loading ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                >
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Guardando...</span> : "✅ Finalizar configuración"}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="text-6xl">🚀</div>
                <h2 className="text-2xl font-bold text-emerald-400">¡Todo listo!</h2>
                <p className="text-slate-400">Ya podés agregar tu primera línea WhatsApp y empezar a disparar campañas.</p>
                <button onClick={() => router.push("/")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
                  Ir al Dashboard →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}