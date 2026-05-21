import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ""
const SECRET = process.env.WHATSAPP_SECRET || ""

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lineas`, {
      headers: { "x-api-secret": SECRET }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Error cargando líneas" }, { status: 500 })
  }
}