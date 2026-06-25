WabiSend v3.2 — Sistema de Envío Masivo WhatsApp
Software self-hosted para envío masivo de WhatsApp con Baileys.
Sin costos ocultos. Sin APIs de pago por mensaje. Sin intermediarios.
Tu infraestructura, tu control, nuestra tecnología.
⚠️ ACUERDO DE LICENCIA DE USUARIO FINAL (EULA)
Al adquirir, instalar o utilizar WabiSend, aceptás los siguientes términos legalmente vinculantes:
Licencia de uso, no de propiedad. No adquirís el código fuente. Adquirís un derecho de uso limitado, no transferible y no exclusivo.
Prohibición de redistribución. No podés vender, alquilar, sublicenciar, distribuir o compartir el software con terceros, ni versiones modificadas ni originales.
Prohibición de ingeniería inversa. No podés descompilar, desofuscar, modificar, mergear o crear trabajos derivados del código sin autorización escrita.
Una licencia = una instancia. Cada licencia está criptográficamente atada a un único instance_id generado en el primer boot. Intentar clonar la licencia en otra instancia resultará en bloqueo inmediato y revocación sin reembolso.
Garantía condicional. La garantía de soporte técnico y actualizaciones es válida únicamente mientras el código no haya sido alterado. Cualquier modificación del código fuente anula automáticamente la garantía, el soporte y el derecho a futuras actualizaciones.
Monitoreo de integridad. El sistema incluye mecanismos de verificación de integridad del código y telemetría de activación. Al usar el software, aceptás que estas verificaciones se ejecuten de forma automática y silenciosa.
Jurisdicción. Este acuerdo se rige por las leyes de la República Argentina. Cualquier disputa será resuelta en los tribunales de la Ciudad de Córdoba.
Incumplimiento: El incumplimiento de cualquiera de estos términos resultará en la revocación inmediata de la licencia, la cancelación del acceso al repositorio privado y la posibilidad de acciones legales por daños y perjuicios.
💰 Planes y Precios
Table
Plan	Precio (USD)	Líneas WhatsApp	Templates	Campañas Pendientes	Features Clave
Starter	$500	2	5	10	Envío masivo, delay anti-ban, logs básicos, contactos, tags
Pro	$750	3	Ilimitados	50	Todo Starter + blacklist, reportes avanzados, programación (cron), export CSV, round-robin, modo humano, clone campañas, spintax avanzado, variables en templates
Business	$1.290	Ilimitadas	Ilimitados	Ilimitadas	Todo Pro + IA (generación de mensajes, auditoría, títulos, resumen post-campaña), multi-usuario, rotación de proxies, white-label
¿Qué incluye cada licencia?
✅ Acceso de lectura al repositorio privado de GitHub
✅ Instalación inicial incluida (nosotros lo deployamos por vos)
✅ Soporte técnico por WhatsApp durante 30 días (Starter/Pro) o 90 días (Business)
✅ Actualizaciones de versión mientras la garantía esté vigente
❌ No incluye costos de infraestructura (Railway, Neon, Vercel) — esos van a tu tarjeta y dependen de tu uso
Costos de infraestructura estimados (mensuales, a cargo del cliente)
Railway (backend + servidor): $5–20 USD según volumen de mensajes
Neon (PostgreSQL): Free tier incluido; si superás límites, ~$5–10 USD
Vercel (frontend): Plan Hobby gratuito para uso comercial
Cloudflare Worker (tracking afiliados, opcional): Gratis en tier gratuito
🛡️ Sistema Anti-Clonación y Protección
WabiSend utiliza un sistema de licencia criptográfica de un solo uso. Esto significa:
Licencia pre-atada: Cada licencia JWT incluye un instance_id único generado en el primer arranque del servidor.
Bloqueo automático: Si intentás activar la misma licencia en una segunda instancia (segundo Railway, segundo servidor, segunda base de datos), el sistema detecta el mismatch y rechaza la activación con el código LICENSE_BOUND_TO_OTHER_INSTANCE.
Alerta al propietario: Cualquier intento de clonación, reactivación en instancia alternativa o mismatch de integridad genera una alerta silenciosa al equipo de WabiSend vía webhook seguro.
Pérdida de garantía: Editar, comentar, bypassar o modificar cualquier archivo del backend (server.js, whatsappService.js, etc.) invalida automáticamente el soporte y las actualizaciones. La detección se realiza mediante verificación de hash de integridad en cada boot.
🏗️ Arquitectura
plain
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Vercel        │──────│   Railway        │──────│   Neon          │
│   (Next.js)     │      │   (Node.js +     │      │   (PostgreSQL)  │
│   Dashboard     │      │   Baileys)       │      │   Prisma ORM    │
│   + Landing     │      │   WhatsApp Server│      │   Datos + Logs  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                        │
         │                        │
         ▼                        ▼
   Usuario final           Socket.IO (QR en vivo,
   Navegador               campañas en tiempo real)
