import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type Map = Database['public']['Tables']['maps']['Row']
export type MapInsert = Database['public']['Tables']['maps']['Insert']
export type MapUpdate = Database['public']['Tables']['maps']['Update']

export async function listMaps(): Promise<Map[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getMap(id: string): Promise<Map | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maps')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createMap(
  input: Omit<MapInsert, 'user_id'>,
): Promise<Map> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data, error } = await supabase
    .from('maps')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMap(id: string, patch: MapUpdate): Promise<Map> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maps')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMap(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('maps').delete().eq('id', id)
  if (error) throw error
}
