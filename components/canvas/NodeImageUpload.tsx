'use client'

import { useState, useRef } from 'react'
import { Upload, ImageOff, Loader2 } from 'lucide-react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { createClient } from '@/lib/supabase/client'
import { updateNodeAction } from '@/app/(dashboard)/maps/[id]/actions'
import { savedAction } from '@/lib/utils/savedAction'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

interface Props {
  node: NodeRow
}

/**
 * Bild-Upload für einen Knoten. Datei landet in supabase-storage
 * (`node-images`-Bucket, Pfad: `{user_id}/{file_uuid}.{ext}`).
 * Anschließend wird die public-URL in `nodes.image_url` gespeichert.
 *
 * Begrenzungen:
 * - Max 5 MB pro Bild (Bucket-Limit)
 * - Nur Bild-MIME-Types
 *
 * Bild als Knoten-Hintergrund: Node.tsx rendert image_url als
 * background-image (cover) wenn gesetzt.
 */
export function NodeImageUpload({ node }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPick = () => fileRef.current?.click()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // damit man dasselbe Bild erneut wählen kann
    if (!file) return

    setError(null)
    if (!ALLOWED.includes(file.type)) {
      setError('Bitte ein Bild wählen (PNG, JPG, WebP, GIF, SVG).')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Das Bild ist zu groß. Maximal 5 MB.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht eingeloggt')

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      // Eindeutiger Dateiname → kein Cache-Konflikt nach Re-Upload
      const fileName = `${user.id}/${node.id}-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('node-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('node-images')
        .getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl
      if (!publicUrl) throw new Error('Konnte URL nicht erzeugen.')

      // Lokal optimistic + server-side persistieren
      useMapStore.getState().patchNodeLocal(node.id, { image_url: publicUrl })
      await savedAction(() =>
        updateNodeAction(node.id, { image_url: publicUrl }),
      )
    } catch (err) {
      console.error('Bild-Upload fehlgeschlagen', err)
      setError('Upload hat nicht geklappt. Bitte erneut versuchen.')
    } finally {
      setUploading(false)
    }
  }

  const onRemove = async () => {
    setError(null)
    useMapStore.getState().patchNodeLocal(node.id, { image_url: null })
    try {
      await savedAction(() =>
        updateNodeAction(node.id, { image_url: null }),
      )
      // Datei bleibt im Storage (Cleanup-Job später) — wäre sonst Race-Condition
      // bei Undo. Bei einer späteren Performance-Iteration kann ein Trigger
      // die Datei beim image_url=null löschen.
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-2">
      {node.image_url ? (
        <div className="relative overflow-hidden rounded-md border border-line2 bg-bg3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.image_url}
            alt={`Bild für ${node.name}`}
            className="h-32 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-line2 bg-bg3 text-xs text-text4">
          Noch kein Bild
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={onChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line2 bg-bg2 px-2.5 py-1.5 text-sm font-medium text-text2 transition hover:bg-bg3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Lädt hoch …</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>{node.image_url ? 'Anderes Bild' : 'Bild auswählen'}</span>
            </>
          )}
        </button>
        {node.image_url && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="flex items-center justify-center gap-1.5 rounded-md border border-red/30 bg-red/5 px-2.5 py-1.5 text-sm font-medium text-red transition hover:bg-red/10 disabled:opacity-50"
            title="Bild entfernen"
            aria-label="Bild entfernen"
          >
            <ImageOff size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red">{error}</p>}
      <p className="text-xs text-text4">
        PNG, JPG, WebP, GIF oder SVG. Maximal 5 MB.
      </p>
    </div>
  )
}
