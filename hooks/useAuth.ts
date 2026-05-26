"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  nombre: string
  email: string
  avatar: string
  role: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('mb_token')
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

      const res = await fetch("/api/auth/me", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache"
        },
        cache: "no-store",
      })

      if (!res.ok) {
        // Token inválido o expirado
        localStorage.removeItem('mb_token')
        setUser(null)
        setChecked(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      setUser(data.user)
    } catch {
      localStorage.removeItem('mb_token')
      setUser(null)
    } finally {
      setChecked(true)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Error en login")

    localStorage.setItem('mb_token', data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
  localStorage.removeItem('mb_token')
  localStorage.removeItem('mb_license_cache')
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
    logout,
    refetch: checkAuth,
  }
}