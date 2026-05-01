'use client'

export type ShapeValue =
  | '50%'
  | '20%'
  | '8%'
  | '0%'
  | 'leaf'
  | 'diamond'
  | 'note'

const SHAPES: { value: ShapeValue; label: string; preview: string }[] = [
  { value: '50%', label: 'Kreis', preview: '50%' },
  { value: '20%', label: 'Rund', preview: '20%' },
  { value: '8%', label: 'Soft', preview: '8%' },
  { value: '0%', label: 'Eckig', preview: '0' },
  { value: 'leaf', label: 'Blatt', preview: '50% 0 50% 0' },
  { value: 'diamond', label: 'Raute', preview: 'diamond' },
  { value: 'note', label: 'Notiz', preview: 'note' },
]

const DIAMOND_CLIP = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'

interface Props {
  value: ShapeValue
  onChange: (shape: ShapeValue) => void
}

export function ShapePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SHAPES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition ${
            value === s.value
              ? 'border-accent bg-accent/10 text-text'
              : 'border-line2 bg-bg2 text-text3 hover:bg-bg3 hover:text-text'
          }`}
        >
          {s.value === 'diamond' ? (
            <div
              className="h-7 w-7 bg-text3"
              style={{ clipPath: DIAMOND_CLIP }}
            />
          ) : s.value === 'note' ? (
            <div
              className="h-7 w-7 bg-amber/70"
              style={{
                borderRadius: '0 8px 0 0',
                transform: 'rotate(-2deg)',
                boxShadow: '1px 1px 0 rgba(0,0,0,0.15)',
              }}
            />
          ) : (
            <div
              className="h-7 w-7 bg-text3"
              style={{ borderRadius: s.preview }}
            />
          )}
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}
