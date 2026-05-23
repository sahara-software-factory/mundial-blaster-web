// app/layout.tsx
import { Inter } from "next/font/google"
// @ts-ignore
import "./globals.css"
import { ThemeProvider } from "./components/ui/theme-provider"
import { ToastProvider } from "./components/ui/toast-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mundial Blaster",
  description: "Sistema de envío masivo WhatsApp",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] bg-gray-50 text-[var(--text-primary)] dark:text-[var(--text-primary)] text-gray-900`}>
        <ThemeProvider>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}