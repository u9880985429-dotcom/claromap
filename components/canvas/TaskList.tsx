'use client'

import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useMapStore, type TaskRow } from '@/stores/mapStore'
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from '@/app/(dashboard)/maps/[id]/actions'

interface Props {
  nodeId: string
}

export function TaskList({ nodeId }: Props) {
  // Raw store array (stable reference). Filter+sort outside of selector
  // to avoid Zustand's "getSnapshot infinite loop" warning that fires when
  // a selector returns a freshly-allocated array on every call.
  const allTasks = useMapStore((s) => s.tasks)
  const tasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.node_id === nodeId)
        .sort((a, b) => a.order_index - b.order_index),
    [allTasks, nodeId],
  )
  const [newText, setNewText] = useState('')

  const onAdd = async () => {
    const text = newText.trim()
    if (!text) return
    setNewText('')

    const tempId = `temp-${Date.now()}`
    const tempTask: TaskRow = {
      id: tempId,
      node_id: nodeId,
      text,
      description: null,
      done: false,
      order_index: tasks.length,
      due_date: null,
      created_at: new Date().toISOString(),
    }
    useMapStore.getState().upsertTask(tempTask)

    try {
      const real = await createTaskAction({
        node_id: nodeId,
        text,
        order_index: tasks.length,
      })
      useMapStore.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === tempId ? real : t)),
      }))
    } catch (err) {
      console.error('Aufgabe konnte nicht erstellt werden', err)
      useMapStore.getState().removeTask(tempId)
    }
  }

  const onToggle = async (task: TaskRow) => {
    const next = !task.done
    useMapStore.getState().patchTaskLocal(task.id, { done: next })
    try {
      await updateTaskAction(task.id, { done: next })
    } catch (err) {
      useMapStore.getState().patchTaskLocal(task.id, { done: !next })
      console.error(err)
    }
  }

  const onDelete = async (id: string) => {
    useMapStore.getState().removeTask(id)
    try {
      await deleteTaskAction(id)
    } catch (err) {
      console.error('Aufgabe konnte nicht gelöscht werden', err)
    }
  }

  return (
    <div className="space-y-2">
      {tasks.length === 0 && (
        <p className="text-xs italic text-text4">Keine Aufgaben.</p>
      )}
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-start gap-2 rounded-md bg-bg3 px-2 py-1.5"
        >
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-accent"
          />
          <span
            className={`flex-1 text-sm ${
              task.done ? 'text-text4 line-through' : 'text-text2'
            }`}
          >
            {task.text}
          </span>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="text-text4 opacity-0 transition hover:text-red group-hover:opacity-100"
            aria-label="Aufgabe löschen"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          placeholder="Neue Aufgabe…"
          className="flex-1 rounded-md border border-line2 bg-bg2 px-2 py-1.5 text-sm outline-none transition focus:border-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!newText.trim()}
          className="rounded-md bg-accent/10 p-1.5 text-accent transition hover:bg-accent/20 disabled:opacity-30"
          aria-label="Hinzufügen"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
