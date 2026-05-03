import type { ViewName } from '@/stores/uiStore'

// ============================================================================
// Template-System
// ============================================================================
// Vorlagen für neue Maps. Jedes Template definiert Knoten, Verbindungen, das
// empfohlene View-Layout und passende Hintergrund-Settings.
//
// Beim Anlegen einer Map aus einem Template:
//   - Server Action erstellt die Map mit den Default-Settings
//   - Alle Knoten werden mit ihren Positions + Status eingefügt
//   - parent_step wird in echte parent_node_id übersetzt
//   - Connections werden mit den echten Node-IDs erzeugt
//
// Templates sind Start-Punkte. Nach dem Anlegen kann der User alles weiter
// editieren (Knoten hinzufügen, verschieben, andere Vorlage als Inspiration
// danebenstellen etc.).

export type TemplateNode = {
  step_number: number
  emoji?: string
  name: string
  short_desc?: string
  description?: string
  color?: string
  text_color?: string
  shape?: '50%' | '20%' | '8%' | '0%' | 'leaf' | 'diamond'
  width?: number
  height?: number
  position_x: number
  position_y: number
  status?: 'done' | 'wip' | 'warning' | 'idea' | 'blocked' | 'ready'
  status_icon?: string
  progress?: number
  lane?: string
  start_date?: string
  end_date?: string
  parent_step?: number
  // Wenn true: Knoten ist fixiert (nicht draggable, nicht löschbar via Bulk).
  // Wird von Vorlagen wie Eisenhower-Matrix für die Hintergrund-Quadranten
  // genutzt — die User kann sie selektieren, lesen, sogar via DetailPanel
  // entsperren, aber sie verrutschen nicht beim normalen Arbeiten.
  locked?: boolean
}

export type TemplateConnection = {
  from_step: number
  to_step: number
  number?: number
  step_label?: string
  color?: string
  line_style?: 'solid' | 'dashed' | 'dotted'
}

export type TemplateCategory =
  | 'allgemein'
  | 'brainstorming'
  | 'analyse'
  | 'prozesse'
  | 'projekte'
  | 'entscheidungen'
  | 'strategie'

export type Template = {
  id: string
  category: TemplateCategory
  name: string
  description: string
  icon: string
  preferredView?: ViewName
  preferredBackgroundPattern?: 'dots' | 'grid' | 'lines' | 'cross' | 'none'
  preferredTheme?: 'default' | 'dark' | 'hand'
  nodes: TemplateNode[]
  connections: TemplateConnection[]
}

const C = {
  blue: '#4A9EFF',
  green: '#10B981',
  amber: '#F5A623',
  red: '#FF6B6B',
  purple: '#A78BFA',
  pink: '#EC4899',
  cyan: '#06B6D4',
  gray: '#9CA3AF',
  pastelBlue: '#BAE6FD',
  pastelGreen: '#BBF7D0',
  pastelYellow: '#FEF3C7',
  pastelPink: '#FECACA',
  pastelLila: '#DDD6FE',
  pastelPeach: '#FED7AA',
}

// ============================================================================
// 1. Allgemein
// ============================================================================

const empty: Template = {
  id: 'empty',
  category: 'allgemein',
  name: 'Leere Map',
  description: 'Leinwand ohne Vorlage. Du startest mit nichts und baust frei.',
  icon: '⬜',
  nodes: [],
  connections: [],
}

// ============================================================================
// 2. Brainstorming & Kreativität
// ============================================================================

const mindmap: Template = {
  id: 'mindmap',
  category: 'brainstorming',
  name: 'Mindmap',
  description:
    'Zentrales Thema in der Mitte, Unterthemen radial drumherum. Klassiker fürs Sortieren von Gedanken.',
  icon: '✦',
  preferredView: 'mindmap',
  nodes: [
    { step_number: 1, emoji: '🧠', name: 'Hauptthema', shape: '50%', width: 160, height: 160, position_x: 600, position_y: 400, color: C.amber },
    { step_number: 2, emoji: '💡', name: 'Idee 1', shape: '50%', position_x: 350, position_y: 200, color: C.blue, parent_step: 1 },
    { step_number: 3, emoji: '🎯', name: 'Idee 2', shape: '50%', position_x: 850, position_y: 200, color: C.green, parent_step: 1 },
    { step_number: 4, emoji: '🌱', name: 'Idee 3', shape: '50%', position_x: 350, position_y: 600, color: C.purple, parent_step: 1 },
    { step_number: 5, emoji: '🚀', name: 'Idee 4', shape: '50%', position_x: 850, position_y: 600, color: C.pink, parent_step: 1 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 1, to_step: 5 },
  ],
}

