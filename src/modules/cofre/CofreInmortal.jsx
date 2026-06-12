import { useState, useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

const FRASES = [
  'Cada satoshi es un voto de confianza en tu futuro. La paciencia de hoy construye la libertad de mañana.',
  'El tiempo en el mercado siempre supera al intento de cronometrar el mercado. Acumula. Espera. Vence.',
  'Bitcoin no te hace rico de la noche a la mañana. Te hace libre de por vida si tienes disciplina.',
  'Los que vendieron en cada corrección lamentan haberlo hecho. Los que aguantaron, celebran. Sé de los que aguantan.',
  'Tu Cofre no es solo dinero. Es el legado que le dejas a tu familia. No lo toques. Deja que crezca.',
]

const BtcLogo = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="#F7931A"/>
    <path d="M46.1 28.5c.6-4.2-2.6-6.5-7-8l1.4-5.8-3.5-.9-1.4 5.6c-.9-.2-1.8-.5-2.8-.7l1.4-5.7-3.5-.9-1.4 5.8c-.8-.2-1.5-.4-2.2-.5l-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.3 1.6 1.2 1.6 1.9l-1.6 6.5c.1 0 .2.1.4.1l-.4-.1-2.3 9.1c-.2.4-.6 1-1.6.8 0 .1-2.5-.6-2.5-.6l-1.7 4 4.6 1.1c.8.2 1.7.4 2.5.6l-1.5 5.9 3.5.9 1.4-5.8c.9.3 1.9.5 2.8.7L27 51.4l3.5.9 1.5-5.9c6 1.1 10.5.7 12.4-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.9-5.2v.4zm-8.7 12.2c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-12.3c-1 3.9-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.4 1.4 7.4 5.6z" fill="white"/>
  </svg>
)

