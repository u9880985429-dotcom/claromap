// Export-Funktionen für Claromap-Maps in verschiedene Formate.
//
//  - PNG: visuelles Bild der Map (Canvas-Snapshot, transparent skaliert)
//  - PDF: Bild im PDF-Container, A4 quer, automatisch eingepasst
//  - DOCX: strukturiertes Word-Dokument mit Knoten-Liste, nach Lane/Status
//  - JSON: vollständiger Map-State zum Re-Import (alter Pfad)
//
// Trick für PNG/PDF: wir snapshotten NICHT den sichtbaren Canvas-Bereich
// (der ist mit pan/zoom transformiert). Stattdessen suchen wir das innere
// Container-Div mit data-claromap-canvas, kopieren es in ein temporäres
// Off-screen-DIV ohne transform, lassen html-to-image dort arbeiten und
// werfen es danach wieder weg. Ergebnis: konsistente, zoom-unabhängige
// Map-Bilder.

import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { saveAs } from 'file-saver'
import type { MapRow, NodeRow, ConnectionRow, TaskRow } from '@/stores/mapStore'

interface MapSnapshot {
  map: MapRow
  nodes: NodeRow[]
  connections: ConnectionRow[]
  tasks: TaskRow[]
}

function safeFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9äöüß]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'map'
  )
}

/**
 * Findet das innere Canvas-Div, kopiert es in ein temporäres Off-screen-DIV
 * ohne pan/zoom-Transform, gibt das DIV + dessen natürliche Bounds zurück.
 * Caller muss das DIV nach Gebrauch entfernen.
 */
async function snapshotCanvas(): Promise<{ dataUrl: string; width: number; height: number }> {
  const source = document.querySelector<HTMLElement>('[data-claromap-canvas]')
  if (!source) throw new Error('Canvas wurde nicht gefunden.')

  // Bounding-Box aller Knoten finden (über die Position-Inline-Styles der
  // Children, nicht via getBoundingClientRect — die wären transformiert).
  // Stattdessen lesen wir die Knoten-Daten aus dem DOM via data-Attribute,
  // oder einfacher: wir clonen das Source-Div, entfernen die transform und
  // lassen den Browser die natürliche Größe ausrechnen.
  const clone = source.cloneNode(true) as HTMLElement
  clone.style.transform = 'none'
  clone.style.position = 'static'
  clone.style.background = 'var(--bg)'

  // Off-Screen rendern
  const offscreen = document.createElement('div')
  offscreen.style.position = 'fixed'
  offscreen.style.left = '-99999px'
  offscreen.style.top = '0'
  offscreen.style.background = getComputedStyle(document.body).backgroundColor
  offscreen.appendChild(clone)
  document.body.appendChild(offscreen)

  // Padding um die Map herum
  const PAD = 40

  // Bounds des Clones ermitteln (jetzt natürlich, kein transform)
  // Die Children sind absolut positioniert via inline-style left/top.
  // Wir gehen alle direkten Kinder durch und sammeln die Extents.
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const child of Array.from(clone.children) as HTMLElement[]) {
    const left = parseFloat(child.style.left || '0') || 0
    const top = parseFloat(child.style.top || '0') || 0
    const width = parseFloat(child.style.width || '0') || child.offsetWidth || 0
    const height =
      parseFloat(child.style.height || '0') || child.offsetHeight || 0
    if (width === 0 || height === 0) continue
    if (left < minX) minX = left
    if (top < minY) minY = top
    if (left + width > maxX) maxX = left + width
    if (top + height > maxY) maxY = top + height
  }
  if (minX === Infinity) {
    // Leere Map → Fallback
    minX = 0
    minY = 0
    maxX = 800
    maxY = 600
  }

  const w = Math.ceil(maxX - minX) + PAD * 2
  const h = Math.ceil(maxY - minY) + PAD * 2

  // Clone-Container auf die natürliche Map-Größe setzen, alle Children um
  // -minX/-minY verschieben (sodass nichts beschnitten wird)
  clone.style.width = `${w}px`
  clone.style.height = `${h}px`
  clone.style.position = 'relative'
  for (const child of Array.from(clone.children) as HTMLElement[]) {
    const curLeft = parseFloat(child.style.left || '0') || 0
    const curTop = parseFloat(child.style.top || '0') || 0
    child.style.left = `${curLeft - minX + PAD}px`
    child.style.top = `${curTop - minY + PAD}px`
  }

  try {
    const dataUrl = await toPng(clone, {
      width: w,
      height: h,
      pixelRatio: 2, // Retina-Qualität
      cacheBust: true,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    })
    return { dataUrl, width: w, height: h }
  } finally {
    document.body.removeChild(offscreen)
  }
}

