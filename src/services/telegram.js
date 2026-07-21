// Telegram Bot API — envía mensajes directamente sin backend
// El token y chat_id se guardan en localStorage (configurados por el usuario)

const TG_KEY = 'bitray.tg'

export function getTgConfig() {
  try { return JSON.parse(localStorage.getItem(TG_KEY)) || null } catch { return null }
}

export function setTgConfig(token, chatId) {
  localStorage.setItem(TG_KEY, JSON.stringify({ token, chatId }))
}

export function clearTgConfig() {
  localStorage.removeItem(TG_KEY)
}

export async function sendTelegram(texto) {
  const cfg = getTgConfig()
  if (!cfg?.token || !cfg?.chatId) return false

  try {
    const url = `https://api.telegram.org/bot${cfg.token}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text: texto,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function testTelegram() {
  return sendTelegram(
    '✅ <b>BitRay conectado</b>\n\nRecibirás alertas de precio aquí cuando tus tokens se muevan.\n\n<i>Bitray · Estrategia Cripto</i>'
  )
}
