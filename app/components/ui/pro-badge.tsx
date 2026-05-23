"use client"
import { motion } from "framer-motion"

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <motion.span
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-[var(--text-primary)] shadow-lg shadow-amber-500/25 ${className}`}
    >
      ✦ Pro
    </motion.span>
  )
}