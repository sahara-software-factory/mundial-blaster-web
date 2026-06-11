"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Mail, Lock, Eye, EyeOff, ArrowRight, CreditCard, Rocket, KeyRound, Shield } from "lucide-react"
import Link from "next/link"

// ─── DATA ──────────────────────────────────────────────────────────────────────

const NODES = [
  { cx: 8,  cy: 15 }, { cx: 35, cy: 6  }, { cx: 68, cy: 18 }, { cx: 90, cy: 8  },
  { cx: 22, cy: 38 }, { cx: 54, cy: 30 }, { cx: 82, cy: 44 }, { cx: 14, cy: 62 },
  { cx: 44, cy: 58 }, { cx: 72, cy: 70 }, { cx: 28, cy: 82 }, { cx: 60, cy: 90 },
  { cx: 90, cy: 82 }, { cx: 6,  cy: 90 },
]

const EDGES = [
  [0, 1], [1, 2], [2, 3], [1, 5], [2, 5], [3, 6], [0, 4], [4, 5],
  [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9], [7, 10], [8, 10],
  [9, 11], [9, 12], [10, 11], [10, 13], [11, 12],
]

const BUBBLES = [
  { text: "¡50% OFF solo hoy! 🔥",      left: 5,  delay: 0    },
  { text: "Tu pedido llegó ✅",           left: 54, delay: 3.5  },
  { text: "Bienvenido a la promo 👋",    left: 22, delay: 7    },
  { text: "Stock limitado ⚡ Actuá ya", left: 63, delay: 10.5 },
  { text: "¡Gracias por tu compra! 🙌", left: 36, delay: 14   },
]

const FEATURES = [
  { icon: Rocket, label: "Envíos sin techo" },
  { icon: Lock, label: "Self-hosted" },
  { icon: CreditCard, label: "Pago único" },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wabi-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Outfit', system-ui, sans-serif;
    background: #060A14;
    overflow: hidden;
  }

  /* ── Left Panel ── */
  .wabi-left {
    display: none;
    flex: 0 0 54%;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    background: linear-gradient(145deg, #070C1A 0%, #080E20 60%, #060A14 100%);
  }
  @media (min-width: 1024px) {
    .wabi-left { display: flex; }
  }

  .wabi-left-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 60px 56px;
  }

  /* ── Right Panel ── */
  .wabi-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: #070B16;
    position: relative;
  }

  .wabi-form-wrap {
    width: 100%;
    max-width: 400px;
  }

  /* ── Inputs ── */
  .wabi-input-wrap {
    position: relative;
    border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.025);
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .wabi-input-wrap:focus-within {
    border-color: rgba(0, 212, 170, 0.5);
    background: rgba(0, 212, 170, 0.035);
    box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.07), 0 0 28px rgba(0, 212, 170, 0.05);
  }
  .wabi-input-wrap:focus-within .wabi-input-icon {
    color: #00D4AA;
  }
  .wabi-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3D4D5C;
    display: flex;
    transition: color 0.25s;
    pointer-events: none;
  }
  .wabi-input-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3D4D5C;
    margin-bottom: 7px;
    display: block;
    transition: color 0.25s;
  }
  .wabi-input-wrap:focus-within + .nope,
  .wabi-input-group:focus-within .wabi-input-label {
    color: #00D4AA;
  }
  .wabi-input {
    width: 100%;
    background: transparent !important;
    border: none;
    outline: none;
    padding: 14px 44px;
    color: #EEF2FF;
    font-size: 14px;
    font-family: 'Outfit', system-ui, sans-serif;
    caret-color: #00D4AA;
  }
  .wabi-input::placeholder { color: #2A3A48; }

  /* Chrome autofill override */
  .wabi-input:-webkit-autofill,
  .wabi-input:-webkit-autofill:hover,
  .wabi-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #0A1020 inset !important;
    -webkit-text-fill-color: #EEF2FF !important;
    caret-color: #00D4AA;
    transition: background-color 5000s;
  }

  /* ── Button ── */
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
  .wabi-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.32) 50%, transparent 70%);
    background-size: 250% 100%;
    animation: shimmer 2.5s infinite 1s;
  }
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  /* ── Network SVG node pulse ── */
  @keyframes nodePulse {
    0%, 100% { opacity: 0.4; r: 0.85; }
    50%       { opacity: 1;   r: 1.4;  }
  }
  @keyframes edgePulse {
    0%, 100% { opacity: 0.1; }
    50%       { opacity: 0.45; }
  }

  /* ── Recover button ── */
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

  /* ── Mobile logo ── */
  .wabi-mobile-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 40px;
  }
  @media (min-width: 1024px) {
    .wabi-mobile-logo { display: none; }
  }

  /* ── Error ── */
  .wabi-error {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.22);
    border-radius: 12px;
    padding: 11px 16px;
    color: #F87171;
    font-size: 13.5px;
  }
