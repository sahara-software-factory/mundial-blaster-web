export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://mundialblasterserver-production.up.railway.app'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = req.headers.get('authorization') || ''

    const res = await fetch(`${API_BASE}/api/lineas/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error('Proxy logout error:', e)
    return NextResponse.json({ error: 'Error de proxy' }, { status: 500 })
  }
}