const cluster: Template = {
  id: 'cluster',
  category: 'brainstorming',
  name: 'Cluster',
  description:
    'Freie Sammlung ohne Hierarchie. Schreib alles raus, ordne später.',
  icon: '☁️',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '💭', name: 'Gedanke 1', shape: '50%', position_x: 200, position_y: 200, color: C.pastelBlue, text_color: '#0F1424' },
    { step_number: 2, emoji: '💭', name: 'Gedanke 2', shape: '50%', position_x: 500, position_y: 150, color: C.pastelGreen, text_color: '#0F1424' },
    { step_number: 3, emoji: '💭', name: 'Gedanke 3', shape: '50%', position_x: 800, position_y: 250, color: C.pastelYellow, text_color: '#0F1424' },
    { step_number: 4, emoji: '💭', name: 'Gedanke 4', shape: '50%', position_x: 300, position_y: 450, color: C.pastelPink, text_color: '#0F1424' },
    { step_number: 5, emoji: '💭', name: 'Gedanke 5', shape: '50%', position_x: 650, position_y: 500, color: C.pastelLila, text_color: '#0F1424' },
    { step_number: 6, emoji: '💭', name: 'Gedanke 6', shape: '50%', position_x: 900, position_y: 450, color: C.pastelPeach, text_color: '#0F1424' },
    { step_number: 7, emoji: '💭', name: 'Gedanke 7', shape: '50%', position_x: 150, position_y: 700, color: C.pastelBlue, text_color: '#0F1424' },
    { step_number: 8, emoji: '💭', name: 'Gedanke 8', shape: '50%', position_x: 550, position_y: 750, color: C.pastelGreen, text_color: '#0F1424' },
  ],
  connections: [],
}

const bubbleMap: Template = {
  id: 'bubble-map',
  category: 'brainstorming',
  name: 'Bubble Map',
  description:
    'Zentraler Begriff mit Eigenschafts-Blasen ringsum. Gut für Charakterisierung.',
  icon: '🫧',
  preferredView: 'mindmap',
  nodes: [
    { step_number: 1, emoji: '⭐', name: 'Hauptbegriff', shape: '50%', width: 150, height: 150, position_x: 600, position_y: 400, color: C.purple },
    { step_number: 2, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 600, position_y: 180, color: C.pastelLila, text_color: '#0F1424', parent_step: 1 },
    { step_number: 3, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 880, position_y: 280, color: C.pastelBlue, text_color: '#0F1424', parent_step: 1 },
    { step_number: 4, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 900, position_y: 540, color: C.pastelGreen, text_color: '#0F1424', parent_step: 1 },
    { step_number: 5, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 600, position_y: 640, color: C.pastelYellow, text_color: '#0F1424', parent_step: 1 },
    { step_number: 6, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 320, position_y: 540, color: C.pastelPink, text_color: '#0F1424', parent_step: 1 },
    { step_number: 7, name: 'Eigenschaft', shape: '50%', width: 100, height: 100, position_x: 300, position_y: 280, color: C.pastelPeach, text_color: '#0F1424', parent_step: 1 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 1, to_step: 5 },
    { from_step: 1, to_step: 6 },
    { from_step: 1, to_step: 7 },
  ],
}

const waltDisney: Template = {
  id: 'walt-disney',
  category: 'brainstorming',
  name: 'Walt-Disney-Methode',
  description:
    'Dieselbe Idee aus drei Perspektiven: Träumer, Realist, Kritiker.',
  icon: '🎭',
  preferredView: 'swimlane',
  nodes: [
    { step_number: 1, emoji: '💫', name: 'Träumer', shape: '20%', width: 200, height: 80, position_x: 100, position_y: 100, color: C.purple, lane: 'Träumer', short_desc: 'Was wäre wenn alles möglich ist?' },
    { step_number: 2, emoji: '🛠️', name: 'Realist', shape: '20%', width: 200, height: 80, position_x: 100, position_y: 280, color: C.blue, lane: 'Realist', short_desc: 'Wie können wir das umsetzen?' },
    { step_number: 3, emoji: '🔍', name: 'Kritiker', shape: '20%', width: 200, height: 80, position_x: 100, position_y: 460, color: C.red, lane: 'Kritiker', short_desc: 'Was könnte schiefgehen?' },
  ],
  connections: [],
}

const sixThreeFive: Template = {
  id: '6-3-5-methode',
  category: 'brainstorming',
  name: '6-3-5-Methode',
  description:
    '6 Personen × 3 Ideen × 5 Runden — Brainwriting für strukturierte Ideenfindung.',
  icon: '✏️',
  preferredView: 'list',
  nodes: Array.from({ length: 18 }).map((_, i) => {
    const round = Math.floor(i / 6)
    const person = i % 6
    return {
      step_number: i + 1,
      name: `P${person + 1} · Idee ${round + 1}`,
      short_desc: '...',
      shape: '8%' as const,
      width: 150,
      height: 70,
      position_x: 100 + person * 180,
      position_y: 100 + round * 150,
      color: [C.pastelBlue, C.pastelGreen, C.pastelYellow][round] ?? C.pastelLila,
      text_color: '#0F1424',
      lane: `Runde ${round + 1}`,
    }
  }),
  connections: [],
}

// ============================================================================
// 3. Analyse
// ============================================================================

