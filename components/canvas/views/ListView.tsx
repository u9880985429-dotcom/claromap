'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

type SortKey = 'step' | 'name' | 'status' | 'progress'

export function ListView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('step')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    const filtered = nodes.filter(
      (n) =>
        !search ||
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.short_desc ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    const byKey: Record<SortKey, (a: NodeRow, b: NodeRow) => number> = {
      step: (a, b) => a.step_number - b.step_number,
      name: (a, b) => a.name.localeCompare(b.name),
      status: (a, b) => a.status.localeCompare(b.status),
      progress: (a, b) => a.progress - b.progress,
    }
    const cmp = byKey[sortKey]
    return [...filtered].sort((a, b) =>
      sortDir === 'asc' ? cmp(a, b) : cmp(b, a),
    )
  }, [nodes, search, sortKey, sortDir])

  if (nodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen — sie erscheinen dann hier als Tabelle." />
    )
  }

  const sortBy = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''

  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-4 flex items-center gap-2 rounded-md border border-line2 bg-bg2 px-3 py-2">
          <Search size={14} className="text-text3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <span className="text-xs text-text4">
            {sorted.length} / {nodes.length}
          </span>
        </div>

        <table className="w-full border-collapse rounded-lg bg-bg2">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-text3">
              <Th onClick={() => sortBy('step')}>
                # {arrow('step')}
              </Th>
              <Th onClick={() => sortBy('name')}>
                Eintrag {arrow('name')}
              </Th>
              <Th onClick={() => sortBy('status')}>
                Status {arrow('status')}
              </Th>
              <Th onClick={() => sortBy('progress')}>
                Fortschritt {arrow('progress')}
              </Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((node) => (
              <tr
                key={node.id}
                onClick={() => useMapStore.getState().selectNode(node.id)}
                className={cn(
                  'cursor-pointer border-b border-line text-sm transition last:border-b-0 hover:bg-bg3',
                  selectedNodeId === node.id && 'bg-accent/5',
                )}
              >
                <td className="py-3 pl-4 pr-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: node.color }}
                  >
                    {node.step_number}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{node.emoji}</span>
                    <span className="font-medium">{node.name}</span>
                  </div>
                  {detailLevel !== 'simple' && node.short_desc && (
                    <p className="mt-0.5 text-xs text-text3">
                      {node.short_desc}
                    </p>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1 text-base">
                    {node.status_icon}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg3">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent2"
                        style={{ width: `${node.progress}%` }}
                      />
                    </div>
                    <span className="w-10 font-mono text-xs text-text3">
                      {node.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none py-2 pl-4 pr-2 text-left font-medium transition hover:text-text"
    >
      {children}
    </th>
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
