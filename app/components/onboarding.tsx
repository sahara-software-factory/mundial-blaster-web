"use client"

import { useState } from "react"

const STEPS = [
  { id: 1, title: "Base de Datos", subtitle: "Crear cuenta en Neon" },
  { id: 2, title: "Backend", subtitle: "Deployar en Railway" },
  { id: 3, title: "Frontend", subtitle: "Deployar en Vercel" },
  { id: 4, title: "Activar", subtitle: "Pegar tu licencia" },
]

export default function SetupWizard() {
  const [step, setStep] = useState(1)
  const [licenseKey, setLicenseKey] = useState("")
  const [activated, setActivated] = useState(false)
  const [error, setError] = useState("")

  const activateLicense = async () => {
    setError("")
    try {
      const res = await fetch("/api/setup/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setActivated(true)
      } else {
        setError(data.error || "Error activando licencia")
      }
    } catch (e) {
      setError("Error de conexión")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-[var(--text-primary)] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">🚀 Configurar Mundial Blaster</h1>
          <p className="text-[var(--text-secondary)]">4 pasos para tener tu propio sistema de envío masivo</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.id ? "bg-emerald-500 text-[var(--text-primary)]" : "bg-slate-800 text-[var(--text-muted)]"}`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${step >= s.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{s.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.subtitle}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`h-1 flex-1 rounded ${step > s.id ? "bg-emerald-500" : "bg-slate-800"}`} />}
            </div>
          ))}
        </div>

        {/* STEP 1: NEON */}
        {step === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">1. Crear base de datos en Neon</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Neon es PostgreSQL gratis en la nube. Tu base de datos privada.</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Andá a <a href="https://neon.tech" target="_blank" className="text-blue-400 underline">neon.tech</a> y creá una cuenta gratuita</li>
                <li>Creá un nuevo proyecto → elegí la región más cercana</li>
                <li>En el dashboard, copiá el <strong>Connection String</strong> (empieza con <code>postgresql://...</code>)</li>
                <li>Guardalo para el paso 2 (Railway)</li>
              </ol>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">
              Ya tengo mi DATABASE_URL →
            </button>
          </div>
        )}

        {/* STEP 2: RAILWAY */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">2. Deployar Backend en Railway</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Railway hostea tu servidor de WhatsApp (Baileys) 24/7.</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Andá a <a href="https://railway.app" target="_blank" className="text-blue-400 underline">railway.app</a> y logueate con GitHub</li>
                <li>Clickeá <strong>New Project</strong> → <strong>Deploy from GitHub repo</strong></li>
                <li>Seleccioná tu repo <code>mundial-blaster-server</code></li>
                <li>En <strong>Variables</strong>, agregá:
                  <ul className="ml-4 mt-1 space-y-1 text-[var(--text-secondary)] font-mono text-xs">
                    <li>DATABASE_URL = (pegá la de Neon)</li>
                    <li>WHATSAPP_SECRET = (creá una clave random, ej: mb123456)</li>
                    <li>PORT = 8080</li>
                  </ul>
                </li>
                <li>Clickeá <strong>Deploy</strong> y esperá que termine</li>
                <li>Copiá la URL pública que te da Railway (ej: <code>https://tu-proyecto.up.railway.app</code>)</li>
              </ol>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">
              Ya tengo mi URL de Railway →
            </button>
          </div>
        )}

        {/* STEP 3: VERCEL */}
        {step === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">3. Deployar Frontend en Vercel</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Vercel hostea tu panel de control (la web que estás viendo ahora).</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Andá a <a href="https://vercel.com" target="_blank" className="text-blue-400 underline">vercel.com</a> y logueate con GitHub</li>
                <li><strong>Add New Project</strong> → importá tu repo <code>mundial-blaster-web</code></li>
                <li>En <strong>Environment Variables</strong>, agregá:
                  <ul className="ml-4 mt-1 space-y-1 text-[var(--text-secondary)] font-mono text-xs">
                    <li>NEXT_PUBLIC_WHATSAPP_SERVER_URL = (URL de Railway del paso 2)</li>
                    <li>NEXT_PUBLIC_SOCKET_URL = (misma URL de Railway)</li>
                    <li>WHATSAPP_SECRET = (la misma clave random del paso 2)</li>
                  </ul>
                </li>
                <li>Clickeá <strong>Deploy</strong></li>
              </ol>
            </div>
            <button onClick={() => setStep(4)} className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">
              Ya deployé en Vercel →
            </button>
          </div>
        )}

        {/* STEP 4: LICENCIA */}
        {step === 4 && !activated && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">4. Activar tu licencia</h2>
            <p className="text-sm text-[var(--text-secondary)]">Pegá acá la key que recibiste por email al comprar.</p>
            
            <textarea
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
            />
            
            {error && <p className="text-red-400 text-sm">❌ {error}</p>}
            
            <button 
              onClick={activateLicense}
              disabled={!licenseKey.trim()}
              className={`w-full font-bold py-3 rounded-xl transition-colors ${licenseKey.trim() ? "bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)]" : "bg-slate-800 text-[var(--text-muted)] cursor-not-allowed"}`}
            >
              ✅ Activar Mundial Blaster
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {activated && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-400">¡Activado correctamente!</h2>
            <p className="text-slate-300">Tu Mundial Blaster está listo. Ya podés agregar líneas y disparar campañas.</p>
            <a href="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold px-8 py-3 rounded-xl transition-colors">
              Ir al Dashboard →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}