const ishikawa: Template = {
  id: 'ishikawa',
  category: 'analyse',
  name: 'Ishikawa / Fischgräten-Diagramm',
  description:
    'Ursache-Wirkung-Analyse mit 6 Kategorien (Mensch, Maschine, Methode, Material, Umgebung, Messung).',
  icon: '🐟',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '🎯', name: 'Effekt / Problem', shape: '20%', width: 180, height: 80, position_x: 1100, position_y: 400, color: C.red },
    { step_number: 2, emoji: '👤', name: 'Mensch', shape: '8%', width: 130, height: 60, position_x: 200, position_y: 150, color: C.blue, parent_step: 1 },
    { step_number: 3, emoji: '⚙️', name: 'Maschine', shape: '8%', width: 130, height: 60, position_x: 500, position_y: 150, color: C.green, parent_step: 1 },
    { step_number: 4, emoji: '📋', name: 'Methode', shape: '8%', width: 130, height: 60, position_x: 800, position_y: 150, color: C.amber, parent_step: 1 },
    { step_number: 5, emoji: '🧱', name: 'Material', shape: '8%', width: 130, height: 60, position_x: 200, position_y: 650, color: C.purple, parent_step: 1 },
    { step_number: 6, emoji: '🌍', name: 'Umgebung', shape: '8%', width: 130, height: 60, position_x: 500, position_y: 650, color: C.cyan, parent_step: 1 },
    { step_number: 7, emoji: '📏', name: 'Messung', shape: '8%', width: 130, height: 60, position_x: 800, position_y: 650, color: C.pink, parent_step: 1 },
  ],
  connections: [
    { from_step: 2, to_step: 1 },
    { from_step: 3, to_step: 1 },
    { from_step: 4, to_step: 1 },
    { from_step: 5, to_step: 1 },
    { from_step: 6, to_step: 1 },
    { from_step: 7, to_step: 1 },
  ],
}

const swot: Template = {
  id: 'swot',
  category: 'analyse',
  name: 'SWOT-Analyse',
  description:
    'Stärken, Schwächen, Chancen, Risiken — die Klassiker-Quadranten für Strategie-Workshops.',
  icon: '⊞',
  preferredView: 'graph',
  preferredBackgroundPattern: 'grid',
  nodes: [
    { step_number: 1, emoji: '💪', name: 'Stärken', short_desc: 'Was läuft gut?', shape: '8%', width: 280, height: 200, position_x: 200, position_y: 150, color: C.green },
    { step_number: 2, emoji: '⚠️', name: 'Schwächen', short_desc: 'Wo hängen wir?', shape: '8%', width: 280, height: 200, position_x: 600, position_y: 150, color: C.red },
    { step_number: 3, emoji: '🌱', name: 'Chancen', short_desc: 'Was öffnet sich?', shape: '8%', width: 280, height: 200, position_x: 200, position_y: 450, color: C.blue },
    { step_number: 4, emoji: '⛔', name: 'Risiken', short_desc: 'Was könnte stören?', shape: '8%', width: 280, height: 200, position_x: 600, position_y: 450, color: C.amber },
  ],
  connections: [],
}

const issueTree: Template = {
  id: 'issue-tree',
  category: 'analyse',
  name: 'Issue Tree / Baumdiagramm',
  description:
    'Hauptproblem oben, logische Zerlegung in Teilprobleme nach unten. Top-Down Struktur.',
  icon: '🌳',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '❓', name: 'Hauptfrage', shape: '8%', width: 240, height: 80, position_x: 600, position_y: 100, color: C.amber },
    { step_number: 2, name: 'Teilfrage A', shape: '8%', width: 180, height: 70, position_x: 200, position_y: 280, color: C.blue, parent_step: 1 },
    { step_number: 3, name: 'Teilfrage B', shape: '8%', width: 180, height: 70, position_x: 600, position_y: 280, color: C.blue, parent_step: 1 },
    { step_number: 4, name: 'Teilfrage C', shape: '8%', width: 180, height: 70, position_x: 1000, position_y: 280, color: C.blue, parent_step: 1 },
    { step_number: 5, name: 'Hypothese A1', shape: '8%', width: 150, height: 60, position_x: 100, position_y: 450, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 6, name: 'Hypothese A2', shape: '8%', width: 150, height: 60, position_x: 290, position_y: 450, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 7, name: 'Hypothese B1', shape: '8%', width: 150, height: 60, position_x: 510, position_y: 450, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 8, name: 'Hypothese B2', shape: '8%', width: 150, height: 60, position_x: 690, position_y: 450, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 9, name: 'Hypothese C1', shape: '8%', width: 150, height: 60, position_x: 910, position_y: 450, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
    { step_number: 10, name: 'Hypothese C2', shape: '8%', width: 150, height: 60, position_x: 1090, position_y: 450, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 2, to_step: 5 },
    { from_step: 2, to_step: 6 },
    { from_step: 3, to_step: 7 },
    { from_step: 3, to_step: 8 },
    { from_step: 4, to_step: 9 },
    { from_step: 4, to_step: 10 },
  ],
}

