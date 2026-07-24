// app/api/lineas/[id]/health/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://mundialblasterserver-production.up.railway.app'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = req.headers.get('authorization') || ''
    const res = await fetch(`${BACKEND_URL}/api/lineas/${params.id}/health`, {
      headers: { Authorization: auth },
      cache: 'no-store'
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: 'health unavailable' }, { status: 500 })
  }
}