'use client'

import { useMemo } from 'react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

const UNASSIGNED = '— Ohne Lane —'

export function SwimlaneView() {
  const allNodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const select = (id: string) => useMapStore.getState().selectNode(id)

  // Group nodes by lane (stable subscription, useMemo for derivation)
  const lanes = useMemo(() => {
    const byLane = new Map<string, NodeRow[]>()
    for (const node of allNodes) {
      const key = node.lane?.trim() || UNASSIGNED
      if (!byLane.has(key)) byLane.set(key, [])
      byLane.get(key)!.push(node)
    }
    for (const arr of byLane.values()) {
      arr.sort((a, b) => a.step_number - b.step_number)
    }
    // Sort lanes alphabetisch, "Ohne Lane" immer zuletzt
    return Array.from(byLane.entries()).sort(([a], [b]) => {
      if (a === UNASSIGNED) return 1
      if (b === UNASSIGNED) return -1
      return a.localeCompare(b)
    })
  }, [allNodes])

  if (allNodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen, dann gib jedem im Detail-Panel eine Lane (z.B. Sales, Tech, Support)." />
    )
  }

  const hasAnyLane = lanes.some(([key]) => key !== UNASSIGNED)
  if (!hasAnyLane) {
    return (
      <NoLanesHint
        nodes={allNodes.slice().sort((a, b) => a.step_number - b.step_number)}
        onSelect={select}
      />
    )
  }

  return (
    <div className="h-full overflow-auto bg-bg">
      <div className="min-w-[800px] p-4">
        <div className="space-y-3">
          {lanes.map(([laneName, nodes]) => (
            <Lane
              key={laneName}
              name={laneName}
              nodes={nodes}
              detailLevel={detailLevel}
              selectedNodeId={selectedNodeId}
              onSelect={select}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Lane({
  name,
  nodes,
  detailLevel,
  selectedNodeId,
  onSelect,
}: {
  name: string
  nodes: NodeRow[]
  detailLevel: string
  selectedNodeId: string | null
  onSelect: (id: string) => void
}) {
  const isUnassigned = name === UNASSIGNED
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-lg border bg-bg2',
        isUnassigned ? 'border-dashed border-line2' : 'border-line',
      )}
      style={{ gridTemplateColumns: '160px 1fr' }}
    >
      <div
        className={cn(
          'flex items-center justify-center px-3 py-4 text-center font-display font-semibold',
          isUnassigned ? 'bg-bg3 text-text3' : 'bg-bg3 text-text',
        )}
      >
        <span className="break-words text-sm">{name}</span>
      </div>

      <div className="flex flex-wrap gap-2 p-3">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            className={cn(
              'flex shrink-0 flex-col items-start gap-1 rounded-lg border-2 px-3 py-2 text-left shadow-soft transition hover:shadow-mid',
              selectedNodeId === node.id
                ? 'border-accent ring-2 ring-accent ring-offset-1'
                : 'border-transparent',
            )}
            style={{
              background: node.color,
              color: node.text_color,
              minWidth: 140,
              maxWidth: 220,
            }}
          >
            <div className="flex w-full items-center gap-2">
              <span className="text-base">{node.emoji}</span>
              <span className="truncate text-sm font-semibold">
                {node.name}
              </span>
              <span className="ml-auto text-sm">{node.status_icon}</span>
            </div>
            {detailLevel !== 'simple' && node.short_desc && (
              <span className="line-clamp-1 text-xs opacity-80">
                {node.short_desc}
              </span>
            )}
            <div className="mt-1 flex w-full items-center gap-1.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full bg-white/85"
                  style={{ width: `${node.progress}%` }}
                />
              </div>
              <span className="font-mono text-[10px] opacity-80">
                #{node.step_number}
              </span>
            </div>
          </button>
        ))}
        {nodes.length === 0 && (
          <span className="px-2 py-1 text-xs italic text-text4">leer</span>
        )}
      </div>
    </div>
  )
}

function NoLanesHint({
  nodes,
  onSelect,
}: {
  nodes: NodeRow[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-bg p-8">
      <div className="max-w-lg rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">Noch keine Lanes vergeben</p>
        <p className="mt-2 text-sm text-text3">
          Klick auf einen Knoten und gib im Detail-Panel im Feld{' '}
          <strong>Lane</strong> ein, wer dafür zuständig ist (z.B. Sales,
          Tech, Support, Du selbst). Knoten gleicher Lane landen dann hier in
          der gleichen Zeile.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {nodes.slice(0, 8).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelect(n.id)}
              className="flex items-center gap-1.5 rounded-md border border-line2 bg-bg px-2.5 py-1 text-xs transition hover:bg-bg3"
            >
              <span>{n.emoji}</span>
              <span>{n.name}</span>
            </button>
          ))}
        </div>
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