export async function exportPng(snapshot: MapSnapshot): Promise<void> {
  const { dataUrl } = await snapshotCanvas()
  const date = new Date().toISOString().slice(0, 10)
  const filename = `claromap-${safeFilename(snapshot.map.title)}-${date}.png`
  // Datei runterladen
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export async function exportPdf(snapshot: MapSnapshot): Promise<void> {
  const { dataUrl, width, height } = await snapshotCanvas()
  // A4 quer (297 x 210 mm). Bild in PDF einpassen mit 10mm Rand.
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 10
  const maxW = pageW - margin * 2
  const maxH = pageH - margin * 2 - 12 // 12mm für Title-Header

  // Skalierung — Bild proportional einpassen
  const ratio = Math.min(maxW / width, maxH / height)
  const drawW = width * ratio
  const drawH = height * ratio
  const drawX = margin + (maxW - drawW) / 2
  const drawY = margin + 12 + (maxH - drawH) / 2

  // Header
  pdf.setFontSize(14)
  pdf.text(snapshot.map.title, margin, margin + 6)
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.text(
    `Exportiert von Claromap · ${new Date().toLocaleDateString('de-DE')} · ${snapshot.nodes.length} Knoten · ${snapshot.connections.length} Verbindungen`,
    margin,
    margin + 11,
  )

  pdf.addImage(dataUrl, 'PNG', drawX, drawY, drawW, drawH)

  const date = new Date().toISOString().slice(0, 10)
  pdf.save(`claromap-${safeFilename(snapshot.map.title)}-${date}.pdf`)
}

export async function exportDocx(snapshot: MapSnapshot): Promise<void> {
  const { map, nodes, connections, tasks } = snapshot

  const tasksByNode = new Map<string, TaskRow[]>()
  for (const t of tasks) {
    const arr = tasksByNode.get(t.node_id) ?? []
    arr.push(t)
    tasksByNode.set(t.node_id, arr)
  }

  // Knoten gruppieren: bevorzugt nach Lane, sonst nach Status
  const useLane = nodes.some((n) => n.lane)
  const groups = new Map<string, NodeRow[]>()
  for (const n of nodes) {
    const key = useLane ? n.lane || 'Ohne Lane' : statusLabel(n.status)
    const arr = groups.get(key) ?? []
    arr.push(n)
    groups.set(key, arr)
  }

  // Innerhalb der Gruppe: nach step_number sortieren
  for (const arr of groups.values()) arr.sort((a, b) => a.step_number - b.step_number)

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: map.title, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Exportiert von Claromap am ${new Date().toLocaleDateString('de-DE')}`,
          italics: true,
          size: 18,
          color: '6B7390',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${nodes.length} Knoten · ${connections.length} Verbindungen · ${tasks.length} Aufgaben`,
          size: 18,
          color: '6B7390',
        }),
      ],
    }),
    new Paragraph({ children: [new TextRun('')] }),
  ]

  if (map.description) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: map.description, italics: true })],
      }),
    )
    children.push(new Paragraph({ children: [new TextRun('')] }))
  }

  for (const [groupName, groupNodes] of groups) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: groupName, bold: true })],
      }),
    )

    for (const node of groupNodes) {
      const titleRuns: TextRun[] = []
      if (node.emoji) titleRuns.push(new TextRun({ text: `${node.emoji} ` }))
      titleRuns.push(
        new TextRun({
          text: `${node.step_number}. ${node.name}`,
          bold: true,
          size: 26,
        }),
      )
      if (node.progress > 0) {
        titleRuns.push(
          new TextRun({
            text: `  (${node.progress}%)`,
            size: 22,
            color: '6B7390',
          }),
        )
      }

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: titleRuns,
        }),
      )

      if (node.short_desc) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: node.short_desc, italics: true }),
            ],
          }),
        )
      }
      if (node.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: node.description })],
          }),
        )
      }

      if (node.start_date || node.end_date) {
        const range = `${node.start_date ?? '—'} bis ${node.end_date ?? '—'}`
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `🗓 ${range}`,
                size: 20,
                color: '6B7390',
              }),
            ],
          }),
        )
      }

      const nodeTasks = tasksByNode.get(node.id) ?? []
      for (const t of nodeTasks.sort((a, b) => a.order_index - b.order_index)) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `${t.done ? '✓ ' : '☐ '}${t.text}`,
                strike: t.done,
                color: t.done ? '6B7390' : undefined,
              }),
            ],
          }),
        )
      }

      children.push(new Paragraph({ children: [new TextRun('')] }))
    }
  }

  if (connections.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Verbindungen', bold: true })],
      }),
    )
    const nodeById = new Map(nodes.map((n) => [n.id, n]))
    for (const c of connections) {
      const from = c.from_node_id ? nodeById.get(c.from_node_id) : null
      const to = c.to_node_id ? nodeById.get(c.to_node_id) : null
      const fromLabel = from
        ? `${from.step_number}. ${from.name}`
        : '(freier Punkt)'
      const toLabel = to
        ? `${to.step_number}. ${to.name}`
        : '(freier Punkt)'
      const labelPart = c.step_label ? ` — ${c.step_label}` : ''
      const numPart = c.number != null ? ` [${c.number}]` : ''
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: `${fromLabel} → ${toLabel}${numPart}${labelPart}`,
            }),
          ],
        }),
      )
    }
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  const date = new Date().toISOString().slice(0, 10)
  saveAs(blob, `claromap-${safeFilename(map.title)}-${date}.docx`)
}

