export async function apiFetch(path: string, options?: RequestInit) {
  // SIEMPRE usar proxy local. Nunca apuntar directo al backend desde el navegador.
  const url = path.startsWith('/') ? path : `/${path}`
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('mb_token') : ''
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  }
  
  const res = await fetch(url, { ...options, headers })
  
  // Debug: si devuelve HTML, loguear
  if (!res.ok) {
    const clone = res.clone()
    const text = await clone.text().catch(() => '')
    if (text.startsWith('<')) {
      console.error(`❌ ${url} devolvió HTML:`, text.slice(0, 200))
    }
  }
  
  return res
}