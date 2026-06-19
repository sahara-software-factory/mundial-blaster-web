export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || 'https://mundialblasterserver-production.up.railway.app'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const token = req.headers.get('authorization') || ''

    const res = await fetch(`${API_BASE}/api/lineas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error('Proxy delete line error:', e)
    return NextResponse.json({ error: 'Error de proxy' }, { status: 500 })
  }
}