📦 Estructura del Monorepo
plain
wabisend/
├── apps/
│   ├── web/                 ← Frontend Next.js (dashboard, landing, docs)
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── server/              ← Backend Node.js + Baileys
│       ├── prisma/
│       │   └── schema.prisma
│       ├── server.js
│       ├── whatsappService.js
│       ├── package.json
│       └── .npmrc
│
├── package.json             ← Root (workspaces pnpm)
├── pnpm-workspace.yaml
└── README.md                ← Este archivo
🚀 Instalación (Realizada por el equipo WabiSend)
No necesitás saber programar. Nosotros nos encargamos del deploy completo. Solo necesitamos que nos pases:
Usuario de GitHub (para darte acceso de lectura al repo privado)
Email de cuenta Vercel (registrate en vercel.com con tu GitHub)
Tarjeta de crédito/débito (para activar Railway; los cargos van directo a tu cuenta, nosotros no cobramos hosting)
Dominio propio (opcional) — si no tenés, usamos la URL gratuita de Vercel
Proceso:
Comprás tu licencia y nos pasás los datos por WhatsApp/email.
Generamos tu licencia criptográfica única (instance_id incluido).
Creamos tu proyecto en Railway, conectamos tu base de datos Neon y deployamos el frontend en Vercel.
Configuramos todas las variables de entorno (secretos, tokens, licencia).
Te entregamos la URL de acceso y tu usuario administrador.
Tiempo estimado: 24–48 horas hábiles.
🔄 Actualizaciones
Cuando lanzamos una nueva versión:
Te avisamos por WhatsApp o email.
Nosotros accedemos a tu infraestructura (como colaboradores de Railway/Vercel) y aplicamos la update.
No tenés que tocar nada. El proceso toma 5 minutos y no perdés datos ni configuraciones.
Importante: Si contrataste un tercero para modificar el código o intentaste editar archivos por tu cuenta, la actualización puede fallar y la garantía quedará anulada.
🧪 Funcionalidades Incluidas
Core (todos los planes)
Conexión de números WhatsApp vía QR (Socket.IO en tiempo real)
Envío masivo de mensajes de texto con delay aleatorio configurable
Envío masivo con imagen vía URL pública (sin costos de storage)
Gestión de contactos con tags y CSV import
Gestión de templates de mensajes
Logs de campaña en PostgreSQL
Dashboard con métricas básicas
Pro / Business
Blacklist automática y manual
Reportes avanzados con gráficos (Recharts)
Programación de campañas (cron integrado)
Exportación CSV de resultados
Rotación Round-Robin de líneas
Modo humano (delay variable + pausas)
Clonación de campañas
Spintax avanzado ({{opción1|opción2|opción3}})
Variables dinámicas en templates ({{nombre}}, etc.)
Business exclusivo
IA generativa (OpenAI): generación de mensajes, auditoría anti-ban, títulos automáticos, resumen post-campaña
Multi-usuario (roles)
Rotación de proxies
White-label (marca propia)
⚠️ Sobre las Imágenes (IMPORTANTE)
No usamos Supabase ni storage propio. El software envía la imagen directamente desde una URL pública que vos proporcionás.
Opciones gratuitas para hostear tu imagen:
Imgur
Postimage
Google Drive (link directo público)
Tu propio servidor web
Esto elimina costos de storage sorpresa y dependencias externas.
🚫 Prohibiciones y Límites
Table
Acción	¿Permitido?	Consecuencia
Usar en una sola instancia	✅ Sí	—
Compartir la licencia con otra persona/empresa	❌ No	Revocación inmediata, sin reembolso
Clonar la instancia en otro servidor	❌ No	Bloqueo por instance_id, alerta al equipo
Modificar el código fuente	❌ No	Pérdida de garantía, soporte y actualizaciones
Vender WabiSend como propio	❌ No	Acciones legales por violación de copyright
Contratar un developer para editar el código	❌ No	Pérdida de garantía y soporte
Usar para spam ilegal o phishing	❌ No	Revocación inmediata, responsabilidad legal del usuario
📞 Soporte y Contacto
WhatsApp: [+54 9 XXX XXXX XXXX] (respuesta en 24h hábiles)
Email: soporte@wabisend.com
Horario: Lunes a Viernes, 9:00 a 18:00 (ART, Argentina)
Para soporte técnico, indicá siempre:
Tu dominio (ej: tunombre.railway.app)
Tu email de compra
Descripción del problema + screenshot si aplica
📜 Licencia y Copyright
© 2026 WabiSend. Todos los derechos reservados.
Este software es propiedad intelectual protegida. La compra de una licencia no implica transferencia de derechos de autor. El código fuente, la arquitectura, la lógica de negocio y los sistemas de protección son propiedad exclusiva de WabiSend.
Hecho para vender hoy, escalar mañana.
Última actualización: Junio 2026 — v3.2.0