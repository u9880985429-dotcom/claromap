'use client'

import {
  memo,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { updateNodeAction } from '@/app/(dashboard)/maps/[id]/actions'
import { savedAction } from '@/lib/utils/savedAction'

// 8 Resize-Handles: 4 Ecken + 4 Kanten-Mitten.
// Eck-Handles ändern Höhe + Breite gleichzeitig (2D), Kanten-Handles
// nur eine Achse (1D-Resize, üblich in Figma/FigJam/Miro).
export type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l'
export type ConnectAnchor = 'top' | 'right' | 'bottom' | 'left'

interface Props {
  node: NodeRow
  selected: boolean
  // Wahr, wenn der Knoten Teil einer Multi-Selection ist (>1 selektiert).
  // selected ist dann false (selectedNodeId = null), aber multiSelected = true.
  multiSelected?: boolean
  connectMode: boolean
  isConnectStart: boolean
  dimmed?: boolean
  onMouseDownNode: (e: ReactMouseEvent, node: NodeRow) => void
  onMouseDownHandle: (
    e: ReactMouseEvent,
    node: NodeRow,
    corner: ResizeCorner,
  ) => void
  // Drag-to-Connect: aus einem Anchor heraus auf einen anderen Knoten ziehen
  onMouseDownAnchor?: (
    e: ReactMouseEvent,
    node: NodeRow,
    anchor: ConnectAnchor,
  ) => void
}

function NodeImpl({
  node,
  selected,
  multiSelected = false,
  connectMode,
  isConnectStart,
  dimmed = false,
  onMouseDownNode,
  onMouseDownHandle,
  onMouseDownAnchor,
}: Props) {
  const detailLevel = useUIStore((s) => s.detailLevel)

  const [editing, setEditing] = useState(false)
  const isDiamond = node.shape === 'diamond'
  const isNote = node.shape === 'note'
  const radius = isDiamond
    ? '0%'
    : node.shape === 'leaf'
      ? '50% 0 50% 0'
      : isNote
        ? '0 12px 0 0' // Sticky-Note: rechte obere Ecke abgeknickt
        : node.shape
  const fontScale = Math.max(0.7, Math.min(1.4, node.width / 120))
  // Sticky-Notes haben leichten Rotation-Wackel basierend auf der Knoten-ID,
  // damit jede Note minimal anders ausgerichtet ist (Excalidraw-Vibe)
  const noteRotation = isNote
    ? `${(parseInt(node.id.slice(0, 8), 16) % 7) - 3}deg`
    : '0deg'

  // Label-Position normalisieren: alte Werte 'inside' / 'outside' werden auf
  // neue gemappt — gleiche Anzeige, neuer Name.
  const labelPos =
    node.label_position === 'inside'
      ? 'center'
      : node.label_position === 'outside'
        ? 'above'
        : node.label_position
  const isTopBanner = labelPos === 'top-banner'
  const isAbove = labelPos === 'above'

  return (
    <div
      className={cn(
        'claromap-node group absolute select-none transition-shadow',
        connectMode
          ? 'cursor-crosshair'
          : editing
            ? 'cursor-text'
            : 'cursor-grab active:cursor-grabbing',
        selected && !connectMode && 'ring-2 ring-accent ring-offset-2',
        multiSelected &&
          !selected &&
          !connectMode &&
          'ring-2 ring-purple ring-offset-2',
        isConnectStart && 'ring-4 ring-accent2 ring-offset-2',
      )}
      style={{
        left: node.position_x,
        top: node.position_y,
        width: node.width,
        height: node.height,
        // Wenn ein Bild gesetzt ist: Bild als Cover, Farbe als Fallback
        // dahinter (rendert während das Bild lädt). Bei Diamond bleibt
        // transparent, weil die clip-path-Form den Hintergrund liefert.
        ...(isDiamond
          ? { background: 'transparent' }
          : node.image_url
            ? {
                backgroundColor: node.color,
                backgroundImage: `url(${node.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : { background: node.color }),
        color: node.text_color,
        borderRadius: radius,
        boxShadow: isDiamond
          ? 'none'
          : isNote
            ? '2px 3px 0 rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.08)'
            : selected
              ? '0 12px 32px rgba(0,0,0,0.20)'
              : '0 2px 8px rgba(0,0,0,0.10)',
        transform: isNote ? `rotate(${noteRotation})` : undefined,
        opacity: dimmed ? 0.18 : 1,
        transition: 'opacity 200ms ease',
      }}
      onMouseDown={(e) => {
        if (editing) {
          e.stopPropagation()
          return
        }
        onMouseDownNode(e, node)
      }}
      onDoubleClick={(e) => {
        if (connectMode) return
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {isDiamond && (
        <div
          className="absolute inset-0 shadow-soft"
          style={{
            ...(node.image_url
              ? {
                  backgroundColor: node.color,
                  backgroundImage: `url(${node.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { background: node.color }),
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
          aria-hidden
        />
      )}
      {/* Subtle dunkler Verlauf wenn Bild gesetzt — lässt Text lesbar bleiben */}
      {node.image_url && !isDiamond && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.45))',
            borderRadius: radius,
          }}
          aria-hidden
        />
      )}
      {/* "above": Titel + Emoji schweben ÜBER dem Feld — Innenraum bleibt frei */}
      {isAbove && (
        <div
          className="absolute -top-7 left-0 right-0 flex items-center justify-center gap-1 px-1"
          style={{ pointerEvents: 'none' }}
        >
          <span style={{ fontSize: `${14 * fontScale}px` }}>
            {node.emoji ?? '📌'}
          </span>
          <span
            className="line-clamp-1 font-semibold leading-tight"
            style={{
              fontSize: `${12 * fontScale}px`,
              color: 'var(--text)',
            }}
          >
            {node.name}
          </span>
        </div>
      )}

      {/* "top-banner": kleine Kopfzeile innerhalb des Knotens, Innenraum frei */}
      {isTopBanner && (
        <div
          className="absolute left-0 right-0 top-0 flex items-center gap-1.5 px-2 py-1.5"
          style={{
            background: 'rgba(0,0,0,0.10)',
            borderTopLeftRadius: typeof radius === 'string' ? radius : 0,
            borderTopRightRadius: typeof radius === 'string' ? radius : 0,
            color: node.text_color,
          }}
        >
          <span style={{ fontSize: `${16 * fontScale}px` }}>
            {node.emoji ?? '📌'}
          </span>
          {editing ? (
            <NameInput
              initial={node.name}
              fontSize={12 * fontScale}
              color={node.text_color}
              onCommit={async (value) => {
                setEditing(false)
                const trimmed = value.trim() || 'Knoten'
                if (trimmed !== node.name) {
                  useMapStore.getState().pushHistory({
                    type: 'patch-node',
                    nodeId: node.id,
                    before: { name: node.name },
                    after: { name: trimmed },
                  })
                  useMapStore
                    .getState()
                    .patchNodeLocal(node.id, { name: trimmed })
                  try {
                    await savedAction(() =>
                      updateNodeAction(node.id, { name: trimmed }),
                    )
                  } catch (err) {
                    console.error('Name speichern fehlgeschlagen', err)
                  }
                }
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <span
              className="line-clamp-1 flex-1 truncate text-left font-semibold leading-tight"
              style={{ fontSize: `${12 * fontScale}px` }}
            >
              {node.name}
            </span>
          )}
        </div>
      )}

      {/* "center" (Default): klassisch in der Mitte */}
      {!isAbove && !isTopBanner && (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
          <div
            className="leading-none"
            style={{ fontSize: `${24 * fontScale}px` }}
          >
            {node.emoji ?? '📌'}
          </div>
          {editing ? (
            <NameInput
              initial={node.name}
              fontSize={13 * fontScale}
              color={node.text_color}
              onCommit={async (value) => {
                setEditing(false)
                const trimmed = value.trim() || 'Knoten'
                if (trimmed !== node.name) {
                  // History-Eintrag, damit Inline-Rename via Doppelklick
                  // auch undo'bar ist
                  useMapStore.getState().pushHistory({
                    type: 'patch-node',
                    nodeId: node.id,
                    before: { name: node.name },
                    after: { name: trimmed },
                  })
                  useMapStore
                    .getState()
                    .patchNodeLocal(node.id, { name: trimmed })
                  try {
                    // savedAction wrappt → SaveIndicator zeigt 'speichere…'
                    // und springt auf 'gespeichert' sobald durch
                    await savedAction(() =>
                      updateNodeAction(node.id, { name: trimmed }),
                    )
                  } catch (err) {
                    console.error('Name speichern fehlgeschlagen', err)
                  }
                }
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div
              className="line-clamp-2 font-semibold leading-tight"
              style={{ fontSize: `${13 * fontScale}px` }}
            >
              {node.name}
            </div>
          )}
          {/* AUSFÜHRLICH: Short-Desc fest, Description-Anschnitt, Tasks-Count */}
          {detailLevel === 'full' && !editing && (
            <>
              {node.short_desc && (
                <div
                  className="line-clamp-1 italic opacity-85"
                  style={{ fontSize: `${10 * fontScale}px` }}
                >
                  {node.short_desc}
                </div>
              )}
              {node.description && (
                <div
                  className="line-clamp-2 opacity-70"
                  style={{ fontSize: `${9 * fontScale}px` }}
                >
                  {node.description}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step-Pille: nur in Normal + Ausführlich, NICHT bei Sticky-Notes */}
      {detailLevel !== 'simple' && !isNote && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            useMapStore.getState().selectNode(node.id)
          }}
          title={`Schritt ${node.step_number} — klicken zum Bearbeiten`}
          className="absolute -left-2 -top-2 flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full border border-line bg-bg2 px-1.5 font-mono text-xs font-semibold text-text shadow-soft transition hover:scale-110"
        >
          {node.step_number}
        </button>
      )}

      {/* Status-Smiley: klickbar = Cycle durch alle Status-Werte (Quick-Toggle) */}
      {detailLevel !== 'simple' && !isNote && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            void cycleStatus(node)
          }}
          title="Klicken um Status zu wechseln (Idee → Aktiv → Fertig → ...)"
          className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-bg2 text-sm shadow-soft transition hover:scale-110"
        >
          {node.status_icon}
        </button>
      )}

      {/* Progress-Bar: klickbar = öffnet Detail-Panel (Slider). Drag entlang
          der Bar setzt Fortschritt direkt prozentual zur Klickposition. */}
      {detailLevel !== 'simple' && !isNote && (
        <ProgressBar node={node} />
      )}

      {/* Ausführlich-only: Tasks-Count-Badge unten links */}
      {detailLevel === 'full' && !isNote && <TasksBadge nodeId={node.id} />}

      {/* Locked-Knoten: kein Resize. Stattdessen kleines Schloss-Indikator unten rechts. */}
      {selected && !connectMode && !editing && !node.locked && (
        <>
          <ResizeHandle
            corner="tl"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'tl')}
          />
          <ResizeHandle
            corner="tr"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'tr')}
          />
          <ResizeHandle
            corner="bl"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'bl')}
          />
          <ResizeHandle
            corner="br"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'br')}
          />
          {/* Kanten-Handles für 1D-Resize */}
          <ResizeHandle
            corner="t"
            onMouseDown={(e) => onMouseDownHandle(e, node, 't')}
          />
          <ResizeHandle
            corner="r"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'r')}
          />
          <ResizeHandle
            corner="b"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'b')}
          />
          <ResizeHandle
            corner="l"
            onMouseDown={(e) => onMouseDownHandle(e, node, 'l')}
          />
        </>
      )}

      {node.locked && (
        <div
          className="pointer-events-none absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bg2 text-[10px] shadow-soft"
          title="Knoten ist fixiert (gesperrt)"
        >
          🔒
        </div>
      )}

      {/* Drag-to-Connect: 4 Anchors am Rand. Erscheinen beim Hover über
          dem Knoten, sind aber sonst dezent (sonst zu viel UI-Rauschen).
          Nicht bei Sticky-Notes, nicht bei locked-Knoten, nicht im
          Connect-Mode (da läuft schon der alte Modus). */}
      {!isNote && !node.locked && !connectMode && !editing && onMouseDownAnchor && (
        <>
          <ConnectAnchorDot
            position="top"
            onMouseDown={(e) => onMouseDownAnchor(e, node, 'top')}
          />
          <ConnectAnchorDot
            position="right"
            onMouseDown={(e) => onMouseDownAnchor(e, node, 'right')}
          />
          <ConnectAnchorDot
            position="bottom"
            onMouseDown={(e) => onMouseDownAnchor(e, node, 'bottom')}
          />
          <ConnectAnchorDot
            position="left"
            onMouseDown={(e) => onMouseDownAnchor(e, node, 'left')}
          />
        </>
      )}
    </div>
  )
}

