// Smart-Alignment-Snap-Helper.
//
// Während ein Knoten gezogen wird, berechnet snapDragPosition() ob die
// Position so liegt, dass eine Kante oder die Mitte mit einem anderen
// Knoten übereinstimmt — und liefert sowohl die korrigierte Position
// als auch die zu zeichnenden Hilfslinien zurück.
//
// Verwendet wie in Figma/FigJam/Miro:
//   • vertikale Linien snappen die linke Kante / Mitte-X / rechte Kante
//   • horizontale Linien snappen die obere Kante / Mitte-Y / untere Kante
//
// Threshold ist in Map-Pixeln (vor scale-Anwendung).

interface NodeBox {
  id: string
  position_x: number
  position_y: number
  width: number
  height: number
}

export interface AlignmentGuide {
  // 'vertical' = senkrechte Linie (gemeinsamer X-Wert), 'horizontal' = waagerecht
  axis: 'vertical' | 'horizontal'
  // Position in Map-Koordinaten
  pos: number
  // Span: von / bis — damit die Hilfslinie nur soweit geht wie nötig
  // (oben links → unten rechts beider beteiligten Knoten)
  start: number
  end: number
}

export interface SnapResult {
  dx: number // korrigierter Delta-X (Map-Pixel)
  dy: number // korrigierter Delta-Y
  guides: AlignmentGuide[]
}

const SNAP_THRESHOLD = 6 // Map-Pixel — wie nahe muss man sein für Snap

/**
 * Berechnet Snap-Korrektur und Hilfslinien für einen Drag.
 *
 * @param dragged    Knoten der gezogen wird (mit START-Position + GEPLANTE Delta)
 * @param plannedDx  Wunsch-Delta in X (vom User-Drag)
 * @param plannedDy  Wunsch-Delta in Y
 * @param others     Alle anderen Knoten (ohne den gezogenen, ohne Bulk-Drag-Member)
 * @returns korrigierte Deltas + Hilfslinien
 */
export function snapDragPosition(
  dragged: NodeBox,
  plannedDx: number,
  plannedDy: number,
  others: NodeBox[],
): SnapResult {
  // Geplante neue Position des gezogenen Knoten
  const newX = dragged.position_x + plannedDx
  const newY = dragged.position_y + plannedDy

  // 6 Kandidatenkanten/Mitten am gezogenen Knoten (vertikal vs horizontal)
  const draggedV: { v: number; key: 'left' | 'centerX' | 'right' }[] = [
    { v: newX, key: 'left' },
    { v: newX + dragged.width / 2, key: 'centerX' },
    { v: newX + dragged.width, key: 'right' },
  ]
  const draggedH: { v: number; key: 'top' | 'centerY' | 'bottom' }[] = [
    { v: newY, key: 'top' },
    { v: newY + dragged.height / 2, key: 'centerY' },
    { v: newY + dragged.height, key: 'bottom' },
  ]

  // Beste Snap-Korrektur pro Achse — wir nehmen den nähesten
  let bestVCorr: { delta: number; abs: number } | null = null
  let bestHCorr: { delta: number; abs: number } | null = null
  const guides: AlignmentGuide[] = []

  for (const other of others) {
    if (other.id === dragged.id) continue

    const otherV = [
      other.position_x,
      other.position_x + other.width / 2,
      other.position_x + other.width,
    ]
    const otherH = [
      other.position_y,
      other.position_y + other.height / 2,
      other.position_y + other.height,
    ]

    // Vertikale Snaps prüfen
    for (const d of draggedV) {
      for (const o of otherV) {
        const diff = o - d.v
        const abs = Math.abs(diff)
        if (abs <= SNAP_THRESHOLD) {
          if (!bestVCorr || abs < bestVCorr.abs) {
            bestVCorr = { delta: diff, abs }
          }
        }
      }
    }

    // Horizontale Snaps prüfen
    for (const d of draggedH) {
      for (const o of otherH) {
        const diff = o - d.v
        const abs = Math.abs(diff)
        if (abs <= SNAP_THRESHOLD) {
          if (!bestHCorr || abs < bestHCorr.abs) {
            bestHCorr = { delta: diff, abs }
          }
        }
      }
    }
  }

  // Nach dem Snap die Final-Position berechnen
  const finalDx = plannedDx + (bestVCorr?.delta ?? 0)
  const finalDy = plannedDy + (bestHCorr?.delta ?? 0)
  const finalX = dragged.position_x + finalDx
  const finalY = dragged.position_y + finalDy

  // Jetzt Guides berechnen — alle Achsen wo nach dem Snap exakt aligned wird
  const finalV = [
    finalX,
    finalX + dragged.width / 2,
    finalX + dragged.width,
  ]
  const finalH = [
    finalY,
    finalY + dragged.height / 2,
    finalY + dragged.height,
  ]

  for (const other of others) {
    if (other.id === dragged.id) continue
    const otherV = [
      other.position_x,
      other.position_x + other.width / 2,
      other.position_x + other.width,
    ]
    const otherH = [
      other.position_y,
      other.position_y + other.height / 2,
      other.position_y + other.height,
    ]

    for (const fv of finalV) {
      for (const ov of otherV) {
        if (Math.abs(fv - ov) < 0.5) {
          // Vertikale Linie bei x=fv, von min(top) zu max(bottom)
          const top = Math.min(finalY, other.position_y)
          const bot = Math.max(
            finalY + dragged.height,
            other.position_y + other.height,
          )
          guides.push({ axis: 'vertical', pos: fv, start: top, end: bot })
        }
      }
    }

    for (const fh of finalH) {
      for (const oh of otherH) {
        if (Math.abs(fh - oh) < 0.5) {
          const left = Math.min(finalX, other.position_x)
          const right = Math.max(
            finalX + dragged.width,
            other.position_x + other.width,
          )
          guides.push({ axis: 'horizontal', pos: fh, start: left, end: right })
        }
      }
    }
  }

  // Duplikate entfernen (gleiche Achse + gleiche Position)
  const uniqueGuides = guides.filter((g, i, arr) => {
    return (
      arr.findIndex(
        (g2) => g2.axis === g.axis && Math.abs(g2.pos - g.pos) < 0.5,
      ) === i
    )
  })

  return { dx: finalDx, dy: finalDy, guides: uniqueGuides }
}
