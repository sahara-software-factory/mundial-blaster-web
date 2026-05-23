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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = `${getBackendUrl()}/api/auth/login`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": SECRET,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    })

    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Backend devolvió HTML", raw: text.substring(0, 200) }, { status: 500 })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    console.error("[Proxy auth/login]", e.message)
    return NextResponse.json({ error: e.message || "Error en login" }, { status: 500 })
  }
}