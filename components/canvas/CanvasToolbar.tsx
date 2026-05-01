'use client'

import {
  Plus,
  Link2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Home,
  StickyNote,
  Undo2,
  Redo2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  scale: number
  connectMode: boolean
  selectedExists: boolean
  canUndo: boolean
  canRedo: boolean
  onAddNode: () => void
  onAddNote: () => void
  onToggleConnect: () => void
  onDeleteSelected: () => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
}

export function CanvasToolbar({
  scale,
  connectMode,
  selectedExists,
  canUndo,
  canRedo,
  onAddNode,
  onAddNote,
  onToggleConnect,
  onDeleteSelected,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
}: Props) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 flex gap-2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-line bg-bg2/95 p-1.5 shadow-soft backdrop-blur">
        <ToolbarButton onClick={onAddNode} icon={Plus} label="Knoten" primary />
        <ToolbarButton onClick={onAddNote} icon={StickyNote} label="Notiz" />
        <ToolbarButton
          onClick={onToggleConnect}
          icon={Link2}
          label={connectMode ? 'Aktiv' : 'Verbinden'}
          active={connectMode}
        />
        <ToolbarButton
          onClick={onDeleteSelected}
          icon={Trash2}
          label="Löschen"
          disabled={!selectedExists}
          danger
        />
      </div>

      <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-line bg-bg2/95 p-1.5 shadow-soft backdrop-blur">
        <ToolbarButton
          onClick={onUndo}
          icon={Undo2}
          label=""
          iconOnly
          disabled={!canUndo}
        />
        <ToolbarButton
          onClick={onRedo}
          icon={Redo2}
          label=""
          iconOnly
          disabled={!canRedo}
        />
      </div>

      <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-line bg-bg2/95 p-1.5 shadow-soft backdrop-blur">
        <ToolbarButton onClick={onZoomOut} icon={ZoomOut} label="" iconOnly />
        <span className="min-w-12 text-center font-mono text-xs text-text3">
          {Math.round(scale * 100)}%
        </span>
        <ToolbarButton onClick={onZoomIn} icon={ZoomIn} label="" iconOnly />
        <ToolbarButton
          onClick={onResetView}
          icon={Home}
          label=""
          iconOnly
        />
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  icon: Icon,
  label,
  active,
  primary,
  danger,
  disabled,
  iconOnly,
}: {
  onClick: () => void
  icon: React.ComponentType<{ size?: number }>
  label: string
  active?: boolean
  primary?: boolean
  danger?: boolean
  disabled?: boolean
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-40',
        primary &&
          !disabled &&
          'bg-gradient-to-r from-accent to-accent2 text-white shadow-soft hover:shadow-mid',
        active &&
          !primary &&
          'bg-accent/15 text-accent ring-1 ring-accent/30',
        !primary &&
          !active &&
          !danger &&
          'text-text2 hover:bg-bg3 hover:text-text',
        danger && !disabled && 'text-red hover:bg-red/10',
      )}
    >
      <Icon size={14} />
      {!iconOnly && label && <span>{label}</span>}
    </button>
  )
}
