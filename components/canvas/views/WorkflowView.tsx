'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { useMemo } from 'react'
import {
  useMapStore,
  type ConnectionRow,
  type NodeRow,
} from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { Node, type ResizeCorner } from '../Node'
import { ConnectionLine } from '../ConnectionLine'
import { CanvasToolbar } from '../CanvasToolbar'
import {
  createConnectionAction,
  createNodeAction,
  deleteNodeAction,
  updateNodeAction,
} from '@/app/(dashboard)/maps/[id]/actions'

type DragState =
  | {
      kind: 'pan'
      startMouseX: number
      startMouseY: number
      startPanX: number
      startPanY: number
    }
  | {
      kind: 'drag-node'
      nodeId: string
      startMouseX: number
      startMouseY: number
      startX: number
      startY: number
    }
  | {
      kind: 'resize-node'
      nodeId: string
      corner: ResizeCorner
      startMouseX: number
      startMouseY: number
      startX: number
      startY: number
      startW: number
      startH: number
    }

const MIN_NODE_SIZE = 60
const MAX_NODE_SIZE = 300

interface Props {
  mapId: string
}

export function WorkflowView({ mapId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const dragAbortRef = useRef<AbortController | null>(null)

  const nodes = useMapStore((s) => s.nodes)
  const connections = useMapStore((s) => s.connections)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const map = useMapStore((s) => s.map)

  const scale = useUIStore((s) => s.scale)
  const panX = useUIStore((s) => s.panX)
  const panY = useUIStore((s) => s.panY)
  const connectMode = useUIStore((s) => s.connectMode)
  const connectFromNodeId = useUIStore((s) => s.connectFromNodeId)
  const theme = useUIStore((s) => s.theme)
  const focusMode = useUIStore((s) => s.focusMode)

  // Im Focus-Mode: nur Knoten die mit dem selektierten direkt verbunden sind
  // (oder der selektierte selbst) bleiben voll sichtbar.
  const focusVisibleIds = useMemo(() => {
    if (!focusMode || !selectedNodeId) return null
    const visible = new Set<string>([selectedNodeId])
    for (const c of connections) {
      if (c.from_node_id === selectedNodeId) visible.add(c.to_node_id)
      if (c.to_node_id === selectedNodeId) visible.add(c.from_node_id)
    }
    return visible
  }, [focusMode, selectedNodeId, connections])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const state = dragRef.current
    if (!state) return

    const dx = e.clientX - state.startMouseX
    const dy = e.clientY - state.startMouseY
    const currentScale = useUIStore.getState().scale

    if (state.kind === 'pan') {
      useUIStore.getState().setPan(state.startPanX + dx, state.startPanY + dy)
      return
    }

    if (state.kind === 'drag-node') {
      const newX = Math.round(state.startX + dx / currentScale)
      const newY = Math.round(state.startY + dy / currentScale)
      useMapStore.getState().patchNodeLocal(state.nodeId, {
        position_x: newX,
        position_y: newY,
      })
      return
    }

    if (state.kind === 'resize-node') {
      const dxs = dx / currentScale
      const dys = dy / currentScale
      let newX = state.startX
      let newY = state.startY
      let newW = state.startW
      let newH = state.startH
      const clamp = (v: number) =>
        Math.max(MIN_NODE_SIZE, Math.min(MAX_NODE_SIZE, v))

      if (state.corner === 'br') {
        newW = clamp(state.startW + dxs)
        newH = clamp(state.startH + dys)
      } else if (state.corner === 'bl') {
        const w = clamp(state.startW - dxs)
        newX = state.startX + (state.startW - w)
        newW = w
        newH = clamp(state.startH + dys)
      } else if (state.corner === 'tr') {
        newW = clamp(state.startW + dxs)
        const h = clamp(state.startH - dys)
        newY = state.startY + (state.startH - h)
        newH = h
      } else {
        const w = clamp(state.startW - dxs)
        newX = state.startX + (state.startW - w)
        newW = w
        const h = clamp(state.startH - dys)
        newY = state.startY + (state.startH - h)
        newH = h
      }

      useMapStore.getState().patchNodeLocal(state.nodeId, {
        position_x: Math.round(newX),
        position_y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      })
    }
  }, [])

  const onMouseUp = useCallback(() => {
    const state = dragRef.current
    if (!state) return

    dragAbortRef.current?.abort()
    dragAbortRef.current = null
    dragRef.current = null

    if (state.kind === 'drag-node') {
      const n = useMapStore
        .getState()
        .nodes.find((x) => x.id === state.nodeId)
      if (
        n &&
        (n.position_x !== state.startX || n.position_y !== state.startY)
      ) {
        updateNodeAction(state.nodeId, {
          position_x: n.position_x,
          position_y: n.position_y,
        }).catch((err) =>
          console.error('Position konnte nicht gespeichert werden', err),
        )
      }
    } else if (state.kind === 'resize-node') {
      const n = useMapStore
        .getState()
        .nodes.find((x) => x.id === state.nodeId)
      if (n) {
        updateNodeAction(state.nodeId, {
          position_x: n.position_x,
          position_y: n.position_y,
          width: n.width,
          height: n.height,
        }).catch((err) =>
          console.error('Größe konnte nicht gespeichert werden', err),
        )
      }
    }
  }, [])

  const startDragListeners = useCallback(() => {
    dragAbortRef.current?.abort()
    const controller = new AbortController()
    dragAbortRef.current = controller
    document.addEventListener('mousemove', onMouseMove, {
      signal: controller.signal,
    })
    document.addEventListener('mouseup', onMouseUp, {
      signal: controller.signal,
    })
  }, [onMouseMove, onMouseUp])

  const onBackgroundMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return
    useMapStore.getState().selectNode(null)
    useMapStore.getState().selectConnection(null)
    dragRef.current = {
      kind: 'pan',
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: useUIStore.getState().panX,
      startPanY: useUIStore.getState().panY,
    }
    startDragListeners()
  }

  const onNodeMouseDown = (e: ReactMouseEvent, node: NodeRow) => {
    if (e.button !== 0) return
    e.stopPropagation()

    const ui = useUIStore.getState()

    if (ui.connectMode) {
      if (!ui.connectFromNodeId) {
        ui.setConnectFromNodeId(node.id)
        return
      }
      if (ui.connectFromNodeId === node.id) return

      const fromId = ui.connectFromNodeId
      const toId = node.id
      ui.setConnectFromNodeId(null)
      ui.toggleConnectMode()

      const tempId = `temp-${Date.now()}`
      const tempConn: ConnectionRow = {
        id: tempId,
        map_id: mapId,
        from_node_id: fromId,
        to_node_id: toId,
        step_label: null,
        number: null,
        color: null,
        line_style: 'solid',
        created_at: new Date().toISOString(),
      }
      useMapStore.getState().upsertConnection(tempConn)

      createConnectionAction({
        map_id: mapId,
        from_node_id: fromId,
        to_node_id: toId,
      })
        .then((real) => {
          useMapStore.setState((s) => ({
            connections: s.connections.map((c) =>
              c.id === tempId ? real : c,
            ),
          }))
        })
        .catch((err) => {
          console.error('Verbindung konnte nicht gespeichert werden', err)
          useMapStore.getState().removeConnection(tempId)
        })
      return
    }

    useMapStore.getState().selectNode(node.id)
    dragRef.current = {
      kind: 'drag-node',
      nodeId: node.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: node.position_x,
      startY: node.position_y,
    }
    startDragListeners()
  }

  const onResizeHandleMouseDown = (
    e: ReactMouseEvent,
    node: NodeRow,
    corner: ResizeCorner,
  ) => {
    if (e.button !== 0) return
    e.stopPropagation()
    useMapStore.getState().selectNode(node.id)
    dragRef.current = {
      kind: 'resize-node',
      nodeId: node.id,
      corner,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: node.position_x,
      startY: node.position_y,
      startW: node.width,
      startH: node.height,
    }
    startDragListeners()
  }

  const onConnectionClick = (e: ReactMouseEvent<SVGGElement>, id: string) => {
    e.stopPropagation()
    useMapStore.getState().selectConnection(id)
  }

  // Wheel zoom (native listener for passive:false)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      useUIStore.getState().zoomBy(factor, cx, cy)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const sel = useMapStore.getState().selectedNodeId
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel) {
        e.preventDefault()
        useMapStore.getState().removeNode(sel)
        deleteNodeAction(sel).catch((err) =>
          console.error('Knoten konnte nicht gelöscht werden', err),
        )
      } else if (e.key === 'Escape') {
        useMapStore.getState().selectNode(null)
        useMapStore.getState().selectConnection(null)
        const ui = useUIStore.getState()
        if (ui.connectMode) ui.toggleConnectMode()
        if (ui.focusMode) ui.setFocusMode(false)
      } else if ((e.key === 'f' || e.key === 'F') && sel) {
        // Focus-Mode togglen: zeigt nur den selektierten Knoten + direkte
        // Verbindungen, dimmt den Rest.
        e.preventDefault()
        useUIStore.getState().toggleFocusMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAddNode = async () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const ui = useUIStore.getState()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const nodeX = (centerX - ui.panX) / ui.scale - 60
    const nodeY = (centerY - ui.panY) / ui.scale - 60
    const existing = useMapStore.getState().nodes
    const nextStep =
      existing.length === 0
        ? 1
        : Math.max(...existing.map((n) => n.step_number)) + 1

    try {
      const created = await createNodeAction({
        map_id: mapId,
        position_x: Math.round(nodeX),
        position_y: Math.round(nodeY),
        step_number: nextStep,
      })
      useMapStore.getState().upsertNode(created)
      useMapStore.getState().selectNode(created.id)
    } catch (err) {
      console.error('Knoten konnte nicht erstellt werden', err)
    }
  }

  const handleDeleteSelected = async () => {
    const id = useMapStore.getState().selectedNodeId
    if (!id) return
    useMapStore.getState().removeNode(id)
    try {
      await deleteNodeAction(id)
    } catch (err) {
      console.error(err)
    }
  }

  const pattern = map?.background_pattern ?? 'dots'
  const patternStyle = (() => {
    const pos = `${panX}px ${panY}px`
    if (pattern === 'grid') {
      return {
        backgroundImage:
          'linear-gradient(to right, var(--bg-grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--bg-grid-color) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: pos,
      }
    }
    if (pattern === 'lines') {
      return {
        backgroundImage:
          'linear-gradient(to bottom, var(--bg-grid-color) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: pos,
      }
    }
    if (pattern === 'cross') {
      return {
        backgroundImage:
          'repeating-linear-gradient(45deg, var(--bg-grid-color) 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, var(--bg-grid-color) 0 1px, transparent 1px 10px)',
        backgroundSize: '14px 14px',
        backgroundPosition: pos,
      }
    }
    if (pattern === 'none') {
      return {}
    }
    return {
      backgroundImage:
        'radial-gradient(circle, var(--bg-grid-color) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: pos,
    }
  })()

  return (
    <div
      ref={containerRef}
      onMouseDown={onBackgroundMouseDown}
      className="relative h-full w-full overflow-hidden bg-bg"
      style={patternStyle}
    >
      <CanvasToolbar
        scale={scale}
        connectMode={connectMode}
        selectedExists={selectedNodeId !== null}
        onAddNode={handleAddNode}
        onToggleConnect={() => useUIStore.getState().toggleConnectMode()}
        onDeleteSelected={handleDeleteSelected}
        onZoomIn={() => useUIStore.getState().zoomBy(1.2)}
        onZoomOut={() => useUIStore.getState().zoomBy(1 / 1.2)}
        onResetView={() => useUIStore.getState().resetView()}
      />

      {connectMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-mid">
          {connectFromNodeId
            ? 'Klick auf den Ziel-Knoten'
            : 'Klick auf den Start-Knoten'}
        </div>
      )}

      {focusMode && selectedNodeId && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-purple px-4 py-1.5 text-sm font-medium text-white shadow-mid">
          Focus-Mode aktiv · Drück <kbd className="rounded bg-white/20 px-1 font-mono text-xs">F</kbd> oder <kbd className="rounded bg-white/20 px-1 font-mono text-xs">Esc</kbd> zum Aufheben
        </div>
      )}

      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
        }}
      >
        <svg
          className="absolute"
          style={{ left: 0, top: 0, width: 1, height: 1, overflow: 'visible' }}
        >
          {connections.map((c) => {
            const from = nodes.find((n) => n.id === c.from_node_id)
            const to = nodes.find((n) => n.id === c.to_node_id)
            if (!from || !to) return null
            const dimmed =
              focusVisibleIds !== null &&
              !(
                focusVisibleIds.has(c.from_node_id) &&
                focusVisibleIds.has(c.to_node_id)
              )
            return (
              <g
                key={c.id}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => onConnectionClick(e, c.id)}
                className="cursor-pointer transition-opacity"
                style={{
                  pointerEvents: 'stroke',
                  opacity: dimmed ? 0.15 : 1,
                }}
              >
                <ConnectionLine
                  connection={c}
                  fromNode={from}
                  toNode={to}
                  handDrawn={theme === 'hand'}
                />
              </g>
            )
          })}
        </svg>

        {nodes.map((node) => {
          const dimmed =
            focusVisibleIds !== null && !focusVisibleIds.has(node.id)
          return (
            <Node
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              connectMode={connectMode}
              isConnectStart={connectFromNodeId === node.id}
              dimmed={dimmed}
              onMouseDownNode={onNodeMouseDown}
              onMouseDownHandle={onResizeHandleMouseDown}
            />
          )
        })}
      </div>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-dashed border-line2 bg-bg2/80 px-8 py-6 text-center backdrop-blur">
            <p className="font-display text-lg">Leerer Canvas</p>
            <p className="mt-1 text-sm text-text3">
              Klick oben auf <strong>+ Neu</strong> für deinen ersten Knoten.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
