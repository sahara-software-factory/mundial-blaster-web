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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const token = req.headers.get("authorization") || ""
    
    const res = await fetch(`${getBackendUrl()}/api/contacts/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json", 
        "x-api-secret": SECRET, 
        "authorization": token 
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}