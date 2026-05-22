// app/api/setup/activate/route.ts
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
  const debug: any = {
    timestamp: new Date().toISOString(),
    envUrl: BACKEND_URL || "NO_DEFINIDA",
  }

  try {
    const body = await req.json()
    const url = `${getBackendUrl()}/api/setup/activate`
    debug.backendUrl = url

    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "x-api-secret": SECRET 
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    })

    debug.fetchStatus = res.status

    const text = await res.text()
    debug.backendResponse = text.substring(0, 500)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json({
        success: false,
        error: "Backend devolvió JSON inválido",
        debug,
      }, { status: 500 })
    }

    return NextResponse.json(data, { status: res.status })

  } catch (e: any) {
    debug.error = e.message
    return NextResponse.json({
      success: false,
      error: e.message,
      debug,
    }, { status: 500 })
  }
}