'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createMap, deleteMap } from '@/lib/data/maps'
import { getTemplate } from '@/lib/data/templates'

export async function createMapAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim() || 'Neue Map'

  const map = await createMap({ title })

  revalidatePath('/maps')
  redirect(`/maps/${map.id}`)
}

export async function createMapFromTemplateAction(
  templateId: string,
  customTitle?: string,
) {
  const template = getTemplate(templateId)
  if (!template) throw new Error(`Template not found: ${templateId}`)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  // 1. Map erstellen
  const { data: map, error: mapErr } = await supabase
    .from('maps')
    .insert({
      user_id: user.id,
      title: customTitle?.trim() || template.name,
      description: template.description,
      background_pattern: template.preferredBackgroundPattern ?? 'dots',
      theme: template.preferredTheme ?? 'default',
    })
    .select()
    .single()
  if (mapErr) throw mapErr

  if (template.nodes.length === 0) {
    revalidatePath('/maps')
    redirect(`/maps/${map.id}`)
  }

  // 2. Knoten einfügen (parent_node_id wird in einem zweiten Pass gesetzt,
  // weil wir die echten IDs erst nach dem Insert kennen)
  const nodesToInsert = template.nodes.map((n) => ({
    map_id: map.id,
    step_number: n.step_number,
    emoji: n.emoji ?? '📌',
    name: n.name,
    short_desc: n.short_desc ?? null,
    description: n.description ?? null,
    color: n.color ?? '#4A9EFF',
    text_color: n.text_color ?? '#FFFFFF',
    shape: n.shape ?? '20%',
    width: n.width ?? 130,
    height: n.height ?? 130,
    position_x: n.position_x,
    position_y: n.position_y,
    status: n.status ?? 'idea',
    status_icon: n.status_icon ?? '🌱',
    progress: n.progress ?? 0,
    lane: n.lane ?? null,
    start_date: n.start_date ?? null,
    end_date: n.end_date ?? null,
    locked: n.locked ?? false,
    label_position: n.label_position ?? 'center',
  }))

  const { data: insertedNodes, error: nodesErr } = await supabase
    .from('nodes')
    .insert(nodesToInsert)
    .select()
  if (nodesErr) throw nodesErr

  // step_number → DB-ID Mapping
  const stepToId = new Map<number, string>()
  for (const n of insertedNodes ?? []) stepToId.set(n.step_number, n.id)

  // 3. parent_node_id in zweiter Runde setzen
  const parentUpdates = template.nodes.filter(
    (n) => n.parent_step !== undefined,
  )
  for (const n of parentUpdates) {
    const childId = stepToId.get(n.step_number)
    const parentId = stepToId.get(n.parent_step!)
    if (!childId || !parentId) continue
    await supabase
      .from('nodes')
      .update({ parent_node_id: parentId })
      .eq('id', childId)
  }

  // 4. Connections einfügen
  if (template.connections.length > 0) {
    const connsToInsert = template.connections
      .map((c) => {
        const fromId = stepToId.get(c.from_step)
        const toId = stepToId.get(c.to_step)
        if (!fromId || !toId) return null
        return {
          map_id: map.id,
          from_node_id: fromId,
          to_node_id: toId,
          number: c.number ?? null,
          step_label: c.step_label ?? null,
          color: c.color ?? '#9CA3AF',
          line_style: c.line_style ?? 'solid',
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)

    if (connsToInsert.length > 0) {
      const { error: connErr } = await supabase
        .from('connections')
        .insert(connsToInsert)
      if (connErr) throw connErr
    }
  }

  revalidatePath('/maps')
  redirect(`/maps/${map.id}`)
}

export async function deleteMapAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await deleteMap(id)
  revalidatePath('/maps')
}
