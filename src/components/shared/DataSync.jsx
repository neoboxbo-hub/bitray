import { useState } from 'react'

const KEYS = ['bitray.cofre', 'bitray.cosecha', 'bitray.turbo']

export default function DataSync() {
  const [open, setOpen]         = useState(false)
  const [mode, setMode]         = useState(null)   // 'export' | 'import'
  const [code, setCode]         = useState('')
  const [copied, setCopied]     = useState(false)
  const [importError, setImportError] = useState('')
  const [importOk, setImportOk] = useState(false)

  const handleExport = () => {
    const data = {}
    KEYS.forEach((k) => {
      const v = localStorage.getItem(k)
      if (v) data[k] = JSON.parse(v)
    })
    setCode(btoa(JSON.stringify(data)))
    setMode('export')
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleImport = () => {
    setImportError('')
    setImportOk(false)
    try {
      const data = JSON.parse(atob(code.trim()))
      KEYS.forEach((k) => {
        if (data[k] !== undefined) {
          localStorage.setItem(k, JSON.stringify(data[k]))
        }
      })
      setImportOk(true)
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      setImportError('Código inválido. Asegúrate de copiar el texto completo.')
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => { setOpen((v) => !v); setMode(null); setCode('') }}
        className="w-full p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔄</span>
          <div className="text-left">
            <p className="font-semibold text-sm">Sincronizar datos</p>
            <p className="text-xs text-gray-500">Exporta o importa tu portafolio entre dispositivos</p>
          </div>
        </div>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-ink-600 pt-3">
          {/* Botones modo */}
          {mode === null && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="py-3 rounded-xl bg-brand/15 border border-brand/30 text-brand text-sm font-semibold active:scale-[0.98]"
              >
                📤 Exportar
              </button>
              <button
                onClick={() => { setMode('import'); setCode('') }}
                className="py-3 rounded-xl bg-ink-700 border border-ink-600 text-gray-300 text-sm font-semibold active:scale-[0.98]"
              >
                📥 Importar
              </button>
            </div>
          )}

          {/* Export */}
          {mode === 'export' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Copia este código y pégalo en la otra pantalla usando el botón <strong className="text-gray-200">Importar</strong>.
              </p>
              <textarea
                readOnly
                value={code}
                rows={4}
                className="field text-[11px] font-mono resize-none w-full"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={handleCopy}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  copied
                    ? 'bg-profit/20 text-profit border border-profit/40'
                    : 'btn-primary'
                }`}
              >
                {copied ? '✓ Copiado' : 'Copiar código'}
              </button>
              <button onClick={() => setMode(null)} className="w-full text-xs text-gray-500 py-1">
                ← Volver
              </button>
            </div>
          )}

          {/* Import */}
          {mode === 'import' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Pega aquí el código que copiaste desde el otro dispositivo. Tus datos actuales serán reemplazados.
              </p>
              <textarea
                rows={4}
                className="field text-[11px] font-mono resize-none w-full"
                placeholder="Pega el código aquí…"
                value={code}
                onChange={(e) => { setCode(e.target.value); setImportError('') }}
              />
              {importError && (
                <p className="text-xs text-loss">{importError}</p>
              )}
              {importOk && (
                <p className="text-xs text-profit">✓ Datos importados. Recargando…</p>
              )}
              <button
                onClick={handleImport}
                disabled={!code.trim()}
                className="w-full py-3 rounded-xl bg-profit/20 border border-profit/40 text-profit text-sm font-bold disabled:opacity-40 active:scale-[0.98]"
              >
                Importar y recargar
              </button>
              <button onClick={() => setMode(null)} className="w-full text-xs text-gray-500 py-1">
                ← Volver
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
