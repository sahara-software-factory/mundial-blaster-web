// app/GlobalProviders.tsx
"use client"

import { AuthGuard } from "./components/AuthGuard"
import { ThemeProvider } from "./components/ui/theme-provider"
import { ToastProvider } from "./components/ui/toast-provider"
import { UpgradeModalProvider } from "./components/UpgradeModalProvider"



export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider />
      <UpgradeModalProvider>
        <AuthGuard>{children}</AuthGuard>
      </UpgradeModalProvider>
    </ThemeProvider>
  )
}