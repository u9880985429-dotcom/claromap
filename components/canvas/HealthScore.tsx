'use client'

import { useMemo } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { cn } from '@/lib/utils/cn'

export function HealthScore() {
  const allNodes = useMapStore((s) => s.nodes)
  const score = useMemo(() => {
    if (allNodes.length === 0) return null
    const sum = allNodes.reduce((acc, n) => acc + n.progress, 0)
    return Math.round(sum / allNodes.length)
  }, [allNodes])

  if (score === null) return null

  const tone =
    score < 30
      ? 'border-red/40 bg-red/10 text-red'
      : score < 70
        ? 'border-amber/40 bg-amber/10 text-amber'
        : 'border-green/40 bg-green/10 text-green'

  const emoji = score < 30 ? '🔴' : score < 70 ? '🟠' : '🟢'

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold',
        tone,
      )}
      title={`Health-Score: durchschnittlicher Fortschritt aller ${allNodes.length} Knoten`}
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span>{score}%</span>
    </div>
  )
}
