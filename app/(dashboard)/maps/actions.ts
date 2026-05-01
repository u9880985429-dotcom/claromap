'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createMap, deleteMap } from '@/lib/data/maps'

export async function createMapAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim() || 'Neue Map'

  const map = await createMap({ title })

  revalidatePath('/maps')
  redirect(`/maps/${map.id}`)
}

export async function deleteMapAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  await deleteMap(id)
  revalidatePath('/maps')
}
