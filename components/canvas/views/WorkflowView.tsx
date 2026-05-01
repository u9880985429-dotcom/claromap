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
import { savedAction } from '@/lib/utils/savedAction'
import { undo, redo } from '@/lib/utils/undoRedo'
import { cn } from '@/lib/utils/cn'

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
      // Bulk-Drag: alle weiteren selektierten Knoten mit ihren Start-Positionen.
      // Leeres Array = single-Drag wie bisher.
      others: { nodeId: string; startX: number; startY: number }[]
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
  const selectedNodeIds = useMapStore((s) => s.selectedNodeIds)
  const map = useMapStore((s) => s.map)
  const historyIndex = useMapStore((s) => s.historyIndex)
  const historyLength = useMapStore((s) => s.history.length)
  const canUndoNow = historyIndex > 0
  const canRedoNow = historyIndex < historyLength

  const scale = useUIStore((s) => s.scale)
  const panX = useUIStore((s) => s.panX)
  const panY = useUIStore((s) => s.panY)
  const connectMode = useUIStore((s) => s.connectMode)
  const connectFromNodeId = useUIStore((s) => s.connectFromNodeId)
  const theme = useUIStore((s) => s.theme)
  const focusMode = useUIStore((s) => s.focusMode)
  const handTool = useUIStore((s) => s.handTool)

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
      const snap = useUIStore.getState().snapToGrid
      // Effektives Delta in Map-Koordinaten — konsistent für alle Knoten,
      // damit relative Abstände bei Bulk-Drag erhalten bleiben.
      let effDx = Math.round(dx / currentScale)
      let effDy = Math.round(dy / currentScale)
      if (snap) {
        // Auf den primären Knoten aligned snappen, dann delta reisen lassen
        const targetX =
          Math.round((state.startX + effDx) / 24) * 24 - state.startX
        const targetY =
          Math.round((state.startY + effDy) / 24) * 24 - state.startY
        effDx = targetX
        effDy = targetY
      }
      useMapStore.getState().patchNodeLocal(state.nodeId, {
        position_x: state.startX + effDx,
        position_y: state.startY + effDy,
      })
      // Mit-bewegen aller anderen Bulk-Selected
      for (const o of state.others) {
        useMapStore.getState().patchNodeLocal(o.nodeId, {
          position_x: o.startX + effDx,
          position_y: o.startY + effDy,
        })
      }
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
      const allNodes = useMapStore.getState().nodes
      const primary = allNodes.find((x) => x.id === state.nodeId)
      if (!primary) return

      const moved =
        primary.position_x !== state.startX ||
        primary.position_y !== state.startY

      if (state.others.length === 0) {
        // Single-Drag — wie bisher
        if (moved) {
          useMapStore.getState().pushHistory({
            type: 'patch-node',
            nodeId: state.nodeId,
            before: { position_x: state.startX, position_y: state.startY },
            after: {
              position_x: primary.position_x,
              position_y: primary.position_y,
            },
          })
          savedAction(() =>
            updateNodeAction(state.nodeId, {
              position_x: primary.position_x,
              position_y: primary.position_y,
            }),
          ).catch((err) =>
            console.error('Position konnte nicht gespeichert werden', err),
          )
        }
      } else if (moved) {
        // Bulk-Drag — ein History-Eintrag für alle, parallele Server-Saves
        const patches = [
          {
            nodeId: state.nodeId,
            before: { position_x: state.startX, position_y: state.startY },
            after: {
              position_x: primary.position_x,
              position_y: primary.position_y,
            },
          },
          ...state.others.flatMap((o) => {
            const n = allNodes.find((x) => x.id === o.nodeId)
            if (!n) return []
            return [
              {
                nodeId: o.nodeId,
                before: { position_x: o.startX, position_y: o.startY },
                after: {
                  position_x: n.position_x,
                  position_y: n.position_y,
                },
              },
            ]
          }),
        ]
        useMapStore.getState().pushHistory({
          type: 'bulk-patch-nodes',
          patches,
        })
        savedAction(() =>
          Promise.all(
            patches.map((p) => updateNodeAction(p.nodeId, p.after)),
          ),
        ).catch((err) =>
          console.error('Bulk-Positionen konnten nicht gespeichert werden', err),
        )
      }
    } else if (state.kind === 'resize-node') {
      const n = useMapStore
        .getState()
        .nodes.find((x) => x.id === state.nodeId)
      if (n) {
        // History für Undo
        useMapStore.getState().pushHistory({
          type: 'patch-node',
          nodeId: state.nodeId,
          before: {
            position_x: state.startX,
            position_y: state.startY,
            width: state.startW,
            height: state.startH,
          },
          after: {
            position_x: n.position_x,
            position_y: n.position_y,
            width: n.width,
            height: n.height,
          },
        })
        savedAction(() =>
          updateNodeAction(state.nodeId, {
            position_x: n.position_x,
            position_y: n.position_y,
            width: n.width,
            height: n.height,
          }),
        ).catch((err) =>
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
    // Shift+Background-Klick: Selektion BEIBEHALTEN (Pan ohne Auswahl-Verlust),
    // damit Multi-Select-User scrollen können ohne ihre Auswahl zu verlieren.
    if (!e.shiftKey) {
      useMapStore.getState().selectNode(null)
      useMapStore.getState().selectConnection(null)
    }
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
    const store = useMapStore.getState()

    // Hand-Tool: Klick auf Knoten = Pan starten (genau wie Hintergrund)
    if (ui.handTool && !ui.connectMode) {
      dragRef.current = {
        kind: 'pan',
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPanX: ui.panX,
        startPanY: ui.panY,
      }
      startDragListeners()
      return
    }

    // Shift / Cmd / Ctrl + Click → Multi-Select toggeln, KEIN Drag starten
    if (
      !ui.connectMode &&
      (e.shiftKey || e.metaKey || e.ctrlKey)
    ) {
      store.toggleNodeSelection(node.id)
      return
    }

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

      savedAction(() =>
        createConnectionAction({
          map_id: mapId,
          from_node_id: fromId,
          to_node_id: toId,
        }),
      )
        .then((real) => {
          useMapStore.setState((s) => ({
            connections: s.connections.map((c) =>
              c.id === tempId ? real : c,
            ),
          }))
          // History für Undo: erst nach Server-Bestätigung mit echter ID
          useMapStore
            .getState()
            .pushHistory({ type: 'create-connection', conn: real })
        })
        .catch((err) => {
          console.error('Verbindung konnte nicht gespeichert werden', err)
          useMapStore.getState().removeConnection(tempId)
        })
      return
    }

    // Wenn der angeklickte Knoten Teil einer bestehenden Multi-Selection ist:
    // Selection NICHT zurücksetzen (sonst geht Bulk verloren) → Bulk-Drag
    // mit allen Selected. Sonst: Single-Select + Single-Drag.
    const currentSelected = store.selectedNodeIds
    const isPartOfMulti =
      currentSelected.size > 1 && currentSelected.has(node.id)

    const others: { nodeId: string; startX: number; startY: number }[] = []
    if (isPartOfMulti) {
      const nodesById = new Map(store.nodes.map((n) => [n.id, n]))
      for (const id of currentSelected) {
        if (id === node.id) continue
        const n = nodesById.get(id)
        if (!n) continue
        others.push({
          nodeId: id,
          startX: n.position_x,
          startY: n.position_y,
        })
      }
    } else {
      store.selectNode(node.id)
    }

    dragRef.current = {
      kind: 'drag-node',
      nodeId: node.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: node.position_x,
      startY: node.position_y,
      others,
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
      // Undo/Redo: Cmd+Z / Cmd+Shift+Z (Mac), Ctrl+Z / Ctrl+Shift+Z (Win/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
      // Cmd+Y als alternativer Redo-Shortcut
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useMapStore.getState()
        const ids = Array.from(state.selectedNodeIds)
        if (ids.length === 0) return
        e.preventDefault()

        if (ids.length === 1) {
          // Single-Delete (alter Pfad)
          const id = ids[0]!
          const node = state.nodes.find((n) => n.id === id)
          if (node) {
            const conns = state.connections.filter(
              (c) => c.from_node_id === id || c.to_node_id === id,
            )
            const tasks = state.tasks.filter((t) => t.node_id === id)
            state.pushHistory({
              type: 'delete-node',
              node,
              connections: conns,
              tasks,
            })
          }
          state.removeNode(id)
          savedAction(() => deleteNodeAction(id)).catch((err) =>
            console.error('Knoten konnte nicht gelöscht werden', err),
          )
        } else {
          // Bulk-Delete
          const idSet = new Set(ids)
          const items = ids.flatMap((id) => {
            const node = state.nodes.find((n) => n.id === id)
            if (!node) return []
            const conns = state.connections.filter(
              (c) => c.from_node_id === id || c.to_node_id === id,
            )
            const tasks = state.tasks.filter((t) => t.node_id === id)
            return [{ node, connections: conns, tasks }]
          })
          state.pushHistory({ type: 'bulk-delete-nodes', items })
          for (const id of idSet) state.removeNode(id)
          savedAction(() =>
            Promise.all(ids.map((id) => deleteNodeAction(id))),
          ).catch((err) =>
            console.error('Knoten konnten nicht gelöscht werden', err),
          )
        }
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
      } else if (e.key === 'h' || e.key === 'H') {
        // Hand-Tool toggeln: jeder Klick wird zum Pan
        e.preventDefault()
        useUIStore.getState().toggleHandTool()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Eine Funktion für alle Shape-Quick-Adds. Defaults pro Shape, der Rest
  // bleibt Standard (handle_new_user-Trigger setzt sinnvolle Werte).
  const handleAddShape = async (
    shape: 'rect' | 'rounded' | 'diamond' | 'circle' | 'leaf' | 'note',
  ) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const ui = useUIStore.getState()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const cfg = {
      rect: { width: 140, height: 100, shape: '8%' as const },
      rounded: { width: 140, height: 100, shape: '20%' as const },
      diamond: { width: 140, height: 140, shape: 'diamond' as const },
      circle: { width: 120, height: 120, shape: '50%' as const },
      leaf: { width: 140, height: 140, shape: 'leaf' as const },
      note: { width: 160, height: 160, shape: 'note' as const },
    }[shape]

    const nodeX = (centerX - ui.panX) / ui.scale - cfg.width / 2
    const nodeY = (centerY - ui.panY) / ui.scale - cfg.height / 2
    const existing = useMapStore.getState().nodes
    const nextStep =
      existing.length === 0
        ? 1
        : Math.max(...existing.map((n) => n.step_number)) + 1

    const isNote = shape === 'note'
    try {
      const created = await savedAction(() =>
        createNodeAction({
          map_id: mapId,
          step_number: nextStep,
          position_x: Math.round(nodeX),
          position_y: Math.round(nodeY),
          width: cfg.width,
          height: cfg.height,
          shape: cfg.shape,
          ...(isNote
            ? {
                color: '#FEF3C7',
                text_color: '#1A1410',
                name: 'Notiz',
                emoji: '📝',
                status: 'idea',
                status_icon: '🌱',
              }
            : {}),
        }),
      )
      useMapStore.getState().upsertNode(created)
      useMapStore.getState().selectNode(created.id)
      useMapStore.getState().pushHistory({ type: 'create-node', node: created })
    } catch (err) {
      console.error('Knoten konnte nicht erstellt werden', err)
    }
  }

  const handleDeleteSelected = async () => {
    const state = useMapStore.getState()
    const ids = Array.from(state.selectedNodeIds)
    if (ids.length === 0) return

    if (ids.length === 1) {
      const id = ids[0]!
      const node = state.nodes.find((n) => n.id === id)
      if (!node) return
      const conns = state.connections.filter(
        (c) => c.from_node_id === id || c.to_node_id === id,
      )
      const tasks = state.tasks.filter((t) => t.node_id === id)
      state.pushHistory({
        type: 'delete-node',
        node,
        connections: conns,
        tasks,
      })
      state.removeNode(id)
      try {
        await savedAction(() => deleteNodeAction(id))
      } catch (err) {
        console.error(err)
      }
      return
    }

    // Bulk
    const items = ids.flatMap((id) => {
      const node = state.nodes.find((n) => n.id === id)
      if (!node) return []
      const conns = state.connections.filter(
        (c) => c.from_node_id === id || c.to_node_id === id,
      )
      const tasks = state.tasks.filter((t) => t.node_id === id)
      return [{ node, connections: conns, tasks }]
    })
    state.pushHistory({ type: 'bulk-delete-nodes', items })
    for (const id of ids) state.removeNode(id)
    try {
      await savedAction(() =>
        Promise.all(ids.map((id) => deleteNodeAction(id))),
      )
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
      className={cn(
        'relative h-full w-full overflow-hidden bg-bg',
        handTool && 'cursor-grab active:cursor-grabbing',
      )}
      style={patternStyle}
    >
      <CanvasToolbar
        scale={scale}
        connectMode={connectMode}
        handTool={handTool}
        selectedExists={selectedNodeIds.size > 0}
        canUndo={canUndoNow}
        canRedo={canRedoNow}
        onAddShape={handleAddShape}
        onToggleConnect={() => useUIStore.getState().toggleConnectMode()}
        onToggleHandTool={() => useUIStore.getState().toggleHandTool()}
        onDeleteSelected={handleDeleteSelected}
        onUndo={() => undo()}
        onRedo={() => redo()}
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

      {selectedNodeIds.size > 1 && !connectMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-purple px-4 py-1.5 text-sm font-medium text-white shadow-mid">
          {selectedNodeIds.size} Knoten ausgewählt · Ziehen verschiebt alle, <kbd className="rounded bg-white/20 px-1 font-mono text-xs">⌫</kbd> löscht alle, <kbd className="rounded bg-white/20 px-1 font-mono text-xs">Esc</kbd> hebt auf
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
          const isSingleSelected = selectedNodeId === node.id
          const isInMulti =
            selectedNodeIds.size > 1 && selectedNodeIds.has(node.id)
          return (
            <Node
              key={node.id}
              node={node}
              selected={isSingleSelected}
              multiSelected={isInMulti}
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
          <div className="pointer-events-auto flex flex-col items-center gap-5 rounded-2xl border border-dashed border-line2 bg-bg2/90 px-10 py-8 text-center shadow-soft backdrop-blur">
            <div>
              <p className="font-display text-xl font-semibold">
                Leinwand bereit
              </p>
              <p className="mt-1.5 text-sm text-text3">
                Wähle eine Form oder eine Aktion, um zu starten.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <WelcomeAction
                onClick={() => handleAddShape('rounded')}
                label="Rechteck"
              />
              <WelcomeAction
                onClick={() => handleAddShape('diamond')}
                label="Raute"
              />
              <WelcomeAction
                onClick={() => handleAddShape('circle')}
                label="Kreis"
              />
              <WelcomeAction
                onClick={() => handleAddShape('note')}
                label="Notiz"
              />
            </div>
            <div className="flex items-center gap-3 border-t border-line pt-3 font-mono text-[11px] text-text4">
              <span>
                Drück <kbd className="rounded bg-bg3 px-1 py-0.5">?</kbd> für
                alle Tastatur-Kürzel
              </span>
              <span>·</span>
              <span>
                <kbd className="rounded bg-bg3 px-1 py-0.5">⌘P</kbd> sucht in
                allen Maps
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WelcomeAction({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-line bg-bg3/40 px-3 py-1.5 text-sm font-medium text-text2 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
    >
      + {label}
    </button>
  )
}