function ConnectAnchorDot({
  position,
  onMouseDown,
}: {
  position: ConnectAnchor
  onMouseDown: (e: ReactMouseEvent) => void
}) {
  const cls = {
    top: '-top-2 left-1/2 -translate-x-1/2',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2',
    left: '-left-2 top-1/2 -translate-y-1/2',
    right: '-right-2 top-1/2 -translate-y-1/2',
  }[position]

  return (
    <div
      onMouseDown={onMouseDown}
      title="Ziehen, um Knoten zu verbinden"
      className={cn(
        'absolute z-10 h-3 w-3 cursor-crosshair rounded-full border-2 border-bg2 bg-accent2 opacity-0 shadow-soft transition-opacity hover:scale-125 group-hover:opacity-100',
        cls,
      )}
    />
  )
}

function TasksBadge({ nodeId }: { nodeId: string }) {
  const total = useMapStore(
    (s) => s.tasks.filter((t) => t.node_id === nodeId).length,
  )
  const done = useMapStore(
    (s) => s.tasks.filter((t) => t.node_id === nodeId && t.done).length,
  )
  if (total === 0) return null
  return (
    <div
      className="absolute -bottom-2 -left-2 flex h-5 items-center gap-1 rounded-full bg-bg2 px-1.5 font-mono text-[10px] font-semibold text-text shadow-soft"
      title={`${done} von ${total} Aufgaben erledigt`}
    >
      <span>☑</span>
      <span>
        {done}/{total}
      </span>
    </div>
  )
}

