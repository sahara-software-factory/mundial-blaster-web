"use client"

import { useState, useEffect } from "react"
import { Check, Smartphone, Wifi, WifiOff } from "lucide-react"

interface Linea {
  id: string
  phone: string
  nombre?: string
  status: string // CONECTADA | DESCONECTADA | etc
}

interface Props {
  mode: "single" | "round_robin"
  onModeChange: (mode: "single" | "round_robin") => void
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function CampaignLineSelector({ mode, onModeChange, selectedIds, onSelectionChange }: Props) {
  const [lineas, setLineas] = useState<Linea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/lineas")
      .then(r => r.json())
      .then(data => {
        setLineas(data.lineas || [])
        setLoading(false)
        // Auto-seleccionar conectadas si hay round-robin
        if (mode === "round_robin") {
          const conectadas = (data.lineas || []).filter((l: Linea) => l.status === "CONECTADA").map((l: Linea) => l.id)
          onSelectionChange(conectadas)
        }
      })
  }, [])

  const toggleLinea = (id: string) => {
    if (mode === "single") {
      onSelectionChange([id]) // Solo una
    } else {
      onSelectionChange(
        selectedIds.includes(id)
          ? selectedIds.filter(x => x !== id)
          : [...selectedIds, id]
      )
    }
  }

  const conectadas = lineas.filter(l => l.status === "CONECTADA")
  const seleccionadas = lineas.filter(l => selectedIds.includes(l.id))

  if (loading) return <div className="text-sm text-slate-400">Cargando líneas...</div>

  return (
    <div className="space-y-4">
      {/* Toggle modo */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
        <button
          onClick={() => { onModeChange("single"); onSelectionChange([]) }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "single" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
          }`}
        >
          Línea única
        </button>
        <button
          onClick={() => { onModeChange("round_robin"); onSelectionChange(conectadas.map(l => l.id)) }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "round_robin" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
          }`}
        >
          Round-robin
        </button>
      </div>

      {/* Lista de líneas */}
      <div className="space-y-2">
        {lineas.map(linea => {
          const isSelected = selectedIds.includes(linea.id)
          const isOnline = linea.status === "CONECTADA"
          const disabled = !isOnline && mode === "round_robin"

          return (
            <button
              key={linea.id}
              onClick={() => !disabled && toggleLinea(linea.id)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10"
              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${
                isSelected ? "bg-blue-500 border-blue-500" : "border-slate-500"
              }`}>
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
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className={`text-xs ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          )
        })}
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