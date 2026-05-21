# Mundial Blaster — Beta Edition

Software de envío masivo de WhatsApp usando Baileys. Sin CRM, sin IA, sin costos ocultos.

## ¿Qué incluye esta beta?

- ✅ Conexión de números WhatsApp vía QR (Socket.IO en tiempo real)
- ✅ Envío masivo de mensajes de texto
- ✅ Envío masivo con imagen vía URL pública
- ✅ Delay aleatorio entre mensajes (anti-ban básico)
- ✅ Logs de campaña en PostgreSQL
- ❌ Sin Supabase (sin costos de storage)
- ❌ Sin OpenAI (sin gasto de créditos)
- ❌ Sin e-commerce ni recepción de mensajes

## Arquitectura

```
Vercel (Frontend Next.js)  →  Railway (Backend Node + Baileys)  →  Neon (PostgreSQL)
```

## Instalación rápida

### 1. Base de datos (Neon o local)

```bash
cd backend
npx prisma migrate dev --name init
```

### 2. Backend (Railway)

```bash
cd backend
npm install
node server.js
```

Variables de entorno en Railway:
- `DATABASE_URL` → tu Neon
- `WHATSAPP_SECRET` → clave para que el frontend hable con el backend

### 3. Frontend (Vercel)

Copiá los archivos de `frontend/` a tu repo Next.js existente.

Variables de entorno en Vercel:
- `NEXT_PUBLIC_SOCKET_URL` → URL de tu Railway
- `NEXT_PUBLIC_WHATSAPP_SERVER_URL` → URL de tu Railway
- `WHATSAPP_SECRET` → misma clave que Railway

## Uso

1. Abrí el panel en Vercel
2. Conectá una línea WhatsApp escaneando el QR
3. Pegá los números (uno por línea, formato: 5491123456789)
4. Escribí el mensaje
5. (Opcional) Pegá una URL pública de imagen
6. Ajustá el delay (recomendado: 4000-12000ms)
7. Click en **DISPARAR CAMPAÑA**

## Sobre las imágenes (IMPORTANTE)

**No usamos Supabase ni storage propio.** El software envía la imagen directamente desde una URL pública que vos proporcionás.

Opciones para hostear tu imagen gratuitamente:
- Imgur
- Postimage
- Tu propio servidor web
- Google Drive (link directo público)

Esto elimina costos de storage y reclamos por "gasto sorpresa".

## Próximos pasos para la versión de venta

1. Sistema de licencia por dominio (Cloudflare Worker)
2. Ofuscación del build frontend
3. Compilación del backend a binario
4. Spintax (variaciones de texto) en campañas
5. Rotación automática de líneas
6. Reporte de entrega en tiempo real (webSocket al frontend)

## Precio sugerido para esta beta

- **Starter $500**: 1 línea, texto + imagen URL, delay configurable
- **Pro $750**: 3 líneas, rotación, spintax, soporte 30 días
- **Agency $1200**: 10 líneas, código fuente incluido

---
**Mundial Blaster — Hecho para vender hoy, escalar mañana.**
