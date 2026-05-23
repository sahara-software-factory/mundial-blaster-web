"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRecover, setShowRecover] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      await login(email, password)
      router.push("/")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mundial Blaster</h1>
          <p className="text-slate-400 text-sm">Iniciá sesión en tu sistema</p>
        </div>

        {!showRecover ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            
            <p className="text-center text-sm text-slate-500">
              ¿Olvidaste tu contraseña?{" "}
              <button type="button" onClick={() => setShowRecover(true)} className="text-blue-400 hover:underline">
                Recuperar
              </button>
            </p>
          </form>
        ) : (
          <RecoverForm onBack={() => setShowRecover(false)} />
        )}
      </motion.div>
    </div>
  )
}

// Sub-componente recuperación
function RecoverForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [answer, setAnswer] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (newPass !== confirmPass) {
      setError("Las contraseñas no coinciden")
      return
    }
    
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          security_answer: answer,
          new_password: newPass
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setSuccess(true)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h3 className="text-white font-bold">¡Contraseña actualizada!</h3>
        <p className="text-slate-400 text-sm">Ya podés iniciar sesión con tu nueva contraseña.</p>
        <button onClick={onBack} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
          Ir al Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleRecover} className="space-y-4">
      <h3 className="text-white font-bold">Recuperar cuenta</h3>
      <p className="text-slate-400 text-sm">Respondé tu pregunta de seguridad.</p>
      
      <div>
        <label className="block text-sm text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Respuesta de seguridad</label>
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
          placeholder="Tu respuesta..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Nueva contraseña</label>
        <input
          type="password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          required
          minLength={6}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Confirmar contraseña</label>
        <input
          type="password"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
        />
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
      
      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">
        Restablecer contraseña
      </button>
      <button type="button" onClick={onBack} className="w-full text-slate-400 hover:text-white text-sm py-2">
        ← Volver al login
      </button>
    </form>
  )
}