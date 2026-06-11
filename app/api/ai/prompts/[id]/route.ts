import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization') || ''
    const res = await fetch(`${API_BASE}/api/ai/prompts/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error proxy delete prompt' }, { status: 500 })
  }
}