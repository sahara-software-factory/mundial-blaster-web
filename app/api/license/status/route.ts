export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  // Forzar https siempre
  if (BACKEND_URL.startsWith("https://")) return BACKEND_URL
  if (BACKEND_URL.startsWith("http://")) return BACKEND_URL.replace("http://", "https://")
  return `https://${BACKEND_URL}`
}

export async function GET(req: NextRequest) {
  console.log("[LicenseProxy] START — BACKEND_URL env:", BACKEND_URL || "VACÍO")
  
  try {
    const url = `${getBackendUrl()}/api/license/status`
    console.log("[LicenseProxy] Fetching:", url)
    
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-api-secret": SECRET },
      signal: AbortSignal.timeout(8000),
      redirect: "follow"
    })
    
    console.log("[LicenseProxy] Backend status:", res.status)
    
    if (!res.ok) {
      const text = await res.text().catch(() => "No body")
      console.error("[LicenseProxy] Backend error:", res.status, text)
      return NextResponse.json({ 
        active: false, 
        backendStatus: res.status,
        backendBody: text 
      }, { status: 200 })
    }
    
    const data = await res.json()
    console.log("[LicenseProxy] Backend data:", JSON.stringify(data))
    return NextResponse.json(data)
    
  } catch (e: any) {
    console.error("[LicenseProxy] EXCEPTION:", e.message)
    return NextResponse.json({ 
      active: false, 
      proxyError: e.message,
      envUrl: BACKEND_URL || "NO_DEFINIDA"
    }, { status: 200 })
  }
}