import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client used solely for Realtime broadcast subscriptions in the
 * agent inbox (channel `chat:{conversationId}`). Sensitive data flows
 * through the authenticated backend API — we never SELECT rows from the
 * browser using the anon key.
 *
 * Realtime channel auth is by channel name only (UUID secrecy); see the
 * threat-model discussion in crevo-backend's migration 032_chat.sql.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — chat inbox real-time updates will not work. See .env.example.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  realtime: { params: { eventsPerSecond: 10 } },
})