export default function CofreInmortal() {
  const {
    cofre, cofreCompras, prices,
    addCompraCofre, updateCompraCofre, deleteCompraCofre, clearCofre,
    cofreVentas, addVentaCofre, deleteVentaCofre,
  } = usePortfolio()

  const [openCompra, setOpenCompra] = useState(false)
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    usd: '',
    precioBtc: prices.BTC?.toString() || '',
  })

  const [openVenta, setOpenVenta] = useState(false)
  const [ventaForm, setVentaForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    usd: '',
    precioBtc: prices.BTC?.toString() || '',
  })

  const [editId, setEditId]               = useState(null)
  const [editForm, setEditForm]           = useState({ fecha: '', usd: '', precioBtc: '' })
  const [confirmClear, setConfirmClear]   = useState(false)
  const [confirmDel, setConfirmDel]       = useState(null)
  const [confirmDelVenta, setConfirmDelVenta] = useState(null)
  const [showVentas, setShowVentas]       = useState(false)
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], [])

  const startEdit = (c) => {
    setEditId(c.id)
    setEditForm({ fecha: c.fecha, usd: c.usd.toString(), precioBtc: c.precioBtc.toString() })
  }
  const saveEdit = () => {
    const usd = parseFloat(editForm.usd)
    const precioBtc = parseFloat(editForm.precioBtc)
    if (!usd || !precioBtc) return
    updateCompraCofre(editId, { fecha: editForm.fecha, usd, precioBtc })
    setEditId(null)
  }

  const submitCompra = (e) => {
    e.preventDefault()
    const usd = parseFloat(form.usd)
    const precioBtc = parseFloat(form.precioBtc)
    if (!usd || !precioBtc) return
    addCompraCofre({ fecha: form.fecha, usd, precioBtc })
    setForm(f => ({ ...f, usd: '' }))
    setOpenCompra(false)
  }

  const submitVenta = (e) => {
    e.preventDefault()
    const usd = parseFloat(ventaForm.usd)
    const precioBtc = parseFloat(ventaForm.precioBtc)
    if (!usd || !precioBtc) return
    addVentaCofre({ fecha: ventaForm.fecha, usd, precioBtc })
    setVentaForm(f => ({ ...f, usd: '' }))
    setOpenVenta(false)
  }

  const up = cofre.pnlPct >= 0

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <h1 className="text-xl font-bold">El Cofre Inmortal</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Largo plazo · Solo Bitcoin</p>
      </header>

      {/* ── Tarjeta principal BTC — diseño premium ── */}
      {/* Borde degradado neón naranja/dorado */}
      <div
        className="rounded-2xl p-[2px]"
        style={{ background: 'linear-gradient(135deg, #F7931A 0%, #FFD700 50%, #F7931A 100%)' }}
      >
        <section className="rounded-[14px] bg-ink-800 p-5 space-y-4"
          style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f0f23 100%)' }}>

          {/* Logo + datos superiores */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-16 h-16 drop-shadow-lg">
              <BtcLogo />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xl tracking-tight" style={{ color: '#F7931A' }}>BTC</span>
                <span className="chip text-[10px]" style={{ background: 'rgba(247,147,26,0.15)', color: '#F7931A' }}>Núcleo</span>
                <span className="chip bg-ink-600 text-gray-400 text-[10px]">Reserva de valor</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                ₿ {fmtNum(cofre.btcAcumulado, 6)} acumulados
              </p>
            </div>
          </div>

          {/* Valor y PnL */}
          <div className="text-center space-y-0.5">
            {cofre.usdInvertido > 0 && (
              <p className="text-xs text-gray-500 tabular-nums">Invertido: {fmtUsd(cofre.usdInvertido)}</p>
            )}
            <p className="text-3xl font-extrabold tabular-nums"
              style={{ textShadow: '0 0 20px rgba(247,147,26,0.3)' }}>
              {fmtUsd(cofre.valorActual)}
            </p>
            {cofre.btcAcumulado > 0 && (
              <p className={`text-sm font-semibold ${up ? 'text-profit' : 'text-loss'}`}>
                {fmtPct(cofre.pnlPct)}
              </p>
            )}
          </div>

          {/* Grid precios */}
          {cofreCompras.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[10px] text-gray-500">Entrada (prom.)</p>
                <p className="text-sm font-semibold tabular-nums">{fmtUsd(cofre.precioPromedio)}</p>
              </div>
              <div className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[10px] text-gray-500">Precio actual</p>
                <p className="text-sm font-semibold tabular-nums">{fmtUsd(prices.BTC)}</p>
              </div>
            </div>
          )}

          {cofreVentas.length > 0 && (
            <div className="rounded-lg px-3 py-2 flex justify-between items-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[11px] text-gray-500">USD recuperados</p>
              <p className="text-sm font-semibold tabular-nums text-profit">+{fmtUsd(cofre.usdRecuperado)}</p>
            </div>
          )}

          {/* Frase motivacional */}
          <div className="border-t pt-3" style={{ borderColor: 'rgba(247,147,26,0.2)' }}>
            <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(247,147,26,0.75)' }}>
              ✦ {frase} ✦
            </p>
          </div>
        </section>
      </div>

      {/* ── Acciones ── */}
      {!openCompra && !openVenta && (
        <div className="flex gap-2">
          <button onClick={() => setOpenCompra(true)}
            className="flex-1 py-2.5 rounded-xl border border-ink-600 text-sm font-semibold text-profit/80 active:scale-[0.99]">
            ▲ Añadir compra
          </button>
          <button onClick={() => setOpenVenta(true)}
            className="flex-1 py-2.5 rounded-xl border border-loss/40 text-sm font-semibold text-loss/80 active:scale-[0.99]">
            ▼ Registrar venta
          </button>
        </div>
      )}

      {openCompra && (
        <form onSubmit={submitCompra} className="card p-5 space-y-3 border-profit/30">
          <p className="text-xs font-semibold text-profit uppercase tracking-wide">▲ Registrar compra BTC</p>
          <input type="date" className="field"
            value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monto (USD)</label>
              <input type="number" inputMode="decimal" className="field" placeholder="100"
                value={form.usd} onChange={e => setForm({ ...form, usd: e.target.value })} />
            </div>
            <div>
              <label className="label">Precio BTC</label>
              <input type="number" inputMode="decimal" className="field"
                value={form.precioBtc} onChange={e => setForm({ ...form, precioBtc: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpenCompra(false)}
              className="flex-1 py-3 rounded-xl border border-ink-600 text-gray-400 font-semibold">Cancelar</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-profit/20 text-profit border border-profit/40 font-bold">Guardar</button>
          </div>
        </form>
      )}

      {openVenta && (
        <form onSubmit={submitVenta} className="card p-5 space-y-3 border-loss/30">
          <p className="text-xs font-semibold text-loss uppercase tracking-wide">▼ Registrar venta BTC</p>
          <p className="text-xs text-gray-500">¿Cuántos USD recuperaste y a qué precio de BTC?</p>
          <input type="date" className="field"
            value={ventaForm.fecha} onChange={e => setVentaForm({ ...ventaForm, fecha: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">USD recuperados</label>
              <input type="number" inputMode="decimal" className="field" placeholder="500"
                value={ventaForm.usd} onChange={e => setVentaForm({ ...ventaForm, usd: e.target.value })} />
            </div>
            <div>
              <label className="label">Precio BTC</label>
              <input type="number" inputMode="decimal" className="field"
                value={ventaForm.precioBtc} onChange={e => setVentaForm({ ...ventaForm, precioBtc: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpenVenta(false)}
              className="flex-1 py-3 rounded-xl border border-ink-600 text-gray-400 font-semibold">Cancelar</button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-loss/20 text-loss border border-loss/40 font-bold">Guardar venta</button>
          </div>
        </form>
      )}

      {/* ── Ventas registradas ── */}
      {cofreVentas.length > 0 && (
        <section>
          <button onClick={() => setShowVentas(v => !v)}
            className="w-full text-xs font-medium text-loss/70 py-1 flex items-center justify-center gap-1.5">
            <span>Ventas registradas ({cofreVentas.length})</span>
            <span>{showVentas ? '▲' : '▼'}</span>
          </button>
          {showVentas && (
            <ul className="mt-2 space-y-2">
              {[...cofreVentas].reverse().map(v => (
                <li key={v.id} className="card px-4 py-3 flex items-center justify-between gap-2 border-loss/20 bg-loss/5">
                  <div>
                    <p className="text-sm font-medium text-loss">{fmtUsd(v.usd)} vendidos</p>
                    <p className="text-xs text-gray-500">{v.fecha} · @ {fmtUsd(v.precioBtc)}</p>
                  </div>
                  <p className="text-xs tabular-nums text-gray-400 shrink-0">
                    ₿ {fmtNum(v.usd / v.precioBtc, 6)}
                  </p>
                  <button onClick={() => setConfirmDelVenta(v.id)}
                    className="h-8 w-8 rounded-lg border border-ink-600 text-loss/70 shrink-0">🗑</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── Historial de compras ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Historial de compras</h2>
          {cofreCompras.length > 0 && (
            <button onClick={() => setConfirmClear(true)}
              className="text-xs font-semibold text-loss/80 active:text-loss">🗑 Limpiar</button>
          )}
        </div>
        {cofreCompras.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">Sin registros. Añade tu primera compra de BTC.</p>
        )}
        <ul className="space-y-2">
          {[...cofreCompras].reverse().map(c =>
            editId === c.id ? (
              <li key={c.id} className="card px-4 py-3 space-y-2">
                <input type="date" className="field py-2" value={editForm.fecha}
                  onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" inputMode="decimal" className="field py-2" placeholder="USD"
                    value={editForm.usd} onChange={e => setEditForm({ ...editForm, usd: e.target.value })} />
                  <input type="number" inputMode="decimal" className="field py-2" placeholder="Precio BTC"
                    value={editForm.precioBtc} onChange={e => setEditForm({ ...editForm, precioBtc: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditId(null)}
                    className="flex-1 py-2 rounded-lg border border-ink-600 text-gray-400 text-sm font-semibold">Cancelar</button>
                  <button onClick={saveEdit} className="btn-primary flex-1 py-2 text-sm">Guardar</button>
                </div>
              </li>
            ) : (
              <li key={c.id} className="card px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{fmtUsd(c.usd)}</p>
                  <p className="text-xs text-gray-500">{c.fecha}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">₿ {fmtNum(c.usd / c.precioBtc, 6)}</p>
                  <p className="text-xs text-gray-500">@ {fmtUsd(c.precioBtc)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(c)}
                    className="h-8 w-8 rounded-lg border border-ink-600 text-gray-400 active:text-brand">✏️</button>
                  <button onClick={() => setConfirmDel(c.id)}
                    className="h-8 w-8 rounded-lg border border-ink-600 text-loss/80 active:text-loss">🗑</button>
                </div>
              </li>
            )
          )}
        </ul>
      </section>

      <ConfirmDialog open={confirmClear} title="¿Limpiar historial del Cofre?"
        message="Se borrarán todos los registros de compra de BTC."
        confirmText="Sí, limpiar"
        onConfirm={() => { clearCofre(); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)} />

      <ConfirmDialog open={confirmDel !== null} title="¿Eliminar esta compra?"
        message="Se elimina solo este registro."
        confirmText="Sí, eliminar"
        onConfirm={() => { deleteCompraCofre(confirmDel); setConfirmDel(null) }}
        onCancel={() => setConfirmDel(null)} />

      <ConfirmDialog open={confirmDelVenta !== null} title="¿Eliminar esta venta?"
        message="Se elimina el registro. Los BTC vuelven a contabilizarse en el total."
        confirmText="Sí, eliminar"
        onConfirm={() => { deleteVentaCofre(confirmDelVenta); setConfirmDelVenta(null) }}
        onCancel={() => setConfirmDelVenta(null)} />
    </div>
  )
}