const relevanzbaum: Template = {
  id: 'relevanzbaum',
  category: 'analyse',
  name: 'Relevanzbaum',
  description:
    'Hierarchische Bewertung: Hauptziel oben, Teilziele mit Relevanz-Gewichtung (Progress = Wichtigkeit).',
  icon: '🌲',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '🎯', name: 'Hauptziel', shape: '8%', width: 220, height: 80, position_x: 600, position_y: 100, color: C.amber, progress: 100 },
    { step_number: 2, name: 'Teilziel A', shape: '8%', width: 180, height: 70, position_x: 200, position_y: 280, color: C.green, progress: 70, parent_step: 1 },
    { step_number: 3, name: 'Teilziel B', shape: '8%', width: 180, height: 70, position_x: 600, position_y: 280, color: C.blue, progress: 50, parent_step: 1 },
    { step_number: 4, name: 'Teilziel C', shape: '8%', width: 180, height: 70, position_x: 1000, position_y: 280, color: C.purple, progress: 30, parent_step: 1 },
    { step_number: 5, name: 'Maßnahme A1', shape: '8%', width: 150, height: 60, position_x: 100, position_y: 450, color: C.pastelGreen, text_color: '#0F1424', progress: 80, parent_step: 2 },
    { step_number: 6, name: 'Maßnahme A2', shape: '8%', width: 150, height: 60, position_x: 290, position_y: 450, color: C.pastelGreen, text_color: '#0F1424', progress: 60, parent_step: 2 },
    { step_number: 7, name: 'Maßnahme B1', shape: '8%', width: 150, height: 60, position_x: 600, position_y: 450, color: C.pastelBlue, text_color: '#0F1424', progress: 40, parent_step: 3 },
    { step_number: 8, name: 'Maßnahme C1', shape: '8%', width: 150, height: 60, position_x: 1000, position_y: 450, color: C.pastelLila, text_color: '#0F1424', progress: 20, parent_step: 4 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 2, to_step: 5 },
    { from_step: 2, to_step: 6 },
    { from_step: 3, to_step: 7 },
    { from_step: 4, to_step: 8 },
  ],
}

const opportunitySolution: Template = {
  id: 'opportunity-solution',
  category: 'analyse',
  name: 'Opportunity-Solution-Map',
  description:
    'Chancen links, mögliche Lösungen rechts, durch Pfeile verbunden.',
  icon: '🔗',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '🌟', name: 'Chance 1', shape: '20%', width: 200, height: 80, position_x: 150, position_y: 150, color: C.green },
    { step_number: 2, emoji: '💡', name: 'Lösung 1', shape: '20%', width: 200, height: 80, position_x: 700, position_y: 150, color: C.blue },
    { step_number: 3, emoji: '🌟', name: 'Chance 2', shape: '20%', width: 200, height: 80, position_x: 150, position_y: 320, color: C.green },
    { step_number: 4, emoji: '💡', name: 'Lösung 2', shape: '20%', width: 200, height: 80, position_x: 700, position_y: 320, color: C.blue },
    { step_number: 5, emoji: '🌟', name: 'Chance 3', shape: '20%', width: 200, height: 80, position_x: 150, position_y: 490, color: C.green },
    { step_number: 6, emoji: '💡', name: 'Lösung 3', shape: '20%', width: 200, height: 80, position_x: 700, position_y: 490, color: C.blue },
  ],
  connections: [
    { from_step: 1, to_step: 2, step_label: 'führt zu' },
    { from_step: 3, to_step: 4, step_label: 'führt zu' },
    { from_step: 5, to_step: 6, step_label: 'führt zu' },
  ],
}

const fiveWhy: Template = {
  id: 'five-why',
  category: 'analyse',
  name: '5-Why-Analyse',
  description:
    'Frag 5× warum hintereinander, um die Ursache eines Problems zu finden.',
  icon: '❓',
  preferredView: 'linear',
  nodes: [
    { step_number: 1, emoji: '🚨', name: 'Problem', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 100, color: C.red },
    { step_number: 2, emoji: '❓', name: 'Warum 1?', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 240, color: C.amber },
    { step_number: 3, emoji: '❓', name: 'Warum 2?', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 380, color: C.amber },
    { step_number: 4, emoji: '❓', name: 'Warum 3?', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 520, color: C.amber },
    { step_number: 5, emoji: '❓', name: 'Warum 4?', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 660, color: C.amber },
    { step_number: 6, emoji: '🎯', name: 'Wurzel-Ursache', shape: '8%', width: 240, height: 80, position_x: 200, position_y: 800, color: C.green },
  ],
  connections: [
    { from_step: 1, to_step: 2, number: 1 },
    { from_step: 2, to_step: 3, number: 2 },
    { from_step: 3, to_step: 4, number: 3 },
    { from_step: 4, to_step: 5, number: 4 },
    { from_step: 5, to_step: 6, number: 5 },
  ],
}

// ============================================================================
// 4. Prozesse
// ============================================================================

const flowchart: Template = {
  id: 'flowchart',
  category: 'prozesse',
  name: 'Flowchart',
  description:
    'Klassisches Flussdiagramm mit Start, Aktionen, Entscheidungen (Diamanten) und Ende.',
  icon: '➡️',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '▶️', name: 'Start', shape: '50%', width: 120, height: 80, position_x: 500, position_y: 80, color: C.green },
    { step_number: 2, name: 'Aktion 1', shape: '8%', width: 180, height: 70, position_x: 470, position_y: 220, color: C.blue },
    { step_number: 3, name: 'Bedingung?', shape: 'diamond', width: 160, height: 160, position_x: 480, position_y: 360, color: C.amber },
    { step_number: 4, name: 'Aktion JA', shape: '8%', width: 180, height: 70, position_x: 250, position_y: 580, color: C.green },
    { step_number: 5, name: 'Aktion NEIN', shape: '8%', width: 180, height: 70, position_x: 700, position_y: 580, color: C.red },
    { step_number: 6, emoji: '⏹️', name: 'Ende', shape: '50%', width: 120, height: 80, position_x: 500, position_y: 740, color: C.gray },
  ],
  connections: [
    { from_step: 1, to_step: 2, number: 1 },
    { from_step: 2, to_step: 3, number: 2 },
    { from_step: 3, to_step: 4, step_label: 'Ja' },
    { from_step: 3, to_step: 5, step_label: 'Nein' },
    { from_step: 4, to_step: 6 },
    { from_step: 5, to_step: 6 },
  ],
}

