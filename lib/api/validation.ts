// Lightweight Validation für REST-API-Payloads. Keine zod-Dependency
// nötig — die Schemas sind klein und übersichtlich.

export interface CreateMapPayload {
  title: string
  description?: string
  template?: string
  theme?: 'default' | 'dark' | 'hand'
  background_color?: string
  background_pattern?: 'dots' | 'grid' | 'lines' | 'cross' | 'none'
  nodes?: PayloadNode[]
  connections?: PayloadConnection[]
}

export interface PayloadNode {
  step_number?: number
  emoji?: string | null
  name: string
  short_desc?: string | null
  description?: string | null
  color?: string
  text_color?: string
  shape?: '50%' | '20%' | '8%' | '0%' | 'leaf' | 'diamond' | 'note'
  width?: number
  height?: number
  position_x?: number
  position_y?: number
  status?: 'done' | 'wip' | 'warning' | 'idea' | 'blocked' | 'ready'
  status_icon?: string
  progress?: number
  lane?: string | null
  start_date?: string | null
  end_date?: string | null
  parent_step?: number | null
  locked?: boolean
  label_position?: 'center' | 'top-banner' | 'above' | 'inside' | 'outside'
  image_url?: string | null
}

export interface PayloadConnection {
  from_step?: number | null
  to_step?: number | null
  from_x?: number | null
  from_y?: number | null
  to_x?: number | null
  to_y?: number | null
  number?: number | null
  step_label?: string | null
  color?: string | null
  line_style?: 'solid' | 'dashed' | 'dotted'
  stroke_width?: 'thin' | 'medium' | 'thick'
  animation?: 'none' | 'pulse' | 'glow'
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(`${field}: ${message}`)
    this.name = 'ValidationError'
  }
}

export function validateCreateMap(input: unknown): CreateMapPayload {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('body', 'Body muss ein JSON-Objekt sein')
  }
  const obj = input as Record<string, unknown>

  if (typeof obj.title !== 'string' || obj.title.trim() === '') {
    throw new ValidationError('title', 'Pflichtfeld, nicht leer')
  }
  if (obj.title.length > 200) {
    throw new ValidationError('title', 'Maximal 200 Zeichen')
  }

  const result: CreateMapPayload = { title: obj.title.trim() }

  if (obj.description != null) {
    if (typeof obj.description !== 'string') {
      throw new ValidationError('description', 'Muss ein String sein')
    }
    result.description = obj.description
  }
  if (obj.template != null) {
    if (typeof obj.template !== 'string') {
      throw new ValidationError('template', 'Muss eine Template-ID sein')
    }
    result.template = obj.template
  }
  if (obj.theme != null) {
    if (!['default', 'dark', 'hand'].includes(obj.theme as string)) {
      throw new ValidationError(
        'theme',
        'Muss "default", "dark" oder "hand" sein',
      )
    }
    result.theme = obj.theme as 'default' | 'dark' | 'hand'
  }
  if (obj.background_color != null) {
    if (typeof obj.background_color !== 'string') {
      throw new ValidationError('background_color', 'Muss ein Hex-String sein')
    }
    result.background_color = obj.background_color
  }
  if (obj.background_pattern != null) {
    if (
      !['dots', 'grid', 'lines', 'cross', 'none'].includes(
        obj.background_pattern as string,
      )
    ) {
      throw new ValidationError(
        'background_pattern',
        'Muss dots/grid/lines/cross/none sein',
      )
    }
    result.background_pattern = obj.background_pattern as
      | 'dots'
      | 'grid'
      | 'lines'
      | 'cross'
      | 'none'
  }

  if (obj.nodes != null) {
    if (!Array.isArray(obj.nodes)) {
      throw new ValidationError('nodes', 'Muss ein Array sein')
    }
    result.nodes = obj.nodes.map((n, i) => validateNode(n, i))
  }

  if (obj.connections != null) {
    if (!Array.isArray(obj.connections)) {
      throw new ValidationError('connections', 'Muss ein Array sein')
    }
    result.connections = obj.connections.map((c, i) =>
      validateConnection(c, i),
    )
  }

  return result
}

function validateNode(input: unknown, index: number): PayloadNode {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(`nodes[${index}]`, 'Muss ein Objekt sein')
  }
  const obj = input as Record<string, unknown>
  if (typeof obj.name !== 'string' || obj.name.trim() === '') {
    throw new ValidationError(`nodes[${index}].name`, 'Pflichtfeld, nicht leer')
  }
  // Wir geben einfach durch — Supabase-Constraints fangen den Rest ab
  return obj as unknown as PayloadNode
}

function validateConnection(
  input: unknown,
  index: number,
): PayloadConnection {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(`connections[${index}]`, 'Muss ein Objekt sein')
  }
  return input as PayloadConnection
}
