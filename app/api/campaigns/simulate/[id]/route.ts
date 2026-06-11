import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const token = req.headers.get('authorization') || ''
    const res = await fetch(`${API_BASE}/api/campaigns/simulate/${params.id}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error proxy logs simulacro' }, { status: 500 })
  }
}