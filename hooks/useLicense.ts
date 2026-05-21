"use client"

import { useEffect, useState } from "react"

interface LicenseData {
  active: boolean
  tier?: string
  maxLines?: number
  spintax?: boolean
  scheduling?: boolean
  templates?: boolean
  whitelabel?: boolean
  api?: boolean
  invalid?: boolean
}

export function useLicense() {
  const [license, setLicense] = useState<<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/license/status")
      .then(r => r.json())
      .then((data: LicenseData) => {
        setLicense(data)
        setLoading(false)
      })
      .catch(() => {
        setLicense({ active: false })
        setLoading(false)
      })
  }, [])

  return { license, loading, isActive: license?.active === true }
}