function statusLabel(status: string): string {
  return (
    {
      done: '✅ Erledigt',
      wip: '⏳ In Arbeit',
      warning: '⚠️ Achtung',
      idea: '🌱 Idee',
      blocked: '🔒 Blockiert',
      ready: '🚀 Bereit',
    }[status] ?? status
  )
}

export function exportJson(snapshot: MapSnapshot): void {
  const { map, nodes, connections, tasks } = snapshot

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
      locked: n.locked,
      label_position: n.label_position,
      parent_step:
        n.parent_node_id != null
          ? (nodes.find((p) => p.id === n.parent_node_id)?.step_number ??
            null)
          : null,
    })),
    connections: connections.map((c) => ({
      from_step: c.from_node_id
        ? nodes.find((n) => n.id === c.from_node_id)?.step_number
        : null,
      to_step: c.to_node_id
        ? nodes.find((n) => n.id === c.to_node_id)?.step_number
        : null,
      from_x: c.from_x,
      from_y: c.from_y,
      to_x: c.to_x,
      to_y: c.to_y,
      number: c.number,
      step_label: c.step_label,
      color: c.color,
      line_style: c.line_style,
      stroke_width: c.stroke_width,
      animation: c.animation,
    })),
    tasks: tasks.map((t) => ({
      node_step: nodes.find((n) => n.id === t.node_id)?.step_number ?? null,
      text: t.text,
      description: t.description,
      done: t.done,
      order_index: t.order_index,
      due_date: t.due_date,
    })),
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const date = new Date().toISOString().slice(0, 10)
  saveAs(blob, `claromap-${safeFilename(map.title)}-${date}.json`)
}
