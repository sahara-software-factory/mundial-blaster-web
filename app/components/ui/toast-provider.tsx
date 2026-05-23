"use client"
import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#0B1120',
          border: '1px solid #1E293B',
          color: '#F8FAFC',
          fontSize: '14px',
        },
      }}
    />
  )
}