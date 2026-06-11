import { useState } from 'react'
import { fmtUsd, fmtNum } from '../../utils/calculations'
import ConfirmDialog from './ConfirmDialog'

// Historial unificado de compras y ventas de un token.
// transacciones: array con tipo 'compra' | 'venta', cantidad, precio, fecha, id.
// precioPromedio: para calcular PnL de cada venta.
export default function TransactionHistory({
  transacciones,
  precioPromedio,
  onUpdate,
  onDelete,
  symbol,
}) {
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({ cantidad: '', precio: '', fecha: '' })
  const [confirmDel, setConfirmDel] = useState(null)

  const startEdit = (t) => {
    setEditId(t.id)
    setEditForm({ cantidad: t.cantidad.toString(), precio: t.precio.toString(), fecha: t.fecha })
  }

  const saveEdit = () => {
    const cant = parseFloat(editForm.cantidad)
    const pr   = parseFloat(editForm.precio)
    if (!cant || !pr) return
    onUpdate(symbol, editId, { cantidad: cant, precio: pr, fecha: editForm.fecha })
    setEditId(null)
  }

  // Ordena del más reciente al más antiguo
  const sorted = [...transacciones].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  )

  return (
    <div className="mt-2 space-y-1.5">
      {sorted.map((t) => {
        const tipo  = t.tipo ?? 'compra'
        const total = t.cantidad * t.precio
        const pnlVenta = tipo === 'venta'
          ? (t.precio - precioPromedio) * t.cantidad
          : null

        if (editId === t.id) {
          return (
            <div key={t.id} className="bg-ink-800 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Editando {tipo}
              </p>
              <input type="date" className="field py-1.5 text-sm"
                value={editForm.fecha}
                onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" inputMode="decimal" className="field py-1.5 text-sm"
                  placeholder="Cantidad"
                  value={editForm.cantidad}
                  onChange={(e) => setEditForm({ ...editForm, cantidad: e.target.value })} />
                <input type="number" inputMode="decimal" className="field py-1.5 text-sm"
                  placeholder="Precio"
                  value={editForm.precio}
                  onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditId(null)}
                  className="flex-1 py-1.5 rounded-lg border border-ink-600 text-gray-400 text-xs font-semibold">
                  Cancelar
                </button>
                <button onClick={saveEdit}
                  className="btn-primary flex-1 py-1.5 text-xs">
                  Guardar
                </button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border ${
              tipo === 'compra'
                ? 'bg-profit/5 border-profit/20'
                : 'bg-loss/5 border-loss/20'
            }`}
          >
            {/* Badge tipo */}
            <span className={`chip text-[10px] shrink-0 ${
              tipo === 'compra'
                ? 'bg-profit/20 text-profit'
                : 'bg-loss/20 text-loss'
            }`}>
              {tipo === 'compra' ? '▲ Compra' : '▼ Venta'}
            </span>

            {/* Datos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm tabular-nums font-medium">
                {fmtNum(t.cantidad, 4)} @ {fmtUsd(t.precio, 4)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-gray-500">{t.fecha}</p>
                {pnlVenta !== null && (
                  <span className={`text-[11px] font-semibold ${
                    pnlVenta >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {pnlVenta >= 0 ? '+' : ''}{fmtUsd(pnlVenta)}
                  </span>
                )}
              </div>
            </div>

            {/* Total */}
            <p className="text-xs tabular-nums text-gray-400 shrink-0">
              {fmtUsd(total)}
            </p>

            {/* Acciones */}
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(t)}
                className="h-7 w-7 rounded-md border border-ink-600 text-gray-400 active:text-brand text-xs">
                ✏️
              </button>
              <button onClick={() => setConfirmDel(t.id)}
                className="h-7 w-7 rounded-md border border-ink-600 text-loss/70 active:text-loss text-xs">
                🗑
              </button>
            </div>
          </div>
        )
      })}

      {transacciones.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-3">
          Sin transacciones registradas.
        </p>
      )}

      <ConfirmDialog
        open={confirmDel !== null}
        title="¿Eliminar esta transacción?"
        message="Se elimina el registro. Los promedios se recalculan."
        confirmText="Sí, eliminar"
        onConfirm={() => { onDelete(symbol, confirmDel); setConfirmDel(null) }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}
