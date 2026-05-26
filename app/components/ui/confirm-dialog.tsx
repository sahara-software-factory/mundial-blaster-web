"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Trash2, LogOut, CheckCircle2, X } from "lucide-react"
import { PremiumModal } from "./modal"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "success"
  icon?: React.ReactNode
}

const variants = {
  danger: {
    icon: <Trash2 size={28} className="text-red-400" />,
    iconBg: "bg-red-500/10 border-red-500/20",
    button: "bg-red-600 hover:bg-red-500 shadow-red-500/25",
  },
  warning: {
    icon: <AlertTriangle size={28} className="text-amber-400" />,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    button: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
  },
  success: {
    icon: <CheckCircle2 size={28} className="text-emerald-400" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
  },
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  icon,
}: ConfirmDialogProps) {
  const style = variants[variant]

  return (
    <PremiumModal open={open} onClose={onClose} title="">
      <div className="text-center space-y-5 py-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`mx-auto h-16 w-16 rounded-2xl ${style.iconBg} border flex items-center justify-center`}
        >
          {icon || style.icon}
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[var(--bg-input)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] rounded-xl text-sm font-medium transition-colors border border-[var(--border-color)]"
          >
            {cancelText}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 py-2.5 text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all shadow-lg ${style.button}`}
          >
            {confirmText}
          </motion.button>
        </div>
      </div>
    </PremiumModal>
  )
}