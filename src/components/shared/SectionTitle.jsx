export default function SectionTitle({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        {children}
      </h2>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  )
}
