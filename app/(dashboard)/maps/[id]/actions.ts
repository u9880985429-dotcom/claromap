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
