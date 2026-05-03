import { memo, type MouseEvent as ReactMouseEvent } from 'react'
import type { NodeRow, ConnectionRow } from '@/stores/mapStore'

interface Props {
  connection: ConnectionRow
  // Optional, weil eine Verbindung auch an freier Position hängen kann.
  // In dem Fall sind connection.from_x/y bzw. to_x/y gesetzt.
  fromNode: NodeRow | null
  toNode: NodeRow | null
  handDrawn?: boolean
  selected?: boolean
  // Wird vom WorkflowView durchgereicht — startet das Endpoint-Drag.
  onEndpointMouseDown?: (
    e: ReactMouseEvent,
    end: 'from' | 'to',
    connection: ConnectionRow,
  ) => void
}

const STROKE_WIDTHS: Record<string, number> = {
  thin: 1.5,
  medium: 2.5,
  thick: 4.5,
}

function ConnectionLineImpl({
  connection,
  fromNode,
  toNode,
  handDrawn = false,
  selected = false,
  onEndpointMouseDown,
}: Props) {
  // Start- und Endpunkte berechnen — entweder aus Knoten-Mitte oder aus
  // freien Koordinaten (free arrow).
  let fromCx: number
  let fromCy: number
  if (fromNode) {
    fromCx = fromNode.position_x + fromNode.width / 2
    fromCy = fromNode.position_y + fromNode.height / 2
  } else if (connection.from_x != null && connection.from_y != null) {
    fromCx = connection.from_x
    fromCy = connection.from_y
  } else {
    return null
  }

  let toCx: number
  let toCy: number
  let toRadius = 0
  if (toNode) {
    toCx = toNode.position_x + toNode.width / 2
    toCy = toNode.position_y + toNode.height / 2
    toRadius = Math.min(toNode.width, toNode.height) / 2
  } else if (connection.to_x != null && connection.to_y != null) {
    toCx = connection.to_x
    toCy = connection.to_y
    toRadius = 0
  } else {
    return null
  }

  // Endpunkt knapp vor dem Ziel-Knoten — bei freier Position direkt am Punkt
  const dx = toCx - fromCx
  const dy = toCy - fromCy
  const dist = Math.max(1, Math.hypot(dx, dy))
  const endX = toCx - (dx / dist) * (toRadius + (toRadius > 0 ? 6 : 0))
  const endY = toCy - (dy / dist) * (toRadius + (toRadius > 0 ? 6 : 0))

  // Bezier-Kontrollpunkt für sanft geschwungene Linie (organischer Look)
  const midX = (fromCx + endX) / 2
  const midY = (fromCy + endY) / 2
  const segLen = Math.hypot(endX - fromCx, endY - fromCy)
  const curveMag = Math.min(50, segLen * 0.12)
  const perpX = (-(endY - fromCy) / segLen) * curveMag
  const perpY = ((endX - fromCx) / segLen) * curveMag
  const cpx = midX + perpX
  const cpy = midY + perpY

  // Label-Position auf der Kurve (parametrisch t=0.5 für Bezier)
  const labelX = 0.25 * fromCx + 0.5 * cpx + 0.25 * endX
  const labelY = 0.25 * fromCy + 0.5 * cpy + 0.25 * endY

  const stroke = connection.color ?? '#9CA3AF'
  const dash =
    connection.line_style === 'dashed'
      ? '8,4'
      : connection.line_style === 'dotted'
        ? '2,4'
        : handDrawn
          ? '6,3'
          : undefined

  const baseWidth = STROKE_WIDTHS[connection.stroke_width] ?? 2.5
  const strokeWidth = handDrawn ? baseWidth + 0.3 : baseWidth
  const arrowId = `arrow-${connection.id}`

  // Animations-Effekte über CSS-Klassen (siehe globals.css)
  const animClass =
    connection.animation === 'pulse'
      ? 'claromap-conn-pulse'
      : connection.animation === 'glow'
        ? 'claromap-conn-glow'
        : ''

  const path = `M ${fromCx} ${fromCy} Q ${cpx} ${cpy} ${endX} ${endY}`

  return (
    <g>
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
        </marker>
      </defs>

      {/* Glow-Halo (nur bei animation='glow') */}
      {connection.animation === 'glow' && (
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          opacity={0.35}
          style={{ filter: 'blur(4px)' }}
          className={animClass}
        />
      )}

      {/* Unsichtbare dickere Hit-Area für leichtere Klickbarkeit */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(14, strokeWidth + 10)}
      />

      {/* Sichtbare Linie */}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap="round"
        markerEnd={`url(#${arrowId})`}
        className={animClass}
      />

      {connection.number != null && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <circle r="14" fill="white" stroke={stroke} strokeWidth={2} />
          <text
            textAnchor="middle"
            dy="4"
            fontSize="12"
            fontWeight="700"
            fill="#0F1424"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {connection.number}
          </text>
        </g>
      )}

      {/* Drag-Handles an Start/Ende — nur wenn selektiert */}
      {selected && onEndpointMouseDown && (
        <>
          <circle
            cx={fromCx}
            cy={fromCy}
            r={7}
            fill="white"
            stroke={stroke}
            strokeWidth={2}
            style={{ cursor: 'grab', pointerEvents: 'all' }}
            onMouseDown={(e) => onEndpointMouseDown(e, 'from', connection)}
          />
          <circle
            cx={endX}
            cy={endY}
            r={7}
            fill={stroke}
            stroke="white"
            strokeWidth={2}
            style={{ cursor: 'grab', pointerEvents: 'all' }}
            onMouseDown={(e) => onEndpointMouseDown(e, 'to', connection)}
          />
        </>
      )}
    </g>
  )
}

// React.memo: ConnectionLine ist rein präsentational, hängt nur an Props.
// Identity-Vergleich auf alle drei (connection/fromNode/toNode), wir
// brauchen keinen tiefen Vergleich, weil mapStore neue Object-Refs liefert
// wenn sich Werte ändern.
export const ConnectionLine = memo(ConnectionLineImpl, (prev, next) => {
  return (
    prev.connection === next.connection &&
    prev.fromNode === next.fromNode &&
    prev.toNode === next.toNode &&
    prev.handDrawn === next.handDrawn &&
    prev.selected === next.selected &&
    prev.onEndpointMouseDown === next.onEndpointMouseDown
  )
})
