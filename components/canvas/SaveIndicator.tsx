'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'

export function SaveIndicator() {
  const status = useMapStore((s) => s.saveStatus)
  const until = useMapStore((s) => s.saveStatusUntil)
  const [now, setNow] = useState(() => Date.now())

  // Tick die Zeit gegen `until` damit „saved" nach 2s automatisch
  // verschwindet ohne dass wir den Store mutieren müssen
  useEffect(() => {
    if (status !== 'saved' && status !== 'error') return
    const tick = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(tick)
  }, [status])

  // Wenn 'saved' oder 'error' abgelaufen → nichts rendern
  const expired = (status === 'saved' || status === 'error') && now >= until

  if (status === 'idle' || expired) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg2 px-2 py-0.5 text-[11px] font-medium text-text4"
        title="Auto-Save aktiv. Änderungen werden direkt gespeichert."
      >
        <Check size={11} className="opacity-50" />
        Synchronisiert
      </span>
    )
  }

  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber">
        <Loader2 size={11} className="animate-spin" />
        Speichert …
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green/40 bg-green/10 px-2 py-0.5 text-[11px] font-medium text-green">
        <Check size={11} />
        Gespeichert
      </span>
    )
  }

  // error
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[11px] font-medium text-red"
      title="Letzte Änderung konnte nicht gespeichert werden. Versuche es nochmal."
    >
      <AlertCircle size={11} />
      Fehler
    </span>
  )
}
