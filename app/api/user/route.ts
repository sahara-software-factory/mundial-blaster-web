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
    const res = await fetch(`${getBackendUrl()}/api/user`, {
      headers: { "x-api-secret": SECRET }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ user: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${getBackendUrl()}/api/user`, {
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}