// hooks/useAuth.ts
"use client"

import { useEffect, useState, useCallback } from "react"

interface User {
  id: string
  nombre: string
  email: string
  avatar: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('mb_token')
  }

  const checkAuth = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      setChecked(true)
      return
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      
      if (!res.ok) throw new Error("Unauthorized")
      
      const data = await res.json()
      setUser(data.user)
    } catch {
      // Token inválido o expirado
      localStorage.removeItem('mb_token')
      setUser(null)
    } finally {
      setLoading(false)
      setChecked(true)
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
    setUser(null)
    window.location.href = "/login"
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
    token: getToken(),
  }
}