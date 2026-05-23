import { AuthGuard } from './components/AuthGuard'
import './globals.css'

export const metadata = {
  title: 'Mundial Blaster',
  description: 'Envío masivo WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">{children}

         <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}