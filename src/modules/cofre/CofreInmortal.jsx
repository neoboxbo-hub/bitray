import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

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

      {/* ── Tarjeta principal BTC ── */}
      <section className="card p-5 bg-gradient-to-br from-brand/20 to-ink-800 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">BTC</span>
              <span className="chip bg-profit/15 text-profit text-[10px]">Núcleo</span>
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">Reserva de valor</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Bitcoin · ₿ {fmtNum(cofre.btcAcumulado, 6)} acumulados
            </p>
          </div>
          <div className="text-right">
            {cofre.usdInvertido > 0 && (
              <p className="text-[11px] text-gray-500 tabular-nums">
                inv. {fmtUsd(cofre.usdInvertido)}
              </p>
            )}
            <p className="font-semibold tabular-nums text-lg">{fmtUsd(cofre.valorActual)}</p>
            {cofre.btcAcumulado > 0 && (
              <p className={`text-xs font-medium ${up ? 'text-profit' : 'text-loss'}`}>
                {fmtPct(cofre.pnlPct)}
              </p>
            )}
          </div>
        </div>

        {cofreCompras.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-ink-800/70 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Entrada (prom.)</p>
              <p className="text-sm font-semibold tabular-nums">{fmtUsd(cofre.precioPromedio)}</p>
            </div>
            <div className="bg-ink-800/70 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Precio actual</p>
              <p className="text-sm font-semibold tabular-nums">{fmtUsd(prices.BTC)}</p>
            </div>
          </div>
        )}

        {cofreVentas.length > 0 && (
          <div className="bg-ink-800/70 rounded-lg px-3 py-2 flex justify-between items-center">
            <p className="text-[11px] text-gray-500">USD recuperados (ventas)</p>
            <p className="text-sm font-semibold tabular-nums text-profit">
              +{fmtUsd(cofre.usdRecuperado)}
            </p>
          </div>
        )}
      </section>

      {/* ── Recordatorio ── */}
      <div className="card p-4 border-brand/30 bg-brand/5 flex gap-3">
        <span className="text-2xl">👨‍👩‍👧‍👦</span>
        <p className="text-sm text-gray-300 leading-snug">
          Esto no se vende. Cada satoshi es el futuro de tu familia.
          La paciencia de hoy es la libertad de mañana.
        </p>
      </div>

      {/* ── Botones ── */}
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
