import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type Annotation = Database['public']['Tables']['annotations']['Row']
export type AnnotationInsert =
  Database['public']['Tables']['annotations']['Insert']
export type AnnotationUpdate =
  Database['public']['Tables']['annotations']['Update']

/**
 * Listet alle Annotations einer Map. Die annotations-Tabelle hat keinen
 * direkten map_id-Verweis, also joinen wir über nodes.map_id.
 */
export async function listAnnotationsByMap(
  mapId: string,
): Promise<Annotation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('annotations')
    .select('*, nodes!inner(map_id)')
    .eq('nodes.map_id', mapId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => {
    const { nodes, ...rest } = row as Annotation & { nodes: unknown }
    void nodes
    return rest as Annotation
  })
}

export async function createAnnotation(
  input: Omit<AnnotationInsert, 'user_id'>,
): Promise<Annotation> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data, error } = await supabase
    .from('annotations')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAnnotation(
  id: string,
  patch: AnnotationUpdate,
): Promise<Annotation> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('annotations')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAnnotation(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('annotations').delete().eq('id', id)
  if (error) throw error
}
