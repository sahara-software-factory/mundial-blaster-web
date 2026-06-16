"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, hasUser, loading: authLoading } = useAuth()
  const { loading: licenseLoading, isActive } = useLicense()

  const [redirected, setRedirected] = useState(false)

    const isLoading = authLoading || licenseLoading
  const isSetup = pathname === "/setup"
  const isOnboarding = pathname === "/onboarding"
  const isLogin = pathname === "/login"
  const isLanding = pathname === "/" || pathname === "/landing"  // ← rutas públicas de marketing
  const isDemo = pathname === "/demo"  // ← si tenés demo pública
  const isPublic = isLanding || isDemo || isLogin  // ← el guard NO toca estas rutas

   useEffect(() => {
    if (isLoading) return
    let target: string | null = null
    if (isPublic) {
      return
    }
    // 1. SIN LICENCIA → solo setup
    if (!isActive) {
      if (!isSetup) {
        target = "/setup"
      }
    }
    // 2. LICENCIA OK + HAY USUARIO EN DB (logueado o no)
    else if (hasUser) {
      // Si está logueado → nunca login/setup/onboarding
      if (user) {
        if (isLogin || isSetup || isOnboarding) {
          target = "/dashboard"
        }
      }
      // Si NO está logueado pero hay usuario → solo login
      else {
        if (!isLogin) {
          target = "/login"
        }
      }
    }
    else {
      if (!isOnboarding) {
        // 🛡️ HARDENING: si venías de una ruta protegida de la app (dashboard, etc.)
        // y de golpe hasUser=false, es una caída de sesión, NO una DB vacía.
        // Si la DB estuviera realmente vacía, nunca hubieras estado en esa ruta.
        const isAppRoute = !isSetup && !isOnboarding && !isLogin
        target = isAppRoute ? "/login" : "/onboarding"
      }
    }

    if (target) {
      router.replace(target)
    }
  }, [isLoading, isActive, user, hasUser, pathname, router, isSetup, isOnboarding, isLogin])

  // Spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
        <div className="h-10 w-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Bloqueos síncronos
  if (isLoading) {
    return
  }
  if (isPublic) return <>{children}</>  // ← landing/demo/login siempre renderizan
  if (!isActive && !isSetup) return null
  if (user && (isLogin || isSetup || isOnboarding)) return null
  if (!user && hasUser && !isLogin) return null
  if (!hasUser && isActive && !isOnboarding) return null

  return <>{children}</>
}