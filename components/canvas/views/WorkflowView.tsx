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
import { AlignToolbar, type AlignDirection } from '../AlignToolbar'
import {
  createConnectionAction,
  createNodeAction,
  deleteNodeAction,
  updateConnectionAction,
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
  | {
      // Pfeil-Endpunkt verschieben — bewegt nur einen End (from oder to).
      // Beim Loslassen über einem Knoten: snap auf diesen Knoten
      // (from_node_id / to_node_id setzen + from_x/y bzw. to_x/y null).
      // Sonst: freie Position speichern (from_x/y bzw. to_x/y).
      kind: 'drag-endpoint'
      connectionId: string
      end: 'from' | 'to'
      // Live-Preview-Position (in Map-Koordinaten)
      currentX: number
      currentY: number
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
  const freeArrowMode = useUIStore((s) => s.freeArrowMode)
  const freeArrowStart = useUIStore((s) => s.freeArrowStart)
  const selectedConnectionId = useMapStore((s) => s.selectedConnectionId)

  // Im Focus-Mode: nur Knoten die mit dem selektierten direkt verbunden sind
  // (oder der selektierte selbst) bleiben voll sichtbar.
  const focusVisibleIds = useMemo(() => {
    if (!focusMode || !selectedNodeId) return null
    const visible = new Set<string>([selectedNodeId])
    for (const c of connections) {
      if (c.from_node_id === selectedNodeId && c.to_node_id) {
        visible.add(c.to_node_id)
      }
      if (c.to_node_id === selectedNodeId && c.from_node_id) {
        visible.add(c.from_node_id)
      }
    }
    return visible
  }, [focusMode, selectedNodeId, connections])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const state = dragRef.current
    if (!state) return

    const currentScale = useUIStore.getState().scale

    // drag-endpoint: nutzt die aktuelle Mausposition direkt (absolute).
    // Dadurch ist die Bewegung pixel-genau am Cursor — keine startMouseX/Y-Diff.
    if (state.kind === 'drag-endpoint') {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const ui = useUIStore.getState()
      const mapX = Math.round((e.clientX - rect.left - ui.panX) / ui.scale)
      const mapY = Math.round((e.clientY - rect.top - ui.panY) / ui.scale)
      state.currentX = mapX
      state.currentY = mapY

      // Live-Preview: lokal patchen, damit der Pfeil dem Cursor folgt.
      // Wir lösen die node-Bindung für den gezogenen Endpunkt und setzen
      // freie Koordinaten — das wird beim Mouse-Up entweder bestätigt oder
      // (bei Snap auf Knoten) durch from_node_id/to_node_id ersetzt.
      if (state.end === 'from') {
        useMapStore.getState().patchConnectionLocal(state.connectionId, {
          from_node_id: null,
          from_x: mapX,
          from_y: mapY,
        })
      } else {
        useMapStore.getState().patchConnectionLocal(state.connectionId, {
          to_node_id: null,
          to_x: mapX,
          to_y: mapY,
        })
      }
      return
    }

    const dx = e.clientX - state.startMouseX
    const dy = e.clientY - state.startMouseY

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
    } else if (state.kind === 'drag-endpoint') {
      // Snap-Test: liegt currentX/Y über einem Knoten?
      const allNodes = useMapStore.getState().nodes
      const hovered = allNodes.find(
        (n) =>
          state.currentX >= n.position_x &&
          state.currentX <= n.position_x + n.width &&
          state.currentY >= n.position_y &&
          state.currentY <= n.position_y + n.height,
      )

      const patch =
        state.end === 'from'
          ? hovered
            ? {
                from_node_id: hovered.id,
                from_x: null,
                from_y: null,
              }
            : {
                from_node_id: null,
                from_x: state.currentX,
                from_y: state.currentY,
              }
          : hovered
            ? {
                to_node_id: hovered.id,
                to_x: null,
                to_y: null,
              }
            : {
                to_node_id: null,
                to_x: state.currentX,
                to_y: state.currentY,
              }

      // Lokal final patchen (wenn snap auf knoten: from_node_id setzen,
      // freie x/y nullen — patchConnectionLocal in onMouseMove hatte schon
      // freie x/y gesetzt; das überschreiben wir hier).
      useMapStore.getState().patchConnectionLocal(state.connectionId, patch)

      savedAction(() =>
        updateConnectionAction(state.connectionId, patch),
      ).catch((err) =>
        console.error('Pfeil-Endpunkt konnte nicht gespeichert werden', err),
      )
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

    const ui = useUIStore.getState()

    // Free-Arrow-Modus: 1. Klick = Start-Punkt, 2. Klick = End-Punkt + erstellen
    if (ui.freeArrowMode) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      // Bildschirm-Koord → Map-Koord (vor Pan/Zoom)
      const mapX = Math.round((e.clientX - rect.left - ui.panX) / ui.scale)
      const mapY = Math.round((e.clientY - rect.top - ui.panY) / ui.scale)

      if (!ui.freeArrowStart) {
        ui.setFreeArrowStart({ x: mapX, y: mapY })
        return
      }

      // Zweiter Klick → Verbindung erzeugen
      const start = ui.freeArrowStart
      ui.setFreeArrowStart(null)
      ui.toggleFreeArrowMode() // wieder aus

      const tempId = `temp-${Date.now()}`
      const tempConn: ConnectionRow = {
        id: tempId,
        map_id: mapId,
        from_node_id: null,
        to_node_id: null,
        from_x: start.x,
        from_y: start.y,
        to_x: mapX,
        to_y: mapY,
        step_label: null,
        number: null,
        color: null,
        line_style: 'solid',
        stroke_width: 'medium',
        animation: 'none',
        created_at: new Date().toISOString(),
      }
      useMapStore.getState().upsertConnection(tempConn)

      savedAction(() =>
        createConnectionAction({
          map_id: mapId,
          from_node_id: null,
          to_node_id: null,
          from_x: start.x,
          from_y: start.y,
          to_x: mapX,
          to_y: mapY,
        }),
      )
        .then((real) => {
          useMapStore.setState((s) => ({
            connections: s.connections.map((c) =>
              c.id === tempId ? real : c,
            ),
          }))
          useMapStore
            .getState()
            .pushHistory({ type: 'create-connection', conn: real })
        })
        .catch((err) => {
          console.error('Freier Pfeil konnte nicht gespeichert werden', err)
          useMapStore.getState().removeConnection(tempId)
        })

      return
    }

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

  const onNodeMouseDown = useCallback((e: ReactMouseEvent, node: NodeRow) => {
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
        from_x: null,
        from_y: null,
        to_x: null,
        to_y: null,
        step_label: null,
        number: null,
        color: null,
        line_style: 'solid',
        stroke_width: 'medium',
        animation: 'none',
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

    // Locked-Knoten: nur selektieren, NICHT draggen. So bleibt das
    // Hintergrund-Layout (z. B. Eisenhower-Quadranten) stabil, ohne dass
    // man den Knoten versehentlich verschiebt.
    if (node.locked) {
      store.selectNode(node.id)
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
        // Locked-Knoten beim Bulk-Drag überspringen
        if (n.locked) continue
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
  }, [mapId, startDragListeners])

  const onResizeHandleMouseDown = useCallback((
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
  }, [startDragListeners])

  const onConnectionClick = useCallback((e: ReactMouseEvent<SVGGElement>, id: string) => {
    e.stopPropagation()
    useMapStore.getState().selectConnection(id)
  }, [])

  // Pfeil-Endpunkt anfassen — startet drag-endpoint. Beim Loslassen
  // (siehe onMouseUp) wird entweder snap-to-node oder freie Position gespeichert.
  const onEndpointMouseDown = useCallback(
    (e: ReactMouseEvent, end: 'from' | 'to', conn: ConnectionRow) => {
      if (e.button !== 0) return
      e.stopPropagation()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const ui = useUIStore.getState()
      const mapX = Math.round((e.clientX - rect.left - ui.panX) / ui.scale)
      const mapY = Math.round((e.clientY - rect.top - ui.panY) / ui.scale)
      dragRef.current = {
        kind: 'drag-endpoint',
        connectionId: conn.id,
        end,
        currentX: mapX,
        currentY: mapY,
      }
      startDragListeners()
    },
    [startDragListeners],
  )

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

  // Cmd+D: Auswahl duplizieren. Kopien werden mit +24px Offset platziert
  // damit sie sichtbar versetzt sind. step_number wird hochgezählt.
  // Nach Erstellung wird die NEUE Auswahl auf die Kopien gesetzt — User
  // kann sofort Cmd+D nochmal drücken oder die Kopien als Block ziehen.
  const duplicateSelection = useCallback(async () => {
    const state = useMapStore.getState()
    const ids = Array.from(state.selectedNodeIds)
    if (ids.length === 0) return
    const sourceNodes = ids
      .map((id) => state.nodes.find((n) => n.id === id))
      .filter((n): n is NodeRow => !!n)
    if (sourceNodes.length === 0) return

    const maxStep =
      state.nodes.length === 0
        ? 0
        : Math.max(...state.nodes.map((n) => n.step_number))
    const OFFSET = 24

    try {
      const created: NodeRow[] = []
      // Sequentiell um deterministische step_number zu vergeben
      for (let i = 0; i < sourceNodes.length; i++) {
        const src = sourceNodes[i]!
        const newNode = await savedAction(() =>
          createNodeAction({
            map_id: mapId,
            step_number: maxStep + 1 + i,
            emoji: src.emoji,
            name: src.name,
            short_desc: src.short_desc,
            description: src.description,
            color: src.color,
            text_color: src.text_color,
            shape: src.shape,
            width: src.width,
            height: src.height,
            position_x: src.position_x + OFFSET,
            position_y: src.position_y + OFFSET,
            status: src.status,
            status_icon: src.status_icon,
            progress: src.progress,
            label_position: src.label_position,
            lane: src.lane,
            // parent_node_id, start_date, end_date NICHT mitkopieren —
            // das wäre meistens nicht das was der User will
          }),
        )
        useMapStore.getState().upsertNode(newNode)
        useMapStore
          .getState()
          .pushHistory({ type: 'create-node', node: newNode })
        created.push(newNode)
      }
      // Auswahl auf die Kopien setzen
      useMapStore.getState().setNodeSelection(created.map((n) => n.id))
    } catch (err) {
      console.error('Knoten konnten nicht dupliziert werden', err)
    }
  }, [mapId])

  // Mehrere Knoten ausrichten / verteilen.
  // - left/center-x/right: an gemeinsamer X-Linie ausrichten
  // - top/center-y/bottom: an gemeinsamer Y-Linie ausrichten
  // - distribute-x/y: erste/letzte bleiben, dazwischen gleichmäßig verteilen
  const alignSelection = useCallback(
    async (direction: AlignDirection) => {
      const state = useMapStore.getState()
      const ids = Array.from(state.selectedNodeIds)
      if (ids.length < 2) return
      const items = ids
        .map((id) => state.nodes.find((n) => n.id === id))
        .filter((n): n is NodeRow => !!n)
      if (items.length < 2) return

      const patches: { nodeId: string; before: Partial<NodeRow>; after: Partial<NodeRow> }[] = []

      const minX = Math.min(...items.map((n) => n.position_x))
      const maxX = Math.max(...items.map((n) => n.position_x + n.width))
      const minY = Math.min(...items.map((n) => n.position_y))
      const maxY = Math.max(...items.map((n) => n.position_y + n.height))
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      if (direction === 'left') {
        for (const n of items) {
          if (n.position_x === minX) continue
          patches.push({
            nodeId: n.id,
            before: { position_x: n.position_x },
            after: { position_x: minX },
          })
        }
      } else if (direction === 'right') {
        for (const n of items) {
          const tx = maxX - n.width
          if (n.position_x === tx) continue
          patches.push({
            nodeId: n.id,
            before: { position_x: n.position_x },
            after: { position_x: tx },
          })
        }
      } else if (direction === 'center-x') {
        for (const n of items) {
          const tx = Math.round(centerX - n.width / 2)
          if (n.position_x === tx) continue
          patches.push({
            nodeId: n.id,
            before: { position_x: n.position_x },
            after: { position_x: tx },
          })
        }
      } else if (direction === 'top') {
        for (const n of items) {
          if (n.position_y === minY) continue
          patches.push({
            nodeId: n.id,
            before: { position_y: n.position_y },
            after: { position_y: minY },
          })
        }
      } else if (direction === 'bottom') {
        for (const n of items) {
          const ty = maxY - n.height
          if (n.position_y === ty) continue
          patches.push({
            nodeId: n.id,
            before: { position_y: n.position_y },
            after: { position_y: ty },
          })
        }
      } else if (direction === 'center-y') {
        for (const n of items) {
          const ty = Math.round(centerY - n.height / 2)
          if (n.position_y === ty) continue
          patches.push({
            nodeId: n.id,
            before: { position_y: n.position_y },
            after: { position_y: ty },
          })
        }
      } else if (direction === 'distribute-x') {
        if (items.length < 3) return
        // Sort nach position_x
        const sorted = [...items].sort((a, b) => a.position_x - b.position_x)
        const first = sorted[0]!
        const last = sorted[sorted.length - 1]!
        // Räume zwischen den Centern gleichmäßig
        const firstCenter = first.position_x + first.width / 2
        const lastCenter = last.position_x + last.width / 2
        const step = (lastCenter - firstCenter) / (sorted.length - 1)
        for (let i = 1; i < sorted.length - 1; i++) {
          const n = sorted[i]!
          const targetCenter = firstCenter + step * i
          const tx = Math.round(targetCenter - n.width / 2)
          if (n.position_x === tx) continue
          patches.push({
            nodeId: n.id,
            before: { position_x: n.position_x },
            after: { position_x: tx },
          })
        }
      } else if (direction === 'distribute-y') {
        if (items.length < 3) return
        const sorted = [...items].sort((a, b) => a.position_y - b.position_y)
        const first = sorted[0]!
        const last = sorted[sorted.length - 1]!
        const firstCenter = first.position_y + first.height / 2
        const lastCenter = last.position_y + last.height / 2
        const step = (lastCenter - firstCenter) / (sorted.length - 1)
        for (let i = 1; i < sorted.length - 1; i++) {
          const n = sorted[i]!
          const targetCenter = firstCenter + step * i
          const ty = Math.round(targetCenter - n.height / 2)
          if (n.position_y === ty) continue
          patches.push({
            nodeId: n.id,
            before: { position_y: n.position_y },
            after: { position_y: ty },
          })
        }
      }

      if (patches.length === 0) return

      // Optimistic + Bulk-History + Server-Sync
      for (const p of patches) {
        useMapStore.getState().patchNodeLocal(p.nodeId, p.after)
      }
      useMapStore
        .getState()
        .pushHistory({ type: 'bulk-patch-nodes', patches })

      try {
        await savedAction(() =>
          Promise.all(
            patches.map((p) => updateNodeAction(p.nodeId, p.after)),
          ),
        )
      } catch (err) {
        console.error('Ausrichten fehlgeschlagen', err)
      }
    },
    [],
  )

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
      // Cmd+A: Alles markieren
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        const allIds = useMapStore.getState().nodes.map((n) => n.id)
        useMapStore.getState().setNodeSelection(allIds)
        return
      }
      // Cmd+D: Duplizieren der Auswahl (nicht nur einzelner Knoten)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        void duplicateSelection()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useMapStore.getState()
        const lockedIds = new Set(
          state.nodes.filter((n) => n.locked).map((n) => n.id),
        )
        const ids = Array.from(state.selectedNodeIds).filter(
          (id) => !lockedIds.has(id),
        )
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
  }, [duplicateSelection])

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
    const lockedIds = new Set(
      state.nodes.filter((n) => n.locked).map((n) => n.id),
    )
    const ids = Array.from(state.selectedNodeIds).filter(
      (id) => !lockedIds.has(id),
    )
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
        freeArrowMode={freeArrowMode}
        selectedExists={selectedNodeIds.size > 0}
        canUndo={canUndoNow}
        canRedo={canRedoNow}
        onAddShape={handleAddShape}
        onToggleConnect={() => useUIStore.getState().toggleConnectMode()}
        onToggleHandTool={() => useUIStore.getState().toggleHandTool()}
        onToggleFreeArrow={() => useUIStore.getState().toggleFreeArrowMode()}
        onDeleteSelected={handleDeleteSelected}
        onUndo={() => undo()}
        onRedo={() => redo()}
        onZoomIn={() => useUIStore.getState().zoomBy(1.2)}
        onZoomOut={() => useUIStore.getState().zoomBy(1 / 1.2)}
        onResetView={() => useUIStore.getState().resetView()}
      />

      <AlignToolbar
        selectedCount={selectedNodeIds.size}
        onAlign={alignSelection}
      />

      {connectMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-mid">
          {connectFromNodeId
            ? 'Klick auf den Ziel-Knoten'
            : 'Klick auf den Start-Knoten'}
        </div>
      )}

      {freeArrowMode && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-blue px-4 py-1.5 text-sm font-medium text-white shadow-mid">
          {freeArrowStart
            ? 'Klick auf den End-Punkt für den Pfeil'
            : 'Klick auf den Start-Punkt für den freien Pfeil'}
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
            const from = c.from_node_id
              ? nodes.find((n) => n.id === c.from_node_id)
              : null
            const to = c.to_node_id
              ? nodes.find((n) => n.id === c.to_node_id)
              : null
            // Free connection: mindestens ein Endpunkt ist eine
            // freie Koordinate. Wenn beide Endpunkte node-bound aber der
            // Knoten existiert nicht (z.B. wurde gelöscht): skip.
            const isNodeBoundFully = c.from_node_id && c.to_node_id
            if (isNodeBoundFully && (!from || !to)) return null
            const dimmed =
              focusVisibleIds !== null &&
              !(
                (c.from_node_id ? focusVisibleIds.has(c.from_node_id) : false) ||
                (c.to_node_id ? focusVisibleIds.has(c.to_node_id) : false)
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
                  fromNode={from ?? null}
                  toNode={to ?? null}
                  handDrawn={theme === 'hand'}
                  selected={selectedConnectionId === c.id}
                  onEndpointMouseDown={onEndpointMouseDown}
                />
              </g>
            )
          })}
        </svg>

        {/* Locked-Knoten zuerst rendern → liegen optisch UNTER den normalen
            Knoten, sodass z. B. Eisenhower-Quadranten als Hintergrund dienen. */}
        {[...nodes]
          .sort((a, b) => Number(a.locked) - Number(b.locked))
          .reverse()
          .map((node) => {
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
