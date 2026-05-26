export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log("📤 PROXY LOGIN → body recibido:", JSON.stringify(body))
    console.log("📤 BACKEND_URL:", BACKEND_URL)

    if (!BACKEND_URL) {
      return NextResponse.json({ error: "BACKEND_URL vacío" }, { status: 500 })
    }

    const targetUrl = `${BACKEND_URL}/api/auth/login`
    
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-secret": SECRET 
      },
      body: JSON.stringify(body),
    })

    console.log("📡 Backend status:", res.status)
    
    const responseText = await res.text()
    console.log("📡 Backend raw response:", responseText.slice(0, 500))

    // Intentar parsear como JSON
    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data, { status: res.status })
    } catch {
      return NextResponse.json({ error: "Backend devolvió HTML", raw: responseText.slice(0, 200) }, { status: res.status })
    }
    
  } catch (e: any) {
    console.error("❌ Proxy crash:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}