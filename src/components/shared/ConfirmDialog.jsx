// Modal de confirmación de seguridad reutilizable.
// Uso: <ConfirmDialog open={...} title danger onConfirm onCancel />
export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Sí, eliminar',
  cancelText = 'Cancelar',
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm p-5 animate-[slideup_.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{danger ? '⚠️' : '❓'}</span>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            {message && (
              <p className="text-sm text-gray-400 mt-1 leading-snug">{message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-ink-600 text-gray-300 font-semibold active:scale-[0.98] transition-transform"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-bold active:scale-[0.98] transition-transform ${
              danger
                ? 'bg-loss text-white'
                : 'bg-brand text-ink-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
