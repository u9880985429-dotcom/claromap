import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type Node = Database['public']['Tables']['nodes']['Row']
export type NodeInsert = Database['public']['Tables']['nodes']['Insert']
export type NodeUpdate = Database['public']['Tables']['nodes']['Update']

export async function listNodesByMap(mapId: string): Promise<Node[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('map_id', mapId)
    .order('step_number', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createNode(input: NodeInsert): Promise<Node> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nodes')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNode(id: string, patch: NodeUpdate): Promise<Node> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nodes')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNode(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('nodes').delete().eq('id', id)
  if (error) throw error
}
