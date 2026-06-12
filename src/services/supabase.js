import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

// Claves que sincronizamos
export const SYNC_KEYS = ['cofre_compras', 'cofre_ventas', 'cosecha_tokens', 'turbo_tokens']

// Lee todos los datos del portafolio desde Supabase
export async function loadAllFromSupabase() {
  const { data, error } = await supabase
    .from('bitray_data')
    .select('key, value, updated_at')
    .in('key', SYNC_KEYS)

  if (error) throw error

  const result = {}
  for (const row of data) {
    result[row.key] = { value: row.value, updatedAt: row.updated_at }
  }
  return result
}

// Guarda/actualiza un valor por clave
export async function saveToSupabase(key, value) {
  const { error } = await supabase
    .from('bitray_data')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) throw error
}
