import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ""
const SECRET = process.env.WHATSAPP_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${BACKEND_URL}/api/lineas/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": SECRET },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Error conectando" }, { status: 500 })
  }
}