'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateToken, hashToken, tokenPrefix } from '@/lib/api-keys'

interface CreateResult {
  ok: true
  token: string // Klartext-Token — wird EINMALIG zurückgegeben, dann nur Hash
  prefix: string
}

interface ErrorResult {
  ok: false
  error: string
}

export async function createApiKeyAction(
  name: string,
): Promise<CreateResult | ErrorResult> {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Name darf nicht leer sein' }
  if (trimmed.length > 80)
    return { ok: false, error: 'Name maximal 80 Zeichen' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Nicht eingeloggt' }

  const token = generateToken()
  const hash = hashToken(token)
  const prefix = tokenPrefix(token)

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    key_hash: hash,
    key_prefix: prefix,
    name: trimmed,
  })

  if (error) {
    return {
      ok: false,
      error: `Konnte nicht gespeichert werden: ${error.message}`,
    }
  }

  revalidatePath('/settings/api-keys')
  return { ok: true, token, prefix }
}

export async function revokeApiKeyAction(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/settings/api-keys')
}

export async function deleteApiKeyAction(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  await supabase.from('api_keys').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/settings/api-keys')
}
