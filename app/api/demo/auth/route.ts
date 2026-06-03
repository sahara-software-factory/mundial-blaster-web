// app/api/demo/auth/route.ts
import { NextResponse } from "next/server"
import { SignJWT } from "jose"

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "mundial-blaster-demo-secret-key-2026"
)

export async function GET() {
  const demoUser = {
    id: "demo-user-001",
    email: "demo@mundialblaster.com",
    nombre: "Usuario Demo",
    is_demo: true,
    tier: "starter",
    plan: "starter",
  }

  const token = await new SignJWT({
    userId: demoUser.id,
    email: demoUser.email,
    nombre: demoUser.nombre,
    is_demo: true,
    tier: "starter",
    plan: "starter",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET_KEY)

  return NextResponse.json({ token, user: demoUser })
}