const swimlane: Template = {
  id: 'swimlane',
  category: 'prozesse',
  name: 'Swimlane-Diagramm',
  description:
    'Prozess-Schritte verteilt auf Lanes nach Verantwortlichkeit.',
  icon: '⫶',
  preferredView: 'swimlane',
  nodes: [
    { step_number: 1, emoji: '📨', name: 'Anfrage erhalten', shape: '8%', width: 180, height: 70, position_x: 200, position_y: 100, color: C.blue, lane: 'Sales' },
    { step_number: 2, emoji: '✅', name: 'Qualifizieren', shape: '8%', width: 180, height: 70, position_x: 500, position_y: 100, color: C.blue, lane: 'Sales' },
    { step_number: 3, emoji: '🛠️', name: 'Lösung bauen', shape: '8%', width: 180, height: 70, position_x: 800, position_y: 100, color: C.green, lane: 'Tech' },
    { step_number: 4, emoji: '🧪', name: 'Testen', shape: '8%', width: 180, height: 70, position_x: 1100, position_y: 100, color: C.green, lane: 'Tech' },
    { step_number: 5, emoji: '🚀', name: 'Ausliefern', shape: '8%', width: 180, height: 70, position_x: 1400, position_y: 100, color: C.amber, lane: 'Support' },
    { step_number: 6, emoji: '📞', name: 'Nachfassen', shape: '8%', width: 180, height: 70, position_x: 1700, position_y: 100, color: C.amber, lane: 'Support' },
  ],
  connections: [
    { from_step: 1, to_step: 2, number: 1 },
    { from_step: 2, to_step: 3, number: 2 },
    { from_step: 3, to_step: 4, number: 3 },
    { from_step: 4, to_step: 5, number: 4 },
    { from_step: 5, to_step: 6, number: 5 },
  ],
}

const conceptMap: Template = {
  id: 'concept-map',
  category: 'prozesse',
  name: 'Concept Map',
  description:
    'Konzepte verbunden mit beschrifteten Verbindungen (Verben). Zeigt komplexe Zusammenhänge.',
  icon: '🕸️',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '💡', name: 'Konzept A', shape: '50%', width: 130, height: 130, position_x: 500, position_y: 200, color: C.amber },
    { step_number: 2, emoji: '🌱', name: 'Konzept B', shape: '50%', width: 130, height: 130, position_x: 200, position_y: 500, color: C.green },
    { step_number: 3, emoji: '🎯', name: 'Konzept C', shape: '50%', width: 130, height: 130, position_x: 800, position_y: 500, color: C.blue },
    { step_number: 4, emoji: '🚀', name: 'Konzept D', shape: '50%', width: 130, height: 130, position_x: 500, position_y: 750, color: C.purple },
  ],
  connections: [
    { from_step: 1, to_step: 2, step_label: 'enthält' },
    { from_step: 1, to_step: 3, step_label: 'führt zu' },
    { from_step: 2, to_step: 4, step_label: 'unterstützt' },
    { from_step: 3, to_step: 4, step_label: 'beeinflusst' },
  ],
}

const systemFlow: Template = {
  id: 'system-flow',
  category: 'prozesse',
  name: 'System-Flow-Diagramm',
  description:
    'Komponenten eines Systems mit Datenflüssen — UI, Backend, Datenbank, externe Services.',
  icon: '⚡',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '🖥️', name: 'UI / App', shape: '8%', width: 160, height: 80, position_x: 100, position_y: 200, color: C.blue },
    { step_number: 2, emoji: '⚙️', name: 'Backend', shape: '8%', width: 160, height: 80, position_x: 500, position_y: 200, color: C.green },
    { step_number: 3, emoji: '🗄️', name: 'Datenbank', shape: '8%', width: 160, height: 80, position_x: 900, position_y: 200, color: C.purple },
    { step_number: 4, emoji: '🌐', name: 'Externe API', shape: '8%', width: 160, height: 80, position_x: 500, position_y: 450, color: C.amber },
  ],
  connections: [
    { from_step: 1, to_step: 2, step_label: 'Request' },
    { from_step: 2, to_step: 1, step_label: 'Response' },
    { from_step: 2, to_step: 3, step_label: 'Read/Write' },
    { from_step: 2, to_step: 4, step_label: 'Fetch' },
  ],
}

// ============================================================================
// 5. Projekte
// ============================================================================

