"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Zap, UserCog, Building2, Smartphone, Share2, CheckCircle2, KeyRound,
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Globe, Clock,
  Briefcase, Users, Radio, Copy, Check, Sparkles, Shield, Phone
} from "lucide-react"
import { toast } from "sonner"

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const STEPS = [
  { id: 1, title: "Bienvenida",    icon: Zap,        desc: "Configurá tu WabiSend" },
  { id: 2, title: "Tu perfil",     icon: UserCog,    desc: "Datos del administrador" },
  { id: 3, title: "Organización",  icon: Building2,  desc: "Tu empresa" },
  { id: 4, title: "WhatsApp",      icon: Smartphone, desc: "Conectá tu primera línea" },
  { id: 5, title: "Partners",      icon: Share2,     desc: "Programa de afiliados" },
  { id: 6, title: "Listo",         icon: CheckCircle2, desc: "Todo configurado" },
]

const AVATARS = [
  { seed: "Felix",   label: "Felix" },
  { seed: "Aneka",   label: "Aneka" },
  { seed: "Bella",   label: "Bella" },
  { seed: "Caleb",   label: "Caleb" },
  { seed: "Diana",   label: "Diana" },
  { seed: "Ethan",   label: "Ethan" },
  { seed: "Fiona",   label: "Fiona" },
  { seed: "Gavin",   label: "Gavin" },
  { seed: "Haley",   label: "Haley" },
  { seed: "Ivan",    label: "Ivan" },
]

const SECURITY_QUESTIONS = [
  "Nombre de tu primera mascota",
  "Ciudad donde naciste",
  "Nombre de tu escuela primaria",
  "Comida favorita de la infancia",
  "Nombre de tu mejor amigo de la infancia",
]

const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (GMT-3)" },
  { value: "America/Santiago",               label: "Chile (GMT-4/-3)" },
  { value: "America/Mexico_City",            label: "México (GMT-6)" },
  { value: "America/Bogota",                 label: "Colombia (GMT-5)" },
  { value: "America/Lima",                   label: "Perú (GMT-5)" },
  { value: "America/Caracas",                label: "Venezuela (GMT-4)" },
  { value: "America/Montevideo",             label: "Uruguay (GMT-3)" },
  { value: "America/Sao_Paulo",              label: "Brasil (GMT-3)" },
  { value: "Europe/Madrid",                  label: "España (GMT+1/+2)" },
  { value: "America/New_York",               label: "New York (GMT-5/-4)" },
]

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "pt", label: "Portugués" },
  { value: "en", label: "English" },
]

const INDUSTRIES = [
  { value: "ecommerce",    label: "E-commerce / Retail",     icon: Briefcase },
  { value: "servicios",    label: "Servicios Profesionales", icon: Shield },
  { value: "educacion",    label: "Educación / Cursos",      icon: Sparkles },
  { value: "salud",        label: "Salud / Bienestar",       icon: Users },
  { value: "inmobiliaria", label: "Inmobiliaria",            icon: Building2 },
  { value: "otro",         label: "Otro / General",          icon: Globe },
]

const VOLUMES = [
  { value: "0-500",      label: "0 - 500 contactos",    plan: "starter",  planLabel: "Starter",  price: "$500" },
  { value: "500-2000",   label: "500 - 2.000 contactos", plan: "pro",      planLabel: "Pro",      price: "$750" },
  { value: "2000-10000", label: "2.000 - 10.000",       plan: "business", planLabel: "Business", price: "$1.250" },
  { value: "10000+",     label: "10.000+",              plan: "business", planLabel: "Business", price: "$1.250" },
]

