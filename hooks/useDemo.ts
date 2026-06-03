"use client"

import { useState, useEffect } from "react"

interface DemoUser {
  id: string
  email: string
  nombre: string
  tier: string
  is_demo: boolean
}

function checkDemoSync(): boolean {
  if (typeof window === "undefined") return false
  const token = localStorage.getItem("mb_token")
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return !!payload.is_demo
  } catch {
    return false
  }
}

export function useDemoMode() {
  // ✅ SINCRÓNICO: lee el token en el primer render, no espera useEffect
  const [isDemo, setIsDemo] = useState(() => checkDemoSync())

  useEffect(() => {
    // Por si cambia el token durante la sesión
    const handleStorage = () => setIsDemo(checkDemoSync())
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return { isDemo }
}

export function isDemoToken(): boolean {
  return checkDemoSync()
}