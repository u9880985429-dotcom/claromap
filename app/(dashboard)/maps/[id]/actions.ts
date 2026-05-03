'use server'

import { revalidatePath } from 'next/cache'
import {
  createNode,
  deleteNode,
  updateNode,
  type NodeInsert,
  type NodeUpdate,
} from '@/lib/data/nodes'
import {
  createConnection,
  deleteConnection,
  type ConnectionInsert,
} from '@/lib/data/connections'
import { updateMap, type MapUpdate } from '@/lib/data/maps'
import { createClient } from '@/lib/supabase/server'
import {
  createTask,
  deleteTask,
  updateTask,
  type TaskInsert,
  type TaskUpdate,
} from '@/lib/data/tasks'
import {
  createAnnotation,
  deleteAnnotation,
  updateAnnotation,
  type AnnotationUpdate,
} from '@/lib/data/annotations'
import { getTemplate } from '@/lib/data/templates'

// ---------- MAPS ----------
export async function updateMapAction(id: string, patch: MapUpdate) {
  const result = await updateMap(id, patch)
  revalidatePath(`/maps/${id}`)
  return result
}

// ---------- NODES ----------
export async function createNodeAction(input: NodeInsert) {
  return await createNode(input)
}

export async function updateNodeAction(id: string, patch: NodeUpdate) {
  return await updateNode(id, patch)
}

export async function deleteNodeAction(id: string) {
  await deleteNode(id)
}

// ---------- CONNECTIONS ----------
export async function createConnectionAction(input: ConnectionInsert) {
  return await createConnection(input)
}

export async function updateConnectionAction(
  id: string,
  patch: {
    step_label?: string | null
    number?: number | null
    color?: string | null
    line_style?: 'solid' | 'dashed' | 'dotted'
    stroke_width?: 'thin' | 'medium' | 'thick'
    animation?: 'none' | 'pulse' | 'glow'
    from_node_id?: string | null
    to_node_id?: string | null
    from_x?: number | null
    from_y?: number | null
    to_x?: number | null
    to_y?: number | null
  },
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('connections')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteConnectionAction(id: string) {
  await deleteConnection(id)
}

// ---------- TEMPLATES (in bestehende Map einfügen) ----------
export async function applyTemplateToMapAction(
  mapId: string,
  templateId: string,
) {
  const template = getTemplate(templateId)
  if (!template) throw new Error(`Template not found: ${templateId}`)
  if (template.nodes.length === 0) {
    return { added: 0 } // leere Vorlage = no-op
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  // Existing nodes für Offset-Berechnung
  const { data: existing, error: existErr } = await supabase
    .from('nodes')
    .select('step_number, position_x, position_y, width')
    .eq('map_id', mapId)
  if (existErr) throw existErr

  let stepOffset = 0
  let posOffsetX = 0
  if (existing && existing.length > 0) {
    stepOffset = Math.max(...existing.map((n) => n.step_number))
    // Rechts vom bisherigen Content einfügen, mit 120px Abstand
    const maxRight = Math.max(
      ...existing.map((n) => n.position_x + n.width),
    )
    posOffsetX = maxRight + 120
  }

  // Knoten einfügen (mit step + position offset)
  const nodesToInsert = template.nodes.map((n) => ({
    map_id: mapId,
    step_number: n.step_number + stepOffset,
    emoji: n.emoji ?? '📌',
    name: n.name,
    short_desc: n.short_desc ?? null,
    description: n.description ?? null,
    color: n.color ?? '#4A9EFF',
    text_color: n.text_color ?? '#FFFFFF',
    shape: n.shape ?? '20%',
    width: n.width ?? 130,
    height: n.height ?? 130,
    position_x: n.position_x + posOffsetX,
    position_y: n.position_y,
    status: n.status ?? 'idea',
    status_icon: n.status_icon ?? '🌱',
    progress: n.progress ?? 0,
    lane: n.lane ?? null,
    start_date: n.start_date ?? null,
    end_date: n.end_date ?? null,
    locked: n.locked ?? false,
  }))

  const { data: insertedNodes, error: nodesErr } = await supabase
    .from('nodes')
    .insert(nodesToInsert)
    .select()
  if (nodesErr) throw nodesErr

  // step_number (mit offset) → DB-ID Mapping
  const stepToId = new Map<number, string>()
  for (const n of insertedNodes ?? []) stepToId.set(n.step_number, n.id)

  // parent_node_id setzen (parent_step bezieht sich auf ORIGINAL step,
  // wir müssen den offset addieren)
  for (const n of template.nodes) {
    if (n.parent_step === undefined) continue
    const childId = stepToId.get(n.step_number + stepOffset)
    const parentId = stepToId.get(n.parent_step + stepOffset)
    if (!childId || !parentId) continue
    await supabase
      .from('nodes')
      .update({ parent_node_id: parentId })
      .eq('id', childId)
  }

  // Connections
  if (template.connections.length > 0) {
    const connsToInsert = template.connections
      .map((c) => {
        const fromId = stepToId.get(c.from_step + stepOffset)
        const toId = stepToId.get(c.to_step + stepOffset)
        if (!fromId || !toId) return null
        return {
          map_id: mapId,
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

  revalidatePath(`/maps/${mapId}`)
  return {
    added: template.nodes.length,
    templateName: template.name,
    posOffsetX,
  }
}

// ---------- TASKS ----------
export async function createTaskAction(input: TaskInsert) {
  return await createTask(input)
}

export async function updateTaskAction(id: string, patch: TaskUpdate) {
  return await updateTask(id, patch)
}

export async function deleteTaskAction(id: string) {
  await deleteTask(id)
}

// ---------- ANNOTATIONS (Notizen / Kommentare zu einem Knoten) ----------
export async function createAnnotationAction(input: {
  node_id: string
  text: string
}) {
  return await createAnnotation(input)
}

export async function updateAnnotationAction(
  id: string,
  patch: AnnotationUpdate,
) {
  return await updateAnnotation(id, patch)
}

export async function deleteAnnotationAction(id: string) {
  await deleteAnnotation(id)
}
