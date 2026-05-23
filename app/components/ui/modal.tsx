"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function PremiumModal({ open, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[var(--bg-card)] dark:bg-[var(--bg-card)] bg-white border border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            {title && (
              <div className="px-6 py-4 border-b border-[var(--border-color)] dark:border-[var(--border-color)] border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900">{title}</h3>
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}