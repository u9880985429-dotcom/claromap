import type { NodeRow, ConnectionRow } from '@/stores/mapStore'

interface Props {
  connection: ConnectionRow
  fromNode: NodeRow
  toNode: NodeRow
  handDrawn?: boolean
}

export function ConnectionLine({
  connection,
  fromNode,
  toNode,
  handDrawn = false,
}: Props) {
  const fromCx = fromNode.position_x + fromNode.width / 2
  const fromCy = fromNode.position_y + fromNode.height / 2
  const toCx = toNode.position_x + toNode.width / 2
  const toCy = toNode.position_y + toNode.height / 2

  // Endpunkt knapp vor dem Ziel-Knoten — sodass die Pfeilspitze nicht im Knoten verschwindet
  const dx = toCx - fromCx
  const dy = toCy - fromCy
  const dist = Math.max(1, Math.hypot(dx, dy))
  const targetRadius = Math.min(toNode.width, toNode.height) / 2
  const endX = toCx - (dx / dist) * (targetRadius + 6)
  const endY = toCy - (dy / dist) * (targetRadius + 6)

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

  const strokeWidth = handDrawn ? 2.8 : 2.5
  const arrowId = `arrow-${connection.id}`

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

      {/* Unsichtbare dickere Hit-Area für leichtere Klickbarkeit */}
      <path
        d={`M ${fromCx} ${fromCy} Q ${cpx} ${cpy} ${endX} ${endY}`}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
      />

      {/* Sichtbare Linie */}
      <path
        d={`M ${fromCx} ${fromCy} Q ${cpx} ${cpy} ${endX} ${endY}`}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap="round"
        markerEnd={`url(#${arrowId})`}
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
    </g>
  )
}
