'use client'

import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

const COLUMNS: {
  status: string
  label: string
  icon: string
  border: string
  bg: string
}[] = [
  {
    status: 'idea',
    label: 'Geplant',
    icon: '🌱',
    border: 'border-text4/30',
    bg: 'bg-bg3',
  },
  {
    status: 'wip',
    label: 'In Arbeit',
    icon: '⏳',
    border: 'border-amber/40',
    bg: 'bg-amber/5',
  },
  {
    status: 'warning',
    label: 'Achtung',
    icon: '⚠️',
    border: 'border-amber/40',
    bg: 'bg-amber/10',
  },
  {
    status: 'done',
    label: 'Erledigt',
    icon: '✅',
    border: 'border-green/40',
    bg: 'bg-green/5',
  },
]

export function KanbanView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)

  if (nodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen — sie verteilen sich dann hier nach Status." />
    )
  }

  const grouped: Record<string, NodeRow[]> = {
    idea: [],
    wip: [],
    warning: [],
    done: [],
  }
  for (const n of nodes) {
    const col = grouped[n.status] ?? grouped.idea
    col.push(n)
  }
  for (const k of Object.keys(grouped)) {
    grouped[k].sort((a, b) => a.step_number - b.step_number)
  }

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden bg-bg p-4">
      <div className="grid h-full min-w-[900px] grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className={cn(
              'flex flex-col rounded-xl border-2 p-3',
              col.border,
              col.bg,
            )}
          >
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.icon}</span>
                <h3 className="font-display text-sm font-bold">{col.label}</h3>
              </div>
              <span className="rounded-full bg-bg2 px-2 py-0.5 font-mono text-xs text-text3">
                {grouped[col.status].length}
              </span>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {grouped[col.status].map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => useMapStore.getState().selectNode(node.id)}
                  className={cn(
                    'block w-full rounded-lg border bg-bg2 p-3 text-left transition hover:shadow-mid',
                    selectedNodeId === node.id
                      ? 'border-accent shadow-mid'
                      : 'border-line',
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-lg">{node.emoji}</span>
                    <span className="rounded-full bg-bg3 px-1.5 py-0.5 font-mono text-xs text-text3">
                      #{node.step_number}
                    </span>
                  </div>
                  <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
                    {node.name}
                  </h4>
                  {detailLevel !== 'simple' && node.short_desc && (
                    <p className="mt-1 line-clamp-2 text-xs text-text3">
                      {node.short_desc}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg3">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent2"
                        style={{ width: `${node.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-text4">
                      {node.progress}%
                    </span>
                  </div>
                </button>
              ))}
              {grouped[col.status].length === 0 && (
                <p className="py-4 text-center text-xs text-text4">leer</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-bg p-8">
      <div className="max-w-md rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">Noch nichts da</p>
        <p className="mt-2 text-sm text-text3">{message}</p>
      </div>
    </div>
  )
}
