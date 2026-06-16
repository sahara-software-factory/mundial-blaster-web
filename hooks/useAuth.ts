"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface User {
  id: string
  nombre: string
  email: string
  avatar: string
  role: string
  affiliate_code?: string | null
  company_name?: string
  phone?: string
  timezone?: string
  language?: string
  industry?: string
  expected_volume?: string
  security_question?: string

}

const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch {
    return null
  }
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const getToken = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("mb_token")
  }

    const checkAuth = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        try {
          const hasUserRes = await fetch("/api/auth/check", { cache: "no-store" })
          const hasUserData = await hasUserRes.json()
          const value = hasUserData.hasUser || false
          setHasUser(value)
          localStorage.setItem("mb_has_user_cache", value ? "1" : "0")
        } catch {
          // 🛡️ Si /api/auth/check falla por red, no asumimos "no hay usuario".
          // Usamos el último valor confirmado.
          const cached = localStorage.getItem("mb_has_user_cache")
          setHasUser(cached === "1")
        }
        setUser(null)
        setChecked(true)
        setLoading(false)
        return
      }


      const payload = decodeToken(token)
      if (payload?.is_demo) {
  setUser({
    id: payload.userId || "demo",
    nombre: payload.nombre || "Usuario Demo",
    email: payload.email || "demo@wabisend.com",
    avatar: "",
    role: "business", // ← CAMBIADO A BUSINESS
    affiliate_code: payload.affiliate_code || null,
  })
        setChecked(true)
        setLoading(false)
        return
      }

      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

       if (!res.ok) {
        // 🛡️ Había token → existe un usuario en la DB, sea cual sea el motivo
        // del fallo. hasUser=true asegura que AuthGuard mande a /login, no a /onboarding.
        setHasUser(true)
        localStorage.setItem("mb_has_user_cache", "1")

        // Solo borramos el token si el SERVIDOR confirma que es inválido (401/403).
        // Si es un 5xx/timeout, lo conservamos: puede ser una caída temporal,
        // no queremos deslogear al usuario por eso.
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("mb_token")
        }

        setUser(null)
        setChecked(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      setUser(data.user)
      setHasUser(true)
      localStorage.setItem("mb_has_user_cache", "1")
    } catch {
      // No llegamos a preguntarle al servidor — pero había token, así que
      // sabemos que hay un usuario en la DB. No lo borramos: puede ser un blip de red.
      setHasUser(true)
      localStorage.setItem("mb_has_user_cache", "1")
      setUser(null)
    } finally {
      setChecked(true)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Error en login")

    localStorage.setItem("mb_token", data.token)
    setUser(data.user)
    return data
  }

  const loginDemo = async () => {
    const res = await fetch("/api/demo/auth", { cache: "no-store" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Error en demo")

    localStorage.setItem("mb_token", data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem("mb_token")
    localStorage.removeItem("mb_license_cache") // ← AGREGAR
    setUser(null)
    window.location.href = "/login"
  }

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user,
    loading,
    hasUser,
    checked,
    isAuthenticated: !!user,
    login,
    loginDemo,
    logout,
    refetch: checkAuth,
  }
}