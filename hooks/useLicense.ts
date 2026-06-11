"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  label?: string
  features?: any
  reason?: string
}

const STORAGE_KEY = "mb_license_cache"

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const fetchingRef = useRef(false)

  const checkLicense = useCallback(async (force = false) => {
    if (fetchingRef.current && !force) return
    fetchingRef.current = true
    setLoading(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mb_token") : null

      // Demo mode
      if (token) {
        const payload = decodeToken(token)
        if (payload?.is_demo) {
          const demoLicense: LicenseData = {
            active: true,
            tier: "business",
            maxLines: Infinity,
            label: "Business (Demo)",
            features: ["basic_spintax", "30d_history", "basic_delay", "ai", "webhooks", "white_label"],
          }
          setLicense(demoLicense)
          setLoading(false)
          setChecked(true)
          fetchingRef.current = false
          return
        }
      }

      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch("/api/license/status", {
        cache: "no-store",
        headers,
      })

      const data: LicenseData = await res.json()
      setLicense(data)

      // Guardar en cache solo si es válida
      if (data.active) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      const fallback: LicenseData = { active: false, reason: "ERROR" }
      setLicense(fallback)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
      setChecked(true)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    checkLicense()
  }, [checkLicense])

   useEffect(() => {
    const handleUpdate = () => checkLicense(true)
    window.addEventListener('license-updated', handleUpdate)
    return () => window.removeEventListener('license-updated', handleUpdate)
  }, [checkLicense])

  return {
    license,
    loading,
    checked,
    isActive: license?.active === true,
    refetch: () => checkLicense(true),
  }
}