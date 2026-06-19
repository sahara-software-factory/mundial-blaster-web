"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X, HelpCircle, ChevronRight, ChevronLeft } from "lucide-react"

/* ---------- Tipos ---------- */
interface TourStep {
  target: string
  title: string
  content: string
  placement: "right" | "left" | "top" | "bottom"
}

/* ---------- Datos ---------- */
const tourSteps: TourStep[] = [
  {
    target: '[data-tour="nav-campaigns"]',
    title: "Campañas",
    content: "Tu centro de comando. Planificá, ejecutá y monitoreá todos tus envíos masivos por WhatsApp.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-contacts"]',
    title: "Contactos",
    content: "Gestioná miles de contactos, importalos por CSV y asignales etiquetas para campañas dirigidas.",
    placement: "right",
  },
   {
    target: '[data-tour="nav-reports"]',
    title: "Reportes",
    content: "Reportes avanzados con gráficos de entrega, apertura y conversión. Exportá todo a CSV.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-templates"]',
    title: "Templates",
    content: "Guardá mensajes que usás frecuentemente. Cargalos con un click al crear campañas.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-tags"]',
    title: "Tags",
    content: "Organizá tus contactos con etiquetas de colores. Filtrá por tags al crear una campaña.",
    placement: "right",
  },
  
 
  {
    target: '[data-tour="nav-ai"]',
    title: "Ia",
    content: "Utiliza chat GPT para poder generar textos aleatorios usando spintax en cuestión de segundos, también vas a poder guardar las plantillas generadas para usarlas las veces que quieras en las campañas.",
    placement: "right",
  },
  {
    target: '[data-tour="nav-affiliates"]',
    title: "Afiliados",
    content: "¡Ganá dinero con WabiSend! Recomendá nuestro motor de envíos y ganá hasta 250usd por venta. Generá tu código de afiliado y compartilo, tu ganancia o tus ventas serán puestas en las tablas de esta sección.",
    placement: "right",
  },
]

const STORAGE_KEY = "nexa_demo_tour_custom"

/* ---------- Helpers de almacenamiento ---------- */
function getSavedState() {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
  } catch { return null }
}

function saveState(state: { run: boolean; step: number; done: boolean }) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/* ---------- Componente ---------- */
export function DemoTour() {
  const [showIntro, setShowIntro] = useState(true)
  const [run, setRun] = useState(false)
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Ref para el intervalo de actualización (lo eliminamos usando eventos)
  const rafRef = useRef<number | null>(null)

  // Inicialización
  useEffect(() => {
    setMounted(true)
    const saved = getSavedState()
    if (saved) {
      if (saved.done) {
        setShowIntro(false)
        setRun(false)
      } else if (saved.run) {
        setShowIntro(false)
        setRun(true)
        setStep(saved.step || 0)
      } else {
        setShowIntro(true)
      }
    }
  }, [])

  // Calcular posición del target activo (sin intervalos, solo eventos)
  const updateRect = useCallback(() => {
    if (!run) {
      setTargetRect(null)
      return
    }
    const currentStep = tourSteps[step]
    if (!currentStep) return
    const el = document.querySelector(currentStep.target)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
    } else {
      setTargetRect(null) // por si el elemento no existe aún
    }
  }, [run, step])

  useEffect(() => {
    updateRect()
    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)
    // Por si hay cambios de layout retardados
    const observer = new ResizeObserver(updateRect)
    observer.observe(document.body)
    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
      observer.disconnect()
    }
  }, [updateRect])

  // Navegación
  const startTour = useCallback(() => {
    setShowIntro(false)
    setStep(0)
    setRun(true)
    saveState({ run: true, step: 0, done: false })
  }, [])

  const skipTour = useCallback(() => {
    setShowIntro(false)
    setRun(false)
    saveState({ run: false, step: 0, done: true })
  }, [])

  const nextStep = useCallback(() => {
    if (step >= tourSteps.length - 1) {
      setRun(false)
      saveState({ run: false, step: 0, done: true })
    } else {
      const next = step + 1
      setStep(next)
      saveState({ run: true, step: next, done: false })
    }
  }, [step])

  const prevStep = useCallback(() => {
    if (step > 0) {
      const prev = step - 1
      setStep(prev)
      saveState({ run: true, step: prev, done: false })
    }
  }, [step])

  const restartTour = useCallback(() => {
    setStep(0)
    setShowIntro(false)
    setRun(true)
    saveState({ run: true, step: 0, done: false })
  }, [])

  if (!mounted) return null

  const currentStep = tourSteps[step]
  const isLast = step === tourSteps.length - 1

  return (
    <>
      {/* SPOTLIGHT único que oscurece todo menos el target */}
      <AnimatePresence>
        {run && targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9991] pointer-events-none"
            style={{
              // Creamos un fondo oscuro con un "hueco" transparente sobre el target
              background: `
                linear-gradient(to right, rgba(0,0,0,0.7) ${targetRect.left - 4}px, transparent ${targetRect.left - 4}px),
                linear-gradient(to left, rgba(0,0,0,0.7) calc(100% - ${targetRect.right + 4}px), transparent calc(100% - ${targetRect.right + 4}px)),
                linear-gradient(to bottom, rgba(0,0,0,0.7) ${targetRect.top - 4}px, transparent ${targetRect.top - 4}px),
                linear-gradient(to top, rgba(0,0,0,0.7) calc(100% - ${targetRect.bottom + 4}px), transparent calc(100% - ${targetRect.bottom + 4}px))
              `,
              willChange: "background",
            }}
            // Añadimos un borde sutil alrededor del hueco para destacarlo (opcional)
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* TOOLTIP */}
      <AnimatePresence mode="wait">
        {run && targetRect && currentStep && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[9992] w-80"
            style={{
              left: currentStep.placement === "right"
                ? Math.min(targetRect.right + 16, window.innerWidth - 340)
                : Math.max(targetRect.left - 336, 20),
              top: Math.min(
                Math.max(targetRect.top + targetRect.height / 2 - 80, 16),
                window.innerHeight - 200
              ),
            }}
          >
            <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Paso {step + 1} de {tourSteps.length}
                </span>
                <button
                  onClick={skipTour}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Cerrar tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                {currentStep.content}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 0}
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                    step === 0
                      ? "text-slate-700 cursor-not-allowed"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Atrás
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
                >
                  {isLast ? "Finalizar" : "Siguiente"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP INTRO */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="mx-auto flex items-center justify-center mb-5">
                  <img className="h-16" src="/images/logo_light.png" alt="WabiSend" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Bienvenid@!
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  Te vamos a mostrar en menos de 2 minutos cómo funciona cada sección del sistema.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={startTour}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Comenzar recorrido
                  </button>
                  <button
                    onClick={skipTour}
                    className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-medium text-sm hover:bg-slate-700 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Omitir por ahora
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN DE REINICIO (visible cuando el tour no está activo) */}
      <AnimatePresence>
        {!showIntro && !run && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartTour}
            className="fixed bottom-6 left-6 z-[9993] flex items-center gap-2 px-4 py-3 rounded-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-300 text-xs font-semibold shadow-xl hover:bg-slate-700/90 hover:text-white hover:border-blue-500/30 transition-all group"
            title="Reiniciar recorrido"
            aria-label="Reiniciar tour"
          >
            <HelpCircle className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ver recorrido</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}