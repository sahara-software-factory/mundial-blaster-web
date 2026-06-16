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

      if (!res.ok) {
        // 5xx/502 temporal: no confiamos en el body para decidir "inactiva".
        throw new Error(`license status ${res.status}`)
      }

      const data: LicenseData = await res.json()
      setLicense(data)

      // Guardar en cache con timestamp, para poder expirarla
      if (data.active) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, cachedAt: Date.now() }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // 🛡️ Error de red/backend: usamos la última licencia válida cacheada
      // (con un margen de 24h) en vez de mandar al usuario a /setup.
      const CACHE_TTL_MS = 24 * 60 * 60 * 1000
      const cachedRaw = localStorage.getItem(STORAGE_KEY)
      let fallback: LicenseData = { active: false, reason: "ERROR" }

      if (cachedRaw) {
        try {
          const { data: cached, cachedAt } = JSON.parse(cachedRaw)
          fallback = (Date.now() - cachedAt < CACHE_TTL_MS)
            ? { ...cached, reason: "CACHED_FALLBACK" }
            : { active: false, reason: "CACHE_EXPIRED" }
        } catch {}
      }

      setLicense(fallback)
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