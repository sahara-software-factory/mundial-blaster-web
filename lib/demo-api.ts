import { NextRequest, NextResponse } from "next/server"

export function isDemoRequest(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || ""
  const token = auth.replace("Bearer ", "")
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return !!payload.is_demo
  } catch {
    return false
  }
}

export function demoResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}