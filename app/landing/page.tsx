"use client"

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-[var(--text-primary)]">
      
      {/* HERO */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
          🚀 Beta Edition — Self-Hosted WhatsApp Blaster
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Tu propio cañón de <span className="text-emerald-400">ventas por WhatsApp</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          Software self-hosted. Sin mensualidades. Sin depender de terceros. 
          Conectá líneas, cargá números, dispará campañas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href="#pricing" className="bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105">
            Ver planes y comprar →
          </a>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: "📱", title: "Múltiples líneas", desc: "Rotación automática Round-Robin. Más líneas = más alcance." },
          { icon: "🛡️", title: "Anti-ban inteligente", desc: "Delay aleatorio, pausas humanizadas, spintax de mensajes." },
          { icon: "⚡", title: "Self-hosted", desc: "Vos controlás todo. Tu infraestructura. Sin costos recurrentes." },
        ].map(f => (
          <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{f.title}</h3>
            <p className="text-[var(--text-secondary)] text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* PRICING */}
      <div id="pricing" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">Elegí tu licencia</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* STARTER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-300">Starter</h3>
            <div className="text-4xl font-extrabold text-[var(--text-primary)] my-4">$500</div>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Perfecto para vendedores individuales.</p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
              <li>✅ 1 línea WhatsApp</li>
              <li>✅ Envío texto + imagen</li>
              <li>✅ Delay anti-ban básico</li>
              <li>✅ Logs de envío</li>
              <li>✅ Guía de instalación</li>
              <li className="text-[var(--text-muted)]">❌ Sin spintax</li>
              <li className="text-[var(--text-muted)]">❌ Sin programación</li>
            </ul>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">
              Comprar Starter
            </button>
          </div>

          {/* PRO - DESTACADO */}
          <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-[var(--text-primary)] text-xs font-bold px-3 py-1 rounded-full">
              MÁS VENDIDO
            </div>
            <h3 className="text-lg font-bold text-blue-400">Pro</h3>
            <div className="text-4xl font-extrabold text-[var(--text-primary)] my-4">$750</div>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Para agencias y equipos de ventas.</p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
              <li>✅ <strong>3 líneas WhatsApp</strong> + rotación</li>
              <li>✅ Spintax completo + preview</li>
              <li>✅ Programación de campañas</li>
              <li>✅ Plantillas guardadas</li>
              <li>✅ Validación de números</li>
              <li>✅ Historial + export CSV</li>
              <li>✅ Soporte WhatsApp 24h</li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-900/20">
              Comprar Pro
            </button>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-emerald-400">Enterprise</h3>
            <div className="text-4xl font-extrabold text-[var(--text-primary)] my-4">$1.250</div>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Para resellers y grandes equipos.</p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
              <li>✅ <strong>Líneas ilimitadas</strong></li>
              <li>✅ White-label (tu logo, colores)</li>
              <li>✅ Dominio propio</li>
              <li>✅ API REST documentada</li>
              <li>✅ Multi-usuario (roles)</li>
              <li>✅ Modo humano avanzado</li>
              <li>✅ Licencia de revenda</li>
              <li>✅ Soporte prioritario lifetime</li>
            </ul>
           <Link href="/setup">
  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-[var(--text-primary)] font-bold py-3 rounded-xl transition-colors">
    Comprar Enterprise
  </button>
</Link>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-12 text-[var(--text-muted)] text-sm">
        <p>© 2026 Mundial Blaster. Software self-hosted. Vos controlás tu infraestructura.</p>
      </div>
    </div>
  )
}