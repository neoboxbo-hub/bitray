import { useState, useEffect } from 'react'

export default function AlertasPrecio() {
  const [permiso, setPermiso] = useState(Notification.permission)
  const [activadas, setActivadas] = useState(() =>
    localStorage.getItem('bitray.alertas') !== 'off'
  )

  useEffect(() => {
    // Sincroniza si el usuario cambia el permiso desde el navegador
    const id = setInterval(() => setPermiso(Notification.permission), 3000)
    return () => clearInterval(id)
  }, [])

  if (!('Notification' in window)) return null

  const solicitar = async () => {
    const result = await Notification.requestPermission()
    setPermiso(result)
    if (result === 'granted') {
      localStorage.setItem('bitray.alertas', 'on')
      setActivadas(true)
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
      new Notification('✅ Alertas BitRay activadas', {
        body: 'Te avisaremos en tiempo real cuando tus tokens se muevan',
        requireInteraction: false,
      })
    }
  }

  const toggle = () => {
    const nuevo = !activadas
    setActivadas(nuevo)
    localStorage.setItem('bitray.alertas', nuevo ? 'on' : 'off')
  }

  return (
    <div className="card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div>
            <p className="font-semibold text-sm">Alertas inteligentes</p>
            <p className="text-xs text-gray-500">Basadas en tu precio de entrada</p>
          </div>
        </div>
        {permiso === 'granted' && (
          <button onClick={toggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${activadas ? 'bg-profit' : 'bg-ink-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activadas ? 'translate-x-5' : ''}`} />
          </button>
        )}
      </div>

      {/* Niveles de alerta */}
      {permiso === 'granted' && activadas && (
        <div className="space-y-1.5">
          {[
            { emoji: '⚖️', texto: 'Toca tu precio promedio (break-even)', color: 'text-gray-300' },
            { emoji: '📈', texto: '+2% sobre tu entrada',                  color: 'text-profit/80' },
            { emoji: '🚀', texto: '+3% — considera tomar parciales',       color: 'text-profit' },
            { emoji: '🔥', texto: '+5% — TP cerca',                        color: 'text-yellow-400' },
            { emoji: '⚠️', texto: '-3% — revisa tu Stop Loss',             color: 'text-loss' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center">{a.emoji}</span>
              <p className={`text-xs ${a.color}`}>{a.texto}</p>
            </div>
          ))}
          <p className="text-[10px] text-gray-600 pt-1">
            Aplica a todos los tokens de Cosecha, Turbo y BTC del Cofre · cooldown 20 min
          </p>
        </div>
      )}

      {/* Activar */}
      {permiso === 'default' && (
        <button onClick={solicitar}
          className="w-full py-2.5 rounded-xl bg-brand/20 text-brand border border-brand/40 font-bold text-sm">
          Activar notificaciones
        </button>
      )}

      {/* Bloqueado */}
      {permiso === 'denied' && (
        <div className="space-y-2">
          <p className="text-xs text-loss leading-snug">
            Notificaciones bloqueadas por el navegador.
          </p>
          <p className="text-xs text-gray-500 leading-snug">
            Para activarlas: toca el 🔒 en la barra del navegador → Permisos del sitio → Notificaciones → Permitir.
          </p>
        </div>
      )}

      {/* Instrucción PWA */}
      {permiso === 'granted' && (
        <div className="bg-ink-800 rounded-xl px-3 py-2.5 space-y-1">
          <p className="text-[11px] font-semibold text-gray-300">📱 ¿Quieres alertas con la app cerrada?</p>
          <p className="text-[11px] text-gray-500 leading-snug">
            Instala BitRay como app en tu celular: en Chrome toca los 3 puntos → <strong className="text-gray-300">Añadir a pantalla de inicio</strong>. Las notificaciones llegarán aunque no tengas la app abierta.
          </p>
        </div>
      )}
    </div>
  )
}
