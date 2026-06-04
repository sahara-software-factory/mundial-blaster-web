"use client"

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

  const getToken = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("mb_token")
  }

  const checkAuth = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
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
        localStorage.removeItem("mb_token")
        setUser(null)
        setChecked(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      setUser(data.user)
    } catch {
      localStorage.removeItem("mb_token")
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
    localStorage.removeItem("mb_license_cache")
    setUser(null)
    router.push("/login")
  }

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user,
    loading,
    checked,
    isAuthenticated: !!user,
    login,
    loginDemo,
    logout,
    refetch: checkAuth,
  }
}