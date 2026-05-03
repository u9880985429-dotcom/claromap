import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Admin-Client mit Service-Role-Key — umgeht RLS!
 *
 * Wird ausschließlich für API-Endpoints genutzt, die per Bearer-Token
 * authentifiziert sind. Nach Token-Verifikation kennen wir die user_id
 * und filtern dann selbst manuell auf .eq('user_id', userId).
 *
 * NIEMALS auf den Client geben oder in einer Client Component nutzen.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Service-Role-Key fehlt. Setze SUPABASE_SERVICE_ROLE_KEY in der .env.local. ' +
        'Findest du im Supabase-Dashboard unter Settings → API → service_role.',
    )
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
