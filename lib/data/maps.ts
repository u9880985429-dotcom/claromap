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

export type MapPreviewNode = {
  position_x: number
  position_y: number
  width: number
  height: number
  color: string
  shape: string
}

export type MapWithStats = Map & {
  node_count: number
  connection_count: number
  preview_nodes: MapPreviewNode[]
}

/**
 * Listet alle Maps + Stats (Knoten-Anzahl, Verbindungs-Anzahl, max 30 Knoten
 * für eine Mini-Vorschau auf der Maps-Liste).
 */
export async function listMapsWithStats(): Promise<MapWithStats[]> {
  const supabase = await createClient()

  const { data: maps, error } = await supabase
    .from('maps')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  if (!maps || maps.length === 0) return []

  // Alle Knoten für Vorschau holen — auf 30 pro Map begrenzt für Performance
  const mapIds = maps.map((m) => m.id)
  const { data: previewNodes } = await supabase
    .from('nodes')
    .select('map_id, position_x, position_y, width, height, color, shape')
    .in('map_id', mapIds)

  const { data: connStats } = await supabase
    .from('connections')
    .select('map_id')
    .in('map_id', mapIds)

  const nodesByMap = new Map<string, MapPreviewNode[]>()
  const nodeCountByMap = new Map<string, number>()
  for (const n of previewNodes ?? []) {
    const arr = nodesByMap.get(n.map_id) ?? []
    if (arr.length < 30) arr.push(n)
    nodesByMap.set(n.map_id, arr)
    nodeCountByMap.set(n.map_id, (nodeCountByMap.get(n.map_id) ?? 0) + 1)
  }

  const connCountByMap = new Map<string, number>()
  for (const c of connStats ?? []) {
    connCountByMap.set(c.map_id, (connCountByMap.get(c.map_id) ?? 0) + 1)
  }

  return maps.map((m) => ({
    ...m,
    node_count: nodeCountByMap.get(m.id) ?? 0,
    connection_count: connCountByMap.get(m.id) ?? 0,
    preview_nodes: nodesByMap.get(m.id) ?? [],
  }))
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
