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
}))
