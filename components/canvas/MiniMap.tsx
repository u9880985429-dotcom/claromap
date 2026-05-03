'use client'

import { useMemo } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  // Wird aus der WorkflowView durchgereicht — die Größe der sichtbaren
  // Container-Fläche (Pixel). Brauchen wir um das Viewport-Rechteck im
  // korrekten Verhältnis zu zeichnen.
  containerWidth: number
  containerHeight: number
}

const MAP_W = 200 // Mini-Map Breite (Pixel auf dem Bildschirm)
const MAP_H = 130

/**
 * Übersichts-Mini-Map unten rechts auf der Canvas.
 *
 * Zeigt:
 *  - Alle Knoten als kleine Rechtecke (in ihrer echten Form/Farbe)
 *  - Ein Viewport-Rechteck, das angibt, was gerade auf der Canvas zu sehen ist
 *
 * Klick auf die Mini-Map verschiebt das Pan so, dass die geklickte Stelle
 * mittig auf der Canvas erscheint.
 */
export function MiniMap({ containerWidth, containerHeight }: Props) {
  const nodes = useMapStore((s) => s.nodes)
  const scale = useUIStore((s) => s.scale)
  const panX = useUIStore((s) => s.panX)
  const panY = useUIStore((s) => s.panY)

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
  // Verhältnis-erhaltend skalieren
  const scaleMini = Math.min(MAP_W / w, MAP_H / h)
  const renderedW = w * scaleMini
  const renderedH = h * scaleMini

  // Viewport-Rechteck in Mini-Map-Koords
  const vx = ((-panX / scale) - bounds.minX) * scaleMini
  const vy = ((-panY / scale) - bounds.minY) * scaleMini
  const vw = (containerWidth / scale) * scaleMini
  const vh = (containerHeight / scale) * scaleMini

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Klick-Position innerhalb der Mini-Map
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    // Map-Koord. der angeklickten Stelle
    const targetMapX = bounds.minX + mx / scaleMini
    const targetMapY = bounds.minY + my / scaleMini
    // Pan so setzen, dass diese Map-Koord mittig auf der Canvas ist
    const newPanX = containerWidth / 2 - targetMapX * scale
    const newPanY = containerHeight / 2 - targetMapY * scale
    useUIStore.getState().setPan(newPanX, newPanY)
  }

  return (
    <div
      className="pointer-events-auto absolute bottom-4 right-4 z-20 overflow-hidden rounded-lg border border-line bg-bg2/95 shadow-mid backdrop-blur"
      style={{ width: MAP_W, height: MAP_H }}
      title="Übersichts-Karte — Klick verschiebt die Ansicht"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onClick}
        className="relative h-full w-full cursor-pointer"
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

          {/* Viewport-Rechteck (was gerade auf der Canvas sichtbar ist) */}
          <div
            className="pointer-events-none absolute border-2 border-accent"
            style={{
              left: vx,
              top: vy,
              width: vw,
              height: vh,
              background: 'rgba(245, 166, 35, 0.10)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Label */}
        <span className="absolute left-1.5 top-1 font-mono text-[9px] uppercase tracking-wider text-text3">
          Übersicht
        </span>
      </div>
    </div>
  )
}