function NameInput({
  initial,
  fontSize,
  color,
  onCommit,
  onCancel,
}: {
  initial: string
  fontSize: number
  color: string
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <input
      ref={ref}
      defaultValue={initial}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onCommit((e.target as HTMLInputElement).value)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
        e.stopPropagation()
      }}
      className="w-full bg-transparent text-center font-semibold leading-tight outline-none ring-1 ring-white/40"
      style={{ fontSize: `${fontSize}px`, color }}
    />
  )
}

function ResizeHandle({
  corner,
  onMouseDown,
}: {
  corner: ResizeCorner
  onMouseDown: (e: ReactMouseEvent) => void
}) {
  const isCorner = corner.length === 2
  const cls = {
    tl: '-top-1.5 -left-1.5 cursor-nwse-resize',
    tr: '-top-1.5 -right-1.5 cursor-nesw-resize',
    bl: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
    br: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
    t: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
    r: '-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize',
    b: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
    l: '-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize',
  }[corner]

  // Eck-Handles: rund (klassisch). Kanten-Handles: schmaler Strich,
  // damit sie nicht so dominant sind und sich klar von den Ecken
  // unterscheiden.
  const shape = isCorner
    ? 'h-3 w-3 rounded-full'
    : corner === 't' || corner === 'b'
      ? 'h-2 w-6 rounded-md'
      : 'h-6 w-2 rounded-md'

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'absolute z-10 border-2 border-bg2 bg-accent shadow-soft',
        shape,
        cls,
      )}
    />
  )
}

