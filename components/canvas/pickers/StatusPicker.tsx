'use client'

export type StatusValue =
  | 'done'
  | 'wip'
  | 'warning'
  | 'idea'
  | 'blocked'
  | 'ready'

const STATUSES: { value: StatusValue; icon: string; label: string }[] = [
  { value: 'done', icon: '✅', label: 'Erledigt' },
  { value: 'wip', icon: '⏳', label: 'In Arbeit' },
  { value: 'idea', icon: '🌱', label: 'Geplant' },
  { value: 'warning', icon: '⚠️', label: 'Achtung' },
  { value: 'ready', icon: '🚀', label: 'Bereit' },
  { value: 'blocked', icon: '🔒', label: 'Blockiert' },
]

interface Props {
  value: StatusValue
  icon: string
  onChange: (status: StatusValue, icon: string) => void
}

export function StatusPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value, s.icon)}
          className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition ${
            value === s.value
              ? 'border-accent bg-accent/10 text-text'
              : 'border-line2 bg-bg2 text-text3 hover:bg-bg3 hover:text-text'
          }`}
        >
          <span className="text-lg">{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}
