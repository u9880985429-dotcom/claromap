'use client'

import { useMemo } from 'react'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

export function TimelineView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const select = (id: string) => useMapStore.getState().selectNode(id)

  // Knoten mit Datums-Range, Tree-Order (Eltern vor Kindern)
  const datedTree = useMemo(() => {
    const dated = nodes.filter((n) => n.start_date && n.end_date)
    const datedIds = new Set(dated.map((n) => n.id))
    const childrenOf = new Map<string | null, NodeRow[]>()
    for (const n of dated) {
      // Wenn der Parent ebenfalls ein Datum hat, gruppiere als Child;
      // sonst als Root (Top-Level)
      const key =
        n.parent_node_id && datedIds.has(n.parent_node_id)
          ? n.parent_node_id
          : null
      if (!childrenOf.has(key)) childrenOf.set(key, [])
      childrenOf.get(key)!.push(n)
    }
    for (const arr of childrenOf.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.start_date!).getTime() -
          new Date(b.start_date!).getTime(),
      )
    }
    const result: { node: NodeRow; depth: number }[] = []
    const visit = (parentId: string | null, depth: number) => {
      const children = childrenOf.get(parentId) ?? []
      for (const child of children) {
        result.push({ node: child, depth })
        visit(child.id, depth + 1)
      }
    }
    visit(null, 0)
    return result
  }, [nodes])

  const dated = useMemo(() => datedTree.map((d) => d.node), [datedTree])

  // Knoten OHNE Datum — Liste am Ende
  const undated = useMemo(
    () =>
      nodes
        .filter((n) => !n.start_date || !n.end_date)
        .sort((a, b) => a.step_number - b.step_number),
    [nodes],
  )

  if (nodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen — dann gib ihnen Start- und End-Datum im Detail-Panel." />
    )
  }

  if (dated.length === 0) {
    return (
      <NoDatesState undatedCount={undated.length} onSelect={select} />
    )
  }

  // Datums-Range bestimmen (dated ist in Tree-Order, nicht zeitlich sortiert)
  const minDate = new Date(
    Math.min(...dated.map((n) => new Date(n.start_date!).getTime())),
  )
  const maxDate = new Date(
    Math.max(...dated.map((n) => new Date(n.end_date!).getTime())),
  )
  // 5% Puffer links + rechts
  const totalMs = maxDate.getTime() - minDate.getTime() || 1
  const buffer = totalMs * 0.05
  const rangeStart = new Date(minDate.getTime() - buffer)
  const rangeEnd = new Date(maxDate.getTime() + buffer)
  const rangeMs = rangeEnd.getTime() - rangeStart.getTime()

  // Monats-Spalten generieren
  const months: { date: Date; label: string }[] = []
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
  while (cursor <= rangeEnd) {
    months.push({
      date: new Date(cursor),
      label: cursor.toLocaleDateString('de-DE', {
        month: 'short',
        year: '2-digit',
      }),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const positionPercent = (d: Date) =>
    ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100

  const NAME_COL_PX = 200

  return (
    <div className="h-full overflow-auto bg-bg">
      <div className="min-w-[900px] p-6">
        {/* Header: Name-Column + Months */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${NAME_COL_PX}px 1fr`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="bg-bg pr-3 pb-3 font-display text-xs font-semibold uppercase tracking-wider text-text3">
            Aufgabe
          </div>
          <div className="relative bg-bg pb-3">
            <div className="flex h-6 border-b border-line2">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-line text-center font-mono text-[10px] text-text3 last:border-r-0"
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2 pt-2">
          {datedTree.map(({ node, depth }) => (
            <Row
              key={node.id}
              node={node}
              depth={depth}
              positionPercent={positionPercent}
              nameColPx={NAME_COL_PX}
              selected={selectedNodeId === node.id}
              detailLevel={detailLevel}
              onSelect={select}
            />
          ))}
        </div>

        {undated.length > 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-line2 bg-bg2 p-4">
            <p className="mb-2 font-display text-sm font-semibold">
              Ohne Datum ({undated.length})
            </p>
            <p className="mb-3 text-xs text-text3">
              Setze Start- und End-Datum im Detail-Panel, dann erscheinen
              diese Knoten oben in der Timeline.
            </p>
            <div className="flex flex-wrap gap-2">
              {undated.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => select(n.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition',
                    selectedNodeId === n.id
                      ? 'border-accent bg-accent/10'
                      : 'border-line2 bg-bg hover:bg-bg3',
                  )}
                >
                  <span>{n.emoji}</span>
                  <span>{n.name}</span>
                  <span className="text-text4">{n.status_icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  node,
  depth,
  positionPercent,
  nameColPx,
  selected,
  detailLevel,
  onSelect,
}: {
  node: NodeRow
  depth: number
  positionPercent: (d: Date) => number
  nameColPx: number
  selected: boolean
  detailLevel: string
  onSelect: (id: string) => void
}) {
  const start = new Date(node.start_date!)
  const end = new Date(node.end_date!)
  const left = positionPercent(start)
  const right = positionPercent(end)
  const width = Math.max(2, right - left)
  const fmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })
  const indentPx = depth * 18

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={cn(
        'grid w-full text-left transition',
        selected && 'rounded-lg ring-2 ring-accent ring-offset-2',
      )}
      style={{ gridTemplateColumns: `${nameColPx}px 1fr` }}
    >
      <div
        className="flex items-center gap-2 truncate pr-3 py-2 text-sm"
        style={{ paddingLeft: indentPx }}
      >
        {depth > 0 && (
          <span aria-hidden className="text-text4">
            ↳
          </span>
        )}
        <span className="text-base">{node.emoji}</span>
        <span className="truncate font-medium">{node.name}</span>
        <span className="ml-auto shrink-0 text-sm">{node.status_icon}</span>
      </div>
      <div className="relative h-9 rounded-md bg-bg3/40">
        <div
          className="absolute top-1 h-7 rounded-md shadow-soft transition group-hover:shadow-mid"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: node.color,
            color: node.text_color,
          }}
        >
          <div className="flex h-full items-center justify-between gap-2 px-2 text-xs font-medium">
            <span className="truncate">
              {detailLevel === 'simple' ? '' : node.short_desc || node.name}
            </span>
            <span className="shrink-0 font-mono text-[10px] opacity-80">
              {fmt.format(start)}–{fmt.format(end)}
            </span>
          </div>
          {/* Progress overlay */}
          <div
            className="absolute inset-0 rounded-md bg-white/15"
            style={{ width: `${node.progress}%` }}
          />
        </div>
      </div>
    </button>
  )
}

function NoDatesState({
  undatedCount,
  onSelect,
}: {
  undatedCount: number
  onSelect: (id: string) => void
}) {
  // Stable Store-Subscription (Raw-Array), Filter/Sort via useMemo —
  // sonst returned der Selector ein neu-allokiertes Array auf jedem Render
  // und Zustand triggert getSnapshot-Loop (Maximum update depth exceeded).
  const allNodes = useMapStore((s) => s.nodes)
  const undated = useMemo(
    () =>
      allNodes
        .filter((n) => !n.start_date || !n.end_date)
        .sort((a, b) => a.step_number - b.step_number),
    [allNodes],
  )
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-bg p-8">
      <div className="max-w-lg rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">Noch keine Termine gesetzt</p>
        <p className="mt-2 text-sm text-text3">
          Klick auf einen Knoten und gib im Detail-Panel ein <strong>Start-</strong>{' '}
          und <strong>End-Datum</strong> ein. Dann erscheint er hier als Bar
          in der Timeline.
        </p>
        {undatedCount > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {undated.slice(0, 8).map((n) => (
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
        )}
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
