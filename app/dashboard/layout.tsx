"use client"

import { ThemeProvider } from "../components/ui/theme-provider"
import { ToastProvider } from "../components/ui/toast-provider"
import { UpgradeModalProvider } from "../components/UpgradeModalProvider"
import { Sidebar } from "../components/ui/sidebar"
import { AuthGuard } from "../components/AuthGuard"
import { DemoTour } from "../components/demo-tour"
import { DemoSalesCTA } from "../components/demo-sales-cta"
import { useAuth } from "@/hooks/useAuth"
import { useDemoMode } from "@/hooks/useDemo"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { isDemo } = useDemoMode()

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

          {/* Tour + CTA solo en modo demo */}
          {isDemo && (
            <>
              <DemoTour />
              <DemoSalesCTA />
            </>
          )}
        </AuthGuard>
      </UpgradeModalProvider>
    </ThemeProvider>
  )
}