"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Globe,
  HelpCircle,
  Infinity as InfinityIcon,
  Layers,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  Repeat,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Smartphone,
  FileText,
  Mail,
  ExternalLink,
  Clock,
  Calendar,
  PieChart,
  Send,
  Tag,
  Hash,
  MousePointerClick,
  CreditCard,
  X,
  Server,
  KeyRound
} from "lucide-react"
import Link from "next/link"

/* ============================================================
   WabiSend — Landing Page v1.0
   Light mode profesional. Sin emojis. Solo Lucide.
   ============================================================ */



// const staggerContainer = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut"
//     }
//   }
// };






const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
}



const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Los hijos aparecen con 0.1s de diferencia
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};





  
/* ---------- Componentes ---------- */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { label: "Funciones", href: "#features" },
    { label: "Demo", href: "#demo" },
    { label: "Precios", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
  <img 
    src="/images/logo_dark.png" 
    alt="WabiSend" 
    className="h-12 w-auto"
  />
</Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/demo"
              className="text-sm font-semibold text-slate-700 hover:text-cyan-600 transition-colors"
            >
              Ingresar a DEMO
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Conocer WabiSend <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-700"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium text-slate-700"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href="/demo"
                  className="w-full text-center py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Ingresar a DEMO
                </Link>
                <Link
                  href="#pricing"
                  className="w-full text-center py-3 rounded-xl bg-slate-900 text-white font-semibold"
                >
                  Conocer WabiSend
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []

    const count = Math.min(w < 768 ? 55 : 90, Math.floor((w * h) / 12000))

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2.5 + 1.5,
      })
    }

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(79, 70, 229, 0.75)"
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.3 * (1 - dist / 140)})`
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    draw()

    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  )
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      {/* Canvas de partículas — ahora con z-0 para que se vea */}
      <HeroBackground />

      {/* Blobs fluidos que respiran */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-100/80 via-violet-100/50 to-transparent rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-200/40 rounded-full blur-3xl animate-[pulse_7s_ease-in-out_infinite_2s]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-cyan-100 text-cyan-700 text-sm font-medium mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Licencia ilimitada · Pagás una vez
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]"
          >
            WhatsApp masivo{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600">
              sin límites
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-lg mx-auto leading-relaxed"
          >
            Plataforma self-hosted. Sin mensualidades, sin techo de envíos, sin que nadie toque tus datos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary: Conocer WabiSend — plano, elegante */}
            <Link
              href="#pricing"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
            >
              Conocer WabiSend
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* DEMO: borde de gradiente que fluye infinitamente */}
            <div className="relative inline-flex rounded-full p-[2.5px] overflow-hidden group cursor-pointer">
  <motion.div
    className="absolute inset-[-50%] rounded-full"
    style={{
      background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #d946ef, #a855f7, #6366f1)",
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
  />
  <Link
    href="/demo"
    className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-semibold text-base hover:bg-cyan-50 transition-colors z-10"
  >
    <Play className="w-4 h-4 text-cyan-600" />
    Ingresar a DEMO
  </Link>
</div>
          </motion.div>

          {/* Trust */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Pago único · Base de datos propia · Sin suscripciones
          </motion.p>
        </div>

        {/* Mockup con float */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 lg:mt-20 max-w-5xl mx-auto"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: 999999, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl animate-pulse" />
            <div className="relative bg-slate-900 rounded-t-2xl sm:rounded-t-3xl p-2 sm:p-3 shadow-2xl">
              <div className="flex items-center gap-2 px-2 pb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 text-slate-400 text-xs">
                    <Lock className="w-3 h-3" />
                    app.tudominio.com

                  </div>
                </div>
              </div>
              <div className="bg-slate-950 rounded-lg sm:rounded-xl overflow-hidden aspect-[2.2/1] relative">
                <img
                  src="/images/mockup_1.png"
                  alt="Dashboard WabiSend"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="relative mx-auto w-[95%] sm:w-[90%]">
              <div className="h-3 sm:h-4 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl sm:rounded-b-2xl shadow-xl" />
              <div className="h-1 sm:h-1.5 bg-slate-600 rounded-b-lg mx-auto w-1/3" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Logos() {
  const items = [
    { icon: ShieldCheck, text: "Pagos seguros" },
    { icon: Database, text: "Datos propios" },
    { icon: Globe, text: "Desde cualquier país" },
    { icon: InfinityIcon, text: "Sin límites" },
    { icon: Lock, text: "Privacidad total" },
  ]

  return (
    <section className="py-12 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8"
        >
          Diseñado para equipos que no aceptan mediocridad
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-wrap justify-center gap-8 lg:gap-16"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={staggerContainer}
              className="flex items-center gap-2 text-slate-500"
            >
              <item.icon className="w-5 h-5 text-cyan-500" />
              <span className="text-sm font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Send,
      title: "Envío masivo real",
      desc: "Conectá múltiples líneas de WhatsApp y distribuí el envío automáticamente. Sin caídas, sin saturación.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Hash,
      title: "Spintax inteligente",
      desc: "Cada mensaje es único. Variaciones automáticas de texto para evitar bloqueos y mejorar entregabilidad.",
      color: "from-sky-500 to-blue-500",
    },
    {
      icon: Calendar,
      title: "Programación avanzada",
      desc: "Agendá campañas para días y horarios específicos. Dejá que WabiSend trabaje mientras dormís.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Reportes en tiempo real",
      desc: "Tracking de entregas, aperturas y respuestas. Métricas claras para saber qué funciona y qué no.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Users,
      title: "Contactos ilimitados",
      desc: "Importá miles de contactos por CSV, organizalos con etiquetas y segmentalos sin restricciones.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Database,
      title: "Tu base, tu servidor",
      desc: "Los datos son tuyos. Instalado en tu infraestructura. Nada en la nube de terceros. Control total.",
      color: "from-rose-500 to-red-500",
    },
  ]

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            Funciones
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Todo lo que necesitás para escalar tus ventas
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            WabiSend no es un servicio mensual. Es un motor de comunicación que instalás una vez y explotás sin techo.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={staggerContainer}
              custom={i}
              className="group relative p-6 lg:p-8 rounded-2xl bg-white border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function SelfHosted() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wide">
              <Globe className="w-3.5 h-3.5" />
              Infraestructura
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Tu dominio.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600">
                Tu marca.
              </span>{" "}
              Nuestro motor.
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Instalá WabiSend en tu propio servidor con el dominio que elijas. Tus clientes ven tu nombre,
              tu logo y tu identidad. Pero detrás del volante siempre está la potencia certificada de WabiSend.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { icon: Globe, text: "Dominio propio: app.tuempresa.com" },
                { icon: Layers, text: "Logo y colores de tu marca" },
                { icon: Lock, text: "Tus datos en tu base de datos" },
                { icon: Sparkles, text: "Badge 'Powered by WabiSend' discreto y profesional" },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <span className="text-slate-700">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Visual: Browser mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-3xl blur-2xl" />

            {/* Browser frame */}
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Browser header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500">
                    <Lock className="w-3 h-3" />
                    app.tuempresa.com
                  </div>
                </div>
              </div>

              {/* Fake dashboard content */}
              <div className="p-6 bg-white relative">
                {/* Header fake */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800" />
                    <span className="font-bold text-slate-900 text-sm">Tu Empresa</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                  </div>
                </div>

                {/* Stats fake */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-2 rounded bg-slate-200 mb-2" />
                      <div className="w-16 h-4 rounded bg-slate-300" />
                    </div>
                  ))}
                </div>

                {/* Chart fake */}
                <div className="h-24 rounded-xl bg-slate-50 border border-slate-100 mb-6 flex items-end gap-1 px-4 pb-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-indigo-400 to-violet-400 opacity-60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                {/* Watermark WabiSend */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Send className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Powered by WabiSend
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}




function DemoSection() {
  return (
    <section id="demo" className="py-24 lg:py-32 bg-slate-900 text-white overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wide border border-white/10">
              <Play className="w-3.5 h-3.5" />
              Probá antes de comprar
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              No te quedes con la duda.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                Probalo ahora.
              </span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Accedé al modo demo y manejá campañas, contactos y reportes con datos reales de
              prueba. Sentí la velocidad. Ves la potencia. Después decidís.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Dashboard completo con métricas en vivo",
                "Simulación de envío masivo sin riesgo",
                "Reportes de entrega, apertura y respuesta",
                "Cero configuración. Cero compromiso.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-semibold hover:bg-cyan-50 transition-colors shadow-xl"
              >
                Ingresar a DEMO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Mockup phone + desktop side by side */}
          {/* Mockup phone + desktop side by side */}
<motion.div
  initial={{ opacity: 0, x: 40 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, amount: 0.1 }}
  transition={{ duration: 0.7 }}
  className="relative"
>
  <div className="relative">
    <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-3xl blur-2xl" />

    {/* Desktop mini mockup */}
    <div className="relative bg-slate-800 rounded-2xl p-3 shadow-2xl border border-slate-700">
      <div className="flex items-center gap-2 px-2 pb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="bg-slate-900 rounded-lg aspect-video overflow-hidden aspect-[2.2/1]">
        <img
        
          src="/images/mockup_2.png"
          alt="Demo WabiSend Desktop"

          className="w-full h-full object-cover "
        />
      </div>
    </div>

    {/* Phone mockup overlapping */}
    <div className="absolute -bottom-8 -right-4 w-32 sm:w-40">
      <div className="bg-slate-800 rounded-[1.5rem] p-2 shadow-2xl border border-slate-700">
        <div className="bg-slate-900 rounded-[1.2rem] aspect-[9/16] overflow-hidden">
          <img
            src="/images/mockup_3.png"
            alt="Demo WabiSend Mobile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</motion.div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$500",
      desc: "Perfecto para emprendedores y equipos pequeños que quieren empezar a escalar.",
      features: [
        "1 licencia de por vida",
        "Hasta 2 líneas de WhatsApp",
        "Envíos masivos ilimitados",
        "Spintax básico",
        "Reportes estándar",
        "Soporte por email",
        "Actualizaciones 6 meses",
      ],
      cta: "Comprar Starter",
      popular: false,
    },
    {
      name: "Pro",
      price: "$750",
      desc: "Para agencias y equipos de ventas que necesitan potencia total sin techo.",
      features: [
        "1 licencia de por vida",
        "Hasta 5 líneas de WhatsApp",
        "Envíos masivos ilimitados",
        "Spintax avanzado + variables",
        "Programación de campañas",
        "Reportes avanzados + export",
        "Soporte prioritario WhatsApp",
        "Actualizaciones de por vida",
      ],
      cta: "Comprar Pro",
      popular: true,
    },
    {
      name: "Business",
      price: "$1.290",
      desc: "Para agencias, resellers y equipos que venden el servicio a terceros. Sin techo.",
      features: [
        "Todo lo de Pro",
        "Multi Agentes",
        "Blacklist global + Whitelist",
        "Backup automático diario",
        "IA para generar mensajes",
        "Soporte 1-a-1 dedicado",
        "Acceso anticipado a betas",
        "Instalación remota incluida",
      ],
      cta: "Hablar con ventas",
      popular: false,
      highlight: true,
    },
  ]

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
            <CreditCard className="w-3.5 h-3.5" />
            Precios
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Pagás una vez. Usás para siempre.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Sin suscripciones mensuales. Sin sorpresas en la tarjeta. Sin que te corten el servicio
            si no pagás a tiempo. WabiSend es tuyo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 lg:p-10 ${
                plan.highlight
                  ? "bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 text-white"
                  : plan.popular
                  ? "bg-white border-2 border-cyan-500 shadow-xl shadow-cyan-500/10"
                  : "bg-white border border-slate-200"
              }`}
            >
              {/* Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Más elegido
                  </span>
                </div>
              )}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg">
                    <Zap className="w-3.5 h-3.5" />
                    Sin techo
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-2 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-8">
                <span className={`text-4xl lg:text-5xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                <span className={`ml-2 ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>USD</span>
                <p className={`text-sm mt-1 ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>
                  Pago único. Sin mensualidades.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      plan.highlight ? "bg-emerald-500/20" : "bg-emerald-50"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? "text-emerald-400" : "text-emerald-600"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-700"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-white text-slate-900 hover:bg-cyan-50 shadow-lg"
                    : plan.popular
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 inline-flex items-center gap-2 flex-wrap justify-center">
            <Lock className="w-4 h-4 text-slate-400" />
            Pagos procesados de forma segura. Licencia vinculada a tu dominio.
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Testimonials() {
  const testimonials = [
    {
      name: "Martín R. Aguirre",
      role: "Dueño de agencia digital",
      text: "Pasamos de pagar $400 mensuales en una plataforma que nos limitaba a tener WabiSend instalado en nuestro servidor. En dos meses ya recuperamos la inversión y ahora enviamos sin miedo.",
      rating: 5,
    },
    {
      name: "Luciana Fernández",
      role: "E-commerce de indumentaria",
      text: "La programación de campañas cambió mi negocio. Armo todo un domingo y la semana se envía sola. Los reportes me dicen exactamente quién abrió y quién respondió.",
      rating: 5,
    },
    {
      name: "Diego Castellanos",
      role: "Consultor inmobiliario",
      text: "Tenía una base de 8.000 contactos y ninguna herramienta me dejaba importarlos sin cobrarme extra. Con WabiSend los subí en 5 minutos y empecé a convertir el mismo día.",
      rating: 5,
    },
    {
      name: "Carolina Méndez",
      role: "Marketing Lead en SaaS",
      text: "El spintax avanzado es una locura. Nuestros mensajes no se repiten y la tasa de respuesta subió un 40%. Además, mis datos están en MI base de datos. Eso no tiene precio.",
      rating: 5,
    },
    {
      name: "Juan Pablo Sosa",
      role: "Emprendedor en cripto",
      text: "Probé 4 herramientas antes de WabiSend. Todas me pedían suscripción y terminaban bloqueándome. Acá controlo todo yo. La licencia ilimitada es real.",
      rating: 5,
    },
    {
      name: "Valentina Ríos",
      role: "Coach de negocios",
      text: "Enviar recordatorios de webinars a 3.000 personas usaba toda mi tarde. Ahora lo programo en 10 minutos y me dedico a lo que realmente importa: vender.",
      rating: 5,
    },
  ]

  const [current, setCurrent] = useState(0)
  const total = testimonials.length

  const next = () => setCurrent((c) => (c + 1) % total)
  const prev = () => setCurrent((c) => (c - 1 + total) % total)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide">
            <MessageSquare className="w-3.5 h-3.5" />
            Opiniones
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Lo que dicen los que ya lo usan
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            No nos creas a nosotros. Creéle a quienes dejaron de perder plata en plataformas
            caras y limitadas.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 shadow-xl shadow-slate-900/5"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xl lg:text-2xl text-slate-800 font-medium leading-relaxed">
                "{testimonials[current].text}"
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonials[current].name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{testimonials[current].name}</p>
                  <p className="text-sm text-slate-500">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? "bg-cyan-600 w-8" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const faqs = [
    {
      q: "¿WabiSend es una suscripción mensual?",
      a: "No. WabiSend funciona con licencia de pago único. Comprás una vez y usás el software para siempre en tu propio servidor. No hay cargos mensuales ocultos ni límites de uso.",
    },
    {
      q: "¿Dónde se guardan mis contactos y datos?",
      a: "En TU base de datos. WabiSend se instala en tu infraestructura (VPS, Railway, o el servidor que prefieras). Tus datos nunca pasan por nuestros servidores. Tenés control total, privacidad absoluta y cero dependencia de terceros.",
    },
    {
      q: "¿Cuántos mensajes puedo enviar por mes?",
      a: "Ilimitados. La única restricción es la capacidad de tus líneas de WhatsApp y los límites propios de WhatsApp. WabiSend no te pone techo. Enviá 1.000 o 1.000.000, es lo mismo para nosotros.",
    },
    {
      q: "¿Necesito saber programar para usarlo?",
      a: "No. La interfaz es 100% visual. Conectás tu línea escaneando un QR, subís tus contactos por CSV, escribís el mensaje y enviás. Si sabés programar, podés personalizar aún más. Si no, funciona igual.",
    },
    {
      q: "¿Qué pasa si WhatsApp me bloquea el número?",
      a: "WabiSend incluye recomendaciones de uso seguro, delays configurables entre mensajes, spintax para variar el contenido y rotación de líneas. Seguí las buenas prácticas y el riesgo se minimiza drásticamente. De todos modos, siempre podés conectar una nueva línea en minutos.",
    },
    {
      q: "¿Puedo usar WabiSend en varios equipos?",
      a: "Sí. Al ser web-based, accedés desde cualquier navegador. La licencia está vinculada a tu dominio, no a un dispositivo. Tu equipo completo puede trabajar simultáneamente.",
    },
    {
      q: "¿Qué costos de mantenimiento tengo?",
      a: "Solo los de tu servidor y base de datos. Con Railway + Neon, estamos hablando de menos de $10 mensuales para operar a gran escala. Comparado con las suscripciones de la competencia, es ridículo.",
    },
    {
      q: "¿Incluye actualizaciones?",
      a: "El plan Pro incluye actualizaciones de por vida. El plan Starter incluye 6 meses. Después podés renovar el plan de actualizaciones o quedarte con la versión que tenés.",
    },
  ]

  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 lg:py-32 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" />
            Preguntas frecuentes
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Sacate las dudas de una vez
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Si no encontrás lo que buscás, escribinos por WhatsApp y te respondemos al instante.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-4"
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={staggerContainer}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left"
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 lg:px-6 pb-5 lg:pb-6 text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Sección "Deploy en 4 pasos" para la landing

function deploy(){
    <section className="py-20 px-4">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-white mb-4">Deploy en 4 pasos</h2>
    <p className="text-slate-400 mb-12">Sin conocimientos avanzados. Solo seguís el wizard.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { step: "1", title: "Base de datos", desc: "Crear PostgreSQL en Neon", icon: Database },
        { step: "2", title: "Backend", desc: "Deploy en Railway", icon: Server },
        { step: "3", title: "Frontend", desc: "Deploy en Vercel", icon: Globe },
        { step: "4", title: "Activar", desc: "Pegar tu licencia", icon: KeyRound },
      ].map((item) => (
        <div key={item.step} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4">
            <item.icon size={20} className="text-white" />
          </div>
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Paso {item.step}</div>
          <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
          <p className="text-slate-500 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
    
    <div className="mt-10">
      <a href="https://www.loom.com/share/..." target="_blank" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium">
        <Play size={18} /> Ver tutorial de instalación
      </a>
    </div>
  </div>
</section>

}

function CTAFinal() {
  return (

    
    <section className="py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="relative rounded-3xl overflow-hidden bg-slate-900 text-white text-center p-10 lg:p-16"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-600/30 rounded-full blur-3xl" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Dejá de pagar alquiler por tu propia herramienta
          </h2>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Cada mes que pasás pagando suscripciones, estás regalando plata. WabiSend se paga una vez
            y empieza a generar retorno desde el primer envío masivo.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#pricing"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-semibold hover:bg-cyan-50 transition-colors shadow-xl"
            >
              Conocer WabiSend
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Play className="w-4 h-4" />
              Probar DEMO
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Garantía de satisfacción 7 días. Si no te convence, te devolvemos el 100%.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  const columns = [
    {
      title: "Producto",
      links: [
        { label: "Funciones", href: "#features" },
        { label: "Demo", href: "/demo" },
        { label: "Precios", href: "#pricing" },
        { label: "Roadmap", href: "#" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { label: "Documentación", href: "#" },
        { label: "Guía de inicio", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Changelog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos del servicio", href: "#" },
        { label: "Política de privacidad", href: "#" },
        { label: "Licencia de uso", href: "#" },
        { label: "Venta no autorizada", href: "#" },
      ],
    },
    {
      title: "Soporte",
      links: [
        { label: "Centro de ayuda", href: "#" },
        { label: "Contacto", href: "#" },
        { label: "WhatsApp", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
  ]

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 lg:py-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
  <img 
    src="/images/logo_light.png" 
    alt="WabiSend" 
    className="h-12 w-auto"
  />
</Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Plataforma de envío masivo por WhatsApp con licencia ilimitada. Control total de
              tus datos. Sin suscripciones mensuales.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} WabiSend. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function WhatsAppFloat() {

    const getWhatsAppLink = () => {
  const ref = typeof window !== 'undefined' ? localStorage.getItem("wabisend_ref") : null
  const base = "https://wa.me/5490000000000?text="
  if (ref) {
    return base + encodeURIComponent(`Hola, quiero WabiSend. Me enviaron con el código: ${ref}`)
  }
  return base + encodeURIComponent("Hola, quiero saber más sobre WabiSend")
}

 useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  
  if (ref) {
    localStorage.setItem("wabisend_ref", ref)
    
    // 🔒 Anti-duplicado: solo trackear una vez por sesión
    const trackedKey = `wabisend_tracked_${ref}`
    if (sessionStorage.getItem(trackedKey)) return
    
    sessionStorage.setItem(trackedKey, "1")
    
    fetch(`https://old-bar-56fe.cursosluckylabmarketing.workers.dev/track?ref=${ref}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Track affiliate:", data)
    })
    .catch(err => {
      console.error("Track error:", err)
    })
  }
}, [])
    
  return (
    <motion.a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">Soporte</span>
    </motion.a>
  )
}

/* ============================================================
   PAGE
   ============================================================ */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <SelfHosted />
      <DemoSection />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}