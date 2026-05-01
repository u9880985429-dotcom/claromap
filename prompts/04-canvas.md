# Phase 4: Canvas — Das Herzstück

> **Voraussetzung:** Phase 1-3 abgeschlossen. Du kannst Maps in Supabase speichern.

## Aufgabe

Bau das Haupt-Canvas mit voller Interaktivität: Drag, Resize, Pan, Zoom, nummerierte Verbindungen.

**Referenz:** `prototypes/claromap_v7.html` — schau dir den Code an, besonders:
- `renderGraph()` Funktion
- `createNodeElement()` mit Drag/Resize-Logik
- `updateConnectionsLive()` für live updates beim Draggen
- SVG-Rendering der Verbindungen mit nummerierten Labels

## Komponenten

### `components/canvas/Canvas.tsx`
- Container mit pan-root und pan-stage
- Mouse + Touch Events für Pan/Zoom
- Rendert SVG für Linien + Knoten als HTML-Elemente

### `components/canvas/Node.tsx`
- Drag-Handle (ganzes Element)
- 4 Resize-Handles (TL, TR, BL, BR)
- Step-Nummer-Pille oben links
- Status-Smiley oben rechts (klickbar → Picker)
- Emoji + Label
- States: selected, dragging, done, wip, warning, idea

### `components/canvas/ConnectionLine.tsx`
- SVG-Path zwischen 2 Knoten
- Edge-Punkte berechnen (account for node radius)
- Nummeriertes Label in der Mitte (Schritt 1→2)

### `components/canvas/PanZoomController.tsx`
- Hook + UI für Zoom (+/-/⌂)

## Stores (Zustand)

### `stores/mapStore.ts`
```typescript
interface MapStore {
  map: Map | null
  nodes: Node[]
  connections: Connection[]
  selectedNodeId: string | null
  loadMap: (id: string) => Promise<void>
  updateNode: (id: string, updates: Partial<Node>) => void
  moveNode: (id: string, x: number, y: number) => void
  resizeNode: (id: string, width: number, height: number) => void
  selectNode: (id: string | null) => void
  syncToDB: () => Promise<void>  // Debounced
}
```

### `stores/uiStore.ts`
```typescript
interface UIStore {
  view: 'graph'|'mindmap'|'linear'|'kanban'|'list'
  detailLevel: 'simple'|'normal'|'full'
  theme: 'default'|'dark'|'hand'
  scale: number
  panX: number
  panY: number
  showStepNumbers: boolean
  showStatusIcons: boolean
  labelOutside: boolean
  setView, setTheme, zoom, resetView
}
```

## Anforderungen

### Drag & Drop
- 1:1 mit Maus, keine Verzögerung
- box-shadow verstärkt beim Greifen
- Verbindungslinien aktualisieren live
- Touch-Support (Single-Finger Drag, Two-Finger Pinch)

### Resize
- 4 Eck-Handles
- Min: 60×60, Max: 300×300
- Emoji + Label skalieren mit
- Verbindungen folgen live

### Pan & Zoom
- Wheel = Zoom (0.2x bis 2x)
- Click+Drag auf Background = Pan
- Mobile: Pinch-Zoom + Single-Touch-Drag
- Reset zu scale=0.6, x=0, y=0

### Persistierung
- Debounced auto-save (500ms)
- Optimistic Updates (UI sofort, DB folgt)
- Bei Fehler: Toast + Retry

## Performance

- >50 Knoten: Virtualisierung erwägen
- `transform: translate()` für GPU-acceleration
- `will-change: transform` während Drag

## Tests

```typescript
// __tests__/canvas/node.test.tsx
- Drag positioniert korrekt
- Resize updated dimensions
- Min/Max-Size respektiert
- Click ohne Drag öffnet Panel
- Click mit Drag öffnet KEIN Panel
```

## Verifikation

- ✅ Knoten flüssig draggable (60fps)
- ✅ Resize mit allen 4 Ecken
- ✅ Pan/Zoom intuitiv
- ✅ Verbindungslinien folgen live
- ✅ Auto-Save funktioniert
- ✅ Touch funktioniert
