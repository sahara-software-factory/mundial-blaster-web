"use client"
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback, useRef } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  label?: string
  features?: any
}

const STORAGE_KEY = "mb_license_cache"

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

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
  const [license, setLicense] = useState<LicenseData | null>(getCachedLicense)
  const [loading, setLoading] = useState(!getCachedLicense())
  const [checked, setChecked] = useState(false)
  const fetchingRef = useRef(false)

  const checkLicense = useCallback(async (force = false) => {
    if (fetchingRef.current && !force) return
    fetchingRef.current = true

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mb_token") : null

      if (token) {
        const payload = decodeToken(token)
        if (payload?.is_demo) {
          const demoLicense: LicenseData = {
  active: true,
  tier: "business", // ← CAMBIADO A BUSINESS
  maxLines: Infinity,
  label: "Business (Demo)",
  features: ["basic_spintax", "30d_history", "basic_delay", "ai", "webhooks", "white_label"],
}
          setLicense(demoLicense)
          setCachedLicense(demoLicense)
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