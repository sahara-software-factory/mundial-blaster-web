// lib/demo-data.ts
export const DEMO_LICENSE = {
  tier: "starter",
  maxLines: 2,
  maxContacts: 500,
  monthlyMessages: 5000,
  features: ["basic_spintax", "30d_history", "basic_delay"],
}

export const DEMO_LINES = [
  {
    id: "line-demo-1",
    phone: "5491112345678",
    status: "connected",
    name: "Línea Principal",
    connected_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "line-demo-2",
    phone: "5491187654321",
    status: "disconnected",
    name: "Línea Secundaria",
    connected_at: null,
  },
]

export const DEMO_CAMPAIGNS = [
  {
    id: "camp-demo-1",
    name: "Promo Verano 2026",
    status: "completed",
    total: 1250,
    sent: 1248,
    failed: 2,
    created_at: "2026-05-25T10:00:00Z",
    finished_at: "2026-05-25T10:45:00Z",
    template: "promo_verano",
    schedule: null,
  },
  {
    id: "camp-demo-2",
    name: "Lanzamiento Nuevo Producto",
    status: "completed",
    total: 3400,
    sent: 3395,
    failed: 5,
    created_at: "2026-05-20T14:30:00Z",
    finished_at: "2026-05-20T15:20:00Z",
    template: "lanzamiento",
    schedule: null,
  },
  {
    id: "camp-demo-3",
    name: "Recordatorio Pagos",
    status: "running",
    total: 890,
    sent: 456,
    failed: 3,
    created_at: "2026-05-29T09:00:00Z",
    finished_at: null,
    template: "recordatorio",
    schedule: null,
  },
  {
    id: "camp-demo-4",
    name: "Reactivación Clientes",
    status: "scheduled",
    total: 2100,
    sent: 0,
    failed: 0,
    created_at: "2026-05-29T16:00:00Z",
    finished_at: null,
    template: "reactivacion",
    schedule: "2026-05-30T09:00:00Z",
  },
  {
    id: "camp-demo-5",
    name: "Black Friday Adiantado",
    status: "draft",
    total: 5000,
    sent: 0,
    failed: 0,
    created_at: "2026-05-28T11:00:00Z",
    finished_at: null,
    template: "blackfriday",
    schedule: null,
  },
]

export const DEMO_CONTACTS = Array.from({ length: 24 }, (_, i) => ({
  id: `contact-demo-${i + 1}`,
  name: [
    "Juan Pérez", "María González", "Carlos Rodríguez", "Ana Martínez",
    "Luis Fernández", "Laura López", "Pedro Sánchez", "Sofia Torres",
    "Diego Ramírez", "Valentina Flores", "Martín Acosta", "Camila Ruiz",
    "Julián Castro", "Paula Medina", "Tomás Herrera", "Lucía Silva",
    "Nicolás Vargas", "Emilia Rojas", "Bruno Molina", "Antonella Cruz",
    "Facundo Ortiz", "Morena Luna", "Santiago Reyes", "Victoria Peña"
  ][i],
  phone: `54911${String(30000000 + i).slice(-8)}`,
  tags: i % 3 === 0 ? ["Cliente"] : i % 3 === 1 ? ["Lead"] : ["VIP"],
  created_at: new Date(Date.now() - 86400000 * (i % 30)).toISOString(),
  last_message: i % 5 === 0 ? "Hola, me interesa" : null,
}))

export const DEMO_TAGS = [
  { id: "tag-1", name: "Cliente", color: "#3b82f6", count: 12 },
  { id: "tag-2", name: "Lead", color: "#10b981", count: 8 },
  { id: "tag-3", name: "VIP", color: "#f59e0b", count: 4 },
  { id: "tag-4", name: "No interesado", color: "#ef4444", count: 3 },
  { id: "tag-5", name: "Reactivar", color: "#8b5cf6", count: 6 },
  { id: "tag-6", name: "Pago pendiente", color: "#f97316", count: 2 },
]

export const DEMO_TEMPLATES = [
  { id: "tpl-1", name: "Bienvenida", category: "General", content: "¡Hola {{nombre}}! Bienvenido a nuestro servicio...", usage: 145 },
  { id: "tpl-2", name: "Promo Verano", category: "Promociones", content: "🔥 {{nombre}}, tenemos 50% OFF en...", usage: 1248 },
  { id: "tpl-3", name: "Recordatorio", category: "Recordatorios", content: "Hola {{nombre}}, te recordamos que...", usage: 892 },
  { id: "tpl-4", name: "Seguimiento", category: "Seguimiento", content: "¿Cómo te fue con {{producto}}?", usage: 67 },
  { id: "tpl-5", name: "Reactivación", category: "Reactivación", content: "Te extrañamos {{nombre}}. Vuelve con 20% OFF", usage: 2100 },
  { id: "tpl-6", name: "Black Friday", category: "Promociones", content: "⚡ BLACK FRIDAY {{nombre}} 70% OFF", usage: 0 },
]

export const DEMO_STATS = {
  totalSent: 5099,
  totalFailed: 10,
  deliveryRate: 99.8,
  activeNow: 1,
  uniqueDelivered: 3847,
  chartData: [
    { date: "25 may", sent: 1248, failed: 2 },
    { date: "26 may", sent: 0, failed: 0 },
    { date: "27 may", sent: 3395, failed: 5 },
    { date: "28 may", sent: 0, failed: 0 },
    { date: "29 may", sent: 456, failed: 3 },
  ],
  pieData: [
    { name: "Entregados", value: 5099, color: "#10b981" },
    { name: "Fallidos", value: 10, color: "#ef4444" },
  ],
}

export const DEMO_LOGS_MAP: Record<string, any[]> = {
  "camp-demo-1": Array.from({ length: 20 }, (_, i) => ({
    contact_phone: `54911${String(30000000 + i).slice(-8)}`,
    status: i === 19 ? "failed" : "sent",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  })),
}