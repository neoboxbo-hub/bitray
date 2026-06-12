import { useState, useEffect } from 'react'

export default function AlertasPrecio() {
  const [permiso, setPermiso] = useState(Notification.permission)
  const [activadas, setActivadas] = useState(() => {
    return localStorage.getItem('bitray.alertas') !== 'off'
  })

  const solicitar = async () => {
    const result = await Notification.requestPermission()
    setPermiso(result)
    if (result === 'granted') {
      localStorage.setItem('bitray.alertas', 'on')
      setActivadas(true)
      new Notification('✅ Alertas BitRay activadas', {
        body: 'Te avisaremos cuando un token se mueva ±3%',
        tag: 'test',
      })
    }
  }

  const toggleActivadas = () => {
    const nuevo = !activadas
    setActivadas(nuevo)
    localStorage.setItem('bitray.alertas', nuevo ? 'on' : 'off')
  }

  // Sin soporte
  if (!('Notification' in window)) return null

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div>
            <p className="font-semibold text-sm">Alertas de precio</p>
            <p className="text-xs text-gray-500">Aviso cuando un token se mueve ±3%</p>
          </div>
        </div>

        {permiso === 'granted' && (
          <button
            onClick={toggleActivadas}
            className={`relative w-11 h-6 rounded-full transition-colors ${activadas ? 'bg-profit' : 'bg-ink-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activadas ? 'translate-x-5' : ''}`} />
          </button>
        )}
      </div>

      {permiso === 'default' && (
        <button onClick={solicitar}
          className="w-full py-2.5 rounded-xl bg-brand/20 text-brand border border-brand/40 font-bold text-sm">
          Activar notificaciones
        </button>
      )}

      {permiso === 'denied' && (
        <p className="text-xs text-loss leading-snug">
          Notificaciones bloqueadas. Ve a Configuración del navegador → Permisos del sitio → Notificaciones y permite este sitio.
        </p>
      )}

      {permiso === 'granted' && (
        <p className="text-[11px] text-gray-500">
          {activadas
            ? '✓ Activas · recibirás avisos mientras la app esté abierta'
            : 'Desactivadas · toca el switch para reactivar'}
        </p>
      )}
    </div>
  )
}
