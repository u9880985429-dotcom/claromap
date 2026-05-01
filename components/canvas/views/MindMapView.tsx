'use client'

import { useMapStore, type NodeRow } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

export function MindMapView() {
  const nodes = useMapStore((s) => s.nodes)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const detailLevel = useUIStore((s) => s.detailLevel)
  const theme = useUIStore((s) => s.theme)
  const select = (id: string) => useMapStore.getState().selectNode(id)

  if (nodes.length === 0) {
    return <EmptyState />
  }

  // Knoten 1 = Center, restliche = Branches (radial verteilt)
  const sorted = [...nodes].sort((a, b) => a.step_number - b.step_number)
  const center = sorted[0]
  const branches = sorted.slice(1)

  // Branches in äußere/innere Ringe verteilen für visuelle Tiefe
  const inner: { node: NodeRow; angle: number }[] = []
  const outer: { node: NodeRow; angle: number }[] = []
  branches.forEach((node, i) => {
    const angle = (i / Math.max(1, branches.length)) * 2 * Math.PI - Math.PI / 2
    if (i % 2 === 0) inner.push({ node, angle })
    else outer.push({ node, angle })
  })

  const cCx = 50
  const cCy = 50
  const innerR = 26
  const outerR = 38

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      {/* Sparkles im Hand-Drawn-Theme */}
      {theme === 'hand' && <Sparkles />}

      {/* Verbindungslinien */}
      <svg
        className="absolute left-0 top-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {[...inner, ...outer].map(({ node, angle }, i) => {
          const r = i % 2 === 0 ? innerR : outerR
          const tx = cCx + Math.cos(angle) * r
          const ty = cCy + Math.sin(angle) * r
          // Bezier-Kontrollpunkt zwischen Center und Target, leicht versetzt
          const cx = cCx + Math.cos(angle) * (r * 0.55)
          const cy = cCy + Math.sin(angle) * (r * 0.4)
          return (
            <path
              key={node.id}
              d={`M ${cCx} ${cCy} Q ${cx} ${cy} ${tx} ${ty}`}
              fill="none"
              stroke={node.color}
              strokeWidth={theme === 'hand' ? '0.35' : '0.25'}
              opacity={0.55}
              strokeDasharray={theme === 'hand' ? '0.6 0.4' : undefined}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* Center-Knoten */}
      <div
        className="absolute"
        style={{
          left: `${cCx}%`,
          top: `${cCy}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <button
          type="button"
          onClick={() => select(center.id)}
          className={`flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-full text-center shadow-strong transition hover:scale-105 ${
            selectedNodeId === center.id
              ? 'ring-4 ring-accent ring-offset-2 ring-offset-bg'
              : ''
          }`}
          style={{
            background: center.color,
            color: center.text_color,
            borderRadius:
              center.shape === 'leaf' ? '50% 0 50% 0' : '50%',
          }}
        >
          <div className="text-5xl leading-none">{center.emoji}</div>
          <div className="px-4 font-display text-lg font-bold leading-tight">
            {center.name}
          </div>
          {detailLevel !== 'simple' && center.short_desc && (
            <div className="px-4 text-xs opacity-80">{center.short_desc}</div>
          )}
        </button>
      </div>

      {/* Innere Branches (Pillen) */}
      {inner.map(({ node, angle }) => {
        const x = cCx + Math.cos(angle) * innerR
        const y = cCy + Math.sin(angle) * innerR
        return (
          <BranchPill
            key={node.id}
            node={node}
            x={x}
            y={y}
            size="md"
            selected={selectedNodeId === node.id}
            detailLevel={detailLevel}
            onSelect={select}
          />
        )
      })}

      {/* Äußere Branches (Hexagone) */}
      {outer.map(({ node, angle }) => {
        const x = cCx + Math.cos(angle) * outerR
        const y = cCy + Math.sin(angle) * outerR
        return (
          <BranchHex
            key={node.id}
            node={node}
            x={x}
            y={y}
            selected={selectedNodeId === node.id}
            detailLevel={detailLevel}
            onSelect={select}
          />
        )
      })}
    </div>
  )
}

function BranchPill({
  node,
  x,
  y,
  selected,
  detailLevel,
  onSelect,
}: {
  node: NodeRow
  x: number
  y: number
  size: 'sm' | 'md'
  selected: boolean
  detailLevel: string
  onSelect: (id: string) => void
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`flex items-center gap-2 rounded-full px-4 py-2.5 shadow-mid transition hover:scale-105 ${
          selected ? 'ring-4 ring-accent ring-offset-2 ring-offset-bg' : ''
        }`}
        style={{ background: node.color, color: node.text_color }}
      >
        <span className="text-xl">{node.emoji}</span>
        <span className="font-semibold">{node.name}</span>
        {detailLevel !== 'simple' && (
          <span className="text-sm opacity-80">{node.status_icon}</span>
        )}
      </button>
    </div>
  )
}

function BranchHex({
  node,
  x,
  y,
  selected,
  detailLevel,
  onSelect,
}: {
  node: NodeRow
  x: number
  y: number
  selected: boolean
  detailLevel: string
  onSelect: (id: string) => void
}) {
  // Hexagon via clip-path
  const hexClip =
    'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)'

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`group relative flex flex-col items-center justify-center gap-0.5 px-6 py-4 transition hover:scale-105 ${
          selected
            ? 'outline outline-4 outline-offset-2 outline-accent'
            : ''
        }`}
        style={{
          background: node.color,
          color: node.text_color,
          clipPath: hexClip,
          minWidth: 130,
        }}
      >
        <span className="text-lg leading-none">{node.emoji}</span>
        <span className="text-xs font-semibold leading-tight">
          {node.name}
        </span>
        {detailLevel === 'full' && (
          <span className="text-[10px] opacity-70">
            {node.status_icon} {node.progress}%
          </span>
        )}
      </button>
    </div>
  )
}

function Sparkles() {
  // 12 verteilte Sparkles für Hand-Drawn-Vibe
  const points = Array.from({ length: 12 }).map((_, i) => ({
    left: `${5 + ((i * 53) % 95)}%`,
    top: `${10 + ((i * 41) % 80)}%`,
    delay: `${(i * 0.7) % 4}s`,
    size: 12 + (i % 3) * 4,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {points.map((p, i) => (
        <span
          key={i}
          className="absolute opacity-30"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            animation: `wipPulse 5s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-bg p-8">
      <div className="max-w-md rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">Noch nichts da</p>
        <p className="mt-2 text-sm text-text3">
          Erst Knoten in der Workflow-Ansicht anlegen — sie erscheinen dann
          hier als Mind Map.
        </p>
      </div>
    </div>
  )
}
