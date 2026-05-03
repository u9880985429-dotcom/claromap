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

export type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br'

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

  return (
    <div
      className={cn(
        'claromap-node absolute select-none transition-shadow',
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
                useMapStore
                  .getState()
                  .patchNodeLocal(node.id, { name: trimmed })
                try {
                  await updateNodeAction(node.id, { name: trimmed })
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

      {/* Step-Pille: nur in Normal + Ausführlich, NICHT bei Sticky-Notes */}
      {detailLevel !== 'simple' && !isNote && (
        <div className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-line bg-bg2 px-1.5 font-mono text-xs font-semibold text-text shadow-soft">
          {node.step_number}
        </div>
      )}

      {/* Status-Smiley: nur in Normal + Ausführlich, NICHT bei Sticky-Notes */}
      {detailLevel !== 'simple' && !isNote && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bg2 text-sm shadow-soft">
          {node.status_icon}
        </div>
      )}

      {/* Progress-Bar: nur in Normal + Ausführlich, NICHT bei Sticky-Notes */}
      {detailLevel !== 'simple' && !isNote && node.progress > 0 && (
        <div className="absolute bottom-1 left-2 right-2 h-1 overflow-hidden rounded-full bg-black/15">
          <div
            className="h-full bg-white/85"
            style={{ width: `${node.progress}%` }}
          />
        </div>
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
    </div>
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
  const cls = {
    tl: '-top-1.5 -left-1.5 cursor-nwse-resize',
    tr: '-top-1.5 -right-1.5 cursor-nesw-resize',
    bl: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
    br: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
  }[corner]

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'absolute z-10 h-3 w-3 rounded-full border-2 border-bg2 bg-accent shadow-soft',
        cls,
      )}
    />
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

