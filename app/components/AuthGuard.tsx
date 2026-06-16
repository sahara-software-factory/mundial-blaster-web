"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLicense } from "@/hooks/useLicense"

// Rutas públicas: NUNCA redirigidas, NUNCA bloqueadas
const PUBLIC_ROUTES = ["/", "/landing", "/demo", "/login"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, hasUser, loading: authLoading } = useAuth()
  const { loading: licenseLoading, isActive } = useLicense()

  const [redirected, setRedirected] = useState(false)

  const isLoading = authLoading || licenseLoading
  const isPublic = PUBLIC_ROUTES.includes(pathname)
  const isSetup = pathname === "/setup"
  const isOnboarding = pathname === "/onboarding"
  const isLogin = pathname === "/login"

  useEffect(() => {
    if (isLoading) return
    if (isPublic) return        // ← LANDING, DEMO, LOGIN: libres
    if (redirected) return

    let target: string | null = null

    // 1. SIN LICENCIA → solo setup
    if (!isActive) {
      if (!isSetup) target = "/setup"
    }
    // 2. LICENCIA OK + HAY USUARIO EN DB
    else if (hasUser) {
      if (user) {
        // Logueado: no puede estar en login/setup/onboarding
        if (isLogin || isSetup || isOnboarding) {
          target = "/dashboard"
        }
      } else {
        // No logueado pero existe usuario → solo login
        if (!isLogin) target = "/login"
      }
    }
    // 3. LICENCIA OK + SIN USUARIO EN DB → onboarding
    else {
      if (!isOnboarding) target = "/onboarding"
    }

    if (target) {
      setRedirected(true)
      router.replace(target)
    }
  }, [isLoading, isActive, user, hasUser, pathname, router, isPublic, isSetup, isOnboarding, isLogin, redirected])

  // Spinner global
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
        <div className="h-10 w-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  // RUTAS PÚBLICAS: siempre renderizan, sin importar auth/licencia/demo
  if (isPublic) {
    return <>{children}</>
  }

  // BLOQUEOS SÍNCRONOS para rutas protegidas
  if (!isActive && !isSetup) return null
  if (user && (isLogin || isSetup || isOnboarding)) return null
  if (!user && hasUser && !isLogin) return null
  if (!hasUser && isActive && !isOnboarding) return null

  return <>{children}</>
}