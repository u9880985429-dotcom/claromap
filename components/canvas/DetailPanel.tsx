'use client'

import { useMemo } from 'react'
import {
  X,
  Trash2,
  Lock,
  Unlock,
  Check,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import {
  deleteNodeAction,
  updateNodeAction,
} from '@/app/(dashboard)/maps/[id]/actions'
import { savedAction } from '@/lib/utils/savedAction'
import { EmojiPicker } from './pickers/EmojiPicker'
import { ColorPicker } from './pickers/ColorPicker'
import { StatusPicker, type StatusValue } from './pickers/StatusPicker'
import { ShapePicker, type ShapeValue } from './pickers/ShapePicker'
import { TaskList } from './TaskList'
import { AnnotationList } from './AnnotationList'
import { NodeImageUpload } from './NodeImageUpload'

export function DetailPanel() {
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const node = useMapStore((s) =>
    s.nodes.find((n) => n.id === selectedNodeId),
  )

  if (!node) return null
  return <NodeEditor key={node.id} node={node} />
}

function NodeEditor({ node }: { node: NodeRow }) {
  const patchAndSave = async (patch: Partial<NodeRow>) => {
    // Vor-Werte für Undo speichern (nur die Felder die sich ändern)
    const before: Partial<NodeRow> = {}
    for (const k of Object.keys(patch) as (keyof NodeRow)[]) {
      // @ts-expect-error -- Index access for partial copy
      before[k] = node[k]
    }
    useMapStore
      .getState()
      .pushHistory({ type: 'patch-node', nodeId: node.id, before, after: patch })
    useMapStore.getState().patchNodeLocal(node.id, patch)
    try {
      await savedAction(() => updateNodeAction(node.id, patch))
    } catch (err) {
      console.error('Speichern fehlgeschlagen', err)
    }
  }

  const onClose = () => useMapStore.getState().selectNode(null)

  const onDelete = async () => {
    useMapStore.getState().removeNode(node.id)
    try {
      await savedAction(() => deleteNodeAction(node.id))
    } catch (err) {
      console.error(err)
    }
  }

  const autoStatusFromProgress = (
    p: number,
  ): { status: StatusValue; icon: string } => {
    if (p >= 100) return { status: 'done', icon: '✅' }
    if (p > 0) return { status: 'wip', icon: '⏳' }
    return { status: 'idea', icon: '🌱' }
  }

  return (
    <aside className="flex h-full w-[380px] flex-col border-l border-line bg-bg2">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-text2">
          Knoten bearbeiten
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
        <Section label="Emoji">
          <EmojiPicker
            value={node.emoji}
            onChange={(e) => patchAndSave({ emoji: e })}
          />
        </Section>

        <Section label="Name">
          <input
            defaultValue={node.name}
            onBlur={(e) => {
              const v = e.target.value.trim() || 'Knoten'
              if (v !== node.name) patchAndSave({ name: v })
            }}
            className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm font-medium outline-none transition focus:border-accent"
          />
        </Section>

        <Section label="Kurz-Beschreibung">
          <input
            defaultValue={node.short_desc ?? ''}
            placeholder="Optional, kurz und knackig"
            onBlur={(e) => {
              const v = e.target.value.trim() || null
              if (v !== node.short_desc) patchAndSave({ short_desc: v })
            }}
            className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
        </Section>

        <Section label="Beschreibung">
          <textarea
            defaultValue={node.description ?? ''}
            placeholder="Was steckt hinter diesem Knoten?"
            rows={4}
            onBlur={(e) => {
              const v = e.target.value.trim() || null
              if (v !== node.description) patchAndSave({ description: v })
            }}
            className="w-full resize-y rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
        </Section>

        <Section label="Status">
          <StatusPicker
            value={node.status as StatusValue}
            icon={node.status_icon}
            onChange={(status, icon) =>
              patchAndSave({ status, status_icon: icon })
            }
          />
        </Section>

        <Section
          label="Fortschritt"
          right={
            <span className="font-mono text-xs text-text3">
              {node.progress}%
            </span>
          }
        >
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={node.progress}
            onChange={(e) => {
              const p = Number(e.target.value)
              useMapStore.getState().patchNodeLocal(node.id, { progress: p })
            }}
            onMouseUp={() => {
              const auto = autoStatusFromProgress(node.progress)
              patchAndSave({
                progress: node.progress,
                status: auto.status,
                status_icon: auto.icon,
              })
            }}
            className="w-full accent-accent"
          />
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg3">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent2 transition-all"
              style={{ width: `${node.progress}%` }}
            />
          </div>
        </Section>

        <Section label="Schritt-Nummer">
          <input
            type="number"
            min={1}
            value={node.step_number}
            onChange={(e) => {
              const n = Math.max(1, Number(e.target.value) || 1)
              patchAndSave({ step_number: n })
            }}
            className="w-20 rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
        </Section>

        <Section label="Lane (für Swimlane-View)">
          <input
            defaultValue={node.lane ?? ''}
            placeholder="z.B. Sales, Tech, Support, Du selbst"
            onBlur={(e) => {
              const v = e.target.value.trim() || null
              if (v !== node.lane) patchAndSave({ lane: v })
            }}
            className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
          />
          <p className="mt-1 text-xs text-text4">
            Knoten mit gleicher Lane landen in derselben Zeile.
          </p>
        </Section>

        <Section label="Übergeordneter Knoten (für Timeline-Hierarchie)">
          <ParentSelector node={node} onSelect={patchAndSave} />
        </Section>

        <Section label="Zeitraum (für Timeline-View)">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-text4">
                Start
              </label>
              <input
                type="date"
                defaultValue={node.start_date ?? ''}
                onBlur={(e) => {
                  const v = e.target.value || null
                  if (v !== node.start_date) patchAndSave({ start_date: v })
                }}
                className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-text4">
                Ende
              </label>
              <input
                type="date"
                defaultValue={node.end_date ?? ''}
                onBlur={(e) => {
                  const v = e.target.value || null
                  if (v !== node.end_date) patchAndSave({ end_date: v })
                }}
                className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
              />
            </div>
          </div>
        </Section>

        <Section label="Hintergrundfarbe">
          <ColorPicker
            value={node.color}
            onChange={(c) => patchAndSave({ color: c })}
          />
        </Section>

        <Section label="Bild im Hintergrund">
          <NodeImageUpload node={node} />
        </Section>

        <Section label="Textfarbe">
          <ColorPicker
            value={node.text_color}
            onChange={(c) => patchAndSave({ text_color: c })}
          />
        </Section>

        <Section label="Form">
          <ShapePicker
            value={node.shape as ShapeValue}
            onChange={(s) => patchAndSave({ shape: s })}
          />
        </Section>

        <Section label="Wo soll der Titel stehen?">
          <LabelPositionPicker
            value={node.label_position}
            onChange={(p) => patchAndSave({ label_position: p })}
          />
        </Section>

        <Section label="Position fixieren">
          <button
            type="button"
            onClick={() => patchAndSave({ locked: !node.locked })}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
              node.locked
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line2 bg-bg2 text-text2 hover:bg-bg3'
            }`}
          >
            <span className="flex items-center gap-2">
              {node.locked ? <Lock size={14} /> : <Unlock size={14} />}
              {node.locked
                ? 'Knoten ist fixiert (nicht verschiebbar)'
                : 'Knoten frei verschiebbar'}
            </span>
            <span className="font-mono text-xs">
              {node.locked ? 'AN' : 'AUS'}
            </span>
          </button>
          <p className="mt-1 text-xs text-text4">
            Fixierte Knoten dienen als Hintergrund-Layout (z. B.
            Eisenhower-Quadranten) und werden beim Verschieben oder Löschen
            ignoriert.
          </p>
        </Section>

        <Section label="Aufgaben">
          <TaskList nodeId={node.id} />
        </Section>

        <Section label="Notizen / Kommentare">
          <AnnotationList nodeId={node.id} />
        </Section>
      </div>

      <footer className="space-y-2 border-t border-line px-4 py-3">
        <SaveStatusRow />
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-red/30 bg-red/5 px-3 py-2 text-sm font-medium text-red transition hover:bg-red/10"
        >
          <Trash2 size={14} />
          Knoten löschen
        </button>
      </footer>
    </aside>
  )
}

function ParentSelector({
  node,
  onSelect,
}: {
  node: NodeRow
  onSelect: (patch: Partial<NodeRow>) => void
}) {
  const allNodes = useMapStore((s) => s.nodes)
  // Verhindere Selbst-Referenz und (zur Sicherheit) direkte Kinder als Eltern,
  // damit kein Zyklus entsteht.
  const childIds = useMemo(() => {
    const directChildren = new Set<string>()
    for (const n of allNodes) {
      if (n.parent_node_id === node.id) directChildren.add(n.id)
    }
    return directChildren
  }, [allNodes, node.id])

  const candidates = useMemo(
    () =>
      allNodes
        .filter((n) => n.id !== node.id && !childIds.has(n.id))
        .sort((a, b) => a.step_number - b.step_number),
    [allNodes, node.id, childIds],
  )

  return (
    <select
      value={node.parent_node_id ?? ''}
      onChange={(e) => {
        const v = e.target.value || null
        onSelect({ parent_node_id: v })
      }}
      className="w-full rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
    >
      <option value="">— Kein übergeordneter Knoten —</option>
      {candidates.map((n) => (
        <option key={n.id} value={n.id}>
          #{n.step_number} {n.emoji} {n.name}
        </option>
      ))}
    </select>
  )
}

/**
 * Save-Status mit explizitem "Speichern"-Button im DetailPanel-Footer.
 *
 * Auch wenn alle Felder Auto-Save via onBlur haben, gibt der Button zwei
 * konkrete Vorteile:
 *  1) Wenn der Cursor noch in einem Feld ist (kein Blur), zwingt der Klick
 *     den aktuellen Input zum Blur → ungespeicherter Text wird committet.
 *  2) Klare visuelle Bestätigung "Es ist alles gespeichert" — gerade für
 *     Senior:innen / unsichere Nutzer ein wichtiges Signal.
 */
function SaveStatusRow() {
  const status = useMapStore((s) => s.saveStatus)
  const inflightCount = useMapStore((s) => s.inflightCount)
  const onForceSave = () => {
    // Aktuellen Fokus blurren → onBlur-Handler feuert → patchAndSave
    const el = document.activeElement
    if (el && 'blur' in el && typeof (el as HTMLElement).blur === 'function') {
      ;(el as HTMLElement).blur()
    }
  }

  let label: string
  let icon: React.ReactNode
  let cls: string
  if (inflightCount > 0 || status === 'saving') {
    label = 'Speichere …'
    icon = <Loader2 size={14} className="animate-spin" />
    cls = 'border-amber/40 bg-amber/10 text-amber'
  } else if (status === 'error') {
    label = 'Speichern fehlgeschlagen — erneut versuchen'
    icon = <AlertCircle size={14} />
    cls = 'border-red/40 bg-red/10 text-red'
  } else {
    label = 'Alles automatisch gespeichert'
    icon = <Check size={14} />
    cls = 'border-green/40 bg-green/10 text-green'
  }

  return (
    <div className="flex items-stretch gap-2">
      <div
        className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${cls}`}
      >
        {icon}
        <span className="flex-1">{label}</span>
      </div>
      <button
        type="button"
        onClick={onForceSave}
        title="Aktuelles Feld speichern (oder erzwingt das Speichern wenn der Cursor noch in einem Feld ist)"
        className="flex items-center gap-1.5 rounded-md border border-line2 bg-bg2 px-3 py-2 text-xs font-medium text-text2 transition hover:bg-bg3"
      >
        <Save size={14} />
        Speichern
      </button>
    </div>
  )
}

