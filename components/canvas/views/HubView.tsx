'use client'

import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

export function HubView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const select = (id: string) => useMapStore.getState().selectNode(id)

  if (nodes.length === 0) {
    return <EmptyState />
  }

  // Sortiert nach step_number — kleinster ist Center, Rest sind Sektoren
  const sorted = [...nodes].sort((a, b) => a.step_number - b.step_number)
  const center = sorted[0]
  const slices = sorted.slice(1)
  const sliceCount = Math.max(1, slices.length)

  // Donut-Geometrie (in SVG-Pixeln, viewBox 600x600)
  const cx = 300
  const cy = 300
  const innerR = 95 // Loch in der Mitte
  const outerR = 230 // Außenrand

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg p-6">
      <div className="mx-auto flex h-full w-full max-w-[640px] items-center justify-center">
        <div className="relative aspect-square w-full max-w-[600px]">
          <svg
            viewBox="0 0 600 600"
            className="h-full w-full drop-shadow-sm"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter
                id="hub-shadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="4"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>

            {/* Donut-Sektoren */}
            {slices.length === 0 ? null : sliceCount === 1 ? (
              // Sonderfall: nur 1 Knoten = ganzer Ring
              <FullRing
                cx={cx}
                cy={cy}
                innerR={innerR}
                outerR={outerR}
                node={slices[0]}
                selected={selectedNodeId === slices[0].id}
                onSelect={select}
              />
            ) : (
              slices.map((node, i) => {
                const startAngle = (i / sliceCount) * 360 - 90
                const endAngle = ((i + 1) / sliceCount) * 360 - 90
                return (
                  <Sector
                    key={node.id}
                    cx={cx}
                    cy={cy}
                    innerR={innerR}
                    outerR={outerR}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    node={node}
                    selected={selectedNodeId === node.id}
                    detailLevel={detailLevel}
                    onSelect={select}
                  />
                )
              })
            )}

            {/* Center-Knoten als Kreis */}
            <g
              onClick={() => select(center.id)}
              style={{ cursor: 'pointer' }}
              filter="url(#hub-shadow)"
            >
              <circle
                cx={cx}
                cy={cy}
                r={innerR - 6}
                fill={center.color}
                stroke={
                  selectedNodeId === center.id
                    ? 'var(--accent)'
                    : 'transparent'
                }
                strokeWidth={selectedNodeId === center.id ? 4 : 0}
              />
              <text
                x={cx}
                y={cy - 14}
                textAnchor="middle"
                fontSize="36"
                style={{ fontFamily: 'inherit' }}
              >
                {center.emoji ?? '📌'}
              </text>
              <text
                x={cx}
                y={cy + 22}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={center.text_color}
                style={{ fontFamily: 'inherit' }}
              >
                <tspan>{truncate(center.name, 16)}</tspan>
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

function Sector({
  cx,
  cy,
  innerR,
  outerR,
  startAngle,
  endAngle,
  node,
  selected,
  detailLevel,
  onSelect,
}: {
  cx: number
  cy: number
  innerR: number
  outerR: number
  startAngle: number
  endAngle: number
  node: NodeRow
  selected: boolean
  detailLevel: string
  onSelect: (id: string) => void
}) {
  const path = donutSlicePath(cx, cy, innerR, outerR, startAngle, endAngle)

  // Label-Position (Mitte des Sektors)
  const midAngle = (startAngle + endAngle) / 2
  const labelR = (innerR + outerR) / 2
  const lx = cx + labelR * Math.cos((midAngle * Math.PI) / 180)
  const ly = cy + labelR * Math.sin((midAngle * Math.PI) / 180)

  return (
    <g
      onClick={() => onSelect(node.id)}
      style={{ cursor: 'pointer' }}
      className="transition-opacity hover:opacity-90"
    >
      <path
        d={path}
        fill={node.color}
        stroke={selected ? 'var(--accent)' : 'rgba(255,255,255,0.85)'}
        strokeWidth={selected ? 4 : 2}
        strokeLinejoin="round"
      />
      <g transform={`translate(${lx}, ${ly})`}>
        <text
          textAnchor="middle"
          fontSize="22"
          dy="-6"
          style={{ fontFamily: 'inherit' }}
        >
          {node.emoji ?? '📌'}
        </text>
        <text
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          dy="14"
          fill={node.text_color}
          style={{ fontFamily: 'inherit' }}
        >
          {truncate(node.name, 14)}
        </text>
        {detailLevel !== 'simple' && (
          <text
            textAnchor="middle"
            fontSize="11"
            dy="30"
            opacity="0.8"
            style={{ fontFamily: 'inherit' }}
          >
            {node.status_icon}
          </text>
        )}
      </g>
    </g>
  )
}

function FullRing({
  cx,
  cy,
  innerR,
  outerR,
  node,
  selected,
  onSelect,
}: {
  cx: number
  cy: number
  innerR: number
  outerR: number
  node: NodeRow
  selected: boolean
  onSelect: (id: string) => void
}) {
  // Vollkreis als Donut: 2 Bögen, jeweils 180°
  const top = donutSlicePath(cx, cy, innerR, outerR, -90, 89.99)
  const bot = donutSlicePath(cx, cy, innerR, outerR, 90, 269.99)
  return (
    <g onClick={() => onSelect(node.id)} style={{ cursor: 'pointer' }}>
      <path
        d={top + ' ' + bot}
        fill={node.color}
        stroke={selected ? 'var(--accent)' : 'rgba(255,255,255,0.85)'}
        strokeWidth={selected ? 4 : 2}
      />
      <text
        x={cx}
        y={cy - outerR + 36}
        textAnchor="middle"
        fontSize="22"
        style={{ fontFamily: 'inherit' }}
      >
        {node.emoji ?? '📌'}
      </text>
    </g>
  )
}

function donutSlicePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, outerR, endAngle)
  const end = polarToCartesian(cx, cy, outerR, startAngle)
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-bg p-8">
      <div className="max-w-md rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">Noch nichts da</p>
        <p className="mt-2 text-sm text-text3">
          Erst Knoten in der Workflow-Ansicht anlegen — der erste wird zum
          Center, der Rest verteilt sich als Donut-Sektoren drumherum.
        </p>
      </div>
    </div>
  )
}
