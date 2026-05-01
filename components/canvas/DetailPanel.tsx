'use client'

import { useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import {
  deleteNodeAction,
  updateNodeAction,
} from '@/app/(dashboard)/maps/[id]/actions'
import { EmojiPicker } from './pickers/EmojiPicker'
import { ColorPicker } from './pickers/ColorPicker'
import { StatusPicker, type StatusValue } from './pickers/StatusPicker'
import { ShapePicker, type ShapeValue } from './pickers/ShapePicker'
import { TaskList } from './TaskList'

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
    useMapStore.getState().patchNodeLocal(node.id, patch)
    try {
      await updateNodeAction(node.id, patch)
    } catch (err) {
      console.error('Speichern fehlgeschlagen', err)
    }
  }

  const onClose = () => useMapStore.getState().selectNode(null)

  const onDelete = async () => {
    useMapStore.getState().removeNode(node.id)
    try {
      await deleteNodeAction(node.id)
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

        <Section label="Aufgaben">
          <TaskList nodeId={node.id} />
        </Section>
      </div>

      <footer className="border-t border-line px-4 py-3">
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
