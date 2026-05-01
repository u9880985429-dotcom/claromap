import type { MapPreviewNode } from '@/lib/data/maps'

interface Props {
  nodes: MapPreviewNode[]
  height?: number
}

/**
 * Mini-Vorschau einer Map: Knoten als kleine farbige Rechtecke/Kreise,
 * automatisch in den Vorschau-Bereich gefittet.
 */
export function MapCardPreview({ nodes, height = 80 }: Props) {
  if (nodes.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-line2 bg-bg3/40 text-[10px] text-text4"
        style={{ width: '100%', height }}
      >
        Leere Map
      </div>
    )
  }

  // Bounding-Box berechnen
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    minX = Math.min(minX, n.position_x)
    minY = Math.min(minY, n.position_y)
    maxX = Math.max(maxX, n.position_x + n.width)
    maxY = Math.max(maxY, n.position_y + n.height)
  }

  // Padding
  const padding = 20
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  const w = Math.max(1, maxX - minX)
  const h = Math.max(1, maxY - minY)

  return (
    <div
      className="overflow-hidden rounded-md border border-line bg-bg3/30"
      style={{ width: '100%', height }}
    >
      <svg
        viewBox={`${minX} ${minY} ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        {nodes.map((n, i) => {
          const isCircle = n.shape === '50%'
          const isDiamond = n.shape === 'diamond'
          if (isCircle) {
            const r = Math.min(n.width, n.height) / 2
            return (
              <circle
                key={i}
                cx={n.position_x + n.width / 2}
                cy={n.position_y + n.height / 2}
                r={r}
                fill={n.color}
                opacity={0.85}
              />
            )
          }
          if (isDiamond) {
            const cx = n.position_x + n.width / 2
            const cy = n.position_y + n.height / 2
            const rx = n.width / 2
            const ry = n.height / 2
            return (
              <polygon
                key={i}
                points={`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`}
                fill={n.color}
                opacity={0.85}
              />
            )
          }
          const rx =
            n.shape === '20%'
              ? Math.min(n.width, n.height) * 0.2
              : n.shape === '8%'
                ? Math.min(n.width, n.height) * 0.08
                : 0
          return (
            <rect
              key={i}
              x={n.position_x}
              y={n.position_y}
              width={n.width}
              height={n.height}
              rx={rx}
              ry={rx}
              fill={n.color}
              opacity={0.85}
            />
          )
        })}
      </svg>
    </div>
  )
}
