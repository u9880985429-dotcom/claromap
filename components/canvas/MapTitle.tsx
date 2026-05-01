'use client'

import { useState } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { updateMapAction } from '@/app/(dashboard)/maps/[id]/actions'

interface Props {
  initialTitle: string
  mapId: string
}

export function MapTitle({ initialTitle, mapId }: Props) {
  const storeTitle = useMapStore((s) => s.map?.title) ?? initialTitle
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <Editor mapId={mapId} initial={storeTitle} onDone={() => setEditing(false)} />
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full truncate rounded px-2 py-0.5 text-left font-display text-lg font-semibold transition hover:bg-bg3"
      title={`Klick zum Umbenennen: ${storeTitle}`}
    >
      {storeTitle}
    </button>
  )
}

function Editor({
  mapId,
  initial,
  onDone,
}: {
  mapId: string
  initial: string
  onDone: () => void
}) {
  const commit = async (value: string) => {
    onDone()
    const trimmed = value.trim() || 'Neue Map'
    if (trimmed !== initial) {
      useMapStore.getState().patchMapLocal({ title: trimmed })
      try {
        const updated = await updateMapAction(mapId, { title: trimmed })
        useMapStore.getState().upsertMap(updated)
      } catch (err) {
        console.error('Titel speichern fehlgeschlagen', err)
      }
    }
  }

  return (
    <input
      autoFocus
      defaultValue={initial}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit((e.target as HTMLInputElement).value)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onDone()
        }
      }}
      className="min-w-0 max-w-sm rounded border border-accent bg-bg2 px-2 py-0.5 font-display text-lg font-semibold outline-none"
    />
  )
}
