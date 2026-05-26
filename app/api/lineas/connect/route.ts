export const dynamic = 'force-dynamic'

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
    const token = req.headers.get("authorization") || ""

    const res = await fetch(`${getBackendUrl()}/api/lineas/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": SECRET,
        "authorization": token,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    console.error("[Proxy /api/lineas/connect]", e.message)
    return NextResponse.json(
      { error: e.message || "Error conectando línea" },
      { status: 500 }
    )
  }
}