const wbs: Template = {
  id: 'wbs',
  category: 'projekte',
  name: 'Projektstrukturplan (WBS)',
  description:
    'Hierarchischer Baum: Projekt → Phasen → Arbeitspakete → Tasks.',
  icon: '📐',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '🎯', name: 'Projekt', shape: '8%', width: 240, height: 80, position_x: 600, position_y: 80, color: C.amber },
    { step_number: 2, name: 'Phase 1', shape: '8%', width: 180, height: 70, position_x: 200, position_y: 230, color: C.blue, parent_step: 1 },
    { step_number: 3, name: 'Phase 2', shape: '8%', width: 180, height: 70, position_x: 600, position_y: 230, color: C.green, parent_step: 1 },
    { step_number: 4, name: 'Phase 3', shape: '8%', width: 180, height: 70, position_x: 1000, position_y: 230, color: C.purple, parent_step: 1 },
    { step_number: 5, name: 'Paket 1.1', shape: '8%', width: 150, height: 60, position_x: 100, position_y: 380, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 6, name: 'Paket 1.2', shape: '8%', width: 150, height: 60, position_x: 290, position_y: 380, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 7, name: 'Paket 2.1', shape: '8%', width: 150, height: 60, position_x: 510, position_y: 380, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 8, name: 'Paket 2.2', shape: '8%', width: 150, height: 60, position_x: 690, position_y: 380, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 9, name: 'Paket 3.1', shape: '8%', width: 150, height: 60, position_x: 910, position_y: 380, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
    { step_number: 10, name: 'Paket 3.2', shape: '8%', width: 150, height: 60, position_x: 1090, position_y: 380, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 2, to_step: 5 },
    { from_step: 2, to_step: 6 },
    { from_step: 3, to_step: 7 },
    { from_step: 3, to_step: 8 },
    { from_step: 4, to_step: 9 },
    { from_step: 4, to_step: 10 },
  ],
}

const gantt: Template = {
  id: 'gantt',
  category: 'projekte',
  name: 'Gantt / Zeitleiste',
  description:
    'Aufgaben mit Start- und End-Datum auf horizontaler Zeitachse.',
  icon: '⟿',
  preferredView: 'timeline',
  nodes: [
    { step_number: 1, emoji: '🎯', name: 'Konzept', shape: '8%', width: 200, height: 70, position_x: 200, position_y: 100, color: C.blue, start_date: '2026-05-01', end_date: '2026-05-15', progress: 100, status: 'done', status_icon: '✅' },
    { step_number: 2, emoji: '🛠️', name: 'Entwicklung Phase 1', shape: '8%', width: 200, height: 70, position_x: 200, position_y: 200, color: C.green, start_date: '2026-05-15', end_date: '2026-06-15', progress: 60, status: 'wip', status_icon: '⏳' },
    { step_number: 3, emoji: '🧪', name: 'Tests', shape: '8%', width: 200, height: 70, position_x: 200, position_y: 300, color: C.amber, start_date: '2026-06-10', end_date: '2026-06-25', progress: 0, status: 'idea', status_icon: '🌱' },
    { step_number: 4, emoji: '🚀', name: 'Launch', shape: '8%', width: 200, height: 70, position_x: 200, position_y: 400, color: C.purple, start_date: '2026-06-25', end_date: '2026-07-05', progress: 0, status: 'idea', status_icon: '🌱' },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 2, to_step: 3 },
    { from_step: 3, to_step: 4 },
  ],
}

const netzplan: Template = {
  id: 'netzplan',
  category: 'projekte',
  name: 'Netzplan',
  description:
    'Aktivitäten + Abhängigkeiten — kritischer Pfad in rot hervorgehoben.',
  icon: '🔀',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, name: 'A — Start', shape: '8%', width: 150, height: 70, position_x: 100, position_y: 300, color: C.green },
    { step_number: 2, name: 'B', shape: '8%', width: 150, height: 70, position_x: 350, position_y: 200, color: C.blue },
    { step_number: 3, name: 'C', shape: '8%', width: 150, height: 70, position_x: 350, position_y: 400, color: C.red },
    { step_number: 4, name: 'D', shape: '8%', width: 150, height: 70, position_x: 600, position_y: 200, color: C.blue },
    { step_number: 5, name: 'E', shape: '8%', width: 150, height: 70, position_x: 600, position_y: 400, color: C.red },
    { step_number: 6, name: 'F — Ende', shape: '8%', width: 150, height: 70, position_x: 850, position_y: 300, color: C.green },
  ],
  connections: [
    { from_step: 1, to_step: 2, step_label: 'unkrit.', color: '#9CA3AF' },
    { from_step: 1, to_step: 3, step_label: 'krit. Pfad', color: '#DC2626' },
    { from_step: 2, to_step: 4, color: '#9CA3AF' },
    { from_step: 3, to_step: 5, step_label: 'krit. Pfad', color: '#DC2626' },
    { from_step: 4, to_step: 6, color: '#9CA3AF' },
    { from_step: 5, to_step: 6, step_label: 'krit. Pfad', color: '#DC2626' },
  ],
}

