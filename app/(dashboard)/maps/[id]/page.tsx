import { notFound } from 'next/navigation'
import { getMap, listMapsWithStats } from '@/lib/data/maps'
import { listNodesByMap } from '@/lib/data/nodes'
import { listConnectionsByMap } from '@/lib/data/connections'
import { listTasksByMap } from '@/lib/data/tasks'
import { CanvasContainer } from '@/components/canvas/CanvasContainer'
import { ViewSwitcher } from '@/components/canvas/ViewSwitcher'
import { MapSettings } from '@/components/canvas/MapSettings'
import { MapTitle } from '@/components/canvas/MapTitle'
import { HealthScore } from '@/components/canvas/HealthScore'
import { AddTemplateButton } from '@/components/canvas/TemplatePicker'
import { SaveIndicator } from '@/components/canvas/SaveIndicator'
import { ExportMapButton } from '@/components/canvas/ExportMapButton'
import { MapsSidebar, MapsSidebarToggle } from '@/components/canvas/MapsSidebar'

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const map = await getMap(id)

  if (!map) notFound()

  const [nodes, connections, tasks, allMaps] = await Promise.all([
    listNodesByMap(id),
    listConnectionsByMap(id),
    listTasksByMap(id),
    listMapsWithStats(),
  ])

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <MapsSidebar maps={allMaps} currentMapId={map.id} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-bg2 px-4 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MapsSidebarToggle />
            <div className="min-w-0 flex-1 max-w-xs">
              <MapTitle initialTitle={map.title} mapId={map.id} />
            </div>
            <HealthScore />
            <SaveIndicator />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <ViewSwitcher />
            <AddTemplateButton mapId={map.id} />
            <ExportMapButton mapTitle={map.title} />
            <MapSettings />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CanvasContainer
            map={map}
            initialNodes={nodes}
            initialConnections={connections}
            initialTasks={tasks}
          />
        </div>
      </div>
    </div>
  )
}
