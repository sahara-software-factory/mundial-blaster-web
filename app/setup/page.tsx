"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Zap, Database, Server, Globe, KeyRound, CheckCircle2, ArrowRight, ArrowLeft,
  ExternalLink, Copy, Check, Shield, Sparkles, AlertCircle,
  MessageCircle, BookOpen, Github
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { id: 1, title: "Base de datos", icon: Database, desc: "PostgreSQL en la nube" },
  { id: 2, title: "Backend",     icon: Server,    desc: "Servidor WhatsApp 24/7" },
  { id: 3, title: "Frontend",    icon: Globe,     desc: "Panel de control web" },
  { id: 4, title: "Licencia",    icon: KeyRound,  desc: "Activar tu instancia" },
]

// ═══════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .wabi-setup-root {
    min-height: 100vh;
    font-family: 'Outfit', system-ui, sans-serif;
    background: #060A14;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
  }

  .wabi-setup-glow {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 70% 50% at 20% 30%, rgba(0,212,170,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59,110,247,0.05) 0%, transparent 55%);
  }

  .wabi-setup-grid {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  }

  .wabi-setup-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 680px;
    background: rgba(7, 11, 22, 0.75);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 44px 40px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
  }

  @media (max-width: 640px) {
    .wabi-setup-card { padding: 28px 22px; border-radius: 20px; }
    .wabi-setup-root { padding: 16px; }
  }

  .wabi-step-track {
    display: flex;
    gap: 8px;
    margin-bottom: 36px;
  }
  .wabi-step-dot {
    flex: 1;
    height: 4px;
    border-radius: 99px;
    background: rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
    transition: background 0.4s ease;
  }
  .wabi-step-dot.active {
    background: rgba(0,212,170,0.25);
  }
  .wabi-step-dot-fill {
    position: absolute;
    inset: 0;
    border-radius: 99px;
    background: linear-gradient(90deg, #00D4AA, #00A8C8);
    transform-origin: left;
  }

  .wabi-setup-input {
    width: 100%;
    background: rgba(255,255,255,0.025);
    border: 1.5px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px 16px;
    color: #EEF2FF;
    font-size: 13px;
    font-family: 'Outfit', monospace;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    resize: vertical;
  }
  .wabi-setup-input:focus {
    border-color: rgba(0, 212, 170, 0.5);
    box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.07), 0 0 28px rgba(0, 212, 170, 0.05);
  }
  .wabi-setup-input::placeholder { color: #2A3A48; font-family: 'Outfit', system-ui; }

    .wabi-btn2 {
    position: relative;
    width: 30%;
    border-radius: 14px;
    border: none;
    padding: 15px;
    font-weight: 700;
    font-size: 15px;
    font-family: 'Outfit', system-ui, sans-serif;
    letter-spacing: 0.01em;
    cursor: pointer;
    overflow: hidden;
    background: linear-gradient(135deg, #00D4AA 0%, #00A8C8 50%, #3B6EF7 100%);
    color: #021210;
    box-shadow: 0 8px 32px rgba(0, 212, 170, 0.25), 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.15s, box-shadow 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .wabi-btn2:hover:not(:disabled) {
    box-shadow: 0 12px 40px rgba(0, 212, 170, 0.35), 0 4px 12px rgba(0,0,0,0.3);
  }
  .wabi-btn2:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wabi-btn {
    position: relative;
    width: 100%;
    border-radius: 14px;
    border: none;
    padding: 15px;
    font-weight: 700;
    font-size: 15px;
    font-family: 'Outfit', system-ui, sans-serif;
    letter-spacing: 0.01em;
    cursor: pointer;
    overflow: hidden;
    background: linear-gradient(135deg, #00D4AA 0%, #00A8C8 50%, #3B6EF7 100%);
    color: #021210;
    box-shadow: 0 8px 32px rgba(0, 212, 170, 0.25), 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.15s, box-shadow 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .wabi-btn:hover:not(:disabled) {
    box-shadow: 0 12px 40px rgba(0, 212, 170, 0.35), 0 4px 12px rgba(0,0,0,0.3);
  }
  .wabi-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .wabi-btn-ghost {
    background: transparent;
    color: #3D5060;
    border: 1.5px solid rgba(255,255,255,0.08);
    box-shadow: none;
  }
  .wabi-btn-ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.12);
    color: #7A90A0;
    box-shadow: none;
  }
  .wabi-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
    background-size: 250% 100%;
    animation: shimmer 2.5s infinite 1s;
  }
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  .wabi-error {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.22);
    border-radius: 12px;
    padding: 11px 16px;
    color: #F87171;
    font-size: 13.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wabi-instruction-card {
    background: rgba(255,255,255,0.015);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    transition: all 0.2s;
  }
  .wabi-instruction-card:hover {
    background: rgba(255,255,255,0.025);
    border-color: rgba(255,255,255,0.08);
  }
  .wabi-instruction-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0,212,170,0.08);
    border: 1px solid rgba(0,212,170,0.2);
    color: #00D4AA;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .wabi-code-block {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 10px 12px;
    font-family: 'Outfit', monospace;
    font-size: 11.5px;
    color: #7A90A0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .wabi-code-block code { color: #00D4AA; }

  .wabi-success-card {
    background: rgba(0,212,170,0.04);
    border: 1.5px solid rgba(0,212,170,0.15);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
  }

  .wabi-link-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #3D5060;
    font-size: 13px;
    font-family: 'Outfit', system-ui, sans-serif;
    transition: color 0.2s;
    padding: 4px;
  }
  .wabi-link-btn:hover { color: #00D4AA; }

  /* ── Floating assistance buttons ── */
  .wabi-assist-float {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }
  @media (max-width: 640px) {
    .wabi-assist-float { bottom: 16px; right: 16px; }
  }
  .wabi-assist-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(7, 11, 22, 0.85);
    backdrop-filter: blur(16px);
    color: #7A90A0;
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    text-decoration: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  }
  .wabi-assist-btn:hover {
    border-color: rgba(0,212,170,0.3);
    background: rgba(0,212,170,0.06);
    color: #00D4AA;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,212,170,0.1);
  }
  .wabi-assist-btn svg { flex-shrink: 0; }
  .wabi-assist-label {
    max-width: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: max-width 0.3s ease, opacity 0.2s;
    opacity: 0;
  }
  .wabi-assist-btn:hover .wabi-assist-label {
    max-width: 200px;
    opacity: 1;
  }`

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SetupWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [licenseKey, setLicenseKey] = useState("")
  const [activated, setActivated] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activatedTier, setActivatedTier] = useState("")
  const goNext = () => {
    setError("")
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length))
  }



  const goBack = () => {
    setError("")
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const activateLicense = async () => {
    if (!licenseKey.trim()) {
      setError("Ingresá una licencia válida")
      return
    }
    setLoading(true)
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
        if (data.tier) {
  setActivatedTier(data.tier)
}
      } else {
        setError(data.error || "Error activando licencia")
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const goToOnboarding = () => {
    window.location.href = "/onboarding"
  }

//  useEffect(() => {
//     fetch("/api/auth/check", { cache: "no-store" })
//       .then(r => r.json())
//       .then(data => {
//         if (data.hasUser) {
//           router.replace("/login") // replace en vez de href para no guardar en history
//         }
//       })
//       .catch(() => {})
//       .finally(() => setChecking(false))
//   }, [router])

//   if (checking) {
//     return (
//       <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
//         <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }
  

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="wabi-setup-root">
        <div className="wabi-setup-glow" />
        <div className="wabi-setup-grid" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative", zIndex: 10, marginBottom: 28, textAlign: "center" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <img src="/images/logo_light.png" width={"400px"} alt="" />
          </div>
          <p style={{ color: "#3D5060", fontSize: 13, marginTop: 6 }}>Configuración inicial de tu instancia</p>
        </motion.div>

        <div className="wabi-setup-card">
          {/* Progress */}
          <div className="wabi-step-track">
            {STEPS.map((s) => (
              <div key={s.id} className={`wabi-step-dot ${step >= s.id ? "active" : ""}`}>
                {step >= s.id && (
                  <motion.div
                    className="wabi-step-dot-fill"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step title */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#00D4AA", fontSize: 12, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {(() => {
                  const Icon = STEPS[step - 1].icon
                  return <Icon size={14} />
                })()}
                Paso {step} de {STEPS.length}
              </div>
              <h2 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, color: "#EEF2FF", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                {STEPS[step - 1].title}
              </h2>
              <p style={{ color: "#3D5060", fontSize: 14, marginTop: 6 }}>
                {STEPS[step - 1].desc}
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && <StepNeon onNext={goNext} />}
              {step === 2 && <StepRailway onNext={goNext} onBack={goBack} copied={copied} onCopy={copyToClipboard} />}
              {step === 3 && <StepVercel onNext={goNext} onBack={goBack} copied={copied} onCopy={copyToClipboard} />}
              {step === 4 && (
                <StepLicense
                  licenseKey={licenseKey}
                  setLicenseKey={setLicenseKey}
                  activated={activated}
                  error={error}
                  loading={loading}
                  activatedTier={activatedTier}
                  onActivate={activateLicense}
                  onBack={goBack}
                  onContinue={goToOnboarding}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#1A2A36", fontSize: 12, marginTop: 24 }}
        >
          © 2026 WabiSend. Todos los derechos reservados.
        </motion.p>

        {/* ═══════════════════════════════════════════════════════════════════════
            FLOATING ASSISTANCE BUTTONS — siempre visibles, fuera del card
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="wabi-assist-float">
          <a
            href="https://wa.me/5491123456789?text=Hola%2C%20necesito%20ayuda%20con%20la%20instalación%20de%20WabiSend"
            target="_blank"
            rel="noopener noreferrer"
            className="wabi-assist-btn"
            title="Soporte por WhatsApp"
          >
            <MessageCircle size={18} color="#00D4AA" />
            <span className="wabi-assist-label">Soporte WhatsApp</span>
          </a>
          <a
            href="https://docs.wabisend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="wabi-assist-btn"
            title="Documentación"
          >
            <BookOpen size={18} color="#3B6EF7" />
            <span className="wabi-assist-label">Documentación</span>
          </a>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 1: NEON
// ═══════════════════════════════════════════════════════════════════════════════

function StepNeon({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #00D4AA, #00A8C8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,212,170,0.2)",
        }}>
          <Database size={20} color="white" />
        </div>
        <div>
          <h3 style={{ color: "#EEF2FF", fontSize: 16, fontWeight: 700 }}>PostgreSQL en la nube</h3>
          <p style={{ color: "#3D5060", fontSize: 12, marginTop: 2 }}>Base de datos gratuita y persistente</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { num: 1, text: "Andá a", link: "https://neon.tech", linkText: "neon.tech", after: "y creá una cuenta gratuita" },
          { num: 2, text: "Creá un nuevo proyecto y elegí la región más cercana a tu audiencia" },
          { num: 3, text: "En el dashboard, copiá el Connection String (empieza con postgresql://...)" },
          { num: 4, text: "Guardalo para el siguiente paso (Railway)" },
        ].map((item) => (
          <div key={item.num} className="wabi-instruction-card">
            <div className="wabi-instruction-num">{item.num}</div>
            <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.5 }}>
              {item.text}{" "}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#00D4AA", textDecoration: "none" }}>
                  {item.linkText} <ExternalLink size={10} style={{ display: "inline", verticalAlign: "middle" }} />
                </a>
              )}
              {item.after && ` ${item.after}`}
            </p>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={onNext}
        className="wabi-btn"
        style={{ marginTop: 8 }}
      >
        <span className="wabi-shimmer" />
        <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          Ya tengo mi DATABASE_URL <ArrowRight size={16} />
        </span>
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 2: RAILWAY (MONOREPO)
// ═══════════════════════════════════════════════════════════════════════════════

function StepRailway({ onNext, onBack, copied, onCopy }: {
  onNext: () => void; onBack: () => void; copied: boolean; onCopy: (text: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #3B6EF7, #00A8C8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(59,110,247,0.2)",
        }}>
          <Server size={20} color="white" />
        </div>
        <div>
          <h3 style={{ color: "#EEF2FF", fontSize: 16, fontWeight: 700 }}>Servidor Backend 24/7</h3>
          <p style={{ color: "#3D5060", fontSize: 12, marginTop: 2 }}>Baileys WhatsApp + API REST</p>
        </div>
      </div>

      <div style={{ background: "rgba(0,212,170,0.03)", border: "1px solid rgba(0,212,170,0.1)", borderRadius: 12, padding: "12px 16px", marginBottom: 4 }}>
        <p style={{ color: "#00D4AA", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Github size={14} />
          Mono repo: un solo código, dos deploys
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { num: 1, text: "Andá a", link: "https://railway.app", linkText: "railway.app", after: "y logueate con GitHub" },
          { num: 2, text: "Clickeá New Project → Deploy from GitHub repo" },
          { num: 3, text: "Seleccioná tu repo de WabiSend (es un monorepo, backend y frontend en uno)" },
          { num: 4, text: "Railway detectará automáticamente el backend. En Variables, agregá:", isCode: true },
        ].map((item) => (
          <div key={item.num}>
            <div className="wabi-instruction-card">
              <div className="wabi-instruction-num">{item.num}</div>
              <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.5 }}>
                {item.text}{" "}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#00D4AA", textDecoration: "none" }}>
                    {item.linkText} <ExternalLink size={10} style={{ display: "inline", verticalAlign: "middle" }} />
                  </a>
                )}
                {item.after && ` ${item.after}`}
              </p>
            </div>
            {item.isCode && (
              <div style={{ marginLeft: 36, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="wabi-code-block">
                  <code>DATABASE_URL = postgresql://...</code>
                  <button onClick={() => onCopy("postgresql://...")} className="wabi-link-btn" style={{ padding: 2 }}>
                    {copied ? <Check size={14} color="#00D4AA" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="wabi-code-block">
                  <code>WHATSAPP_SECRET = tu_clave_secreta_123</code>
                  <button onClick={() => onCopy("tu_clave_secreta_123")} className="wabi-link-btn" style={{ padding: 2 }}>
                    {copied ? <Check size={14} color="#00D4AA" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="wabi-code-block">
                  <code>PORT = 8080</code>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="wabi-instruction-card">
          <div className="wabi-instruction-num">5</div>
          <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.5 }}>
            Clickeá Deploy y esperá que termine. Copiá la URL pública que te da Railway.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="wabi-btn2 wabi-btn-ghost"
          style={{ flex: "0 0 auto", minWidth: 110 }}
        >
          <ArrowLeft size={16} />
          Atrás
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={onNext}
          className="wabi-btn"
          style={{ flex: 1 }}
        >
          <span className="wabi-shimmer" />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            Ya tengo mi URL de Railway <ArrowRight size={16} />
          </span>
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 3: VERCEL (MONOREPO)
// ═══════════════════════════════════════════════════════════════════════════════

function StepVercel({ onNext, onBack, copied, onCopy }: {
  onNext: () => void; onBack: () => void; copied: boolean; onCopy: (text: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #00D4AA, #3B6EF7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,212,170,0.2)",
        }}>
          <Globe size={20} color="white" />
        </div>
        <div>
          <h3 style={{ color: "#EEF2FF", fontSize: 16, fontWeight: 700 }}>Panel de Control Web</h3>
          <p style={{ color: "#3D5060", fontSize: 12, marginTop: 2 }}>Next.js deployado en Vercel</p>
        </div>
      </div>

      <div style={{ background: "rgba(0,212,170,0.03)", border: "1px solid rgba(0,212,170,0.1)", borderRadius: 12, padding: "12px 16px", marginBottom: 4 }}>
        <p style={{ color: "#00D4AA", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <Github size={14} />
          Mismo repo, deploy separado para el frontend
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { num: 1, text: "Andá a", link: "https://vercel.com", linkText: "vercel.com", after: "y logueate con GitHub" },
          { num: 2, text: "Add New Project → importá el mismo repo de WabiSend" },
          { num: 3, text: "Configurá el Root Directory como la carpeta del frontend (ej: apps/web)" },
          { num: 4, text: "En Environment Variables, agregá estas variables:", isCode: true },
        ].map((item) => (
          <div key={item.num}>
            <div className="wabi-instruction-card">
              <div className="wabi-instruction-num">{item.num}</div>
              <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.5 }}>
                {item.text}{" "}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#00D4AA", textDecoration: "none" }}>
                    {item.linkText} <ExternalLink size={10} style={{ display: "inline", verticalAlign: "middle" }} />
                  </a>
                )}
                {item.after && ` ${item.after}`}
              </p>
            </div>
            {item.isCode && (
              <div style={{ marginLeft: 36, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="wabi-code-block">
                  <code>NEXT_PUBLIC_WHATSAPP_SERVER_URL = https://tu-proyecto.up.railway.app</code>
                  <button onClick={() => onCopy("https://tu-proyecto.up.railway.app")} className="wabi-link-btn" style={{ padding: 2 }}>
                    {copied ? <Check size={14} color="#00D4AA" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="wabi-code-block">
                  <code>NEXT_PUBLIC_SOCKET_URL = https://tu-proyecto.up.railway.app</code>
                </div>
                <div className="wabi-code-block">
                  <code>WHATSAPP_SECRET = tu_clave_secreta_123</code>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="wabi-instruction-card">
          <div className="wabi-instruction-num">5</div>
          <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.5 }}>
            Clickeá Deploy y esperá a que termine la build.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="wabi-btn2 wabi-btn-ghost"
          style={{ flex: "0 0 auto", minWidth: 110 }}
        >
          <ArrowLeft size={16} />
          Atrás
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={onNext}
          className="wabi-btn"
          style={{ flex: 1 }}
        >
          <span className="wabi-shimmer" />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            Ya deployé en Vercel <ArrowRight size={16} />
          </span>
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 4: LICENSE
// ═══════════════════════════════════════════════════════════════════════════════

function StepLicense({
  licenseKey, setLicenseKey, activated, activatedTier, error, loading, onActivate, onBack, onContinue
}: {
  licenseKey: string; setLicenseKey: (v: string) => void
  activated: boolean; activatedTier?: string; error: string; loading: boolean
  onActivate: () => void; onBack: () => void; onContinue: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!activated ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #3B6EF7, #00A8C8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(59,110,247,0.2)",
            }}>
              <KeyRound size={20} color="white" />
            </div>
            <div>
              <h3 style={{ color: "#EEF2FF", fontSize: 16, fontWeight: 700 }}>Activar licencia</h3>
              <p style={{ color: "#3D5060", fontSize: 12, marginTop: 2 }}>Desbloqueá tu instancia de WabiSend</p>
            </div>
          </div>

          <p style={{ color: "#7A90A0", fontSize: 13.5, lineHeight: 1.6 }}>
            Pegá acá la clave de licencia que recibiste al comprar. Cada instancia requiere una licencia única vinculada a tu dominio.
          </p>

          <textarea
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={4}
            className="wabi-setup-input"
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div className="wabi-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="wabi-btn2 wabi-btn-ghost"
              style={{ flex: "0 0 auto", minWidth: 110 }}
            >
              <ArrowLeft size={16} />
              Atrás
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={onActivate}
              disabled={loading || !licenseKey.trim()}
              className="wabi-btn"
              style={{ flex: 1 }}
            >
              <span className="wabi-shimmer" />
              <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                {loading ? (
                  <motion.span
                    style={{ display: "block", width: 18, height: 18, border: "2.5px solid rgba(2,13,18,0.3)", borderTopColor: "#021210", borderRadius: "50%" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Sparkles size={16} />
                    Activar WabiSend
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="wabi-success-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(0,212,170,0.12)", border: "2px solid rgba(0,212,170,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 40px rgba(0,212,170,0.15)",
            }}
          >
            <CheckCircle2 size={32} color="#00D4AA" />
          </motion.div>

          <h3 style={{ color: "#EEF2FF", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            {activatedTier ? (
              <>Instancia <span style={{ color: '#00D4AA' }}>{activatedTier.toUpperCase()}</span> activada</>
            ) : (
              'Instancia activada'
            )}
          </h3>
          <p style={{ color: "#3D5060", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Tu WabiSend está listo. Ahora creá tu cuenta de administrador para empezar a usarlo.
          </p>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={onContinue}
            className="wabi-btn"
            style={{ maxWidth: 300, margin: "0 auto" }}
          >
            <span className="wabi-shimmer" />
            <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              Crear cuenta de admin <ArrowRight size={16} />
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}