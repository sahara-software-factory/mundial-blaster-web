// hooks/useLicense.ts
"use client"

import { useEffect, useState, useCallback } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  label?: string
  features?: any
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  const checkLicense = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : null
      
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`
      
      const res = await fetch("/api/license/status", {
        cache: "no-store",
        headers,
      })
      
      const data = await res.json()
      setLicense(data)
    } catch {
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
    refetch: checkLicense,
  }
}