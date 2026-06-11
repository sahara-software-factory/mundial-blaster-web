// app/dashboard/layout.tsx
"use client"


import { useDemoMode } from "@/hooks/useDemo"
import { DemoTour } from "../components/demo-tour"
import { DemoSalesCTA } from "../components/demo-sales-cta"
import { Sidebar } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isDemo } = useDemoMode()

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <Sidebar/>
            <main className="flex-1 overflow-auto">
        {children}
      </main>

      {isDemo && (
        <>
          <DemoTour />
          <DemoSalesCTA />
        </>
      )}
    </div>
  )
}