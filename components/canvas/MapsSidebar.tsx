'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, PanelLeftClose, PanelLeft, Plus, ArrowDownUp } from 'lucide-react'
import type { MapWithStats } from '@/lib/data/maps'
import { MapCardPreview } from './MapCardPreview'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

type SortMode = 'recent' | 'title' | 'size'

interface Props {
  maps: MapWithStats[]
  currentMapId: string
}

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60_000)
  if (m < 1) return 'gerade eben'
  if (m < 60) return `vor ${m} Min`
  const h = Math.round(m / 60)
  if (h < 24) return `vor ${h} Std`
  const d = Math.round(h / 24)
  if (d < 30) return `vor ${d} Tag${d === 1 ? '' : 'en'}`
  const mo = Math.round(d / 30)
  if (mo < 12) return `vor ${mo} Mon`
  const y = Math.round(mo / 12)
  return `vor ${y} J`
}

export function MapsSidebar({ maps, currentMapId }: Props) {
  const open = useUIStore((s) => s.mapsSidebarOpen)
  const setOpen = useUIStore((s) => s.setMapsSidebarOpen)
  const toggle = useUIStore((s) => s.toggleMapsSidebar)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('recent')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Nach Mount aus localStorage laden — vermeidet SSR-Hydration-Mismatch.
  useEffect(() => {
    const saved = localStorage.getItem('claromap.mapsSidebarOpen')
    if (saved === 'false') setOpen(false)
  }, [setOpen])

  // ⌘P / Ctrl+P — Quick-Search: Sidebar öffnen + Suchfeld fokussieren
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        // In Inputs ignorieren: User tippt vielleicht
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'TEXTAREA') return
        e.preventDefault()
        setOpen(true)
        // Nach Render fokussieren
        setTimeout(() => {
          searchInputRef.current?.focus()
          searchInputRef.current?.select()
        }, 50)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let arr = maps
    if (q) {
      arr = arr.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q),
      )
    }
    arr = [...arr]
    if (sort === 'title') {
      arr.sort((a, b) => a.title.localeCompare(b.title, 'de'))
    } else if (sort === 'size') {
      arr.sort((a, b) => b.node_count - a.node_count)
    } else {
      arr.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
    }
    return arr
  }, [maps, query, sort])

  if (!open) return null

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-bg2">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text3">
          Deine Maps
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setSort((s) =>
                s === 'recent' ? 'title' : s === 'title' ? 'size' : 'recent',
              )
            }
            className="rounded-md p-1 text-text3 transition hover:bg-bg3 hover:text-text"
            title={`Sortierung: ${
              sort === 'recent'
                ? 'Zuletzt geändert'
                : sort === 'title'
                  ? 'Titel A-Z'
                  : 'Größe'
            } — klick zum Wechseln`}
            aria-label="Sortierung wechseln"
          >
            <ArrowDownUp size={14} />
          </button>
          <Link
            href="/maps"
            className="rounded-md p-1 text-text3 transition hover:bg-bg3 hover:text-text"
            title="Neue Map (Vorlagen-Picker)"
            aria-label="Neue Map erstellen"
          >
            <Plus size={16} />
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="rounded-md p-1 text-text3 transition hover:bg-bg3 hover:text-text"
            aria-label="Sidebar einklappen"
            title="Sidebar einklappen"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      <div className="border-b border-line px-3 py-2">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text4"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…  ⌘P"
            className="w-full rounded-md border border-line bg-bg pl-7 pr-2 py-1.5 text-xs outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-text4">
            {query ? 'Keine Treffer.' : 'Noch keine Maps.'}
          </p>
        ) : (
          <ul className="space-y-1 px-2 py-2">
            {filtered.map((m) => {
              const active = m.id === currentMapId
              return (
                <li key={m.id}>
                  <Link
                    href={`/maps/${m.id}`}
                    className={cn(
                      'group flex gap-2 rounded-md border px-2 py-1.5 transition',
                      active
                        ? 'border-accent/40 bg-accent/10'
                        : 'border-transparent hover:border-line hover:bg-bg3',
                    )}
                  >
                    <div className="h-10 w-12 shrink-0 overflow-hidden rounded">
                      <MapCardPreview nodes={m.preview_nodes} height={40} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          'truncate text-xs font-semibold',
                          active ? 'text-accent' : 'text-text',
                        )}
                      >
                        {m.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-text4">
                        <span>{m.node_count}</span>
                        <span>·</span>
                        <span>{relTime(m.updated_at)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

/**
 * Button um die kollabierte Maps-Sidebar wieder zu öffnen. Wird im Header
 * angezeigt wenn die Sidebar zu ist.
 */
export function MapsSidebarToggle() {
  const open = useUIStore((s) => s.mapsSidebarOpen)
  const toggle = useUIStore((s) => s.toggleMapsSidebar)
  if (open) return null
  return (
    <button
      type="button"
      onClick={toggle}
      className="shrink-0 rounded-md p-1.5 text-text3 transition hover:bg-bg3 hover:text-text"
      aria-label="Maps-Liste anzeigen"
      title="Maps-Liste anzeigen"
    >
      <PanelLeft size={16} />
    </button>
  )
}
