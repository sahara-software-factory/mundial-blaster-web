"use client"

import { Check, Smartphone, Wifi, WifiOff } from "lucide-react"

interface Linea {
  id: string
  phone: string
  nombre?: string
  status: string
}

interface Props {
  mode: "single" | "round_robin"
  onModeChange: (mode: "single" | "round_robin") => void
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  lines: Linea[] // ← NUEVO: recibe del padre
}

export function CampaignLineSelector({
  mode,
  onModeChange,
  selectedIds,
  onSelectionChange,
  lines,
}: Props) {
  const toggleLinea = (id: string) => {
    if (mode === "single") {
      onSelectionChange([id])
    } else {
      onSelectionChange(
        selectedIds.includes(id)
          ? selectedIds.filter((x) => x !== id)
          : [...selectedIds, id]
      )
    }
  }

  const conectadas = lines.filter((l) => l.status === "CONECTADA")
  const desconectadas = lines.filter((l) => l.status !== "CONECTADA")

  if (lines.length === 0) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-xs text-amber-400">No hay líneas creadas. Andá a la pestaña "Líneas" y agregá una.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toggle modo */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
        <button
          onClick={() => {
            onModeChange("single")
            onSelectionChange([])
          }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "single"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Línea única
        </button>
        <button
          onClick={() => {
            onModeChange("round_robin")
            // Auto-seleccionar todas las conectadas
            onSelectionChange(conectadas.map((l) => l.id))
          }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "round_robin"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Round-robin
        </button>
      </div>

      {/* Lista de líneas */}
      <div className="space-y-2">
        {/* Conectadas */}
        {conectadas.map((linea) => {
          const isSelected = selectedIds.includes(linea.id)
          return (
            <button
              key={linea.id}
              onClick={() => toggleLinea(linea.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10"
              } cursor-pointer`}
            >
              <div
                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${
                  isSelected ? "bg-blue-500 border-blue-500" : "border-slate-500"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </div>

              <Smartphone className="h-4 w-4 text-slate-400" />

              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {linea.phone}
                </p>
                {linea.nombre && (
                  <p className="text-xs text-[var(--text-secondary)]">{linea.nombre}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">Online</span>
              </div>
            </button>
          )
        })}

        {/* Desconectadas (solo visibles, no seleccionables) */}
        {desconectadas.map((linea) => (
          <div
            key={linea.id}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
          >
            <div className="h-5 w-5 rounded-md border-2 border-slate-600" />
            <Smartphone className="h-4 w-4 text-slate-500" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[var(--text-primary)]">{linea.phone}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-red-400">Offline</span>
            </div>
          </div>
        ))}
      </div>

      {/* Badge resumen */}
      {mode === "round_robin" && selectedIds.length > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">
            Round-robin activo · {selectedIds.length} líneas · Reparto automático
          </span>
        </div>
      )}

      {mode === "round_robin" && selectedIds.length < 2 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs text-amber-400">
            Seleccioná al menos 2 líneas para round-robin
          </span>
        </div>
      )}
    </div>
  )
}