// Status-Cycle: jedes Klicken auf das Smiley wechselt zur nächsten Stufe.
// Reihenfolge spiegelt einen typischen Workflow: Idee → Bereit → Aktiv →
// Achtung → Blockiert → Fertig (und wieder von vorn).
const STATUS_CYCLE: { status: string; icon: string }[] = [
  { status: 'idea', icon: '🌱' },
  { status: 'ready', icon: '🚀' },
  { status: 'wip', icon: '⏳' },
  { status: 'warning', icon: '⚠️' },
  { status: 'blocked', icon: '🔒' },
  { status: 'done', icon: '✅' },
]

async function cycleStatus(node: NodeRow) {
  const idx = STATUS_CYCLE.findIndex((s) => s.status === node.status)
  const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]!
  // Auto-Adjust progress: bei 'done' = 100, bei 'idea' = 0 wenn bisher 0/100
  const progressPatch =
    next.status === 'done'
      ? { progress: 100 }
      : next.status === 'idea' && (node.progress === 100 || node.progress === 0)
        ? { progress: 0 }
        : {}
  const patch: Partial<NodeRow> = {
    status: next.status,
    status_icon: next.icon,
    ...progressPatch,
  }
  // Vor-Werte für Undo
  const before: Partial<NodeRow> = {
    status: node.status,
    status_icon: node.status_icon,
    ...('progress' in progressPatch ? { progress: node.progress } : {}),
  }
  useMapStore
    .getState()
    .pushHistory({ type: 'patch-node', nodeId: node.id, before, after: patch })
  useMapStore.getState().patchNodeLocal(node.id, patch)
  try {
    await savedAction(() => updateNodeAction(node.id, patch))
  } catch (err) {
    console.error('Status konnte nicht gespeichert werden', err)
  }
}

