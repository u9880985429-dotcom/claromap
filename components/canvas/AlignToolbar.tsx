'use client'

import {
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from 'lucide-react'

export type AlignDirection =
  | 'left'
  | 'center-x'
  | 'right'
  | 'top'
  | 'center-y'
  | 'bottom'
  | 'distribute-x'
  | 'distribute-y'

interface Props {
  /** Anzahl der aktuell selektierten Knoten. Toolbar erscheint ab 2. */
  selectedCount: number
  onAlign: (direction: AlignDirection) => void
}

/**
 * Schwebende Ausrichtungs-Toolbar. Wird angezeigt sobald 2+ Knoten markiert
 * sind. Klar beschriftet mit Tooltips, damit auch Senior:innen ohne
 * Vorerfahrung wissen was passiert.
 */
export function AlignToolbar({ selectedCount, onAlign }: Props) {
  if (selectedCount < 2) return null

  const groups: { label: string; items: { dir: AlignDirection; icon: React.ComponentType<{ size?: number }>; tooltip: string }[] }[] = [
    {
      label: 'Waagerecht',
      items: [
        {
          dir: 'left',
          icon: AlignStartVertical,
          tooltip: 'Links bündig — alle Knoten an die linke Kante setzen',
        },
        {
          dir: 'center-x',
          icon: AlignCenterVertical,
          tooltip: 'Mittig — alle Knoten auf gleiche horizontale Mitte',
        },
        {
          dir: 'right',
          icon: AlignEndVertical,
          tooltip: 'Rechts bündig — alle Knoten an die rechte Kante setzen',
        },
      ],
    },
    {
      label: 'Senkrecht',
      items: [
        {
          dir: 'top',
          icon: AlignStartHorizontal,
          tooltip: 'Oben bündig — alle Knoten an die obere Kante setzen',
        },
        {
          dir: 'center-y',
          icon: AlignCenterHorizontal,
          tooltip: 'Mittig — alle Knoten auf gleiche vertikale Mitte',
        },
        {
          dir: 'bottom',
          icon: AlignEndHorizontal,
          tooltip: 'Unten bündig — alle Knoten an die untere Kante setzen',
        },
      ],
    },
    {
      label: 'Verteilen',
      items: [
        {
          dir: 'distribute-x',
          icon: AlignHorizontalDistributeCenter,
          tooltip: 'Waagerecht gleichmäßig verteilen',
        },
        {
          dir: 'distribute-y',
          icon: AlignVerticalDistributeCenter,
          tooltip: 'Senkrecht gleichmäßig verteilen',
        },
      ],
    },
  ]

  return (
    <div className="pointer-events-auto absolute left-1/2 top-16 z-20 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-lg border border-line bg-bg2/95 px-2 py-1.5 shadow-mid backdrop-blur">
        <span className="px-2 font-mono text-[10px] uppercase tracking-wider text-text3">
          {selectedCount} markiert
        </span>
        {groups.map((g, gi) => (
          <div key={g.label} className="flex items-center gap-0.5">
            {gi > 0 && <span className="mx-1 h-5 w-px bg-line" />}
            {g.items.map((it) => {
              const Icon = it.icon
              return (
                <button
                  key={it.dir}
                  type="button"
                  onClick={() => onAlign(it.dir)}
                  title={it.tooltip}
                  aria-label={it.tooltip}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text2 transition hover:bg-bg3 hover:text-accent"
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
