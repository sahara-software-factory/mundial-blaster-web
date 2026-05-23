export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("https://")) return BACKEND_URL
  if (BACKEND_URL.startsWith("http://")) return BACKEND_URL.replace("http://", "https://")
  return `https://${BACKEND_URL}`
}

export async function GET(req: NextRequest) {
  try {
    const url = `${getBackendUrl()}/api/auth/check`
    const res = await fetch(url, {
      headers: { "x-api-secret": SECRET },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("[Proxy auth/check]", e.message)
    return NextResponse.json({ hasUser: false, error: e.message }, { status: 200 })
  }
}