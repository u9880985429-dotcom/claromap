'use client'

import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

export function LinearView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const select = (id: string) => useMapStore.getState().selectNode(id)

  if (nodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen — sie erscheinen dann hier als Liste." />
    )
  }

  const sorted = [...nodes].sort((a, b) => a.step_number - b.step_number)

  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ol className="relative">
          {/* Durchgehende vertikale Linie */}
          <span
            aria-hidden
            className="absolute left-[23px] top-2 h-[calc(100%-1rem)] w-px bg-line2"
          />

          {sorted.map((node) => (
            <li key={node.id} className="relative pl-16 pb-6 last:pb-0">
              {/* Step-Kreis auf der Linie */}
              <span
                className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full font-display font-bold text-white shadow-soft ring-4 ring-bg"
                style={{ background: node.color }}
              >
                {node.step_number}
              </span>

              <button
                type="button"
                onClick={() => select(node.id)}
                className={cn(
                  'block w-full rounded-xl border bg-bg2 px-5 py-4 text-left transition',
                  selectedNodeId === node.id
                    ? 'border-accent shadow-mid'
                    : 'border-line hover:border-line2 hover:shadow-soft',
                )}
              >
                <header className="flex items-baseline justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xl">{node.emoji}</span>
                    <h3 className="truncate font-display text-base font-semibold">
                      {node.name}
                    </h3>
                  </div>
                  <span className="shrink-0 text-base">
                    {node.status_icon}
                  </span>
                </header>

                {detailLevel !== 'simple' && node.short_desc && (
                  <p className="mt-1 text-sm text-text3">{node.short_desc}</p>
                )}

                {detailLevel === 'full' && node.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text2">
                    {node.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all"
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-text3">
                    {node.progress}%
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ol>
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
