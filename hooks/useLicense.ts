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
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch("/api/licence/status")
      .then(r => r.json())
      .then((data: LicenseData) => {
        setLicense(data)
      })
      .catch(() => {
        setLicense({ active: false })
      })
      .finally(() => {
        setLoading(false)
        setChecked(true)
      })
  }, [])

  return { 
    license, 
    loading, 
    checked,
    isActive: license?.active === true 
  }
}