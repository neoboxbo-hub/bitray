import { usePortfolio } from '../../context/PortfolioContext'

export default function DataSync() {
  const { syncStatus, syncedAt } = usePortfolio()

  const config = {
    loading: { dot: 'bg-gray-400 animate-pulse', texto: 'Sincronizando con la nube…',      sub: 'Cargando tus datos desde Supabase' },
    synced:  { dot: 'bg-profit animate-pulse',   texto: 'Datos sincronizados ☁️',          sub: syncedAt ? `Última sync: ${syncedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : '' },
    local:   { dot: 'bg-yellow-400',             texto: 'Modo local (sin nube)',            sub: 'Sin conexión a Supabase · datos guardados en este dispositivo' },
    error:   { dot: 'bg-loss',                   texto: 'Error de sincronización',          sub: 'No se pudo conectar a Supabase' },
  }

  const { dot, texto, sub } = config[syncStatus] ?? config.local

  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{texto}</p>
        {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
      </div>
      <span className="text-xl shrink-0">☁️</span>
    </div>
  )
}
