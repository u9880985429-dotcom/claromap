import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type Connection = Database['public']['Tables']['connections']['Row']
export type ConnectionInsert =
  Database['public']['Tables']['connections']['Insert']

export async function listConnectionsByMap(
  mapId: string,
): Promise<Connection[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('map_id', mapId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createConnection(
  input: ConnectionInsert,
): Promise<Connection> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('connections')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteConnection(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('connections').delete().eq('id', id)
  if (error) throw error
}