/**
 * Picker für die Position des Knoten-Titels. Bestimmt, wo Emoji + Name
 * angezeigt werden:
 *  - 'center' (alt: 'inside') → mittig im Knoten (Default)
 *  - 'top-banner'             → kleines fixiertes Header-Band oben innerhalb
 *  - 'above' (alt: 'outside') → über dem Knoten, außerhalb (schwebt darüber)
 *
 * Praktisch für Container-Knoten wie Eisenhower-Quadranten: mit 'top-banner'
 * bleibt der ganze Innenraum frei für reingelegte Aufgaben.
 */
function LabelPositionPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  // Alte Werte sanft auf neue mappen
  const norm = value === 'inside' ? 'center' : value === 'outside' ? 'above' : value
  const options: { v: string; label: string; preview: React.ReactNode }[] = [
    {
      v: 'center',
      label: 'Mitte',
      preview: (
        <div className="flex h-full w-full items-center justify-center bg-accent/20 text-[9px] text-accent">
          Titel
        </div>
      ),
    },
    {
      v: 'top-banner',
      label: 'Kopfzeile',
      preview: (
        <div className="flex h-full w-full flex-col bg-bg3">
          <div className="bg-accent/30 px-1 py-0.5 text-[8px] font-semibold text-accent">
            Titel
          </div>
          <div className="flex-1" />
        </div>
      ),
    },
    {
      v: 'above',
      label: 'Über dem Feld',
      preview: (
        <div className="flex h-full w-full flex-col gap-0.5">
          <div className="text-[8px] font-semibold text-accent">Titel</div>
          <div className="flex-1 bg-bg3" />
        </div>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`flex flex-col items-stretch gap-1 rounded-md border p-1.5 text-xs transition ${
            norm === opt.v
              ? 'border-accent bg-accent/10 text-text'
              : 'border-line2 bg-bg2 text-text3 hover:bg-bg3'
          }`}
        >
          <div className="h-10 w-full overflow-hidden rounded border border-line2">
            {opt.preview}
          </div>
          <span className="text-center text-[10px]">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

function Section({
  label,
  right,
  children,
}: {
  label: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-text3">
          {label}
        </label>
        {right}
      </div>
      {children}
    </section>
  )
}
