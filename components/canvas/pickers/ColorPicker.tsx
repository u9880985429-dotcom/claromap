'use client'

const PRESETS = [
  // Kräftig (Default-Set)
  '#10B981', '#34D399', '#059669',
  '#F5A623', '#FF8C42', '#FBBF24',
  '#2563EB', '#4A9EFF', '#06B6D4',
  '#7C3AED', '#A78BFA', '#EC4899',
  '#DC2626', '#FF6B6B', '#D97706',
  // Pastell (warm + freundlich)
  '#FECACA', '#FED7AA', '#FEF3C7',
  '#BBF7D0', '#A7F3D0', '#BAE6FD',
  '#DDD6FE', '#E9D5FF', '#FBCFE8',
  // Neutrals
  '#6B7280', '#9CA3AF', '#1F2937',
  '#FFFFFF', '#0F1424',
]

interface Props {
  value: string
  onChange: (hex: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: Props) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Farbe ${c}`}
            className={`h-7 w-7 rounded-md border transition ${
              value.toUpperCase() === c.toUpperCase()
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg2'
                : 'border-line2 hover:scale-110'
            }`}
            style={{ background: c }}
          />
        ))}
        <label className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-dashed border-line2 text-xs text-text3 transition hover:bg-bg3">
          ⋯
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="sr-only"
          />
        </label>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="w-24 rounded-md border border-line2 bg-bg2 px-2 py-1 font-mono text-xs uppercase outline-none transition focus:border-accent"
        />
      </div>
    </div>
  )
}
