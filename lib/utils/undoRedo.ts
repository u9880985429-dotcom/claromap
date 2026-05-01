import { useMapStore, type HistoryEntry } from '@/stores/mapStore'
import {
  createNodeAction,
  updateNodeAction,
  deleteNodeAction,
  createConnectionAction,
  deleteConnectionAction,
} from '@/app/(dashboard)/maps/[id]/actions'
import { savedAction } from './savedAction'

/**
 * Wendet eine Undo-Aktion an: invertiert den HistoryEntry und führt die
 * Operation lokal + auf dem Server aus. Pusht KEINEN neuen History-Eintrag.
 */
export async function applyUndo(entry: HistoryEntry): Promise<void> {
  const store = useMapStore.getState()

  switch (entry.type) {
    case 'patch-node': {
      // Inverse: setze die "before"-Werte
      store.patchNodeLocal(entry.nodeId, entry.before)
      try {
        await savedAction(() => updateNodeAction(entry.nodeId, entry.before))
      } catch (err) {
        console.error('Undo: patch-node failed', err)
      }
      return
    }

    case 'bulk-patch-nodes': {
      // Inverse: alle "before"-Werte parallel setzen
      for (const p of entry.patches) {
        store.patchNodeLocal(p.nodeId, p.before)
      }
      try {
        await savedAction(() =>
          Promise.all(
            entry.patches.map((p) =>
              updateNodeAction(p.nodeId, p.before),
            ),
          ),
        )
      } catch (err) {
        console.error('Undo: bulk-patch-nodes failed', err)
      }
      return
    }

    case 'create-node': {
      // Inverse von create: delete
      store.removeNode(entry.node.id)
      try {
        await savedAction(() => deleteNodeAction(entry.node.id))
      } catch (err) {
        console.error('Undo: delete (was create) failed', err)
      }
      return
    }

    case 'delete-node': {
      // Inverse von delete: re-create mit gleicher ID + alle Connections + Tasks
      try {
        const created = await savedAction(() =>
          createNodeAction({
            id: entry.node.id, // gleiche ID — wichtig für Connections!
            map_id: entry.node.map_id,
            step_number: entry.node.step_number,
            emoji: entry.node.emoji,
            name: entry.node.name,
            short_desc: entry.node.short_desc,
            description: entry.node.description,
            color: entry.node.color,
            text_color: entry.node.text_color,
            shape: entry.node.shape,
            width: entry.node.width,
            height: entry.node.height,
            position_x: entry.node.position_x,
            position_y: entry.node.position_y,
            status: entry.node.status,
            status_icon: entry.node.status_icon,
            progress: entry.node.progress,
            label_position: entry.node.label_position,
            lane: entry.node.lane,
            start_date: entry.node.start_date,
            end_date: entry.node.end_date,
            parent_node_id: entry.node.parent_node_id,
          }),
        )
        store.upsertNode(created)
        // Connections re-create (sie wurden durch CASCADE gelöscht)
        for (const c of entry.connections) {
          try {
            const reCreated = await createConnectionAction({
              id: c.id,
              map_id: c.map_id,
              from_node_id: c.from_node_id,
              to_node_id: c.to_node_id,
              number: c.number,
              step_label: c.step_label,
              color: c.color,
              line_style: c.line_style,
            })
            store.upsertConnection(reCreated)
          } catch (err) {
            console.error('Undo: connection re-create failed', err)
          }
        }
        // Tasks re-create (für Vollständigkeit) — hier vereinfacht weggelassen,
        // weil Tasks selten reverted werden müssen
      } catch (err) {
        console.error('Undo: re-create-node failed', err)
      }
      return
    }

    case 'bulk-delete-nodes': {
      // Inverse: alle Knoten + ihre Connections re-create (mit Original-IDs)
      for (const item of entry.items) {
        try {
          const created = await createNodeAction({
            id: item.node.id,
            map_id: item.node.map_id,
            step_number: item.node.step_number,
            emoji: item.node.emoji,
            name: item.node.name,
            short_desc: item.node.short_desc,
            description: item.node.description,
            color: item.node.color,
            text_color: item.node.text_color,
            shape: item.node.shape,
            width: item.node.width,
            height: item.node.height,
            position_x: item.node.position_x,
            position_y: item.node.position_y,
            status: item.node.status,
            status_icon: item.node.status_icon,
            progress: item.node.progress,
            label_position: item.node.label_position,
            lane: item.node.lane,
            start_date: item.node.start_date,
            end_date: item.node.end_date,
            parent_node_id: item.node.parent_node_id,
          })
          store.upsertNode(created)
        } catch (err) {
          console.error('Undo: bulk re-create-node failed', err)
        }
      }
      // Connections nach allen Knoten re-createn, damit beide Endpunkte
      // schon wieder existieren
      for (const item of entry.items) {
        for (const c of item.connections) {
          try {
            const reCreated = await createConnectionAction({
              id: c.id,
              map_id: c.map_id,
              from_node_id: c.from_node_id,
              to_node_id: c.to_node_id,
              number: c.number,
              step_label: c.step_label,
              color: c.color,
              line_style: c.line_style,
            })
            store.upsertConnection(reCreated)
          } catch {
            // Connection könnte zum gleichen Bulk gehören und schon existieren
            // (sie ist im items-Array eines anderen Knoten doppelt) — silent
          }
        }
      }
      return
    }

    case 'create-connection': {
      store.removeConnection(entry.conn.id)
      try {
        await savedAction(() => deleteConnectionAction(entry.conn.id))
      } catch (err) {
        console.error('Undo: delete (was create) connection failed', err)
      }
      return
    }

    case 'delete-connection': {
      try {
        const reCreated = await savedAction(() =>
          createConnectionAction({
            id: entry.conn.id,
            map_id: entry.conn.map_id,
            from_node_id: entry.conn.from_node_id,
            to_node_id: entry.conn.to_node_id,
            number: entry.conn.number,
            step_label: entry.conn.step_label,
            color: entry.conn.color,
            line_style: entry.conn.line_style,
          }),
        )
        store.upsertConnection(reCreated)
      } catch (err) {
        console.error('Undo: re-create-connection failed', err)
      }
      return
    }
  }
}

