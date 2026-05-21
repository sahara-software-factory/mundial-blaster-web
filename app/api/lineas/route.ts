import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

// 🔥 FIX: Aseguramos que la URL tenga protocolo
function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("http://") || BACKEND_URL.startsWith("https://")) return BACKEND_URL
  return `https://${BACKEND_URL}`
}

export async function GET(req: NextRequest) {
  try {
    const url = `${getBackendUrl()}/api/lineas`
    const res = await fetch(url, {
      headers: { "x-api-secret": SECRET }
    })
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.error || "Backend error" }, { status: res.status })
    }
    
    const data = await res.json()
    // Backend Express retorna { lines: [...] }
    const lines = data.lines || []
    return NextResponse.json({ lines })
  } catch (e: any) {
    console.error("[Proxy GET lineas]", e.message)
    return NextResponse.json({ error: e.message || "Error cargando líneas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = `${getBackendUrl()}/api/lineas`
    
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-api-secret": SECRET 
      },
      body: JSON.stringify(body),
    })
    
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    console.error("[Proxy POST lineas]", e.message)
    return NextResponse.json({ error: e.message || "Error creando línea" }, { status: 500 })
  }
}