// ═══════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  .wabi-onboarding-root {
    min-height: 100vh;
    font-family: 'Outfit', system-ui, sans-serif;
    background: #060A14;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .wabi-glow-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 70% 50% at 20% 30%, rgba(0,212,170,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 70%, rgba(59,110,247,0.05) 0%, transparent 55%);
  }

  .wabi-grid-bg {
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

  .wabi-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 600px;
    background: rgba(7, 11, 22, 0.75);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 44px 40px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
  }

  @media (max-width: 640px) {
    .wabi-card { padding: 28px 22px; border-radius: 20px; }
    .wabi-onboarding-root { padding: 16px; }
  }

  .wabi-step-track {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
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

  .wabi-input-group { margin-bottom: 16px; }
  .wabi-input-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3D4D5C;
    margin-bottom: 7px;
    transition: color 0.25s;
  }
  .wabi-input-group:focus-within .wabi-input-label { color: #00D4AA; }

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
  .wabi-input-wrap:focus-within .wabi-input-icon { color: #00D4AA; }
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
  .wabi-input:-webkit-autofill,
  .wabi-input:-webkit-autofill:hover,
  .wabi-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #0A1020 inset !important;
    -webkit-text-fill-color: #EEF2FF !important;
    transition: background-color 5000s;
  }

  .wabi-select {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 14px 40px 14px 44px;
    color: #EEF2FF;
    font-size: 14px;
    font-family: 'Outfit', system-ui, sans-serif;
    appearance: none;
    cursor: pointer;
  }
  .wabi-select option { background: #0A1020; color: #EEF2FF; }
  .wabi-select-wrap .wabi-select-arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3D4D5C;
    pointer-events: none;
  }

  .wabi-btn2 {
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
  .wabi-btn2:hover:not(:disabled) {
    box-shadow: 0 12px 40px rgba(0, 212, 170, 0.35), 0 4px 12px rgba(0,0,0,0.3);
  }
  .wabi-btn2:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wabi-btn {
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

  .wabi-avatar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  .wabi-avatar-item {
    aspect-ratio: 1;
    border-radius: 16px;
    border: 2px solid transparent;
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.25s ease;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .wabi-avatar-item:hover { transform: scale(1.05); background: rgba(255,255,255,0.06); }
  .wabi-avatar-item.selected {
    border-color: #00D4AA;
    box-shadow: 0 0 20px rgba(0,212,170,0.2);
    background: rgba(0,212,170,0.08);
  }
  .wabi-avatar-item img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }

  .wabi-industry-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (max-width: 480px) {
    .wabi-industry-grid { grid-template-columns: 1fr; }
  }
  .wabi-industry-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    color: #7A90A0;
    text-align: left;
  }
  .wabi-industry-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
  .wabi-industry-card.selected {
    border-color: rgba(0,212,170,0.5);
    background: rgba(0,212,170,0.06);
    color: #EEF2FF;
  }

  .wabi-volume-card {
    padding: 16px;
    border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .wabi-volume-card:hover { background: rgba(255,255,255,0.04); }
  .wabi-volume-card.selected {
    border-color: rgba(0,212,170,0.5);
    background: rgba(0,212,170,0.06);
  }
  .wabi-plan-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 99px;
    background: rgba(0,212,170,0.12);
    color: #00D4AA;
    border: 1px solid rgba(0,212,170,0.25);
    white-space: nowrap;
  }

  .wabi-summary-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .wabi-summary-row:last-child { border-bottom: none; }
  .wabi-summary-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: rgba(0,212,170,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00D4AA;
    flex-shrink: 0;
  }

  .wabi-check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    color: #7A90A0;
    font-size: 14px;
  }
  .wabi-check-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0,212,170,0.15);
    color: #00D4AA;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wabi-license-input {
    text-align: center;
    letter-spacing: 0.15em;
    font-family: 'Outfit', monospace;
    font-size: 16px;
    font-weight: 700;
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function FormInput({ label, type, value, onChange, placeholder, icon, right, required = true, className = "" }: {
  label: string; type: string; value: string; onChange: (v: string) => void
  placeholder: string; icon: React.ReactNode; right?: React.ReactNode; required?: boolean; className?: string
}) {
  return (
    <div className="wabi-input-group">
      <label className="wabi-input-label">{label}</label>
      <div className="wabi-input-wrap">
        <span className="wabi-input-icon">{icon}</span>
        <input
          className={`wabi-input ${className}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{ paddingRight: right ? "44px" : "16px" }}
        />
        {right && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
            {right}
          </span>
        )}
      </div>
    </div>
  )
}

function SelectInput({ label, value, onChange, options, icon }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; icon: React.ReactNode
}) {
  return (
    <div className="wabi-input-group">
      <label className="wabi-input-label">{label}</label>
      <div className="wabi-input-wrap wabi-select-wrap" style={{ display: "flex", alignItems: "center" }}>
        <span className="wabi-input-icon">{icon}</span>
        <select className="wabi-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="wabi-select-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D4D5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>
    </div>
  )
}


async function sendToLeadSheet(data: {
  nombre: string; email: string; company_name?: string; phone?: string;
  industry?: string; expected_volume?: string; timezone?: string; fecha: string
}) {
  console.log("📋 sendToLeadSheet iniciado:", data)
  try {
    const res = await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    console.log("✅ Lead capturado:", result)
  } catch (e: any) {
    console.error("❌ Error capturando lead:", e.message)
    // No crítico — no bloquear el onboarding
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}



function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const bypass = searchParams.get("bypass") === "1"

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [affiliateGenerated, setAffiliateGenerated] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsScrolled, setTermsScrolled] = useState(false)

  const generateRecoveryCode = () => {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase()
    return `WBR-${part()}-${part()}-${new Date().getFullYear()}`
  }

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: AVATARS[0].seed,
    security_question: SECURITY_QUESTIONS[0],
    security_answer: "",
    company_name: "",
    phone: "",
    timezone: "America/Argentina/Buenos_Aires",
    language: "es",
    industry: "",
    expected_volume: "",
    line_phone: "",
    line_name: "",
    affiliate_code: "",
    wantsAffiliate: false,
    recovery_code: generateRecoveryCode()
  })

  // 🔒 PROTECCIÓN: si ya existe usuario, mandar a login inmediatamente
 
  // useEffect(() => {  
  //   fetch("/api/auth/check", { cache: "no-store" })
  //     .then(r => r.json())
  //     .then(data => {
  //       if (data.hasUser) {
  //         router.replace("/login") 
  //       }
  //     })
  //     .catch(() => {})
  //     .finally(() => setChecking(false))
  // }, [router])

  // if (checking) {
  //   return (
  //     <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
  //       <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   )
  // }

  // 🔥 BYPASS AGRESIVO para desarrollo
  // useEffect(() => {
  //   if (bypass) {
  //     localStorage.setItem("onboarding_bypass", "1")
  //   }
  // }, [bypass])







  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const goNext = () => {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError("")
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => {
    setError("")
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 2:
        if (!form.nombre.trim()) return "Nombre completo requerido"
        if (!form.email.trim() || !form.email.includes("@")) return "Email válido requerido"
        if (!form.password || form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres"
        if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden"
        return null
      case 3:
        if (!form.security_answer.trim()) return "Respuesta de seguridad requerida"
        if (!form.company_name.trim()) return "Nombre de empresa requerido"
        if (!form.industry) return "Seleccioná un rubro"
        if (!form.expected_volume) return "Seleccioná un volumen estimado"
        return null
      case 4:
      case 5:
        return null
      
      default:
        return null
    }
  }

  const handleGenerateAffiliate = async () => {
    setForm((prev) => ({ ...prev, wantsAffiliate: true }))
    setAffiliateGenerated(true)
    setAffiliateCode("WS-" + Math.random().toString(36).substring(2, 8).toUpperCase())
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getPlanRecommendation = () => {
    const vol = VOLUMES.find((v) => v.value === form.expected_volume)
    return vol || VOLUMES[0]
  }

    const handleSubmit = async () => {
    console.log("🔥 handleSubmit ejecutado")
    setLoading(true)
    setError("")

    try {
      const payload = {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        avatar: form.avatar,
        security_question: form.security_question,
        security_answer: form.security_answer,
        line_phone: form.line_phone || undefined,
        line_name: form.line_name || undefined,
        company_name: form.company_name,
        phone: form.phone,
        timezone: form.timezone,
        language: form.language,
        industry: form.industry,
        expected_volume: form.expected_volume,
        recovery_code: form.recovery_code,
        affiliate_code: affiliateCode || null,
      }
      console.log("📤 Payload:", payload)

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("📡 Response status:", res.status)
      const data = await res.json()
      console.log("📡 Response data:", data)

      if (!res.ok) throw new Error(data.error || "Error en registro")

      localStorage.setItem("mb_token", data.token)
      
      await sendToLeadSheet({
        nombre: form.nombre,
        email: form.email,
        company_name: form.company_name,
        phone: form.phone,
        industry: form.industry,
        expected_volume: form.expected_volume,
        timezone: form.timezone,
        fecha: new Date().toISOString(),
      })

      console.log("✅ Token guardado, redirigiendo a /dashboard")
      window.location.href = "/dashboard"
    } catch (e: any) {
      console.error("❌ Error en registro:", e.message)
      setError(e.message)
      setLoading(false)
    }
  }
  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="wabi-onboarding-root">
        <div className="wabi-glow-bg" />
        <div className="wabi-grid-bg" />

        {/* Logo flotante */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: "relative", zIndex: 10, marginBottom: 28, textAlign: "center" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #00D4AA, #00A8C8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,212,170,0.25)",
            }}>
              <Zap size={20} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#EEF2FF", letterSpacing: "-0.02em" }}>
              Wabi<span style={{ color: "#00D4AA" }}>Send</span>
            </span>
          </div>
        </motion.div> */}

         <img 
    src="/images/logo_light.png" 
    alt="WabiSend" 
    className="h-14 w-auto m-auto"
    style={{ marginBottom: 20 }}
  />

        <div className="wabi-card">
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
          <div style={{ marginBottom: 5, textAlign: "center" }}>
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
                {step === 1 && <StepWelcome onStart={goNext} />}
            {step === 2 && <StepProfile form={form} update={update} showPw={showPw} setShowPw={setShowPw} showConfirmPw={showConfirmPw} setShowConfirmPw={setShowConfirmPw} />}
            {step === 3 && <StepOrganization form={form} update={update} />}
            {step === 4 && <StepWhatsApp form={form} update={update} />}
            {step === 5 && (
              <StepAffiliate
                form={form}
                update={update}
                generated={affiliateGenerated}
                code={affiliateCode}
                onGenerate={handleGenerateAffiliate}
                copied={copied}
                onCopy={handleCopyCode}
                onSkip={() => { update("wantsAffiliate", false); goNext() }}
                onContinue={goNext}
              />
            )}
           {step === 6 && <StepSummary form={form} plan={getPlanRecommendation()} affiliateCode={affiliateCode} />}

             
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div className="wabi-error">
                  <Shield size={14} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons — NAVIGATION (ocultos en paso 5 y 6 porque manejan su propia navegación) */}
                    {step !== 5 && (
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goBack}
                  className="wabi-btn wabi-btn-ghost"
                  style={{ flex: "0 0 auto", minWidth: 110 }}
                >
                  <ArrowLeft size={16} />
                  Atrás
                </motion.button>
              )}

              {step < STEPS.length && (
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={goNext}
                  className="wabi-btn"
                  style={{ flex: 1 }}
                >
                  <span className="wabi-shimmer" />
                  <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                    {step === 1 ? "Comenzar" : step === 4 ? "Continuar" : "Siguiente"}
                    <ArrowRight size={16} />
                  </span>
                </motion.button>
              )}

               {step === STEPS.length && (
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setShowTerms(true)}
                  disabled={loading}
                  className="wabi-btn"
                  style={{ flex: 1 }}
                >
                  <span className="wabi-shimmer" />
                  <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                    {loading ? (
                      <>
                        <motion.span
                          style={{ display: "block", width: 18, height: 18, border: "2.5px solid rgba(2,13,18,0.3)", borderTopColor: "#021210", borderRadius: "50%" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Crear cuenta y entrar
                      </>
                    )}
                  </span>
                </motion.button>
              )}
            </div>
          )}

          {/* Login link */}
          {/* {step === 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: "center", marginTop: 20, color: "#2E4050", fontSize: 13 }}
            >
              ¿Ya tenés cuenta?{" "}
              <button onClick={() => window.location.href = "/login"} className="wabi-link-btn" style={{ color: "#3D5060", fontSize: 13 }}>
                Iniciar sesión
              </button>
            </motion.p>
          )} */}
        </div>

              {/* ═════════════════════════════════════════════════════════════════
          MODAL TÉRMINOS Y CONDICIONES
      ═════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="wabi-card"
              style={{ maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
            >
              {/* Header */}
              <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={18} style={{ color: '#00D4AA' }} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#EEF2FF' }}>Términos y Condiciones de Uso</h2>
                </div>
                <p style={{ fontSize: 12.5, color: '#3D5060', lineHeight: 1.5 }}>
                  Antes de tomar posesión del software, debés aceptar los términos que regulan el uso de WabiSend.
                </p>
              </div>

              {/* Scrollable Content */}
              <div 
                style={{ 
                  padding: '20px 28px', 
                  overflowY: 'auto', 
                  maxHeight: '50vh',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: '#7A90A0'
                }}
                onScroll={(e) => {
                  const el = e.currentTarget
                  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
                  if (nearBottom) setTermsScrolled(true)
                }}
              >
                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  1. Naturaleza del Producto
                </div>
                <p style={{ marginBottom: 16 }}>
                  WabiSend es un software <strong>self-hosted</strong>. El cliente adquiere una licencia de uso y es responsable exclusivo de la infraestructura donde se ejecuta (servidores, bases de datos, dominios y servicios asociados). El proveedor no gestiona, aloja ni controla la instancia del cliente.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  2. Propiedad Intelectual y Licencia
                </div>
                <p style={{ marginBottom: 16 }}>
                  El código fuente, la arquitectura, los algoritmos de distribución, los sistemas de encriptación y todos los activos intelectuales asociados son propiedad exclusiva del licenciante. El cliente recibe una licencia <strong>no transferible, no sublicenciable y no exclusiva</strong> para uso interno. Queda terminantemente prohibida la ingeniería inversa, el descompilado, la modificación del código, el repackaging, la redistribución o cualquier práctica que altere la integridad del software.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  3. Integridad de la Base de Datos
                </div>
                <p style={{ marginBottom: 16 }}>
                  El cliente tiene acceso administrativo a su propia base de datos. Sin embargo, <strong>queda expresamente prohibido</strong> manipular directamente la estructura de tablas, relaciones, campos o registros de sistema mediante SQL, scripts o cualquier herramienta externa. Alterar la estructura de la base de datos invalida automáticamente la licencia, anula el soporte técnico y exime al proveedor de toda responsabilidad por pérdida de datos o mal funcionamiento.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  4. Responsabilidad sobre Datos y Cumplimiento Legal
                </div>
                <p style={{ marginBottom: 16 }}>
                  El cliente es único responsable del contenido de los mensajes enviados, del cumplimiento de las leyes de protección de datos personales (Ley 25.326 en Argentina, GDPR en Europa, LGPD en Brasil, y demás normativas aplicables en su jurisdicción), y de obtener los consentimientos necesarios de los contactos. El proveedor no se hace responsable por el uso indebido de la plataforma, spam, o incumplimiento normativo por parte del cliente.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  5. Soporte Técnico y Alcance
                </div>
                <p style={{ marginBottom: 16 }}>
                  El soporte técnico cubre únicamente el funcionamiento del software tal cual fue entregado, en un entorno que no haya sido alterado. No se brinda soporte sobre: modificaciones del código, cambios en la estructura de la base de datos, integraciones no autorizadas, ni problemas derivados de infraestructura ajena al software (servidores, redes, DNS, certificados SSL, etc.).
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  6. Caducidad de Licencia y Sanciones
                </div>
                <p style={{ marginBottom: 16 }}>
                  El incumplimiento de cualquiera de los términos aquí descriptos —incluyendo pero no limitado a ingeniería inversa, modificación de la base de datos, redistribución no autorizada o uso fuera del alcance licenciado— producirá la <strong>caducidad inmediata e irremediable de la licencia</strong>, sin derecho a reintegro del precio pagado. El proveedor se reserva el derecho de iniciar las acciones legales pertinentes por violación de derechos de propiedad intelectual y daños derivados.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  7. Limitación de Responsabilidad
                </div>
                <p style={{ marginBottom: 16 }}>
                  El software se proporciona <strong>"tal cual"</strong>, sin garantías expresas o implícitas de comercialización, idoneidad para un propósito particular, o ininterrupción del servicio. El proveedor no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del software.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  8. Jurisdicción y Ley Aplicable
                </div>
                <p style={{ marginBottom: 16 }}>
                  Estos términos se rigen por las leyes de la <strong>República Argentina</strong>. Para cualquier controversia derivada del presente acuerdo, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad de Córdoba, Argentina, con renuncia expresa a cualquier otro fuero o jurisdicción que pudiera corresponder.
                </p>

                <div style={{ color: '#EEF2FF', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  9. Aceptación
                </div>
                <p>
                  Al hacer click en "Crear cuenta", el usuario declara haber leído, comprendido y aceptado íntegramente estos términos y condiciones, obligándose a cumplirlos en forma absoluta.
                </p>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: 3, accentColor: '#00D4AA' }}
                  />
                  <span style={{ fontSize: 13, color: '#7A90A0', lineHeight: 1.5 }}>
                    He leído y comprendo los términos. Entiendo que este software es self-hosted, que soy responsable de mi infraestructura, y que alterar la base de datos o el código anula mi licencia y soporte.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => { setShowTerms(false); setTermsAccepted(false) }}
                    className="wabi-btn wabi-btn-ghost"
                    style={{ flex: '0 0 auto', minWidth: 110 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!termsAccepted) {
                        setError("Debés aceptar los términos para continuar.")
                        return
                      }
                      setShowTerms(false)
                      handleSubmit()
                    }}
                    disabled={!termsAccepted || !termsScrolled}
                    className="wabi-btn"
                    style={{ flex: 1, opacity: (!termsAccepted || !termsScrolled) ? 0.5 : 1 }}
                  >
                    <span className="wabi-shimmer" />
                    <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle2 size={16} />
                      Si comprendo los TyC, crear cuenta
                    </span>
                  </button>
                </div>
                {!termsScrolled && (
                  <p style={{ fontSize: 11, color: '#F87171', marginTop: 8, textAlign: 'center' }}>
                    📜 Desplazá hasta el final para habilitar el botón
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#1A2A36", fontSize: 12, marginTop: 24 }}
        >
          © 2026 WabiSend. Todos los derechos reservados.
        </motion.p>
      </div>
      
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 1: WELCOME
// ═══════════════════════════════════════════════════════════════════════════════

function StepWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
      
     

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: "#3D5060", fontSize: 14.5, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 28px" }}
      >
        En menos de 2 minutos vas a configurar tu plataforma de envíos masivos por WhatsApp. Sin límites, sin mensualidades.
      </motion.p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 300, margin: "0 auto" }}>
        {[
          { icon: Smartphone, text: "Conectá tu línea WhatsApp" },
          { icon: Users, text: "Gestioná contactos ilimitados" },
          { icon: Share2, text: "Generá ingresos con afiliados" },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              color: "#7A90A0", fontSize: 13.5, fontWeight: 500,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(0,212,170,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#00D4AA", flexShrink: 0,
            }}>
              <item.icon size={14} />
            </div>
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: 28 }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="wabi-btn"
          style={{ maxWidth: 280, margin: "0 auto" }}
        >
          <span className="wabi-shimmer" />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
            Comenzar configuración <ArrowRight size={16} />
          </span>
        </motion.button>
      </motion.div> */}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 2: PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

function StepProfile({ form, update, showPw, setShowPw, showConfirmPw, setShowConfirmPw }: {
  form: any; update: (f: string, v: string) => void
  showPw: boolean; setShowPw: (v: boolean) => void
  showConfirmPw: boolean; setShowConfirmPw: (v: boolean) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <FormInput
        label="Nombre completo"
        type="text"
        value={form.nombre}
        onChange={(v) => update("nombre", v)}
        placeholder="Juan Pérez"
        icon={<UserCog size={16} />}
      />
      <FormInput
        label="Email de registro"
        type="email"
        value={form.email}
        onChange={(v) => update("email", v)}
        placeholder="juan@empresa.com"
        icon={<Mail size={16} />}
      />
      <FormInput
        label="Contraseña"
        type={showPw ? "text" : "password"}
        value={form.password}
        onChange={(v) => update("password", v)}
        placeholder="Mínimo 6 caracteres"
        icon={<Lock size={16} />}
        right={
          <button type="button" onClick={() => setShowPw(!showPw)} className="wabi-link-btn" style={{ display: "flex" }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <FormInput
        label="Confirmar contraseña"
        type={showConfirmPw ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(v) => update("confirmPassword", v)}
        placeholder="Repetí la contraseña"
        icon={<Lock size={16} />}
        right={
          <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="wabi-link-btn" style={{ display: "flex" }}>
            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div style={{ marginTop: 8 }}>
        <label className="wabi-input-label" style={{ marginBottom: 10 }}>Avatar</label>
        <div className="wabi-avatar-grid">
          {AVATARS.map((a, i) => (
            <motion.button
              key={a.seed}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => update("avatar", a.seed)}
              className={`wabi-avatar-item ${form.avatar === a.seed ? "selected" : ""}`}
              title={a.label}
            >
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${a.seed}&backgroundColor=transparent`}
                alt={a.label}
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <SelectInput
          label="Pregunta de seguridad"
          value={form.security_question}
          onChange={(v) => update("security_question", v)}
          options={SECURITY_QUESTIONS.map((q) => ({ value: q, label: q }))}
          icon={<Shield size={16} />}
        />
        <FormInput
          label="Tu respuesta secreta"
          type="text"
          value={form.security_answer}
          onChange={(v) => update("security_answer", v)}
          placeholder="Solo vos sabés esto..."
          icon={<Lock size={16} />}
        />
      </div>
            {/* Código de recuperación de emergencia */}
      <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Shield size={16} style={{ color: '#F87171' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Código de recuperación de emergencia
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: '#7A90A0', lineHeight: 1.5, marginBottom: 10 }}>
          Si olvidás tu contraseña <strong>y</strong> tu pregunta de seguridad, este código es la única forma de recuperar tu cuenta. Guardalo en un lugar seguro.
        </p>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 14px',
          border: '1px dashed rgba(239,68,68,0.3)'
        }}>
          <code style={{ fontSize: 16, fontWeight: 800, color: '#F87171', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
            {form.recovery_code}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(form.recovery_code)
              toast.success("Código copiado")
            }}
            className="wabi-link-btn"
            style={{ fontSize: 12, color: '#F87171', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Copy size={14} /> Copiar
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#3D5060', marginTop: 8 }}>
          ⚠️ Este código se muestra <strong>una sola vez</strong>. No se puede recuperar después.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 3: ORGANIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function StepOrganization({ form, update }: { form: any; update: (f: string, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <FormInput
        label="Nombre de tu empresa o marca"
        type="text"
        value={form.company_name}
        onChange={(v) => update("company_name", v)}
        placeholder="Mi Empresa S.A."
        icon={<Building2 size={16} />}
      />
      <FormInput
        label="Teléfono de contacto"
        type="tel"
        value={form.phone}
        onChange={(v) => update("phone", v)}
        placeholder="+54 9 11 1234-5678"
        icon={<Phone size={16} />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SelectInput
          label="Zona horaria"
          value={form.timezone}
          onChange={(v) => update("timezone", v)}
          options={TIMEZONES}
          icon={<Clock size={16} />}
        />
        <SelectInput
          label="Idioma"
          value={form.language}
          onChange={(v) => update("language", v)}
          options={LANGUAGES}
          icon={<Globe size={16} />}
        />
      </div>

      <div style={{ marginTop: 4 }}>
        <label className="wabi-input-label" style={{ marginBottom: 10 }}>Rubro de tu negocio</label>
        <div className="wabi-industry-grid">
          {INDUSTRIES.map((ind, i) => (
            <motion.button
              key={ind.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => update("industry", ind.value)}
              className={`wabi-industry-card ${form.industry === ind.value ? "selected" : ""}`}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: form.industry === ind.value ? "rgba(0,212,170,0.12)" : "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: form.industry === ind.value ? "#00D4AA" : "#3D4D5C",
                transition: "all 0.2s",
              }}>
                <ind.icon size={16} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{ind.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 4 }}>
        <label className="wabi-input-label" style={{ marginBottom: 10 }}>Volumen estimado de contactos</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {VOLUMES.map((vol, i) => (
            <motion.button
              key={vol.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => update("expected_volume", vol.value)}
              className={`wabi-volume-card ${form.expected_volume === vol.value ? "selected" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: form.expected_volume === vol.value ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: form.expected_volume === vol.value ? "#00D4AA" : "#3D4D5C",
                  border: form.expected_volume === vol.value ? "1.5px solid rgba(0,212,170,0.4)" : "1.5px solid transparent",
                }}>
                  <Users size={13} />
                </div>
                <span style={{ fontSize: 14, color: "#EEF2FF", fontWeight: 500 }}>{vol.label}</span>
              </div>
              <span className="wabi-plan-badge">{vol.planLabel} · {vol.price}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 4: WHATSAPP
// ═══════════════════════════════════════════════════════════════════════════════

function StepWhatsApp({ form, update }: { form: any; update: (f: string, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.12)",
        borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(0,212,170,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#00D4AA", flexShrink: 0,
        }}>
          <Smartphone size={18} />
        </div>
        <div>
          <p style={{ color: "#EEF2FF", fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Conectá tu primera línea</p>
          <p style={{ color: "#3D5060", fontSize: 12 }}>Escaneá el QR desde tu celular. Podés agregar más líneas después.</p>
        </div>
      </div>

      <FormInput
        label="Número de WhatsApp (con código de país)"
        type="tel"
        value={form.line_phone}
        onChange={(v) => update("line_phone", v)}
        placeholder="5491123456789"
        icon={<Phone size={16} />}
      />
      <FormInput
        label="Nombre de la línea"
        type="text"
        value={form.line_name}
        onChange={(v) => update("line_name", v)}
        placeholder="Línea Principal"
        icon={<Radio size={16} />}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: "#2E4050", fontSize: 12.5, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}
      >
        Este paso es opcional. Si preferís, podés conectar tu línea más tarde desde el panel.
      </motion.p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 5: AFFILIATE (FIXED NAVIGATION)
// ═══════════════════════════════════════════════════════════════════════════════

function StepAffiliate({
  form, update, generated, code, onGenerate, copied, onCopy, onSkip, onContinue
}: {
  form: any; update: (f: string, v: string | boolean) => void
  generated: boolean; code: string; onGenerate: () => void
  copied: boolean; onCopy: () => void; onSkip: () => void; onContinue: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #00D4AA, #3B6EF7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(0,212,170,0.2)",
          }}
        >
          <Share2 size={28} color="white" />
        </motion.div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#EEF2FF", marginBottom: 6 }}>Programa de Partners</h3>
        <p style={{ color: "#3D5060", fontSize: 13.5, lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
          Generá ingresos pasivos por cada licencia que vendas con tu código único. Sin techo, sin complicaciones.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "16px 0" }}>
        {[
          { value: "30%", label: "Comisión por venta" },
          { value: "24h", label: "Tracking en tiempo real" },
          { value: "USD", label: "Pagos automáticos" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            style={{
              textAlign: "center", padding: "14px 8px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: "#00D4AA", letterSpacing: "-0.02em", marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: "#3D5060", fontWeight: 500 }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {!generated ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={onGenerate}
            className="wabi-btn2"
          >
            <span className="wabi-shimmer" />
            <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} />
              Generar mi código de afiliado
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={onSkip}
            className="wabi-btn2 wabi-btn-ghost"
          >
            Omitir por ahora
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "rgba(0,212,170,0.04)", border: "1.5px solid rgba(0,212,170,0.2)",
            borderRadius: 16, padding: "20px", textAlign: "center", marginTop: 8,
          }}
        >
          <p style={{ color: "#3D5060", fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Tu código único</p>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 12,
          }}>
            <code style={{
              fontSize: 24, fontWeight: 800, color: "#00D4AA",
              letterSpacing: "0.08em", fontFamily: "'Outfit', monospace",
            }}>
              {code}
            </code>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCopy}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: copied ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: copied ? "#00D4AA" : "#3D4D5C", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </motion.button>
          </div>
          <p style={{ color: "#2E4050", fontSize: 12 }}>
            {copied ? "Copiado al portapapeles" : "Compartí este código para empezar a generar comisiones"}
          </p>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={onContinue}
            className="wabi-btn"
            style={{ marginTop: 16 }}
          >
            <span className="wabi-shimmer" />
            <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              Continuar <ArrowRight size={16} />
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
//  STEP 7: SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

function StepSummary({ form, plan, affiliateCode }: { form: any; plan: typeof VOLUMES[0]; affiliateCode?: string }) {
  const summaryItems = [
    { icon: UserCog, label: "Administrador", value: form.nombre },
    { icon: Mail, label: "Email", value: form.email },
    { icon: Building2, label: "Empresa", value: form.company_name },
    { icon: Briefcase, label: "Rubro", value: INDUSTRIES.find((i) => i.value === form.industry)?.label || "—" },
    { icon: Users, label: "Volumen estimado", value: VOLUMES.find((v) => v.value === form.expected_volume)?.label || "—" },
    { icon: Globe, label: "Zona horaria", value: TIMEZONES.find((t) => t.value === form.timezone)?.label || "—" },
    { icon: Phone, label: "Teléfono", value: form.phone || "—" },
    { icon: Smartphone, label: "Línea WhatsApp", value: form.line_phone ? `${form.line_name || 'Sin nombre'} (${form.line_phone})` : "No configurada" },
    { icon: Share2, label: "Código de afiliado", value: form.wantsAffiliate ? (affiliateCode || "Generado") : "No participa" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #00D4AA, #00A8C8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(0,212,170,0.2), 0 0 0 6px rgba(0,212,170,0.05)",
          }}
        >
          <CheckCircle2 size={28} color="white" />
        </motion.div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#EEF2FF", marginBottom: 4 }}>Revisá tu configuración</h3>
        <p style={{ color: "#3D5060", fontSize: 13 }}>Todo listo para lanzar tu WabiSend.</p>
      </div>

      {/* Plan + License */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(59,110,247,0.06))",
          border: "1.5px solid rgba(0,212,170,0.2)",
          borderRadius: 16, padding: "16px 20px", marginBottom: 8,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ color: "#3D5060", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Plan recomendado
          </p>

          <p style={{ color: "#EEF2FF", fontSize: 18, fontWeight: 800 }}>
            {plan.planLabel} <span style={{ color: "#00D4AA" }}>· {plan.price}</span>
          </p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "rgba(0,212,170,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#00D4AA",
        }}>
          <Sparkles size={20} />
        </div>
      </motion.div>

      {/* Summary list */}
      <div style={{ marginBottom: 8 }}>
        {summaryItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="wabi-summary-row"
          >
            <div className="wabi-summary-icon">
              <item.icon size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#3D5060", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                {item.label}
              </p>
              <p style={{ color: "#EEF2FF", fontSize: 14, fontWeight: 500 }}>{item.value || "—"}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checklist */}
      <div style={{
        background: "rgba(255,255,255,0.015)", borderRadius: 14, padding: "14px 18px",
        border: "1px solid rgba(255,255,255,0.04)",
      }}>
        {[
          "Licencia activada",
          "Usuario administrador",
          "Datos de empresa",
          "Línea WhatsApp (opcional)",
          "Programa de afiliados (opcional)",
        ].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="wabi-check-item"
          >
            <div className="wabi-check-icon">
              <Check size={12} />
            </div>
            {text}
          </motion.div>
        ))}
      </div>
    </div>
  )
}