/**
 * Wendet eine Redo-Aktion an: führt die Operation erneut aus.
 */
export async function applyRedo(entry: HistoryEntry): Promise<void> {
  const store = useMapStore.getState()

  switch (entry.type) {
    case 'patch-node': {
      store.patchNodeLocal(entry.nodeId, entry.after)
      try {
        await savedAction(() => updateNodeAction(entry.nodeId, entry.after))
      } catch (err) {
        console.error('Redo: patch-node failed', err)
      }
      return
    }

    case 'bulk-patch-nodes': {
      for (const p of entry.patches) {
        store.patchNodeLocal(p.nodeId, p.after)
      }
      try {
        await savedAction(() =>
          Promise.all(
            entry.patches.map((p) => updateNodeAction(p.nodeId, p.after)),
          ),
        )
      } catch (err) {
        console.error('Redo: bulk-patch-nodes failed', err)
      }
      return
    }

    case 'create-node': {
      // Re-create mit gleicher ID
      try {
        const created = await savedAction(() =>
          createNodeAction({
            id: entry.node.id,
            map_id: entry.node.map_id,
            step_number: entry.node.step_number,
            emoji: entry.node.emoji,
            name: entry.node.name,
            short_desc: entry.node.short_desc,
            description: entry.node.description,
            color: entry.node.color,
            text_color: entry.node.text_color,
            shape: entry.node.shape,
            width: entry.node.width,
            height: entry.node.height,
            position_x: entry.node.position_x,
            position_y: entry.node.position_y,
            status: entry.node.status,
            status_icon: entry.node.status_icon,
            progress: entry.node.progress,
            label_position: entry.node.label_position,
            lane: entry.node.lane,
            start_date: entry.node.start_date,
            end_date: entry.node.end_date,
            parent_node_id: entry.node.parent_node_id,
          }),
        )
        store.upsertNode(created)
      } catch (err) {
        console.error('Redo: re-create-node failed', err)
      }
      return
    }

    case 'delete-node': {
      store.removeNode(entry.node.id)
      try {
        await savedAction(() => deleteNodeAction(entry.node.id))
      } catch (err) {
        console.error('Redo: delete-node failed', err)
      }
      return
    }

    case 'bulk-delete-nodes': {
      for (const item of entry.items) {
        store.removeNode(item.node.id)
      }
      try {
        await savedAction(() =>
          Promise.all(
            entry.items.map((item) => deleteNodeAction(item.node.id)),
          ),
        )
      } catch (err) {
        console.error('Redo: bulk-delete-nodes failed', err)
      }
      return
    }

    case 'create-connection': {
      try {
        const reCreated = await savedAction(() =>
          createConnectionAction({
            id: entry.conn.id,
            map_id: entry.conn.map_id,
            from_node_id: entry.conn.from_node_id,
            to_node_id: entry.conn.to_node_id,
            number: entry.conn.number,
            step_label: entry.conn.step_label,
            color: entry.conn.color,
            line_style: entry.conn.line_style,
          }),
        )
        store.upsertConnection(reCreated)
      } catch (err) {
        console.error('Redo: re-create-connection failed', err)
      }
      return
    }

    case 'delete-connection': {
      store.removeConnection(entry.conn.id)
      try {
        await savedAction(() => deleteConnectionAction(entry.conn.id))
      } catch (err) {
        console.error('Redo: delete-connection failed', err)
      }
      return
    }
  }
}

export async function undo(): Promise<void> {
  const entry = useMapStore.getState().popUndo()
  if (!entry) return
  await applyUndo(entry)
}

export async function redo(): Promise<void> {
  const entry = useMapStore.getState().popRedo()
  if (!entry) return
  await applyRedo(entry)
}
