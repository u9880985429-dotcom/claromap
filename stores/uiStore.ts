import { create } from 'zustand'

export type ViewName =
  | 'graph'
  | 'mindmap'
  | 'hub'
  | 'linear'
  | 'kanban'
  | 'list'
  | 'timeline'
  | 'swimlane'
  | 'galaxy3d'
export type Theme = 'default' | 'dark' | 'hand'
export type DetailLevel = 'simple' | 'normal' | 'full'

interface UIState {
  view: ViewName
  detailLevel: DetailLevel
  theme: Theme
  scale: number
  panX: number
  panY: number
  connectMode: boolean
  connectFromNodeId: string | null
  focusMode: boolean
  snapToGrid: boolean
  // Maps-Sidebar links (auf der Map-Edit-Seite). Persistiert via localStorage.
  mapsSidebarOpen: boolean
  // Hand-Tool: wenn aktiv, ist jeder Klick (auch auf Knoten) ein Pan.
  // Toggle-Button in der Toolbar oder Hotkey "H".
  handTool: boolean
  // Komfort-Modus: größere Bedienelemente, kräftigerer Kontrast,
  // dickere Outlines. Für Senior:innen oder Touch-Bedienung.
  // Persistiert via localStorage als 'claromap.comfort'.
  comfortMode: boolean

  setView: (v: ViewName) => void
  setDetailLevel: (l: DetailLevel) => void
  setTheme: (t: Theme) => void
  setScale: (s: number) => void
  setPan: (x: number, y: number) => void
  zoomBy: (factor: number, originX?: number, originY?: number) => void
  resetView: () => void
  toggleConnectMode: () => void
  setConnectFromNodeId: (id: string | null) => void
  toggleFocusMode: () => void
  setFocusMode: (v: boolean) => void
  toggleSnapToGrid: () => void
  toggleMapsSidebar: () => void
  setMapsSidebarOpen: (open: boolean) => void
  toggleHandTool: () => void
  setHandTool: (v: boolean) => void
  toggleComfortMode: () => void
  setComfortMode: (v: boolean) => void
}

const MIN_SCALE = 0.2
const MAX_SCALE = 2

export const useUIStore = create<UIState>((set, get) => ({
  view: 'graph',
  detailLevel: 'normal',
  theme: 'default',
  scale: 0.8,
  panX: 0,
  panY: 0,
  connectMode: false,
  connectFromNodeId: null,
  focusMode: false,
  snapToGrid: false,
  // Default true — wird per useEffect in der Sidebar-Komponente aus
  // localStorage hydratisiert, um SSR/Client-Mismatch zu vermeiden.
  mapsSidebarOpen: true,
  handTool: false,
  comfortMode: false,

  setView: (v) => set({ view: v }),
  setDetailLevel: (l) => set({ detailLevel: l }),
  setTheme: (t) => set({ theme: t }),
  setScale: (s) =>
    set({ scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, s)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  zoomBy: (factor, originX = 0, originY = 0) => {
    const { scale, panX, panY } = get()
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor))
    const ratio = newScale / scale
    set({
      scale: newScale,
      panX: originX - (originX - panX) * ratio,
      panY: originY - (originY - panY) * ratio,
    })
  },
  resetView: () => set({ scale: 0.8, panX: 0, panY: 0 }),
  toggleConnectMode: () =>
    set((s) => ({
      connectMode: !s.connectMode,
      connectFromNodeId: null,
    })),
  setConnectFromNodeId: (id) => set({ connectFromNodeId: id }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFocusMode: (v) => set({ focusMode: v }),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  toggleMapsSidebar: () =>
    set((s) => {
      const next = !s.mapsSidebarOpen
      if (typeof window !== 'undefined') {
        localStorage.setItem('claromap.mapsSidebarOpen', String(next))
      }
      return { mapsSidebarOpen: next }
    }),
  setMapsSidebarOpen: (open) =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('claromap.mapsSidebarOpen', String(open))
      }
      return { mapsSidebarOpen: open }
    }),
  toggleHandTool: () => set((s) => ({ handTool: !s.handTool })),
  setHandTool: (v) => set({ handTool: v }),
  toggleComfortMode: () =>
    set((s) => {
      const next = !s.comfortMode
      if (typeof window !== 'undefined') {
        localStorage.setItem('claromap.comfort', String(next))
        document.body.toggleAttribute('data-comfort', next)
      }
      return { comfortMode: next }
    }),
  setComfortMode: (v) =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('claromap.comfort', String(v))
        document.body.toggleAttribute('data-comfort', v)
      }
      return { comfortMode: v }
    }),
}))