`

// ─── NETWORK ANIMATION ─────────────────────────────────────────────────────────

function NetworkSVG() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={`e${i}`}
          x1={NODES[a].cx} y1={NODES[a].cy}
          x2={NODES[b].cx} y2={NODES[b].cy}
          stroke="#00D4AA"
          strokeWidth="0.22"
          style={{
            animation: `edgePulse ${3 + (i % 5) * 0.5}s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={`n${i}`}
          cx={n.cx} cy={n.cy}
          r={i % 4 === 0 ? 1.4 : 0.85}
          fill="#00D4AA"
          style={{
            animation: `nodePulse ${2.5 + (i % 3) * 0.6}s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </svg>
  )
}

// ─── FLOATING BUBBLES ──────────────────────────────────────────────────────────

function MessageBubble({ text, left, delay }: { text: string; left: number; delay: number }) {
  const REPEAT = BUBBLES.length * 3.5
  return (
    <motion.div
      style={{ position: "absolute", bottom: 40, left: `${left}%`, pointerEvents: "none", zIndex: 10 }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -35, -95, -150] }}
      transition={{
        duration: 5.5, delay,
        repeat: Infinity, repeatDelay: REPEAT,
        ease: "easeOut", times: [0, 0.12, 0.72, 1],
      }}
    >
      <div style={{
        background: "rgba(0,212,170,0.1)",
        border: "1px solid rgba(0,212,170,0.28)",
        borderRadius: "14px 14px 14px 3px",
        padding: "7px 14px",
        color: "#5EFCD8",
        fontSize: "11.5px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 24px rgba(0,212,170,0.08), inset 0 1px 0 rgba(0,212,170,0.15)",
      }}>
        {text}
      </div>
    </motion.div>
  )
}

// ─── INPUT COMPONENT ───────────────────────────────────────────────────────────

function FormInput({
  label, type, value, onChange, placeholder, icon, right,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void
  placeholder: string; icon: React.ReactNode; right?: React.ReactNode
}) {
  return (
    <div className="wabi-input-group" style={{ display: "flex", flexDirection: "column" }}>
      <label className="wabi-input-label">{label}</label>
      <div className="wabi-input-wrap">
        <span className="wabi-input-icon">{icon}</span>
        <input
          className="wabi-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          style={{ paddingRight: right ? "44px" : "16px" }}
        />
        {right && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── RECOVER FORM ──────────────────────────────────────────────────────────────

function RecoverForm({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"question" | "code">("question")
  const [email, setEmail] = useState("")
  const [answer, setAnswer] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPass !== confirmPass) { setError("Las contraseñas no coinciden"); return }
    if (newPass.length < 6) { setError("Mínimo 6 caracteres"); return }
    setLoading(true)

    try {
      const body: any = {
        email,
        new_password: newPass,
      }

      if (mode === "question") {
        body.security_answer = answer
      } else {
        body.recovery_code = recoveryCode.toUpperCase().trim()
      }

      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(0,212,170,0.12)", border: "2px solid rgba(0,212,170,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(0,212,170,0.15)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <div>
          <h3 style={{ color: "#EEF2FF", fontWeight: 700, fontSize: 20, marginBottom: 6 }}>¡Contraseña actualizada!</h3>
          <p style={{ color: "#3D5060", fontSize: 14 }}>Ya podés ingresar con tu nueva contraseña.</p>
        </div>
        <button onClick={onBack} className="wabi-btn" style={{ marginTop: 4 }}>
          Ir al Login →
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleRecover} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <h3 style={{ color: "#EEF2FF", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Recuperar acceso
        </h3>
        <p style={{ color: "#3D5060", fontSize: 14 }}>
          {mode === "question"
            ? "Respondé tu pregunta de seguridad."
            : "Usá tu código de recuperación de emergencia."}
        </p>
      </div>

      {/* Toggle modo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setMode("question")}
          className={`wabi-btn ${mode === "question" ? "" : "wabi-btn-ghost"}`}
          style={{ flex: 1, fontSize: 12, padding: "10px 12px" }}
        >
          <Shield size={14} style={{ marginRight: 6 }} />
          Pregunta de seguridad
        </button>
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`wabi-btn ${mode === "code" ? "" : "wabi-btn-ghost"}`}
          style={{ flex: 1, fontSize: 12, padding: "10px 12px" }}
        >
          <KeyRound size={14} style={{ marginRight: 6 }} />
          Código de emergencia
        </button>
      </div>

      <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" icon={<Mail size={16} />} />

      {mode === "question" ? (
        <FormInput label="Respuesta de seguridad" type="text" value={answer} onChange={setAnswer} placeholder="Tu respuesta..." icon={<Lock size={16} />} />
      ) : (
        <div>
          <label className="wabi-input-label" style={{ marginBottom: 7 }}>Código de recuperación</label>
          <div className="wabi-input-wrap">
            <span className="wabi-input-icon"><KeyRound size={16} /></span>
            <input
              className="wabi-input wabi-license-input"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              placeholder="WBR-XXXX-XXXX-2026"
              style={{ letterSpacing: "0.12em", fontWeight: 700 }}
            />
          </div>
          <p style={{ fontSize: 11, color: "#3D5060", marginTop: 6 }}>
            Encontrá este código en el paso 2 del onboarding. Si lo perdiste, contactá soporte.
          </p>
        </div>
      )}

      <FormInput label="Nueva contraseña" type="password" value={newPass} onChange={setNewPass} placeholder="••••••••" icon={<Lock size={16} />} />
      <FormInput label="Confirmar contraseña" type="password" value={confirmPass} onChange={setConfirm} placeholder="••••••••" icon={<Lock size={16} />} />

      {error && <div className="wabi-error">{error}</div>}

      <button type="submit" disabled={loading} className="wabi-btn" style={{ marginTop: 4 }}>
        {loading
          ? <motion.span style={{ display: "block", width: 20, height: 20, border: "2.5px solid rgba(2,13,18,0.3)", borderTopColor: "#021210", borderRadius: "50%" }}
              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          : "Restablecer contraseña"
        }
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onBack} className="wabi-link-btn" style={{ textAlign: "center" }}>
          ← Volver al login
        </button>
      </div>
    </form>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { login, user, checked } = useAuth()

  const [email,        setEmail]       = useState("")
  const [password,     setPassword]    = useState("")
  const [error,        setError]       = useState("")
  const [loading,      setLoading]     = useState(false)
  const [showRecover,  setShowRecover] = useState(false)
  const [showPassword, setShowPw]      = useState(false)


  // useEffect(() => {
  //   fetch("/api/auth/check", { cache: "no-store" })
  //     .then(r => r.json())
  //     .then(data => {
  //       if (!data.hasUser) {
  //         window.location.href = "/onboarding"
  //       }
  //     })
  //     .catch(() => {})
  // }, [])

  useEffect(() => {
    if (checked && user && !user.email?.includes("demo") && user.id !== "demo") {
      window.location.href = "/dashboard"
    }
  }, [checked, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      window.location.href = "/dashboard"
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />


      <div className="wabi-root">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="wabi-left">
          {/* Network */}
          <NetworkSVG />

          {/* Gradient overlays */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(ellipse 70% 60% at 25% 20%, rgba(0,212,170,0.07) 0%, transparent 65%)" }}/>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(ellipse 55% 50% at 85% 85%, rgba(59,110,247,0.08) 0%, transparent 60%)" }}/>

          {/* Content */}
          <div className="wabi-left-content">

            {/* Logo */}
                  <Link href="/" className="flex items-center mb-5 gap-2 group">
  <img 
    src="/images/logo_light.png" 
    alt="WabiSend" 
    className="h-14 w-auto"
  />
</Link>


            {/* Badge */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.15 }} style={{ marginBottom:24 }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.2)",
                borderRadius:999, padding:"6px 14px",
                color:"#00D4AA", fontSize:11, fontWeight:600, letterSpacing:"0.05em",
              }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4AA",
                  display:"inline-block", boxShadow:"0 0 8px #00D4AA" }}/>
                LICENCIA ILIMITADA · PAGÁS UNA VEZ
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.22, ease:[0.22,1,0.36,1] }}
              style={{
                fontSize:"clamp(36px,3.5vw,50px)", fontWeight:800,
                lineHeight:1.1, letterSpacing:"-0.03em",
                color:"#EEF2FF", marginBottom:18,
              }}>
              WhatsApp masivo{" "}
              <span style={{
                background:"linear-gradient(90deg, #00D4AA, #00A8C8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                sin límites.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.3 }}
              style={{ color:"white", fontSize:16, lineHeight:1.65, maxWidth:420, marginBottom:48 }}>
              Plataforma self-hosted. Sin mensualidades, sin techo de envíos,
              sin que nadie toque tus datos.
            </motion.p>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 56 }}>
  {FEATURES.map((f, i) => (
    <motion.div
      key={f.label}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.38 + i * 0.1, type: "spring", stiffness: 160 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: "9px 16px",
        color: "#7A90A0",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <f.icon size={16} />   {/* ← Icono Lucide */}
      {f.label}
    </motion.div>
  ))}
</div>

            {/* Stats */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.65 }}
              style={{ display:"flex", gap:40, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:32 }}>
              {[
                { value:"10K+",  label:"Mensajes / día" },
                { value:"99.9%", label:"Uptime"         },
                { value:"$0",    label:"Mensualidades"  },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize:28, fontWeight:800, color:"#EEF2FF", letterSpacing:"-0.03em" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize:12, color:"#2E4050", fontWeight:500, marginTop:3 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bubbles */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
            {BUBBLES.map(b => <MessageBubble key={b.text} {...b}/>)}
          </div>

          {/* Bottom fade */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:"28%", pointerEvents:"none",
            background:"linear-gradient(to top, #080E20, transparent)",
          }}/>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="wabi-right">
          {/* Top glow line */}
          <div style={{
            position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
            width:"70%", height:1,
            background:"linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)",
          }}/>
          {/* Left border glow (desktop) */}
          <div style={{
            position:"absolute", top:"10%", left:0, width:1, height:"80%",
            background:"linear-gradient(to bottom, transparent, rgba(0,212,170,0.18) 40%, rgba(0,212,170,0.18) 60%, transparent)",
          }}/>

          <div className="wabi-form-wrap">

            {/* Mobile logo */}
            <div className="wabi-mobile-logo">
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg, #00D4AA, #00A8C8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 6px 20px rgba(0,212,170,0.25)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5l3.5 11L10 9l2.5 7L16 9l3.5 7L23 5"/>
                </svg>
              </div>
              <span style={{ fontSize:20, fontWeight:700, color:"#EEF2FF", letterSpacing:"-0.02em" }}>
                Wabi<span style={{ color:"#00D4AA" }}>Send</span>
              </span>
            </div>

            {/* Form area */}
            <AnimatePresence mode="wait">
              {!showRecover ? (
                <motion.div key="login"
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-24 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}>

                  {/* Heading */}
                  <div style={{ marginBottom:36 }}>
                    <motion.h2 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.05 }}
                      style={{ fontSize:28, fontWeight:800, color:"#EEF2FF",
                        letterSpacing:"-0.03em", marginBottom:8, lineHeight:1.2 }}>
                      Bienvenido
                    </motion.h2>
                    <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                      transition={{ delay:0.12 }}
                      style={{ color:"#2E4050", fontSize:14.5, lineHeight:1.5 }}>
                      Ingresá tus credenciales para acceder a tu panel.
                    </motion.p>
                  </div>

                  {/* Fields */}
                  <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.15 }}>
                      <FormInput label="Email" type="email" value={email} onChange={setEmail}
                        placeholder="tu@email.com" icon={<Mail size={16}/>}/>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.22 }}>
                      <FormInput
                        label="Contraseña" type={showPassword ? "text" : "password"}
                        value={password} onChange={setPassword} placeholder="••••••••"
                        icon={<Lock size={16}/>}
                        right={
                          <button type="button" onClick={() => setShowPw(!showPassword)}
                            className="wabi-link-btn" style={{ display:"flex", padding:4 }}>
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        }
                      />
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div key="err"
                          initial={{ opacity:0, y:-8, height:0 }}
                          animate={{ opacity:1, y:0, height:"auto", x:[0,-6,6,-4,4,0] }}
                          exit={{ opacity:0, height:0 }}
                          transition={{ x:{ duration:0.35 } }}
                          style={{ overflow:"hidden" }}>
                          <div className="wabi-error">{error}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.3 }} style={{ marginTop:4 }}>
                      <motion.button type="submit" disabled={loading}
                        className="wabi-btn"
                        whileHover={!loading ? { scale:1.015, y:-1 } : {}}
                        whileTap={!loading ? { scale:0.985 } : {}}>
                        {!loading && <span className="wabi-shimmer"/>}
                        <span style={{ position:"relative", display:"flex", alignItems:"center", gap:8 }}>
                          {loading
                            ? <motion.span
                                style={{ display:"block", width:20, height:20,
                                  border:"2.5px solid rgba(2,13,18,0.3)",
                                  borderTopColor:"#021210", borderRadius:"50%" }}
                                animate={{ rotate:360 }}
                                transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}/>
                            : <><span>Ingresar</span><ArrowRight size={17}/></>
                          }
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>

                  {/* Recover link */}
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ delay:0.4 }}
                    style={{ textAlign:"center", marginTop:24 }}>
                    <button type="button" onClick={() => setShowRecover(true)} className="wabi-link-btn">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="recover"
                  initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-24 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}>
                  <RecoverForm onBack={() => setShowRecover(false)}/>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              style={{ textAlign:"center", color:"#1A2A36", fontSize:12, marginTop:44 }}>
              © 2026 WabiSend. Todos los derechos reservados.
            </motion.p>
          </div>
        </div>
      </div>
    </>
  )
}