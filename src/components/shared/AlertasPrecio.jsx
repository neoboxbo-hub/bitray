import { useState, useEffect } from 'react'
import { getTgConfig, setTgConfig, clearTgConfig, testTelegram } from '../../services/telegram'

const BOT_TOKEN_DEFAULT = '8947239563:AAEQlZzfWpaUQlKkVdiOd9kTVR3J48lJhVk'
const CHAT_ID_DEFAULT   = '179616148'

export default function AlertasPrecio() {
  const [permiso, setPermiso]       = useState(Notification.permission)
  const [activadas, setActivadas]   = useState(() => localStorage.getItem('bitray.alertas') !== 'off')
  const [tgConfig, setTgConfigState] = useState(getTgConfig)
  const [showTgForm, setShowTgForm] = useState(false)
  const [token, setToken]           = useState(BOT_TOKEN_DEFAULT)
  const [chatId, setChatId]         = useState(CHAT_ID_DEFAULT)
  const [tgStatus, setTgStatus]     = useState(null)   // null | 'ok' | 'error'

  useEffect(() => {
    // Auto-configurar Telegram con los datos por defecto si no hay config
    if (!getTgConfig()) {
      setTgConfig(BOT_TOKEN_DEFAULT, CHAT_ID_DEFAULT)
      setTgConfigState(getTgConfig())
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setPermiso(Notification.permission), 3000)
    return () => clearInterval(id)
  }, [])

  if (!('Notification' in window)) return null

  const solicitarPermiso = async () => {
    const result = await Notification.requestPermission()
    setPermiso(result)
    if (result === 'granted') {
      localStorage.setItem('bitray.alertas', 'on')
      setActivadas(true)
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
      new Notification('✅ Alertas BitRay activadas', { body: 'Te avisaremos cuando tus tokens se muevan' })
    }
  }

  const toggle = () => {
    const nuevo = !activadas
    setActivadas(nuevo)
    localStorage.setItem('bitray.alertas', nuevo ? 'on' : 'off')
  }

  const guardarTelegram = async () => {
    if (!token.trim() || !chatId.trim()) return
    setTgConfig(token.trim(), chatId.trim())
    setTgConfigState(getTgConfig())
    setTgStatus(null)
    const ok = await testTelegram()
    setTgStatus(ok ? 'ok' : 'error')
    if (ok) setShowTgForm(false)
  }

  const desconectarTelegram = () => {
    clearTgConfig()
    setTgConfigState(null)
    setTgStatus(null)
    setToken(BOT_TOKEN_DEFAULT)
    setChatId(CHAT_ID_DEFAULT)
  }

  return (
    <div className="card p-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div>
            <p className="font-semibold text-sm">Alertas inteligentes</p>
            <p className="text-xs text-gray-500">Break-even · +2% · +3% · +5% · -3%</p>
          </div>
        </div>
        {permiso === 'granted' && (
          <button onClick={toggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${activadas ? 'bg-profit' : 'bg-ink-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activadas ? 'translate-x-5' : ''}`} />
          </button>
        )}
      </div>

      {/* ── Canales activos ── */}
      <div className="flex gap-2 flex-wrap">
        {/* Navegador */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
          permiso === 'granted' && activadas
            ? 'bg-profit/10 border-profit/30 text-profit'
            : 'bg-ink-700 border-ink-600 text-gray-500'
        }`}>
          <span>🌐</span>
          <span>Navegador {permiso === 'granted' && activadas ? '· activo' : '· inactivo'}</span>
        </div>

        {/* Telegram */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
          tgConfig
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            : 'bg-ink-700 border-ink-600 text-gray-500'
        }`}>
          <span>✈️</span>
          <span>Telegram {tgConfig ? '· conectado' : '· sin conectar'}</span>
        </div>
      </div>

      {/* ── Activar navegador ── */}
      {permiso === 'default' && (
        <button onClick={solicitarPermiso}
          className="w-full py-2.5 rounded-xl bg-brand/20 text-brand border border-brand/40 font-bold text-sm">
          Activar notificaciones del navegador
        </button>
      )}
      {permiso === 'denied' && (
        <p className="text-xs text-loss leading-snug">
          Notificaciones bloqueadas. Ve a Configuración del navegador → Permisos del sitio → Notificaciones → Permitir.
        </p>
      )}

      {/* ── Telegram conectado ── */}
      {tgConfig && !showTgForm && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-300">✈️ Telegram activo</p>
            <p className="text-[11px] text-gray-500">@Bitray_alertas_bot · Las alertas llegan aunque la app esté cerrada</p>
          </div>
          <button onClick={desconectarTelegram} className="text-[11px] text-gray-500 underline ml-3 shrink-0">
            Desconectar
          </button>
        </div>
      )}

      {/* ── Formulario Telegram ── */}
      {!tgConfig && !showTgForm && (
        <button onClick={() => setShowTgForm(true)}
          className="w-full py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold text-sm">
          ✈️ Conectar Telegram
        </button>
      )}

      {showTgForm && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-300">Configurar Telegram</p>
          <div>
            <label className="label">Token del bot</label>
            <input className="field text-xs font-mono" value={token}
              onChange={e => setToken(e.target.value)} placeholder="123456:ABC..." />
          </div>
          <div>
            <label className="label">Tu Chat ID</label>
            <input className="field text-xs font-mono" value={chatId}
              onChange={e => setChatId(e.target.value)} placeholder="179616148" />
          </div>
          {tgStatus === 'error' && (
            <p className="text-xs text-loss">No se pudo enviar. Verifica el token y chat ID.</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowTgForm(false)}
              className="flex-1 py-2 rounded-xl border border-ink-600 text-gray-400 text-sm font-semibold">
              Cancelar
            </button>
            <button onClick={guardarTelegram}
              className="flex-1 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 text-sm font-bold">
              Guardar y probar
            </button>
          </div>
        </div>
      )}

      {/* ── Instalar PWA ── */}
      {permiso === 'granted' && (
        <div className="bg-ink-800 rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-[11px] font-semibold text-gray-300">📱 Alertas con la app cerrada</p>
          <p className="text-[11px] text-gray-500 leading-snug">
            Instala BitRay: Chrome → 3 puntos → <strong className="text-gray-300">Añadir a pantalla de inicio</strong>. Telegram ya funciona aunque la app esté cerrada.
          </p>
        </div>
      )}
    </div>
  )
}
