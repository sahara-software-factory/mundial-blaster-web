import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization") || ""
    const body = await req.json().catch(() => ({}))

    const res = await fetch(`${BACKEND_URL}/api/affiliate/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({ error: "Error del servidor" }))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Error de conexión con el servidor" }, { status: 500 })
  }
}