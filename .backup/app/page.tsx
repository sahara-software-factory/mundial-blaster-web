'use client'

import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, QrCode, Wifi, WifiOff, Trash2, Rocket } from 'lucide-react'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ''
const API_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || ''

export default function Dashboard() {
  const [lines, setLines] = useState<any[]>([])
  const [selectedLine, setSelectedLine] = useState<any>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState('IDLE')

  const [numbersText, setNumbersText] = useState('')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [delayMin, setDelayMin] = useState(3000)
  const [delayMax, setDelayMax] = useState(8000)
  const [isSending, setIsSending] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    fetchLines()
  }, [])

  useEffect(() => {
    if (!SOCKET_URL) return
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socket.on('qr', (payload: any) => {
      if (selectedLine && payload.lineId === selectedLine.id) {
        setQrImage(payload.qr)
        setQrStatus('PENDING')
      }
    })
    socket.on('status', (payload: any) => {
      if (selectedLine && payload.lineId === selectedLine.id) {
        setQrStatus(payload.status)
        if (payload.status === 'CONECTADA') {
          setTimeout(() => { setQrModalOpen(false); fetchLines() }, 2000)
        }
      }
    })
    return () => { socket.disconnect() }
  }, [selectedLine])

  const fetchLines = async () => {
    // Ajustá esto a tu endpoint real de listado de líneas
    // Por ahora usamos un mock para que veas la estructura
    setLines([
      { id: 'line_abc123', phone: '5491123456789', status: 'CONECTADA', nombre: 'Línea 1' },
      { id: 'line_def456', phone: '5491165432198', status: 'DESCONECTADA', nombre: 'Línea 2' },
    ])
  }

  const connectLine = async (phone: string) => {
    setQrStatus('CONNECTING')
    setQrImage(null)
    await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
  }

  const logoutLine = async (lineId: string) => {
    await fetch('/api/whatsapp/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineId })
    })
    fetchLines()
  }

  const sendCampaign = async () => {
    if (!selectedLine) return alert('Seleccioná una línea primero')
    const rawNumbers = numbersText.split('\n').map(n => n.trim()).filter(Boolean)
    const targets = rawNumbers.map(n => ({ phone: n.replace(/\D/g, ''), name: '' }))
    if (targets.length === 0) return alert('No hay números válidos')

    setIsSending(true)
    setLogs([`🚀 Iniciando campaña: ${targets.length} números...`])

    try {
      const res = await fetch('/api/campaign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineId: selectedLine.id,
          targets,
          message,
          imageUrl: imageUrl || undefined,
          delayMin,
          delayMax
        })
      })
      const data = await res.json()
      if (data.success) {
        setLogs(prev => [...prev, `✅ Campaña ${data.campaignId} disparada en background`, `⏳ Esperá a que termine en el servidor...`])
      } else {
        setLogs(prev => [...prev, `❌ Error: ${data.error}`])
      }
    } catch (e) {
      setLogs(prev => [...prev, `❌ Error de red`])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-bold tracking-tight">Mundial Blaster <span className="text-emerald-400">Beta</span></h1>
        </div>

        {/* Líneas */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Líneas WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.map(line => (
              <div key={line.id} className={`flex items-center justify-between p-4 rounded-xl border ${selectedLine?.id === line.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
                <div className="space-y-1">
                  <p className="font-semibold text-white">{line.phone}</p>
                  <Badge variant="outline" className={
                    line.status === 'CONECTADA' ? 'border-emerald-500 text-emerald-400' :
                    line.status === 'PENDING' ? 'border-amber-500 text-amber-400' :
                    'border-red-500 text-red-400'
                  }>
                    {line.status === 'CONECTADA' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                    {line.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {line.status !== 'CONECTADA' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => { setSelectedLine(line); setQrModalOpen(true); connectLine(line.phone) }}>
                      <QrCode className="w-4 h-4 mr-1" /> Conectar
                    </Button>
                  )}
                  {line.status === 'CONECTADA' && (
                    <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10" onClick={() => setSelectedLine(line)}>
                      <Wifi className="w-4 h-4 mr-1" /> Usar esta
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => logoutLine(line.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* QR Modal inline */}
        {qrModalOpen && selectedLine && (
          <Card className="border-2 border-blue-500 bg-slate-900">
            <CardHeader>
              <CardTitle>Vincular {selectedLine.phone}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              {qrStatus === 'CONNECTING' && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                  <p className="text-slate-400">Generando QR en el servidor...</p>
                </div>
              )}
              {qrStatus === 'PENDING' && qrImage && (
                <div className="space-y-4 text-center">
                  <div className="p-2 bg-white rounded-xl inline-block">
                    <img src={qrImage} alt="QR" className="w-64 h-64" />
                  </div>
                  <p className="text-sm text-slate-400">Abrí WhatsApp en tu celular → Configuración → Dispositivos Vinculados → Escanear</p>
                </div>
              )}
              {qrStatus === 'CONECTADA' && (
                <Badge className="bg-emerald-500 text-white px-4 py-2 text-lg">¡Conectado! Cerrando...</Badge>
              )}
              <Button variant="outline" onClick={() => setQrModalOpen(false)}>Cancelar</Button>
            </CardContent>
          </Card>
        )}

        {/* Campaña */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Nueva Campaña
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedLine ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                Usando línea: {selectedLine.phone}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-400 border-amber-500">Seleccioná una línea arriba ↑</Badge>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Números de destino (uno por línea, solo números, sin + ni espacios)</label>
              <Textarea
                value={numbersText}
                onChange={e => setNumbersText(e.target.value)}
                placeholder="5491123456789&#10;5491165432198&#10;5491176543210"
                rows={8}
                className="bg-slate-950 border-slate-800 font-mono text-sm"
              />
              <p className="text-xs text-slate-500">{numbersText.split('\n').filter(Boolean).length} números detectados</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Mensaje</label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hola, tenemos una promo imperdible para el mundial..."
                rows={4}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">URL de imagen (opcional)</label>
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://tuservidor.com/imagen.jpg"
                className="bg-slate-950 border-slate-800"
              />
              <p className="text-xs text-slate-500">La imagen debe ser pública. Si no sabés, dejá vacío y mandá solo texto.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Delay mínimo (ms)</label>
                <Input type="number" value={delayMin} onChange={e => setDelayMin(Number(e.target.value))} className="bg-slate-950 border-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Delay máximo (ms)</label>
                <Input type="number" value={delayMax} onChange={e => setDelayMax(Number(e.target.value))} className="bg-slate-950 border-slate-800" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Delay aleatorio entre mensajes para evitar detección. Recomendado: 4000-12000ms.</p>

            <Button
              onClick={sendCampaign}
              disabled={isSending || !selectedLine}
              className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 text-lg font-bold"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Rocket className="w-5 h-5 mr-2" />}
              {isSending ? 'DISPARANDO...' : 'DISPARAR CAMPAÑA'}
            </Button>

            {logs.length > 0 && (
              <div className="bg-black border border-slate-800 rounded-lg p-4 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
                {logs.map((l, i) => (
                  <div key={i} className={l.startsWith('✅') ? 'text-emerald-400' : l.startsWith('❌') ? 'text-red-400' : 'text-slate-400'}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
