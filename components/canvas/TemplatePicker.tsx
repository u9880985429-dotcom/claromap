'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Search, LayoutTemplate, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  TEMPLATES,
  CATEGORY_LABELS,
  type TemplateCategory,
} from '@/lib/data/templates'
import { createMapFromTemplateAction } from '@/app/(dashboard)/maps/actions'
import { applyTemplateToMapAction } from '@/app/(dashboard)/maps/[id]/actions'

const FAVORITES_KEY = 'claromap.favoriteTemplates'

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function saveFavorites(set: Set<string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(set)))
}

interface Props {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'apply'
  mapId?: string
}

const CATEGORIES: ('all' | TemplateCategory)[] = [
  'all',
  'allgemein',
  'brainstorming',
  'analyse',
  'prozesse',
  'projekte',
  'entscheidungen',
  'strategie',
]

export function TemplatePicker({
  open,
  onClose,
  mode = 'create',
  mapId,
}: Props) {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState<'all' | 'favorites' | TemplateCategory>('all')
  const [search, setSearch] = useState('')
  const [pending, startTransition] = useTransition()
  const [pickingId, setPickingId] = useState<string | null>(null)
  // Lazy-init aus localStorage (läuft nur einmal beim ersten Render).
  // Picker ist conditionally gerendert (open && ...), also wird der State
  // bei jedem Öffnen frisch initialisiert, was hier genau das gewünschte
  // Verhalten ist.
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) next.delete(templateId)
      else next.add(templateId)
      saveFavorites(next)
      return next
    })
  }

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (activeCat === 'favorites' && !favorites.has(t.id)) return false
      if (
        activeCat !== 'all' &&
        activeCat !== 'favorites' &&
        t.category !== activeCat
      ) {
        return false
      }
      if (!search) return true
      const q = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
    })
  }, [activeCat, search, favorites])

  const onPick = (templateId: string) => {
    setPickingId(templateId)
    startTransition(async () => {
      try {
        if (mode === 'apply') {
          if (!mapId) throw new Error('mapId fehlt im apply-Mode')
          await applyTemplateToMapAction(mapId, templateId)
          onClose()
          // Refresh, damit die neuen Knoten erscheinen
          router.refresh()
        } else {
          await createMapFromTemplateAction(templateId)
          // Bei create redirected die Server-Action selbst — kein onClose nötig
        }
      } catch (err) {
        console.error('Vorlage konnte nicht angewendet werden', err)
        setPickingId(null)
      }
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-line bg-bg2 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold">
              {mode === 'apply'
                ? 'Vorlage in diese Map einfügen'
                : 'Vorlage wählen'}
            </h2>
            <p className="text-xs text-text3">
              {mode === 'apply'
                ? 'Die gewählten Knoten werden rechts neben deinem bisherigen Inhalt eingefügt. Step-Nummern werden automatisch fortgezählt.'
                : 'Wähle eine Struktur als Start. Du kannst danach alles frei anpassen.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md p-2 text-text3 transition hover:bg-bg3 hover:text-text disabled:opacity-50"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </header>

        {/* Filter-Bar */}
        <div className="flex flex-col gap-3 border-b border-line px-6 py-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-line2 bg-bg2 px-3 py-1.5">
            <Search size={14} className="text-text3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vorlage suchen…"
              className="flex-1 bg-transparent text-sm outline-none"
              disabled={pending}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {/* Favoriten-Filter prominent vorne */}
            <button
              type="button"
              onClick={() => setActiveCat('favorites')}
              disabled={pending}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
                activeCat === 'favorites'
                  ? 'bg-amber/15 text-amber ring-1 ring-amber/40'
                  : 'bg-bg3 text-text2 hover:bg-bg4',
                pending && 'opacity-50',
              )}
              title={
                favorites.size === 0
                  ? 'Markiere eine Vorlage mit dem Stern, um sie hier zu sehen.'
                  : `${favorites.size} Favoriten`
              }
            >
              <Star
                size={12}
                className={cn(
                  activeCat === 'favorites' || favorites.size > 0
                    ? 'fill-amber text-amber'
                    : '',
                )}
              />
              <span>Favoriten</span>
              {favorites.size > 0 && (
                <span className="font-mono text-[10px] opacity-75">
                  ({favorites.size})
                </span>
              )}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                disabled={pending}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  activeCat === cat
                    ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                    : 'text-text3 hover:bg-bg3 hover:text-text',
                  pending && 'opacity-50',
                )}
              >
                {cat === 'all' ? 'Alle' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            activeCat === 'favorites' && favorites.size === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Star size={32} className="text-text4" />
                <p className="text-sm text-text3">
                  Du hast noch keine Favoriten.
                </p>
                <p className="text-xs text-text4">
                  Klick bei einer Vorlage auf den{' '}
                  <Star
                    size={12}
                    className="-mb-0.5 inline text-amber"
                  />{' '}
                  oben rechts, um sie hier zu sammeln.
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-text3">
                Keine Vorlage zu &bdquo;{search}&ldquo; gefunden.
              </p>
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => {
                const isFav = favorites.has(t.id)
                return (
                  <div
                    key={t.id}
                    className={cn(
                      'group relative flex flex-col items-start gap-2 rounded-lg border bg-bg2 p-4 text-left transition',
                      pickingId === t.id
                        ? 'border-accent shadow-mid'
                        : 'border-line hover:border-accent/40 hover:shadow-soft',
                      pending && pickingId !== t.id && 'opacity-50',
                    )}
                  >
                    {/* Favoriten-Stern oben rechts — klickbar ohne Karten-Wahl auszulösen */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(t.id)
                      }}
                      disabled={pending}
                      className={cn(
                        'absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition',
                        isFav
                          ? 'text-amber hover:bg-amber/10'
                          : 'text-text4 opacity-0 hover:bg-bg3 hover:text-amber group-hover:opacity-100',
                      )}
                      aria-label={
                        isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'
                      }
                      title={
                        isFav ? 'Aus Favoriten entfernen' : 'Als Favorit markieren'
                      }
                    >
                      <Star
                        size={16}
                        className={cn(isFav && 'fill-amber')}
                      />
                    </button>

                    {/* Klickbarer Karten-Body */}
                    <button
                      type="button"
                      onClick={() => onPick(t.id)}
                      disabled={pending}
                      className="flex w-full flex-col items-start gap-2 text-left"
                    >
                      <div className="flex w-full items-center gap-2 pr-7">
                        <span className="text-2xl leading-none">{t.icon}</span>
                        <span className="rounded-full bg-bg3 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text3">
                          {CATEGORY_LABELS[t.category]}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-semibold leading-tight">
                        {t.name}
                      </h3>
                      <p className="line-clamp-2 text-xs leading-relaxed text-text3">
                        {t.description}
                      </p>
                      <div className="mt-1 flex w-full items-center justify-between text-[10px] font-mono text-text4">
                        <span>
                          {t.nodes.length}{' '}
                          {t.nodes.length === 1 ? 'Knoten' : 'Knoten'}
                          {t.connections.length > 0 &&
                            ` · ${t.connections.length} Linien`}
                        </span>
                        {pickingId === t.id ? (
                          <span className="text-accent">Lege an…</span>
                        ) : (
                          <span className="text-accent opacity-0 transition group-hover:opacity-100">
                            Auswählen →
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-line bg-bg2 px-6 py-3 text-xs text-text3">
          <span>{TEMPLATES.length} Vorlagen verfügbar</span>
          <span>Tipp: Vorlagen sind Start-Punkte — alles bleibt editierbar.</span>
        </footer>
      </div>
    </div>
  )
}

export function NewMapButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-gradient-to-r from-accent to-accent2 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
      >
        <Plus size={16} />
        Neue Map
      </button>
      <TemplatePicker open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  )
}

export function AddTemplateButton({ mapId }: { mapId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-line bg-bg2 px-2.5 py-1 text-xs text-text2 transition hover:bg-bg3"
        title="Eine Vorlage in diese Map einfügen"
      >
        <LayoutTemplate size={14} />
        <span>Vorlage einfügen</span>
      </button>
      <TemplatePicker
        open={open}
        onClose={() => setOpen(false)}
        mode="apply"
        mapId={mapId}
      />
    </>
  )
}
