"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  label?: string
  features?: any
}

const STORAGE_KEY = "mb_license_cache"

function getCachedLicense(): LicenseData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function setCachedLicense(data: LicenseData | null) {
  if (typeof window === "undefined") return
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function useLicense() {
  // Estado inicial: lee del cache local para evitar flash
  const [license, setLicense] = useState<LicenseData | null>(getCachedLicense)
  const [loading, setLoading] = useState(!getCachedLicense()) // solo loading si no hay cache
  const [checked, setChecked] = useState(false)
  const fetchingRef = useRef(false)

  const checkLicense = useCallback(async (force = false) => {
  
    if (fetchingRef.current && !force) return
    fetchingRef.current = true

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mb_token") : null
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch("/api/license/status", {
        cache: "no-store",
        headers,
      })

      const data: LicenseData = await res.json()
      setLicense(data)
      setCachedLicense(data)
    } catch {
      const fallback: LicenseData = { active: false }
      setLicense(fallback)
      setCachedLicense(fallback)
    } finally {
      setLoading(false)
      setChecked(true)
      fetchingRef.current = false
    }
  }, [])

//   const checkLicense = useCallback(async (force = false) => {
//   if (fetchingRef.current && !force) return
//   fetchingRef.current = true

//   // 🔥 BYPASS LOCALHOST: Siempre Pro en desarrollo
//   const isLocalhost = typeof window !== 'undefined' && 
//     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  
//   if (isLocalhost) {
//     const mockLicense: LicenseData = { 
//       active: true, 
//       tier: 'pro', 
//       maxLines: 3, 
//       label: 'Local Dev',
//       features: { unlimited: true }
//     }
//     setLicense(mockLicense)
//     setCachedLicense(mockLicense)
//     setLoading(false)
//     setChecked(true)
//     fetchingRef.current = false
//     return
//   }

//   try {
//     const token = typeof window !== "undefined" ? localStorage.getItem("mb_token") : null
//     const headers: Record<string, string> = {}
//     if (token) headers.Authorization = `Bearer ${token}`

//     const res = await fetch("/api/license/status", {
//       cache: "no-store",
//       headers,
//     })

//     const data: LicenseData = await res.json()
//     setLicense(data)
//     setCachedLicense(data)
//   } catch {
//     const fallback: LicenseData = { active: false }
//     setLicense(fallback)
//     setCachedLicense(fallback)
//   } finally {
//     setLoading(false)
//     setChecked(true)
//     fetchingRef.current = false
//   }
// }, [])

  useEffect(() => {
    checkLicense()
  }, [checkLicense])

  return {
    license,
    loading,
    checked,
    isActive: license?.active === true,
    refetch: () => checkLicense(true),
  }
}