// ProgressBar: klick/drag entlang der Bar setzt den Fortschritt prozentual
// zur Klickposition. Bei 100 → done, bei 0 → idea (Auto-Status).
function ProgressBar({ node }: { node: NodeRow }) {
  const ref = useRef<HTMLDivElement>(null)

  const setFromEvent = (clientX: number, commit: boolean) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const progress = Math.round(ratio * 100 / 5) * 5 // snap auf 5%
    // Auto-Status nach Progress
    let nextStatus = node.status
    let nextIcon = node.status_icon
    if (progress === 100) {
      nextStatus = 'done'
      nextIcon = '✅'
    } else if (progress === 0) {
      nextStatus = 'idea'
      nextIcon = '🌱'
    } else if (node.status !== 'wip' && node.status !== 'warning') {
      nextStatus = 'wip'
      nextIcon = '⏳'
    }
    const patch: Partial<NodeRow> = {
      progress,
      status: nextStatus,
      status_icon: nextIcon,
    }
    useMapStore.getState().patchNodeLocal(node.id, patch)
    if (commit && progress !== node.progress) {
      const before: Partial<NodeRow> = {
        progress: node.progress,
        status: node.status,
        status_icon: node.status_icon,
      }
      useMapStore
        .getState()
        .pushHistory({ type: 'patch-node', nodeId: node.id, before, after: patch })
      void savedAction(() => updateNodeAction(node.id, patch)).catch((err) =>
        console.error('Fortschritt konnte nicht gespeichert werden', err),
      )
    }
  }

  const onMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setFromEvent(e.clientX, false)
    const onMove = (ev: MouseEvent) => setFromEvent(ev.clientX, false)
    const onUp = (ev: MouseEvent) => {
      setFromEvent(ev.clientX, true)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (node.progress === 0) {
    // Subtil-Track damit man weiß: hier kann ich klicken um Fortschritt zu setzen
    return (
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        title="Klick/Ziehen: Fortschritt setzen"
        className="absolute bottom-1 left-2 right-2 h-1 cursor-ew-resize overflow-hidden rounded-full bg-black/8 opacity-0 transition group-hover:opacity-100 hover:!opacity-100"
      />
    )
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      title={`${node.progress}% — klick/zieh um zu ändern`}
      className="absolute bottom-1 left-2 right-2 h-1.5 cursor-ew-resize overflow-hidden rounded-full bg-black/15 transition hover:h-2"
    >
      <div
        className="h-full bg-white/85"
        style={{ width: `${node.progress}%` }}
      />
    </div>
  )
}

/**
 * React.memo: re-rendert nur wenn sich props ändern. Reduziert deutlich
 * die Anzahl Re-Renders während Drag/Pan/Zoom (jeder Knoten wird sonst
 * bei jeder Maus-Bewegung neu gerendert, weil der Parent neu rendert).
 *
 * Custom comparator: Identity-Vergleich auf node + flat-Vergleich auf
 * scalar booleans. Funktionen `onMouseDownNode` / `onMouseDownHandle` werden
 * im WorkflowView per useCallback stabil gehalten.
 */
export const Node = memo(NodeImpl, (prev, next) => {
  if (prev.node !== next.node) return false
  if (prev.selected !== next.selected) return false
  if (prev.multiSelected !== next.multiSelected) return false
  if (prev.connectMode !== next.connectMode) return false
  if (prev.isConnectStart !== next.isConnectStart) return false
  if (prev.dimmed !== next.dimmed) return false
  if (prev.onMouseDownNode !== next.onMouseDownNode) return false
  if (prev.onMouseDownHandle !== next.onMouseDownHandle) return false
  return true
})

