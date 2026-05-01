'use client'

import { useUIStore, type ViewName, type DetailLevel } from '@/stores/uiStore'

const VIEWS: { value: ViewName; label: string; icon: string }[] = [
  { value: 'graph', label: 'Workflow', icon: '⬡' },
  { value: 'mindmap', label: 'Mind Map', icon: '✦' },
  { value: 'hub', label: 'Hub', icon: '◎' },
  { value: 'linear', label: 'Linear', icon: '📋' },
  { value: 'kanban', label: 'Kanban', icon: '⊞' },
  { value: 'list', label: 'Liste', icon: '≡' },
  { value: 'timeline', label: 'Timeline', icon: '⟿' },
  { value: 'swimlane', label: 'Swimlane', icon: '⫶' },
  { value: 'galaxy3d', label: '3D', icon: '✺' },
]

const LEVELS: { value: DetailLevel; label: string }[] = [
  { value: 'simple', label: 'Einfach' },
  { value: 'normal', label: 'Normal' },
  { value: 'full', label: 'Ausführlich' },
]

export function ViewSwitcher() {
  const view = useUIStore((s) => s.view)
  const setView = useUIStore((s) => s.setView)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const setDetailLevel = useUIStore((s) => s.setDetailLevel)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5 rounded-lg border border-line bg-bg2 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setView(v.value)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              view === v.value
                ? 'bg-accent/15 text-accent'
                : 'text-text3 hover:bg-bg3 hover:text-text'
            }`}
          >
            <span className="text-sm leading-none">{v.icon}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-0.5 rounded-lg border border-line bg-bg2 p-1">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setDetailLevel(l.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              detailLevel === l.value
                ? 'bg-accent/15 text-accent'
                : 'text-text3 hover:bg-bg3 hover:text-text'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
