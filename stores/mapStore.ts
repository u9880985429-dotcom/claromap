import { create } from 'zustand'
import type { Database } from '@/types/database'

export type MapRow = Database['public']['Tables']['maps']['Row']
export type NodeRow = Database['public']['Tables']['nodes']['Row']
export type ConnectionRow = Database['public']['Tables']['connections']['Row']
export type TaskRow = Database['public']['Tables']['tasks']['Row']

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// History-Stack für Undo/Redo. Jede Aktion ist ihr eigener "inverse-fähiger"
// Eintrag, der lokal angewendet UND server-seitig synchronisiert werden kann.
export type HistoryEntry =
  | {
      type: 'patch-node'
      nodeId: string
      before: Partial<NodeRow>
      after: Partial<NodeRow>
    }
  | { type: 'create-node'; node: NodeRow }
  | {
      type: 'delete-node'
      node: NodeRow
      connections: ConnectionRow[]
      tasks: TaskRow[]
    }
  | { type: 'create-connection'; conn: ConnectionRow }
  | { type: 'delete-connection'; conn: ConnectionRow }

interface MapState {
  map: MapRow | null
  nodes: NodeRow[]
  connections: ConnectionRow[]
  tasks: TaskRow[]
  selectedNodeId: string | null
  selectedConnectionId: string | null
  saveStatus: SaveStatus
  saveStatusUntil: number // timestamp ms — bis wann „saved" angezeigt wird
  inflightCount: number // wieviele Server Actions gerade laufen

  // Undo/Redo
  history: HistoryEntry[]
  historyIndex: number // -1 = nichts zum redo'n, history.length = nichts zum undo'n
  pushHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  popUndo: () => HistoryEntry | null
  popRedo: () => HistoryEntry | null

  init: (
    map: MapRow,
    nodes: NodeRow[],
    connections: ConnectionRow[],
    tasks: TaskRow[],
  ) => void

  beginSave: () => void
  endSave: (success: boolean) => void

  patchMapLocal: (patch: Partial<MapRow>) => void
  upsertMap: (map: MapRow) => void

  selectNode: (id: string | null) => void
  selectConnection: (id: string | null) => void

  patchNodeLocal: (id: string, patch: Partial<NodeRow>) => void
  upsertNode: (node: NodeRow) => void
  removeNode: (id: string) => void

  upsertConnection: (conn: ConnectionRow) => void
  patchConnectionLocal: (id: string, patch: Partial<ConnectionRow>) => void
  removeConnection: (id: string) => void

  upsertTask: (task: TaskRow) => void
  patchTaskLocal: (id: string, patch: Partial<TaskRow>) => void
  removeTask: (id: string) => void
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  nodes: [],
  connections: [],
  tasks: [],
  selectedNodeId: null,
  selectedConnectionId: null,
  saveStatus: 'idle',
  saveStatusUntil: 0,
  inflightCount: 0,

  history: [],
  historyIndex: 0,

  init: (map, nodes, connections, tasks) =>
    set({
      map,
      nodes,
      connections,
      tasks,
      selectedNodeId: null,
      selectedConnectionId: null,
      history: [],
      historyIndex: 0,
    }),

  pushHistory: (entry) =>
    set((s) => {
      // Wenn wir nach einem Undo waren und neue Action kommt:
      // alle "redo"-Einträge nach dem aktuellen Index verwerfen.
      const trimmed = s.history.slice(0, s.historyIndex)
      const next = [...trimmed, entry].slice(-50) // max 50 Schritte
      return { history: next, historyIndex: next.length }
    }),

  clearHistory: () => set({ history: [], historyIndex: 0 }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const s = get()
    return s.historyIndex < s.history.length
  },

  popUndo: () => {
    const s = get()
    if (s.historyIndex <= 0) return null
    const entry = s.history[s.historyIndex - 1]
    set({ historyIndex: s.historyIndex - 1 })
    return entry
  },

  popRedo: () => {
    const s = get()
    if (s.historyIndex >= s.history.length) return null
    const entry = s.history[s.historyIndex]
    set({ historyIndex: s.historyIndex + 1 })
    return entry
  },

  beginSave: () =>
    set((s) => ({
      saveStatus: 'saving',
      inflightCount: s.inflightCount + 1,
    })),

  endSave: (success) =>
    set((s) => {
      const next = Math.max(0, s.inflightCount - 1)
      if (next > 0) {
        // Es laufen noch Saves — bleib auf 'saving'
        return { inflightCount: next }
      }
      return {
        inflightCount: 0,
        saveStatus: success ? 'saved' : 'error',
        saveStatusUntil: Date.now() + 2000,
      }
    }),

  patchMapLocal: (patch) =>
    set((s) => (s.map ? { map: { ...s.map, ...patch } } : {})),

  upsertMap: (map) => set({ map }),

  selectNode: (id) => set({ selectedNodeId: id, selectedConnectionId: null }),

  selectConnection: (id) =>
    set({ selectedConnectionId: id, selectedNodeId: null }),

  patchNodeLocal: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),

  upsertNode: (node) =>
    set((s) => {
      const exists = s.nodes.some((n) => n.id === node.id)
      return {
        nodes: exists
          ? s.nodes.map((n) => (n.id === node.id ? node : n))
          : [...s.nodes, node],
      }
    }),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      connections: s.connections.filter(
        (c) => c.from_node_id !== id && c.to_node_id !== id,
      ),
      tasks: s.tasks.filter((t) => t.node_id !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  upsertConnection: (conn) =>
    set((s) => {
      const exists = s.connections.some((c) => c.id === conn.id)
      return {
        connections: exists
          ? s.connections.map((c) => (c.id === conn.id ? conn : c))
          : [...s.connections, conn],
      }
    }),

  patchConnectionLocal: (id, patch) =>
    set((s) => ({
      connections: s.connections.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),

  removeConnection: (id) =>
    set((s) => ({
      connections: s.connections.filter((c) => c.id !== id),
      selectedConnectionId:
        s.selectedConnectionId === id ? null : s.selectedConnectionId,
    })),

  upsertTask: (task) =>
    set((s) => {
      const exists = s.tasks.some((t) => t.id === task.id)
      return {
        tasks: exists
          ? s.tasks.map((t) => (t.id === task.id ? task : t))
          : [...s.tasks, task],
      }
    }),

  patchTaskLocal: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}))
