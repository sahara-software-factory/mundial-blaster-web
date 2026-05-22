export const dynamic = 'force-dynamic'
export const revalidate = 0 

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "").replace(/\/$/, "")
const SECRET = process.env.WHATSAPP_SECRET || ""

function getBackendUrl(): string {
  if (!BACKEND_URL) throw new Error("NEXT_PUBLIC_WHATSAPP_SERVER_URL no está definida")
  if (BACKEND_URL.startsWith("https://")) return BACKEND_URL
  if (BACKEND_URL.startsWith("http://")) return BACKEND_URL.replace("http://", "https://")
  return `https://${BACKEND_URL}`
}

export async function GET(req: NextRequest) {
  const debug: any = {
    timestamp: new Date().toISOString(),
    envUrl: BACKEND_URL || "NO_DEFINIDA",
    envSecret: SECRET ? "DEFINIDO" : "NO_DEFINIDO",
    backendUrl: null,
    fetchStatus: null,
    fetchOk: null,
    backendResponse: null,
    error: null,
  }

  try {
    const url = `${getBackendUrl()}/api/license/status`
    debug.backendUrl = url

    const res = await fetch(url, {
      method: "GET",
      headers: { "x-api-secret": SECRET },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
      cache: "no-store", 
    })

    debug.fetchStatus = res.status
    debug.fetchOk = res.ok

    const text = await res.text()
    debug.backendResponse = text

    if (!res.ok) {
      return NextResponse.json({
        active: false,
        reason: "BACKEND_ERROR",
        debug,
      }, { status: 200 })
    }

    // Parsear respuesta del backend
    let data
    try {
      data = JSON.parse(text)
    } catch (parseErr: any) {
      return NextResponse.json({
        active: false,
        reason: "JSON_PARSE_ERROR",
        rawResponse: text,
        debug,
      }, { status: 200 })
    }

    // Si el backend dice active: true, devolvemos EXACTAMENTE eso
    if (data.active === true) {
      return NextResponse.json({
        active: true,
        tier: data.tier,
        maxLines: data.maxLines,
        label: data.label,
        email: data.email,
        features: {
          spintax: data.spintax,
          scheduling: data.scheduling,
          templates: data.templates,
          whitelabel: data.whitelabel,
          api: data.api,
        },
        debug: { ...debug, forwarded: true },
      })
    }

    // Backend dice active: false
    return NextResponse.json({
      active: false,
      reason: "BACKEND_SAYS_INACTIVE",
      backendData: data,
      debug,
    }, { status: 200 })

  } catch (e: any) {
    debug.error = e.message
    return NextResponse.json({
      active: false,
      reason: "PROXY_EXCEPTION",
      debug,
    }, { status: 200 })
  }
}