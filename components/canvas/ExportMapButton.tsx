'use client'

import { useState } from 'react'
import {
  Download,
  FileImage,
  FileText,
  FileType,
  FileJson,
  Loader2,
} from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'
import {
  exportJson,
  exportPng,
  exportPdf,
  exportDocx,
} from '@/lib/utils/exporters'

interface Props {
  mapTitle: string
}

type Format = 'pdf' | 'png' | 'docx' | 'json'

interface FormatDef {
  id: Format
  label: string
  desc: string
  icon: React.ComponentType<{ size?: number }>
}

const FORMATS: FormatDef[] = [
  {
    id: 'pdf',
    label: 'PDF (zum Drucken / Versenden)',
    desc: 'Visuelles Bild der Map auf einer A4-Seite',
    icon: FileType,
  },
  {
    id: 'png',
    label: 'PNG-Bild (Mail / Slack / Präsentation)',
    desc: 'Hochaufgelöstes Bild mit transparentem Hintergrund',
    icon: FileImage,
  },
  {
    id: 'docx',
    label: 'Word-Dokument',
    desc: 'Strukturierte Liste aller Knoten + Aufgaben + Verbindungen',
    icon: FileText,
  },
  {
    id: 'json',
    label: 'JSON (Backup / Re-Import)',
    desc: 'Komplette Map-Daten als Datei (technisch)',
    icon: FileJson,
  },
]

/**
 * Lädt die Map in einem von 4 Formaten runter:
 *  - PDF / PNG: visueller Snapshot der Map (Bild)
 *  - DOCX:    strukturiertes Word-Dokument zum Lesen / Drucken
 *  - JSON:    komplette Daten zum Re-Import
 */
export function ExportMapButton({ mapTitle }: Props) {
  void mapTitle // Title wird im Export-Helper aus dem Store gezogen
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<Format | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const onPick = async (format: Format) => {
    const state = useMapStore.getState()
    if (!state.map) return
    const snapshot = {
      map: state.map,
      nodes: state.nodes,
      connections: state.connections,
      tasks: state.tasks,
    }
    setBusy(format)
    setErr(null)
    try {
      if (format === 'pdf') await exportPdf(snapshot)
      else if (format === 'png') await exportPng(snapshot)
      else if (format === 'docx') await exportDocx(snapshot)
      else exportJson(snapshot)
      setOpen(false)
    } catch (e) {
      console.error('Export fehlgeschlagen', e)
      setErr(
        'Export hat nicht geklappt. Versuche es nochmal oder wähle ein anderes Format.',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-line bg-bg2 px-2.5 py-1 text-xs text-text2 transition hover:bg-bg3"
        title="Map exportieren"
      >
        <Download size={14} />
        <span>Export</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => !busy && setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-line bg-bg2 p-2 shadow-strong">
            <div className="px-2 pb-2 pt-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text3">
                In welchem Format?
              </p>
            </div>
            <div className="space-y-1">
              {FORMATS.map((f) => {
                const Icon = f.icon
                const isBusy = busy === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onPick(f.id)}
                    disabled={busy !== null}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition hover:bg-bg3 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bg3 text-text2">
                      {isBusy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Icon size={14} />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-text">
                        {f.label}
                      </span>
                      <span className="block text-xs text-text3">
                        {f.desc}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            {err && (
              <p className="mt-2 rounded-md bg-red/10 px-2 py-1.5 text-xs text-red">
                {err}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
