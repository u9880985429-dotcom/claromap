'use client'

import { useEffect } from 'react'
import {
  useMapStore,
  type MapRow,
  type NodeRow,
  type ConnectionRow,
  type TaskRow,
  type AnnotationRow,
} from '@/stores/mapStore'
import { useUIStore, type Theme } from '@/stores/uiStore'
import { DetailPanel } from './DetailPanel'
import { ConnectionPanel } from './ConnectionPanel'
import { WorkflowView } from './views/WorkflowView'
import { MindMapView } from './views/MindMapView'
import { HubView } from './views/HubView'
import { LinearView } from './views/LinearView'
import { KanbanView } from './views/KanbanView'
import { ListView } from './views/ListView'
import { TimelineView } from './views/TimelineView'
import { SwimlaneView } from './views/SwimlaneView'
import { KeyboardCheatsheet } from './KeyboardCheatsheet'
import dynamic from 'next/dynamic'

// 3D-View dynamisch laden (Three.js ~600KB) — nicht im Initial-Bundle
const Galaxy3DView = dynamic(
  () => import('./views/Galaxy3DView').then((m) => m.Galaxy3DView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-bg">
        <p className="font-mono text-sm text-text3">3D-Engine lädt …</p>
      </div>
    ),
  },
)

interface Props {
  map: MapRow
  initialNodes: NodeRow[]
  initialConnections: ConnectionRow[]
  initialTasks: TaskRow[]
  initialAnnotations: AnnotationRow[]
}

export function CanvasContainer({
  map,
  initialNodes,
  initialConnections,
  initialTasks,
  initialAnnotations,
}: Props) {
  const view = useUIStore((s) => s.view)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)
  const selectedConnectionId = useMapStore((s) => s.selectedConnectionId)

  // Hydrate store with server data — nur bei Map-Wechsel, nicht bei jeder
  // neuen Server-Array-Referenz, sonst entsteht ein Render-Loop wenn der
  // Store sich ändert und Parent neu rendert.
  useEffect(() => {
    useMapStore
      .getState()
      .init(
        map,
        initialNodes,
        initialConnections,
        initialTasks,
        initialAnnotations,
      )
    useUIStore.getState().setTheme(map.theme as Theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.id])

  // Apply theme to document body
  useEffect(() => {
    const theme = useUIStore.getState().theme
    document.body.setAttribute('data-theme', theme === 'default' ? '' : theme)
    const unsub = useUIStore.subscribe((s) => {
      document.body.setAttribute(
        'data-theme',
        s.theme === 'default' ? '' : s.theme,
      )
    })
    return () => {
      unsub()
      document.body.setAttribute('data-theme', '')
    }
  }, [])

  // Hydrate comfort-mode aus localStorage (auf Map-Edit-Seite einmal)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('claromap.comfort')
    if (saved === 'true') {
      useUIStore.getState().setComfortMode(true)
    }
  }, [])

  return (
    <div className="flex h-full overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        {view === 'graph' && <WorkflowView mapId={map.id} />}
        {view === 'mindmap' && <MindMapView />}
        {view === 'hub' && <HubView />}
        {view === 'linear' && <LinearView />}
        {view === 'kanban' && <KanbanView />}
        {view === 'list' && <ListView />}
        {view === 'timeline' && <TimelineView />}
        {view === 'swimlane' && <SwimlaneView />}
        {view === 'galaxy3d' && <Galaxy3DView />}
      </div>

      {selectedNodeId && <DetailPanel />}
      {selectedConnectionId && <ConnectionPanel />}
      <KeyboardCheatsheet />
    </div>
  )
}
