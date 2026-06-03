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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.headers.get("authorization") || ""

    const res = await fetch(`${getBackendUrl()}/api/campaigns/${id}/export`, {
      method: "GET",
      headers: {
        "x-api-secret": SECRET,
        "authorization": token
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Error exportando' }))
      return NextResponse.json(data, { status: res.status })
    }

    // Pasar el CSV tal cual (no es JSON, es texto plano para descarga)
    const blob = await res.arrayBuffer()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": res.headers.get("content-disposition") || `attachment; filename="campana_${id}_validos.csv"`,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}