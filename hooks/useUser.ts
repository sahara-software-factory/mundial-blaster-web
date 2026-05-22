"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  nombre: string
  email: string
  avatar?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.json())
      .then(data => {
        setUser(data.user)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, hasUser: !!user }
}