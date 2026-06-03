"use client"

import { motion } from "framer-motion"
import { MessageCircle, ArrowRight, X } from "lucide-react"
import { useState } from "react"

export function DemoSalesCTA() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ delay: 2, type: "spring", damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-[9980]"
    >
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-t border-slate-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  ¿Querés transformar este demo en realidad para tu empresa?
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Habla con ventas ahora y empezá a escalar tus campañas hoy mismo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://wa.me/#?text=Hola,%20vi%20el%20demo%20de%20NEXA%20y%20quiero%20saber%20más%20sobre%20la%20licencia"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                <MessageCircle className="w-4 h-4" />
                Hablar con ventas
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}