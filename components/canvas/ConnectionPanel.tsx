'use client'

import { X, Trash2 } from 'lucide-react'
import { useMapStore, type ConnectionRow } from '@/stores/mapStore'
import {
  deleteConnectionAction,
  updateConnectionAction,
} from '@/app/(dashboard)/maps/[id]/actions'
import { ColorPicker } from './pickers/ColorPicker'

export function ConnectionPanel() {
  const selectedConnectionId = useMapStore((s) => s.selectedConnectionId)
  const conn = useMapStore((s) =>
    s.connections.find((c) => c.id === selectedConnectionId),
  )
  if (!conn) return null
  return <ConnectionEditor key={conn.id} conn={conn} />
}

function ConnectionEditor({ conn }: { conn: ConnectionRow }) {
  const patchAndSave = async (patch: Partial<ConnectionRow>) => {
    useMapStore.getState().patchConnectionLocal(conn.id, patch)
    try {
      await updateConnectionAction(conn.id, {
        step_label: patch.step_label ?? undefined,
        number: patch.number ?? undefined,
        color: patch.color ?? undefined,
        line_style: patch.line_style as
          | 'solid'
          | 'dashed'
          | 'dotted'
          | undefined,
        stroke_width: patch.stroke_width as
          | 'thin'
          | 'medium'
          | 'thick'
          | undefined,
        animation: patch.animation as 'none' | 'pulse' | 'glow' | undefined,
      })
    } catch (err) {
      console.error('Verbindung speichern fehlgeschlagen', err)
    }
  }

  const onClose = () => useMapStore.getState().selectConnection(null)

  const onDelete = async () => {
    useMapStore.getState().removeConnection(conn.id)
    try {
      await deleteConnectionAction(conn.id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <aside className="flex h-full w-[340px] flex-col border-l border-line bg-bg2">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-text2">
          Verbindung bearbeiten
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-text3 transition hover:bg-bg3 hover:text-text"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Schritt-Nummer
          </label>
          <input
            type="number"
            min={1}
            defaultValue={conn.number ?? ''}
            placeholder="z.B. 1"
            onBlur={(e) => {
              const raw = e.target.value
              const n = raw === '' ? null : Math.max(1, Number(raw) || 1)
              if (n !== conn.number) patchAndSave({ number: n })
            }}
            className="w-24 rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
          <p className="mt-1 text-xs text-text4">
            Erscheint als Zahl in der Mitte der Verbindungslinie.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Beschriftung
          </label>
          <input
            defaultValue={conn.step_label ?? ''}
            placeholder="z.B. „Schritt 1"
            onBlur={(e) => {
              const v = e.target.value.trim() || null
              if (v !== conn.step_label) patchAndSave({ step_label: v })
            }}
            className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Linien-Stil
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['solid', 'dashed', 'dotted'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => patchAndSave({ line_style: style })}
                className={`rounded-md border px-2 py-2 text-xs transition ${
                  conn.line_style === style
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
                }`}
              >
                {style === 'solid'
                  ? '— Voll'
                  : style === 'dashed'
                    ? '— Gestrichelt'
                    : '⋯ Punkte'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Dicke
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { v: 'thin', label: 'Dünn', height: 1.5 },
                { v: 'medium', label: 'Normal', height: 2.5 },
                { v: 'thick', label: 'Dick', height: 4.5 },
              ] as const
            ).map((w) => (
              <button
                key={w.v}
                type="button"
                onClick={() => patchAndSave({ stroke_width: w.v })}
                className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-2 text-xs transition ${
                  conn.stroke_width === w.v
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
                }`}
              >
                <div
                  className="w-full rounded-full bg-text2"
                  style={{ height: `${w.height}px` }}
                />
                <span>{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Animation
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { v: 'none', label: 'Keine', icon: '—' },
                { v: 'pulse', label: 'Pulsieren', icon: '🫧' },
                { v: 'glow', label: 'Leuchten', icon: '✨' },
              ] as const
            ).map((a) => (
              <button
                key={a.v}
                type="button"
                onClick={() => patchAndSave({ animation: a.v })}
                className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition ${
                  conn.animation === a.v
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
                }`}
              >
                <span className="text-base leading-none">{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-text4">
            Hebt wichtige Pfeile hervor — z. B. den aktuellen Schritt.
          </p>
        </div>

        <div>
          <ColorPicker
            label="Farbe"
            value={conn.color ?? '#9CA3AF'}
            onChange={(c) => patchAndSave({ color: c })}
          />
        </div>

        <div className="rounded-md border border-line2 bg-bg3/50 px-3 py-2 text-xs text-text3">
          {conn.from_node_id && conn.to_node_id ? (
            <span>
              ✅ An beiden Enden an Knoten gebunden — Pfeil bewegt sich mit, wenn
              du die Knoten verschiebst.
            </span>
          ) : (
            <span>
              ↗ Freier Pfeil. Ziehe einen Endpunkt auf einen Knoten, um ihn
              dort zu fixieren.
            </span>
          )}
        </div>
      </div>

      <footer className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-red/30 bg-red/5 px-3 py-2 text-sm font-medium text-red transition hover:bg-red/10"
        >
          <Trash2 size={14} />
          Verbindung löschen
        </button>
      </footer>
    </aside>
  )
}
