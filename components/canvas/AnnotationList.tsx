'use client'

import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useMapStore, type AnnotationRow } from '@/stores/mapStore'
import {
  createAnnotationAction,
  deleteAnnotationAction,
  updateAnnotationAction,
} from '@/app/(dashboard)/maps/[id]/actions'
import { savedAction } from '@/lib/utils/savedAction'

interface Props {
  nodeId: string
}

/**
 * Annotations = freie Notizen / Kommentare, die ein Nutzer einem Knoten
 * anhängt. Jede Annotation gehört einem User (RLS) und ist ans Node gebunden.
 * Im Self-Use-Pfad ist es ein Notizfeld; sobald Teams kommen, wird daraus
 * automatisch eine Kommentar-Spur.
 */
export function AnnotationList({ nodeId }: Props) {
  const allAnnotations = useMapStore((s) => s.annotations)
  const annotations = useMemo(
    () =>
      allAnnotations
        .filter((a) => a.node_id === nodeId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [allAnnotations, nodeId],
  )

  const [newText, setNewText] = useState('')

  const onAdd = async () => {
    const text = newText.trim()
    if (!text) return
    setNewText('')

    const tempId = `temp-anno-${Date.now()}`
    const tempAnno: AnnotationRow = {
      id: tempId,
      node_id: nodeId,
      user_id: '',
      text,
      created_at: new Date().toISOString(),
    }
    useMapStore.getState().upsertAnnotation(tempAnno)

    try {
      const real = await savedAction(() =>
        createAnnotationAction({ node_id: nodeId, text }),
      )
      useMapStore.setState((s) => ({
        annotations: s.annotations.map((a) =>
          a.id === tempId ? real : a,
        ),
      }))
    } catch (err) {
      console.error('Notiz konnte nicht erstellt werden', err)
      useMapStore.getState().removeAnnotation(tempId)
    }
  }

  const onDelete = async (id: string) => {
    const before = useMapStore.getState().annotations.find((a) => a.id === id)
    useMapStore.getState().removeAnnotation(id)
    try {
      await savedAction(() => deleteAnnotationAction(id))
    } catch (err) {
      // optimistic rollback
      if (before) useMapStore.getState().upsertAnnotation(before)
      console.error('Notiz konnte nicht gelöscht werden', err)
    }
  }

  const onEditBlur = async (a: AnnotationRow, value: string) => {
    const next = value.trim()
    if (!next || next === a.text) return
    const before = a.text
    useMapStore.getState().patchAnnotationLocal(a.id, { text: next })
    try {
      await savedAction(() =>
        updateAnnotationAction(a.id, { text: next }),
      )
    } catch (err) {
      useMapStore.getState().patchAnnotationLocal(a.id, { text: before })
      console.error(err)
    }
  }

  return (
    <div className="space-y-2">
      {annotations.length === 0 && (
        <p className="text-xs italic text-text4">
          Noch keine Notizen. Schreib unten was rein, das hilft dir später.
        </p>
      )}
      {annotations.map((a) => (
        <div
          key={a.id}
          className="group flex items-start gap-2 rounded-md bg-bg3 px-2 py-1.5"
        >
          <textarea
            defaultValue={a.text}
            onBlur={(e) => onEditBlur(a, e.target.value)}
            rows={2}
            className="flex-1 resize-y bg-transparent text-sm text-text2 outline-none"
            aria-label="Notiz bearbeiten"
          />
          <button
            type="button"
            onClick={() => onDelete(a.id)}
            className="mt-0.5 text-text4 opacity-0 transition hover:text-red group-hover:opacity-100"
            aria-label="Notiz löschen"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex items-start gap-2">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter sendet
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          placeholder="Neue Notiz… (Cmd+Enter)"
          rows={2}
          className="flex-1 resize-y rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!newText.trim()}
          className="rounded-md bg-accent/10 p-1.5 text-accent transition hover:bg-accent/20 disabled:opacity-30"
          aria-label="Notiz hinzufügen"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
