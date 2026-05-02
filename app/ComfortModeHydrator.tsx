'use client'

import { useEffect } from 'react'

/**
 * Liest den Komfort-Modus aus localStorage und setzt das `data-comfort`-
 * Attribut am body. Damit greift die Komfort-CSS auch auf der Maps-Liste,
 * Login, Marketing-Seite — überall, wo der Body diesen Attribut bekommt.
 *
 * Synchron mit dem store-toggle in MapSettings (toggleComfortMode setzt
 * gleichzeitig den localStorage-Wert UND das body-Attribut).
 */
export function ComfortModeHydrator() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('claromap.comfort')
    if (saved === 'true') {
      document.body.toggleAttribute('data-comfort', true)
    }
  }, [])

  return null
}
