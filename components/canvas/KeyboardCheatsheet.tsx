'use client'

import { useEffect, useState } from 'react'
import { X, Keyboard } from 'lucide-react'

const SHORTCUTS: { keys: string[]; desc: string; group: string }[] = [
  // Navigation
  { keys: ['Mausrad'], desc: 'Zoom rein/raus', group: 'Navigation' },
  {
    keys: ['Klick + Ziehen', 'Hintergrund'],
    desc: 'Pan / Verschieben',
    group: 'Navigation',
  },
  { keys: ['⌂'], desc: 'View zurücksetzen (Toolbar)', group: 'Navigation' },

  // Knoten-Bearbeitung
  { keys: ['Klick'], desc: 'Knoten auswählen', group: 'Knoten' },
  { keys: ['Klick + Ziehen'], desc: 'Knoten verschieben', group: 'Knoten' },
  { keys: ['Doppelklick'], desc: 'Name inline bearbeiten', group: 'Knoten' },
  { keys: ['Eck-Handles'], desc: 'Größe ändern', group: 'Knoten' },
  {
    keys: ['Del', 'Backspace'],
    desc: 'Ausgewählte(n) Knoten löschen',
    group: 'Knoten',
  },

  // Mehrfach-Auswahl
  {
    keys: ['Shift + Klick', '⌘ + Klick'],
    desc: 'Knoten zur Auswahl hinzufügen / entfernen',
    group: 'Mehrfach',
  },
  {
    keys: ['⌘A', 'Strg+A'],
    desc: 'Alle Knoten auf der Map markieren',
    group: 'Mehrfach',
  },
  {
    keys: ['⌘D', 'Strg+D'],
    desc: 'Ausgewählte Knoten duplizieren (mit Offset)',
    group: 'Mehrfach',
  },
  {
    keys: ['Ziehen', 'mehrere selektiert'],
    desc: 'Alle ausgewählten Knoten gleichzeitig verschieben',
    group: 'Mehrfach',
  },
  {
    keys: ['Shift + Hintergrund'],
    desc: 'Pannen ohne Auswahl zu verlieren',
    group: 'Mehrfach',
  },

  // Modi
  {
    keys: ['🔗 Verbinden + 2× Klick'],
    desc: 'Zwei Knoten verbinden',
    group: 'Modi',
  },
  { keys: ['F'], desc: 'Focus-Mode auf Auswahl', group: 'Modi' },
  {
    keys: ['H'],
    desc: 'Hand-Tool an/aus (Klick wird zum Pannen)',
    group: 'Modi',
  },
  {
    keys: ['Esc'],
    desc: 'Auswahl aufheben / Modus verlassen',
    group: 'Modi',
  },

  // Verbindungen
  {
    keys: ['Klick auf Linie'],
    desc: 'Verbindung auswählen + bearbeiten',
    group: 'Verbindungen',
  },

  // System
  { keys: ['?'], desc: 'Diese Übersicht öffnen/schließen', group: 'System' },
  {
    keys: ['⌘P', 'Strg+P'],
    desc: 'Maps-Sidebar öffnen + Suchfeld fokussieren',
    group: 'System',
  },
]

export function KeyboardCheatsheet() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const groups = new Map<string, typeof SHORTCUTS>()
  for (const s of SHORTCUTS) {
    const arr = groups.get(s.group) ?? []
    arr.push(s)
    groups.set(s.group, arr)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line bg-bg2 px-5 py-3">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-accent" />
            <h2 className="font-display text-lg font-semibold">
              Tastatur-Kürzel
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-text3 transition hover:bg-bg3 hover:text-text"
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {Array.from(groups.entries()).map(([group, items]) => (
              <section key={group}>
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text3">
                  {group}
                </h3>
                <div className="space-y-1.5">
                  {items.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm hover:bg-bg3"
                    >
                      <div className="flex items-center gap-1.5">
                        {s.keys.map((k, j) => (
                          <kbd
                            key={j}
                            className="inline-flex min-w-[24px] items-center justify-center rounded border border-line2 bg-bg2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-text2 shadow-soft"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-right text-text2">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-line bg-bg2 px-5 py-2.5 text-center text-xs text-text3">
          Drücke{' '}
          <kbd className="inline-flex h-4 items-center rounded bg-bg3 px-1 font-mono text-[10px]">
            ?
          </kbd>{' '}
          oder{' '}
          <kbd className="inline-flex h-4 items-center rounded bg-bg3 px-1 font-mono text-[10px]">
            Esc
          </kbd>{' '}
          zum Schließen.
        </footer>
      </div>
    </div>
  )
}
