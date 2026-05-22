export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("http://") || BACKEND_URL.startsWith("https://")) return BACKEND_URL
  return `https://${BACKEND_URL}`
}

export async function GET(req: NextRequest) {
  try {
    const url = `${getBackendUrl()}/api/license/status`
    
    const res = await fetch(url, {
      headers: { "x-api-secret": SECRET },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ active: false, error: err.error || "Backend error" }, { status: 200 })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
    
  } catch (e: any) {
    console.error("[Proxy license/status]", e.message)
    return NextResponse.json({ active: false, error: e.message }, { status: 200 })
  }
}