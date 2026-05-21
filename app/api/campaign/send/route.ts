export const dynamic = 'force-dynamic'  // ← AGREGAR ESTO AL INICIO
s
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("http://") || BACKEND_URL.startsWith("https://")) return BACKEND_URL
  return `https://${BACKEND_URL}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = `${getBackendUrl()}/api/campaign/send`

    console.log("[Proxy Campaign] Enviando a:", url)
    console.log("[Proxy Campaign] Payload:", JSON.stringify(body, null, 2))

    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-api-secret": SECRET 
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({ error: "Respuesta inválida del backend" }))
    
    if (!res.ok) {
      console.error("[Proxy Campaign] Backend error:", res.status, data)
      return NextResponse.json({ error: data.error || "Error del backend", details: data }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error("[Proxy Campaign] Error:", e.message)
    return NextResponse.json({ error: e.message || "Error en campaña" }, { status: 500 })
  }
}