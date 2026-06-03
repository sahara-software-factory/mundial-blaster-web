"use client"

import { ThemeProvider } from "../components/ui/theme-provider"
import { ToastProvider } from "../components/ui/toast-provider"
import { UpgradeModalProvider } from "../components/UpgradeModalProvider"
import { Sidebar } from "../components/ui/sidebar"
import { AuthGuard } from "../components/AuthGuard"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isDemo = user?.email === "demo@wabisend.com" || user?.id === "demo"

  return (
    <ThemeProvider>
      <ToastProvider />
      <UpgradeModalProvider>
        <AuthGuard>
          <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <Sidebar onSettings={() => {}} />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </AuthGuard>
      </UpgradeModalProvider>
    </ThemeProvider>
  )
}