import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getMap } from '@/lib/data/maps'
import { listNodesByMap } from '@/lib/data/nodes'
import { listConnectionsByMap } from '@/lib/data/connections'
import { listTasksByMap } from '@/lib/data/tasks'
import { CanvasContainer } from '@/components/canvas/CanvasContainer'
import { ViewSwitcher } from '@/components/canvas/ViewSwitcher'
import { MapSettings } from '@/components/canvas/MapSettings'
import { MapTitle } from '@/components/canvas/MapTitle'
import { HealthScore } from '@/components/canvas/HealthScore'
import { AddTemplateButton } from '@/components/canvas/TemplatePicker'

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const map = await getMap(id)

  if (!map) notFound()

  const [nodes, connections, tasks] = await Promise.all([
    listNodesByMap(id),
    listConnectionsByMap(id),
    listTasksByMap(id),
  ])

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-bg2 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/maps"
            className="rounded-md p-1.5 text-text3 transition hover:bg-bg3 hover:text-text"
            aria-label="Zurück zu allen Maps"
          >
            <ArrowLeft size={16} />
          </Link>
          <MapTitle initialTitle={map.title} mapId={map.id} />
          <HealthScore />
        </div>

        <div className="flex items-center gap-3">
          <ViewSwitcher />
          <AddTemplateButton mapId={map.id} />
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
  )
}
