'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Map as MapIcon } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  // Wird aus der WorkflowView durchgereicht — die Größe der sichtbaren
  // Container-Fläche (Pixel). Brauchen wir um das Viewport-Rechteck im
  // korrekten Verhältnis zu zeichnen.
  containerWidth: number
  containerHeight: number
}

const MAP_W = 220 // Mini-Map Breite (Pixel auf dem Bildschirm)
const MAP_H = 150
const COLLAPSE_KEY = 'claromap.minimapCollapsed'

/**
 * Übersichts-Mini-Map unten rechts auf der Canvas.
 *
 * Dynamiken:
 *  - Live-Update bei jeder Knoten-/Pan-/Zoom-Änderung (via Zustand-Subscriptions)
 *  - Klick irgendwo = Pan zur Stelle (zentriert)
 *  - Drag auf das Viewport-Rechteck = synchroner Pan auf der Canvas
 *  - Collapse-Toggle in der Kopfzeile (persistiert via localStorage)
 *  - Bounding-Box passt sich automatisch an den Content + den Viewport an
 */
export function MiniMap({ containerWidth, containerHeight }: Props) {
  const nodes = useMapStore((s) => s.nodes)
  const scale = useUIStore((s) => s.scale)
  const panX = useUIStore((s) => s.panX)
  const panY = useUIStore((s) => s.panY)

  // Collapsed-State persistiert
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(COLLAPSE_KEY) === 'true'
  })
  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLLAPSE_KEY, String(next))
      }
      return next
    })
  }

  // Drag-State für Viewport-Rectangle
  const dragRef = useRef<{
    startMouseX: number
    startMouseY: number
    startPanX: number
    startPanY: number
    scaleMini: number
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Bounding-Box aller Knoten + des aktuellen Viewports.
  // So wird die Mini-Map auch dann sinnvoll, wenn der User weit weg gepant
  // hat (sonst sieht er nur leere Mini-Map).
  const bounds = useMemo(() => {
    // Viewport in Map-Koordinaten
    const vx0 = -panX / scale
    const vy0 = -panY / scale
    const vx1 = (containerWidth - panX) / scale
    const vy1 = (containerHeight - panY) / scale

    if (nodes.length === 0) {
      return { minX: vx0, minY: vy0, maxX: vx1, maxY: vy1 }
    }

    let minX = Math.min(vx0, ...nodes.map((n) => n.position_x))
    let minY = Math.min(vy0, ...nodes.map((n) => n.position_y))
    let maxX = Math.max(vx1, ...nodes.map((n) => n.position_x + n.width))
    let maxY = Math.max(vy1, ...nodes.map((n) => n.position_y + n.height))

    // Etwas Padding
    const padX = (maxX - minX) * 0.05
    const padY = (maxY - minY) * 0.05
    minX -= padX
    minY -= padY
    maxX += padX
    maxY += padY

    return { minX, minY, maxX, maxY }
  }, [nodes, scale, panX, panY, containerWidth, containerHeight])

  const w = Math.max(1, bounds.maxX - bounds.minX)
  const h = Math.max(1, bounds.maxY - bounds.minY)
  const scaleMini = Math.min(MAP_W / w, MAP_H / h)
  const renderedW = w * scaleMini
  const renderedH = h * scaleMini

  // Viewport-Rechteck in Mini-Map-Koords (relativ zum renderedW-Container)
  const vx = (-panX / scale - bounds.minX) * scaleMini
  const vy = (-panY / scale - bounds.minY) * scaleMini
  const vw = (containerWidth / scale) * scaleMini
  const vh = (containerHeight / scale) * scaleMini

  // ── Drag-Listeners (auf document, nicht auf der MiniMap, damit der Drag
  // auch außerhalb der MiniMap fortgesetzt werden kann)
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      const state = dragRef.current
      if (!state) return
      // Wie weit hat sich die Maus seit Drag-Start (in Bildschirm-Pixeln) bewegt?
      const dxScreen = e.clientX - state.startMouseX
      const dyScreen = e.clientY - state.startMouseY
      // In Map-Koord-Pixel umrechnen — Mini-Map ist scaleMini × Map-Pixel,
      // Canvas-Anzeige ist scale × Map-Pixel. Pan-Delta auf der Canvas =
      // dx in Map-Pixel × scale.
      const dxMap = dxScreen / state.scaleMini
      const dyMap = dyScreen / state.scaleMini
      const newPanX = state.startPanX - dxMap * scale
      const newPanY = state.startPanY - dyMap * scale
      useUIStore.getState().setPan(newPanX, newPanY)
    }
    const onUp = () => {
      dragRef.current = null
      setIsDragging(false)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, scale])

  const onViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: panX,
      startPanY: panY,
      scaleMini,
    }
    setIsDragging(true)
  }

  const onClickMap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Klick außerhalb des Viewports → Pan zur Stelle (zentriert)
    if (isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    // Relativ zum renderedW-Container (der ist mittig)
    const relX = mx - (MAP_W - renderedW) / 2
    const relY = my - (MAP_H - renderedH) / 2
    const targetMapX = bounds.minX + relX / scaleMini
    const targetMapY = bounds.minY + relY / scaleMini
    const newPanX = containerWidth / 2 - targetMapX * scale
    const newPanY = containerHeight / 2 - targetMapY * scale
    useUIStore.getState().setPan(newPanX, newPanY)
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleCollapse}
        title="Übersicht öffnen"
        aria-label="Übersicht öffnen"
        className="pointer-events-auto absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg2/95 text-text2 shadow-mid backdrop-blur transition hover:bg-bg3"
      >
        <MapIcon size={16} />
      </button>
    )
  }

  return (
    <div
      className="pointer-events-auto absolute bottom-4 right-4 z-20 overflow-hidden rounded-lg border border-line bg-bg2/95 shadow-mid backdrop-blur"
      style={{ width: MAP_W }}
    >
      {/* Kopfzeile mit Collapse-Toggle */}
      <div className="flex items-center justify-between border-b border-line bg-bg3/40 px-2 py-1">
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text3">
          <MapIcon size={11} />
          Übersicht
        </span>
        <button
          type="button"
          onClick={toggleCollapse}
          title="Übersicht zuklappen"
          aria-label="Übersicht zuklappen"
          className="rounded p-0.5 text-text3 transition hover:bg-bg3 hover:text-text"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Map-Bereich */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onClickMap}
        className="relative cursor-pointer"
        style={{ width: MAP_W, height: MAP_H }}
        title="Klick = Pan dorthin · Viereck ziehen = direkt verschieben"
      >
        <div
          className="absolute"
          style={{
            left: (MAP_W - renderedW) / 2,
            top: (MAP_H - renderedH) / 2,
            width: renderedW,
            height: renderedH,
          }}
        >
          {/* Knoten */}
          {nodes.map((n) => {
            const left = (n.position_x - bounds.minX) * scaleMini
            const top = (n.position_y - bounds.minY) * scaleMini
            const width = Math.max(2, n.width * scaleMini)
            const height = Math.max(2, n.height * scaleMini)
            const isCircle = n.shape === '50%'
            return (
              <div
                key={n.id}
                className="absolute"
                style={{
                  left,
                  top,
                  width,
                  height,
                  background: n.color,
                  borderRadius: isCircle ? '50%' : 1.5,
                  opacity: n.locked ? 0.5 : 0.9,
                }}
              />
            )
          })}

          {/* Viewport-Rechteck — draggable! */}
          <div
            onMouseDown={onViewportMouseDown}
            className={`absolute border-2 border-accent transition-colors ${
              isDragging
                ? 'cursor-grabbing bg-accent/25'
                : 'cursor-grab bg-accent/10 hover:bg-accent/20'
            }`}
            style={{
              left: vx,
              top: vy,
              width: vw,
              height: vh,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  )
}
