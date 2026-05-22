// hooks/useLicense.ts
"use client"

import { useEffect, useState, useCallback } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  label?: string
  email?: string
  features?: {
    spintax?: boolean
    scheduling?: boolean
    templates?: boolean
    whitelabel?: boolean
    api?: boolean
  }
  reason?: string      // ← viene del proxy debug
  debug?: any          // ← viene del proxy debug
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkLicense = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/license/status", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      
      const data: LicenseData = await res.json()
      console.log("[useLicense] Response:", data)
      
      setLicense(data)
    } catch (e: any) {
      console.error("[useLicense] Fetch error:", e.message)
      setError(e.message)
      setLicense({ active: false })
    } finally {
      setLoading(false)
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    checkLicense()
  }, [checkLicense])

  return { 
    license, 
    loading, 
    checked,
    isActive: license?.active === true,
    error,
    refetch: checkLicense,  // ← para el botón 🔄 del header
  }
}