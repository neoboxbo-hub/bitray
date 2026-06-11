import { mockAINews } from '../../data/mockData'

// Resumen de sentimiento (placeholder de futura integración con Perplexity API).
export default function AINews() {
  const news = mockAINews

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold flex items-center gap-2">
          🤖 Noticias AI
        </h3>
        <span className="chip bg-blue-500/20 text-blue-300">Perplexity*</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {news.generatedAt} · Sentimiento:{' '}
        <span className="text-gray-300 font-medium">{news.sentiment}</span>
      </p>

      <ul className="space-y-3">
        {news.items.map((n) => (
          <li key={n.id} className="border-l-2 border-ink-600 pl-3">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="chip bg-ink-600 text-gray-300">{n.tag}</span>
            </div>
            <p className="text-sm font-medium leading-snug">{n.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{n.summary}</p>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-gray-600 mt-4">
        * Contenido simulado. La integración real con Perplexity llega en la Fase 2.
      </p>
    </div>
  )
}
