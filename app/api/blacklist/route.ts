import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no definida")
  return BACKEND_URL.startsWith("https://") ? BACKEND_URL : `https://${BACKEND_URL.replace(/^http:\/\//, "")}`
}

async function proxy(req: NextRequest, method: string, path: string, body?: any) {
  const url = `${getBackendUrl()}${path}`
  const headers: Record<string, string> = { "x-api-secret": SECRET }
  
  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth

  const res = await fetch(url, {
    method,
    headers: body ? { ...headers, "Content-Type": "application/json" } : headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const text = await res.text()
  try {
    const data = JSON.parse(text)
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: text }, { status: res.status })
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET", "/api/blacklist")
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return proxy(req, "POST", "/api/blacklist", body)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")
  if (!phone) return NextResponse.json({ error: "Teléfono requerido" }, { status: 400 })
  return proxy(req, "DELETE", `/api/blacklist/${encodeURIComponent(phone)}`)
}