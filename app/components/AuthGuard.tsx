"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading, checked: authChecked } = useAuth()
  const { license, loading: licenseLoading, checked: licenseChecked, isActive } = useLicense()

  // Rutas que NO requieren licencia (solo setup y demo)
  const setupPaths = ["/setup", "/demo"]
  const isSetupPath = setupPaths.includes(pathname)

  // Rutas públicas que requieren licencia activa
  const publicPaths = ["/login", "/setup", "/onboarding", "/demo"]
  const isPublic = publicPaths.includes(pathname)

  useEffect(() => {
    // Esperar a que ambos hooks terminen de cargar
    if (authLoading || licenseLoading || !authChecked || !licenseChecked) return

    // 1. 🔴 SIN LICENCIA: solo /setup y /demo son válidas. Todo lo demás → /setup
    if (!isActive && !isSetupPath) {
      router.push("/setup")
      return
    }

    // 2. 🟢 LICENCIA OK + sin usuario registrado → /login
    //    (el onboarding se accede DESDE el login, no directamente)
    if (isActive && !user && pathname !== "/login" && pathname !== "/onboarding") {
      router.push("/login")
      return
    }

    // 3. Usuario logueado y va a login → dashboard
    if (user && pathname === "/login") {
      router.push("/dashboard")
      return
    }
  }, [authLoading, licenseLoading, authChecked, licenseChecked, isActive, user, pathname, router, isSetupPath])

  // Spinner mientras carga
  if (authLoading || licenseLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 🔴 Sin licencia: solo setup y demo se renderizan
  if (!isActive && !isSetupPath) return null

  // 🟢 Con licencia: rutas públicas se renderizan, privadas también (el guard de auth se encarga en cada página)
  if (isActive && isPublic) return <>{children}</>

  // Ruta privada con licencia activa: renderizar
  return <>{children}</>
}