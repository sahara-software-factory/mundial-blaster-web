export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("http://") || BACKEND_URL.startsWith("https://")) return BACKEND_URL
  return `https://${BACKEND_URL}`
}

// app/api/license/status/route.ts
export async function GET(req: NextRequest) {
  try {
    const url = `${getBackendUrl()}/api/license/status`
    console.log("[Proxy] Fetching:", url)
    
    const res = await fetch(url, {
      headers: { "x-api-secret": SECRET },
      signal: AbortSignal.timeout(8000)
    })
    
    console.log("[Proxy] Backend status:", res.status)
    
    if (!res.ok) {
      const text = await res.text().catch(() => "No body")
      console.error("[Proxy] Backend error body:", text)
      return NextResponse.json({ active: false, backendStatus: res.status, backendError: text }, { status: 200 })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
    
  } catch (e: any) {
    console.error("[Proxy] Exception:", e.message)
    return NextResponse.json({ active: false, proxyError: e.message }, { status: 200 })
  }
}