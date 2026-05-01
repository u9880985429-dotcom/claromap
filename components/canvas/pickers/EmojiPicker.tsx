'use client'

const QUICK_EMOJIS = [
  '📌', '🎯', '💡', '⭐', '🔥', '🚀', '🌱', '🎨', '🧠', '💪',
  '📚', '✏️', '📊', '💼', '🏆', '⚡', '🎁', '🔧', '⚙️', '🛠️',
  '📅', '⏰', '🗓️', '📋', '✅', '☑️', '📝', '📁', '📂', '🗂️',
  '👥', '👤', '🤝', '💬', '📧', '📞', '📱', '💻', '🖥️', '⌨️',
  '🌍', '🌐', '🏠', '🏢', '🚗', '✈️', '🍕', '☕', '🎵', '❤️',
]

interface Props {
  value: string | null
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value.slice(0, 4))}
          placeholder="📌"
          className="w-16 rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-center text-2xl outline-none transition focus:border-accent"
        />
        <span className="text-xs text-text3">
          Eigenes Emoji eintippen oder auswählen ↓
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1 rounded-md border border-line bg-bg3 p-2">
        {QUICK_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`flex h-8 w-8 items-center justify-center rounded text-lg transition hover:bg-bg2 ${
              value === e ? 'bg-bg2 ring-2 ring-accent' : ''
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
