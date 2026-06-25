// app/demo/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DemoEntryPage() {
  const router = useRouter()

  useEffect(() => {
    const initDemo = async () => {
      try {
        const res = await fetch("/api/demo/auth", { cache: "no-store" })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error || "Error generando demo")

        localStorage.setItem("mb_token", data.token)
        toast.success("Demo activada")
        
        // Redirigir al dashboard
       window.location.href = "/dashboard/"
      } catch (e: any) {
        toast.error(e.message)
        router.replace("/login") // o a una página de error
      }
    }

    initDemo()
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--text-muted)]">Activando modo demo...</p>
      </div>
    </div>
  )
}