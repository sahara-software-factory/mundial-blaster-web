"use client"
import { useState } from "react"

export function useFeatureLock(tier: string | undefined) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isPro = tier === 'pro' || tier === 'business'
  
  const check = (requiredTier: 'pro' | 'business') => {
    if (requiredTier === 'pro' && !isPro) {
      setShowUpgrade(true)
      return false
    }
    return true
  }

  return { isPro, showUpgrade, setShowUpgrade, check }
}