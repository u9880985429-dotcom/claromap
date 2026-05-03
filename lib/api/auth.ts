import 'server-only'
import { NextResponse } from 'next/server'
import { extractBearer, hashToken } from '@/lib/api-keys'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AuthedRequest {
  userId: string
  apiKeyId: string
}

/**
 * Verifiziert den Bearer-Token aus dem Authorization-Header.
 * Gibt entweder { userId, apiKeyId } zurück oder eine NextResponse mit
 * 401, die der Endpoint einfach durchreichen kann.
 *
 * Beispiel:
 *   const auth = await authenticate(request)
 *   if (auth instanceof NextResponse) return auth
 *   // ab hier sicher: auth.userId ist der eingeloggte User
 */
export async function authenticate(
  request: Request,
): Promise<AuthedRequest | NextResponse> {
  const token = extractBearer(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json(
      {
        error: 'missing_token',
        message:
          'Authorization-Header fehlt oder hat falsches Format. Erwartet: "Authorization: Bearer cmk_live_…"',
      },
      { status: 401 },
    )
  }

  const hash = hashToken(token)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('api_keys')
    .select('id, user_id, revoked_at')
    .eq('key_hash', hash)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      {
        error: 'invalid_token',
        message:
          'Token ist ungültig. Generiere einen neuen unter /settings/api-keys.',
      },
      { status: 401 },
    )
  }

  if (data.revoked_at) {
    return NextResponse.json(
      {
        error: 'revoked_token',
        message:
          'Dieser Token wurde widerrufen. Generiere einen neuen unter /settings/api-keys.',
      },
      { status: 401 },
    )
  }

  // last_used_at aktualisieren — fire & forget, nicht blocken
  void admin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return { userId: data.user_id, apiKeyId: data.id }
}
