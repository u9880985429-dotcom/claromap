'use client'

import {
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

export function Node({
  node,
  selected,
  connectMode,
  isConnectStart,
  dimmed = false,
  onMouseDownNode,
  onMouseDownHandle,
}: Props) {
  const detailLevel = useUIStore((s) => s.detailLevel)

  const [editing, setEditing] = useState(false)
  const isDiamond = node.shape === 'diamond'
  const radius = isDiamond
    ? '0%'
    : node.shape === 'leaf'
      ? '50% 0 50% 0'
      : node.shape
  const fontScale = Math.max(0.7, Math.min(1.4, node.width / 120))

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
        isConnectStart && 'ring-4 ring-accent2 ring-offset-2',
      )}
      style={{
        left: node.position_x,
        top: node.position_y,
        width: node.width,
        height: node.height,
        background: isDiamond ? 'transparent' : node.color,
        color: node.text_color,
        borderRadius: radius,
        boxShadow: isDiamond
          ? 'none'
          : selected
            ? '0 12px 32px rgba(0,0,0,0.20)'
            : '0 2px 8px rgba(0,0,0,0.10)',
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
            background: node.color,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
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
        {detailLevel === 'full' && node.short_desc && !editing && (
          <div
            className="line-clamp-1 opacity-80"
            style={{ fontSize: `${10 * fontScale}px` }}
          >
            {node.short_desc}
          </div>
        )}
      </div>

      {detailLevel !== 'simple' && (
        <div className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-line bg-bg2 px-1.5 font-mono text-xs font-semibold text-text shadow-soft">
          {node.step_number}
        </div>
      )}

      {detailLevel !== 'simple' && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bg2 text-sm shadow-soft">
          {node.status_icon}
        </div>
      )}

      {node.progress > 0 && (
        <div className="absolute bottom-1 left-2 right-2 h-1 overflow-hidden rounded-full bg-black/15">
          <div
            className="h-full bg-white/85"
            style={{ width: `${node.progress}%` }}
          />
        </div>
      )}

      {selected && !connectMode && !editing && (
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
