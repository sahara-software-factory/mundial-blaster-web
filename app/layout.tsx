import type { Metadata } from "next"
import { Inter } from "next/font/google"
// @ts-ignore
import "./globals.css"
import { GlobalProviders } from "./GlobalProviders"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "WabiSend — Envío masivo por WhatsApp sin suscripciones",
  description:
    "Plataforma de envío masivo por WhatsApp con licencia ilimitada de por vida. Control total de tus datos. Sin mensualidades.",
  keywords: [
    "whatsapp marketing",
    "envio masivo whatsapp",
    "campanas whatsapp",
    "licencia whatsapp",
    "wabisend",
  ],
  openGraph: {
    title: "WabiSend — Envío masivo por WhatsApp sin suscripciones",
    description: "Pagá una vez. Usá para siempre. Control total de tus datos.",
    type: "website",
  },
  icons: {
    icon: "/images/isotipo.png",   // o "/icon.png" si lo ponés en public/
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",  // opcional
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  )
}