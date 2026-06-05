// components/AuthGuard.tsx
"use client"

import { useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, checked: authChecked } = useAuth()
  const { license, loading: licenseLoading, checked: licenseChecked, isActive } = useLicense()

  // 🔥 BYPASS AGRESIVO: ?preview=1 en la URL saltea TODO
  const isPreview = searchParams?.get("preview") === "1"
  if (isPreview && pathname === "/onboarding") {
    return <>{children}</>
  }

  const publicPaths = ["/login", "/setup", "/onboarding", "/demo"]
  const isPublic = publicPaths.includes(pathname)

  useEffect(() => {
    if (authLoading || licenseLoading || !authChecked || !licenseChecked) return

    // 1. Sin licencia activa → setup
    if (!isActive && pathname !== "/setup") {
      router.push("/setup")
      return
    }

    // 2. Licencia OK pero sin usuario registrado → onboarding
    if (isActive && user === null && !isPublic && pathname !== "/login") {
    router.push("/login")
    return
  }

    // 3. Usuario existe pero no logueado → login
    if (isActive && user && !authChecked) {
      // Esto no debería pasar, pero por si acaso
    }

    // 4. Ya logueado y va a login → dashboard
    if (user && pathname === "/login") {
      router.push("/dashboard")
    }
  }, [authLoading, licenseLoading, authChecked, licenseChecked, isActive, user, pathname, router])

  if (authLoading || licenseLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Permitir acceso a públicas siempre
  if (isPublic) return <>{children}</>

  // Si no hay licencia, solo setup
  if (!isActive && pathname !== "/setup") return null

  // Si hay licencia pero no hay usuario, solo onboarding o login
  if (isActive && !user && pathname !== "/onboarding" && pathname !== "/login") return null

  return <>{children}</>
}