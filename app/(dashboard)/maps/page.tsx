import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { listMaps } from '@/lib/data/maps'
import { deleteMapAction } from './actions'
import { NewMapButton } from '@/components/canvas/TemplatePicker'

const dateFmt = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export default async function MapsPage() {
  const maps = await listMaps()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Deine Maps</h1>
          <p className="mt-1 text-sm text-text2">
            {maps.length === 0
              ? 'Noch keine Maps. Leg deine erste an.'
              : `${maps.length} ${maps.length === 1 ? 'Map' : 'Maps'}`}
          </p>
        </div>

        <NewMapButton />
      </div>

      {maps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line2 bg-bg2 p-12 text-center">
          <p className="mb-2 font-display text-lg">Hier ist es noch leer.</p>
          <p className="mb-6 text-sm text-text3">
            Klick oben auf <strong>Neue Map</strong> und wähle eine Vorlage —
            von Mindmap bis SWOT, von Flowchart bis 3D-Galaxy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <article
              key={map.id}
              className="group relative flex flex-col rounded-lg border border-line bg-bg2 p-5 shadow-soft transition hover:border-accent/40 hover:shadow-mid"
            >
              <Link
                href={`/maps/${map.id}`}
                className="absolute inset-0 rounded-lg"
                aria-label={`Map ${map.title} öffnen`}
              />
              <h2 className="mb-1 font-display text-lg font-semibold">
                {map.title}
              </h2>
              {map.description && (
                <p className="mb-3 line-clamp-2 text-sm text-text3">
                  {map.description}
                </p>
              )}
              <p className="mt-auto pt-4 font-mono text-xs text-text4">
                Aktualisiert {dateFmt.format(new Date(map.updated_at))}
              </p>

              <form
                action={deleteMapAction}
                className="absolute right-3 top-3 z-10 opacity-0 transition group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={map.id} />
                <button
                  type="submit"
                  aria-label="Map löschen"
                  className="rounded-md p-1.5 text-text3 transition hover:bg-red/10 hover:text-red"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