const organigramm: Template = {
  id: 'organigramm',
  category: 'projekte',
  name: 'Organigramm',
  description:
    'Top-Down-Hierarchie mit Geschäftsführung, Abteilungen, Teams.',
  icon: '🏢',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '👔', name: 'Geschäftsführung', shape: '8%', width: 220, height: 80, position_x: 600, position_y: 80, color: C.amber },
    { step_number: 2, emoji: '💼', name: 'Sales', shape: '8%', width: 180, height: 70, position_x: 200, position_y: 230, color: C.blue, parent_step: 1 },
    { step_number: 3, emoji: '🛠️', name: 'Technik', shape: '8%', width: 180, height: 70, position_x: 600, position_y: 230, color: C.green, parent_step: 1 },
    { step_number: 4, emoji: '📞', name: 'Support', shape: '8%', width: 180, height: 70, position_x: 1000, position_y: 230, color: C.purple, parent_step: 1 },
    { step_number: 5, name: 'Team Sales 1', shape: '8%', width: 150, height: 60, position_x: 100, position_y: 380, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 6, name: 'Team Sales 2', shape: '8%', width: 150, height: 60, position_x: 290, position_y: 380, color: C.pastelBlue, text_color: '#0F1424', parent_step: 2 },
    { step_number: 7, name: 'Team Frontend', shape: '8%', width: 150, height: 60, position_x: 510, position_y: 380, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 8, name: 'Team Backend', shape: '8%', width: 150, height: 60, position_x: 690, position_y: 380, color: C.pastelGreen, text_color: '#0F1424', parent_step: 3 },
    { step_number: 9, name: 'Team L1', shape: '8%', width: 150, height: 60, position_x: 910, position_y: 380, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
    { step_number: 10, name: 'Team L2', shape: '8%', width: 150, height: 60, position_x: 1090, position_y: 380, color: C.pastelLila, text_color: '#0F1424', parent_step: 4 },
  ],
  connections: [
    { from_step: 1, to_step: 2 },
    { from_step: 1, to_step: 3 },
    { from_step: 1, to_step: 4 },
    { from_step: 2, to_step: 5 },
    { from_step: 2, to_step: 6 },
    { from_step: 3, to_step: 7 },
    { from_step: 3, to_step: 8 },
    { from_step: 4, to_step: 9 },
    { from_step: 4, to_step: 10 },
  ],
}

// ============================================================================
// 6. Entscheidungen
// ============================================================================

const decisionTree: Template = {
  id: 'decision-tree',
  category: 'entscheidungen',
  name: 'Entscheidungsbaum',
  description:
    'Frage → 2 Optionen → Folge-Entscheidungen → Konsequenzen.',
  icon: '🌿',
  preferredView: 'graph',
  nodes: [
    { step_number: 1, emoji: '❓', name: 'Frage', shape: 'diamond', width: 180, height: 180, position_x: 600, position_y: 80, color: C.amber },
    { step_number: 2, emoji: '✅', name: 'Option A', shape: 'diamond', width: 160, height: 160, position_x: 250, position_y: 320, color: C.green },
    { step_number: 3, emoji: '✅', name: 'Option B', shape: 'diamond', width: 160, height: 160, position_x: 950, position_y: 320, color: C.blue },
    { step_number: 4, name: 'Konsequenz A1', shape: '8%', width: 160, height: 70, position_x: 100, position_y: 540, color: C.pastelGreen, text_color: '#0F1424', parent_step: 2 },
    { step_number: 5, name: 'Konsequenz A2', shape: '8%', width: 160, height: 70, position_x: 350, position_y: 540, color: C.pastelGreen, text_color: '#0F1424', parent_step: 2 },
    { step_number: 6, name: 'Konsequenz B1', shape: '8%', width: 160, height: 70, position_x: 800, position_y: 540, color: C.pastelBlue, text_color: '#0F1424', parent_step: 3 },
    { step_number: 7, name: 'Konsequenz B2', shape: '8%', width: 160, height: 70, position_x: 1050, position_y: 540, color: C.pastelBlue, text_color: '#0F1424', parent_step: 3 },
  ],
  connections: [
    { from_step: 1, to_step: 2, step_label: 'Ja' },
    { from_step: 1, to_step: 3, step_label: 'Nein' },
    { from_step: 2, to_step: 4 },
    { from_step: 2, to_step: 5 },
    { from_step: 3, to_step: 6 },
    { from_step: 3, to_step: 7 },
  ],
}

const eisenhower: Template = {
  id: 'eisenhower',
  category: 'entscheidungen',
  name: 'Eisenhower-Matrix',
  description:
    '4 fixierte Quadranten als Hintergrund — Aufgaben einfach reinziehen. Sofort tun · Planen · Delegieren · Weglassen.',
  icon: '🟦',
  preferredView: 'graph',
  preferredBackgroundPattern: 'grid',
  nodes: [
    // ═══ 4 große Quadranten, FIXIERT, dienen als Hintergrund-Layout ═══
    {
      step_number: 1,
      emoji: '🔥',
      name: 'Wichtig & Dringend',
      short_desc: 'Sofort selbst erledigen',
      shape: '8%',
      width: 520,
      height: 380,
      position_x: 0,
      position_y: 0,
      color: '#FECACA', // pastel red
      text_color: '#7F1D1D',
      locked: true,
    },
    {
      step_number: 2,
      emoji: '📅',
      name: 'Wichtig & nicht dringend',
      short_desc: 'Bewusst einplanen',
      shape: '8%',
      width: 520,
      height: 380,
      position_x: 540,
      position_y: 0,
      color: '#BBF7D0', // pastel green
      text_color: '#14532D',
      locked: true,
    },
    {
      step_number: 3,
      emoji: '👥',
      name: 'Nicht wichtig & dringend',
      short_desc: 'Delegieren',
      shape: '8%',
      width: 520,
      height: 380,
      position_x: 0,
      position_y: 400,
      color: '#FED7AA', // pastel orange
      text_color: '#7C2D12',
      locked: true,
    },
    {
      step_number: 4,
      emoji: '🗑️',
      name: 'Nicht wichtig & nicht dringend',
      short_desc: 'Weglassen oder später',
      shape: '8%',
      width: 520,
      height: 380,
      position_x: 540,
      position_y: 400,
      color: '#E5E7EB', // pastel gray
      text_color: '#374151',
      locked: true,
    },
    // ═══ 4 Beispiel-Aufgaben in den Quadranten ═══
    { step_number: 5, emoji: '⚡', name: 'Krise lösen', shape: '20%', width: 160, height: 80, position_x: 60, position_y: 220, color: C.red },
    { step_number: 6, emoji: '🎯', name: 'Quartals-Ziele setzen', shape: '20%', width: 200, height: 80, position_x: 600, position_y: 220, color: C.green },
    { step_number: 7, emoji: '📞', name: 'Anruf zurückgeben', shape: '20%', width: 180, height: 80, position_x: 60, position_y: 620, color: C.amber },
    { step_number: 8, emoji: '📺', name: 'Social-Media-Scrollen', shape: '20%', width: 200, height: 80, position_x: 600, position_y: 620, color: C.gray },
  ],
  connections: [],
}

