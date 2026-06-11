// app/page.tsx
"use client"

export default function HomePage() {
  // Este componente nunca se ve. El AuthGuard redirige inmediatamente.
  return (
    <div className="min-h-screen bg-[#060A14] flex items-center justify-center">
      <div className="h-10 w-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )
}