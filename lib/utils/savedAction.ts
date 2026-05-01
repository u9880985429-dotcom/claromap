import { useMapStore } from '@/stores/mapStore'

/**
 * Wrappt eine Server-Action so, dass der globale Save-Status im mapStore
 * aktualisiert wird. Mehrere parallele Calls werden gezählt (inflightCount),
 * der Status springt erst dann auf 'saved' wenn alle abgeschlossen sind.
 *
 * Beispiel:
 *   await savedAction(() => updateNodeAction(id, patch))
 */
export async function savedAction<T>(fn: () => Promise<T>): Promise<T> {
  const { beginSave, endSave } = useMapStore.getState()
  beginSave()
  try {
    const result = await fn()
    endSave(true)
    return result
  } catch (err) {
    endSave(false)
    throw err
  }
}
