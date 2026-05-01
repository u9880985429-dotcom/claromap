'use client'

import { Download } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'

interface Props {
  mapTitle: string
}

/**
 * Lädt die komplette Map als JSON runter — Map-Settings, alle Knoten,
 * Verbindungen, Tasks. Geeignet als Backup oder für späteren Re-Import.
 */
export function ExportMapButton({ mapTitle }: Props) {
  const onExport = () => {
    const { map, nodes, connections, tasks } = useMapStore.getState()
    if (!map) return

    const payload = {
      _format: 'claromap-export-v1',
      _exportedAt: new Date().toISOString(),
      map: {
        title: map.title,
        description: map.description,
        background_color: map.background_color,
        background_pattern: map.background_pattern,
        theme: map.theme,
      },
      nodes: nodes.map((n) => ({
        step_number: n.step_number,
        emoji: n.emoji,
        name: n.name,
        short_desc: n.short_desc,
        description: n.description,
        color: n.color,
        text_color: n.text_color,
        shape: n.shape,
        width: n.width,
        height: n.height,
        position_x: n.position_x,
        position_y: n.position_y,
        status: n.status,
        status_icon: n.status_icon,
        progress: n.progress,
        lane: n.lane,
        start_date: n.start_date,
        end_date: n.end_date,
        // parent als step_number, nicht als ID (sodass Re-Import funktioniert)
        parent_step:
          n.parent_node_id != null
            ? (nodes.find((p) => p.id === n.parent_node_id)?.step_number ??
              null)
            : null,
      })),
      connections: connections.map((c) => ({
        from_step: nodes.find((n) => n.id === c.from_node_id)?.step_number,
        to_step: nodes.find((n) => n.id === c.to_node_id)?.step_number,
        number: c.number,
        step_label: c.step_label,
        color: c.color,
        line_style: c.line_style,
      })),
      tasks: tasks.map((t) => ({
        node_step:
          nodes.find((n) => n.id === t.node_id)?.step_number ?? null,
        text: t.text,
        description: t.description,
        done: t.done,
        order_index: t.order_index,
        due_date: t.due_date,
      })),
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const safeTitle = mapTitle
      .toLowerCase()
      .replace(/[^a-z0-9äöüß]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
    const date = new Date().toISOString().slice(0, 10)
    const filename = `claromap-${safeTitle || 'map'}-${date}.json`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={onExport}
      className="flex items-center gap-1.5 rounded-md border border-line bg-bg2 px-2.5 py-1 text-xs text-text2 transition hover:bg-bg3"
      title="Map als JSON-Datei herunterladen"
    >
      <Download size={14} />
      <span>Export</span>
    </button>
  )
}