// ============================================================================
// 7. Strategie
// ============================================================================

const leanCanvas: Template = {
  id: 'lean-canvas',
  category: 'strategie',
  name: 'Lean Canvas',
  description:
    '9-Felder-Strategie-Bord für Startups: Problem, Lösung, Zielgruppe, Value, etc.',
  icon: '📊',
  preferredView: 'graph',
  preferredBackgroundPattern: 'grid',
  nodes: [
    { step_number: 1, emoji: '🚨', name: 'Problem', shape: '8%', width: 200, height: 120, position_x: 100, position_y: 100, color: C.red },
    { step_number: 2, emoji: '🛠️', name: 'Lösung', shape: '8%', width: 200, height: 120, position_x: 320, position_y: 100, color: C.green },
    { step_number: 3, emoji: '⭐', name: 'Value Proposition', shape: '8%', width: 200, height: 120, position_x: 540, position_y: 100, color: C.amber },
    { step_number: 4, emoji: '🎯', name: 'Unfair Advantage', shape: '8%', width: 200, height: 120, position_x: 760, position_y: 100, color: C.purple },
    { step_number: 5, emoji: '👥', name: 'Kundensegmente', shape: '8%', width: 200, height: 120, position_x: 980, position_y: 100, color: C.blue },
    { step_number: 6, emoji: '📈', name: 'Key Metrics', shape: '8%', width: 200, height: 120, position_x: 320, position_y: 250, color: C.cyan },
    { step_number: 7, emoji: '📣', name: 'Channels', shape: '8%', width: 200, height: 120, position_x: 760, position_y: 250, color: C.pink },
    { step_number: 8, emoji: '💸', name: 'Kostenstruktur', shape: '8%', width: 320, height: 100, position_x: 100, position_y: 420, color: C.gray },
    { step_number: 9, emoji: '💰', name: 'Einnahmequellen', shape: '8%', width: 320, height: 100, position_x: 760, position_y: 420, color: C.green },
  ],
  connections: [],
}

const kawa: Template = {
  id: 'kawa',
  category: 'strategie',
  name: 'KAWA-Methode',
  description:
    'Kreatives Akrostichon: jeder Buchstabe eines Wortes wird mit einem Begriff/Idee gefüllt.',
  icon: '🔤',
  preferredView: 'linear',
  nodes: [
    { step_number: 1, name: 'K — Begriff/Idee', shape: '8%', width: 280, height: 70, position_x: 200, position_y: 100, color: C.blue },
    { step_number: 2, name: 'A — Begriff/Idee', shape: '8%', width: 280, height: 70, position_x: 200, position_y: 220, color: C.green },
    { step_number: 3, name: 'W — Begriff/Idee', shape: '8%', width: 280, height: 70, position_x: 200, position_y: 340, color: C.amber },
    { step_number: 4, name: 'A — Begriff/Idee', shape: '8%', width: 280, height: 70, position_x: 200, position_y: 460, color: C.purple },
  ],
  connections: [],
}

// ============================================================================
// Registry — alle Templates in fester Reihenfolge
// ============================================================================

export const TEMPLATES: Template[] = [
  // Allgemein
  empty,
  // Brainstorming
  mindmap,
  cluster,
  bubbleMap,
  waltDisney,
  sixThreeFive,
  // Analyse
  ishikawa,
  swot,
  issueTree,
  relevanzbaum,
  opportunitySolution,
  fiveWhy,
  // Prozesse
  flowchart,
  swimlane,
  conceptMap,
  systemFlow,
  // Projekte
  wbs,
  gantt,
  netzplan,
  organigramm,
  // Entscheidungen
  decisionTree,
  eisenhower,
  // Strategie
  leanCanvas,
  kawa,
]

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  allgemein: 'Allgemein',
  brainstorming: 'Brainstorming & Kreativität',
  analyse: 'Analyse',
  prozesse: 'Prozesse',
  projekte: 'Projekte & Planung',
  entscheidungen: 'Entscheidungen',
  strategie: 'Strategie',
}

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
