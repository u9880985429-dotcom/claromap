'use client'

import { useState } from 'react'
import { Settings, Magnet } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore, type Theme } from '@/stores/uiStore'
import { updateMapAction } from '@/app/(dashboard)/maps/[id]/actions'
import { ColorPicker } from './pickers/ColorPicker'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'hand', label: 'Hand-Drawn' },
]

const PATTERNS = [
  { value: 'dots', label: 'Punkte' },
  { value: 'grid', label: 'Raster' },
  { value: 'lines', label: 'Linien' },
  { value: 'cross', label: 'Hatch' },
  { value: 'none', label: 'Keine' },
] as const

export function MapSettings() {
  const [open, setOpen] = useState(false)
  const map = useMapStore((s) => s.map)
  const setTheme = useUIStore((s) => s.setTheme)
  const snapToGrid = useUIStore((s) => s.snapToGrid)
  const toggleSnap = useUIStore((s) => s.toggleSnapToGrid)

  if (!map) return null

  const patchAndSave = async (patch: {
    theme?: string
    background_pattern?: string
    background_color?: string
  }) => {
    useMapStore.getState().patchMapLocal(patch)
    if (patch.theme) setTheme(patch.theme as Theme)
    try {
      const updated = await updateMapAction(map.id, patch)
      useMapStore.getState().upsertMap(updated)
    } catch (err) {
      console.error('Map-Setting speichern fehlgeschlagen', err)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-line bg-bg2 px-2.5 py-1 text-xs text-text2 transition hover:bg-bg3"
      >
        <Settings size={14} />
        <span>Settings</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 space-y-4 rounded-lg border border-line bg-bg2 p-4 shadow-strong">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => patchAndSave({ theme: t.value })}
                    className={`rounded-md border px-2 py-1.5 text-xs transition ${
                      map.theme === t.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
                Hintergrund-Muster
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PATTERNS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      patchAndSave({ background_pattern: p.value })
                    }
                    className={`rounded-md border px-2 py-1.5 text-xs transition ${
                      map.background_pattern === p.value
                        ? 'border-accent bg-accent/10 text-text'
                        : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ColorPicker
                label="Hintergrund-Farbe"
                value={map.background_color}
                onChange={(c) => patchAndSave({ background_color: c })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
                Verhalten
              </label>
              <button
                type="button"
                onClick={toggleSnap}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                  snapToGrid
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line2 bg-bg2 text-text2 hover:bg-bg3'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Magnet size={14} />
                  Am Raster ausrichten (24px)
                </span>
                <span className="font-mono text-xs">
                  {snapToGrid ? 'AN' : 'AUS'}
                </span>
              </button>
              <p className="mt-1 text-xs text-text4">
                Knoten rasten beim Ziehen an einem 24-Pixel-Raster ein.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
