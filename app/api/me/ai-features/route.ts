import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization') || ''
    const res = await fetch(`${API_BASE}/api/me/ai-features`, {
      headers: { Authorization: token },
      cache: 'no-store'
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Backend error', detail: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy error', detail: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization') || ''
    const body = await req.json()
    
    const res = await fetch(`${API_BASE}/api/me/ai-features`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token 
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Backend error', detail: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy error', detail: e.message }, { status: 500 })
  }
}