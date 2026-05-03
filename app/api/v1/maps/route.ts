import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  validateCreateMap,
  ValidationError,
  type PayloadNode,
  type PayloadConnection,
} from '@/lib/api/validation'
import { getTemplate } from '@/lib/data/templates'

/**
 * POST /api/v1/maps — Map mit Inhalten in einem Aufruf erstellen.
 *
 * Body:
 *   {
 *     "title":     "qontroly Phase-2 Roadmap",
 *     "template":  "wbs",                // optional: Vorlage als Basis
 *     "nodes":     [...],                // optional: zusätzliche Knoten
 *     "connections": [...]               // optional: Verbindungen via step-numbers
 *   }
 *
 * Knoten in `nodes` werden NACH den Vorlagen-Knoten eingefügt. step_number-
 * Konflikte werden automatisch durch Offset gelöst.
 */
export async function POST(request: Request) {
  const auth = await authenticate(request)
  if (auth instanceof NextResponse) return auth

  let payload
  try {
    const body = await request.json()
    payload = validateCreateMap(body)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: 'validation_error', message: err.message, field: err.field },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'invalid_json', message: 'Body ist kein gültiges JSON' },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  // 1) Map erstellen
  const { data: map, error: mapErr } = await admin
    .from('maps')
    .insert({
      user_id: auth.userId,
      title: payload.title,
      description: payload.description ?? null,
      theme: payload.theme ?? 'default',
      background_color: payload.background_color ?? '#F8F9FB',
      background_pattern: payload.background_pattern ?? 'dots',
    })
    .select()
    .single()
  if (mapErr || !map) {
    return NextResponse.json(
      { error: 'db_error', message: mapErr?.message ?? 'Map-Erstellung fehlgeschlagen' },
      { status: 500 },
    )
  }

  // 2) Vorlage einsetzen (optional)
  let stepOffset = 0
  if (payload.template) {
    const tpl = getTemplate(payload.template)
    if (!tpl) {
      return NextResponse.json(
        {
          error: 'unknown_template',
          message: `Template "${payload.template}" existiert nicht`,
        },
        { status: 400 },
      )
    }
    if (tpl.nodes.length > 0) {
      const tplInserts = tpl.nodes.map((n) => ({
        map_id: map.id,
        step_number: n.step_number,
        emoji: n.emoji ?? '📌',
        name: n.name,
        short_desc: n.short_desc ?? null,
        description: n.description ?? null,
        color: n.color ?? '#4A9EFF',
        text_color: n.text_color ?? '#FFFFFF',
        shape: n.shape ?? '20%',
        width: n.width ?? 130,
        height: n.height ?? 130,
        position_x: n.position_x,
        position_y: n.position_y,
        status: n.status ?? 'idea',
        status_icon: n.status_icon ?? '🌱',
        progress: n.progress ?? 0,
        lane: n.lane ?? null,
        start_date: n.start_date ?? null,
        end_date: n.end_date ?? null,
        locked: n.locked ?? false,
        label_position: n.label_position ?? 'center',
      }))
      const { data: insertedTpl, error: tplErr } = await admin
        .from('nodes')
        .insert(tplInserts)
        .select()
      if (tplErr) {
        return NextResponse.json(
          { error: 'db_error', message: tplErr.message },
          { status: 500 },
        )
      }
      // step → DB-ID Mapping für Vorlage-Knoten
      const tplStepToId = new Map<number, string>()
      for (const n of insertedTpl ?? []) tplStepToId.set(n.step_number, n.id)

      // parent_step setzen
      for (const n of tpl.nodes) {
        if (n.parent_step === undefined) continue
        const childId = tplStepToId.get(n.step_number)
        const parentId = tplStepToId.get(n.parent_step)
        if (!childId || !parentId) continue
        await admin
          .from('nodes')
          .update({ parent_node_id: parentId })
          .eq('id', childId)
      }

      // Vorlage-Connections
      if (tpl.connections.length > 0) {
        const tplConns = tpl.connections
          .map((c) => {
            const fromId = tplStepToId.get(c.from_step)
            const toId = tplStepToId.get(c.to_step)
            if (!fromId || !toId) return null
            return {
              map_id: map.id,
              from_node_id: fromId,
              to_node_id: toId,
              number: c.number ?? null,
              step_label: c.step_label ?? null,
              color: c.color ?? '#9CA3AF',
              line_style: c.line_style ?? 'solid',
            }
          })
          .filter((c): c is NonNullable<typeof c> => c !== null)
        if (tplConns.length > 0) {
          await admin.from('connections').insert(tplConns)
        }
      }

      stepOffset = Math.max(...tpl.nodes.map((n) => n.step_number))
    }
  }

  // 3) Custom-Knoten anhängen (vom User mitgegeben)
  const customSteps = new Map<number, string>()
  if (payload.nodes && payload.nodes.length > 0) {
    const customInserts = payload.nodes.map((n: PayloadNode, i) => ({
      map_id: map.id,
      step_number: (n.step_number ?? i + 1) + stepOffset,
      emoji: n.emoji ?? '📌',
      name: n.name,
      short_desc: n.short_desc ?? null,
      description: n.description ?? null,
      color: n.color ?? '#4A9EFF',
      text_color: n.text_color ?? '#FFFFFF',
      shape: n.shape ?? '20%',
      width: n.width ?? 130,
      height: n.height ?? 130,
      position_x: n.position_x ?? i * 200,
      position_y: n.position_y ?? 100,
      status: n.status ?? 'idea',
      status_icon: n.status_icon ?? '🌱',
      progress: n.progress ?? 0,
      lane: n.lane ?? null,
      start_date: n.start_date ?? null,
      end_date: n.end_date ?? null,
      locked: n.locked ?? false,
      label_position: n.label_position ?? 'center',
      image_url: n.image_url ?? null,
    }))
    const { data: insertedCustom, error: customErr } = await admin
      .from('nodes')
      .insert(customInserts)
      .select()
    if (customErr) {
      return NextResponse.json(
        { error: 'db_error', message: customErr.message },
        { status: 500 },
      )
    }
    for (let i = 0; i < (insertedCustom ?? []).length; i++) {
      const original = payload.nodes[i]!
      const inserted = insertedCustom![i]!
      const originalStep = original.step_number ?? i + 1
      customSteps.set(originalStep, inserted.id)
    }

    // parent_step für custom-Knoten setzen
    for (let i = 0; i < payload.nodes.length; i++) {
      const n = payload.nodes[i]!
      if (n.parent_step == null) continue
      const childId = customSteps.get(n.step_number ?? i + 1)
      const parentId = customSteps.get(n.parent_step)
      if (!childId || !parentId) continue
      await admin
        .from('nodes')
        .update({ parent_node_id: parentId })
        .eq('id', childId)
    }
  }

  // 4) Custom-Connections (über step-Nummern)
  if (payload.connections && payload.connections.length > 0) {
    const connInserts = payload.connections
      .map((c: PayloadConnection) => {
        const fromId = c.from_step != null ? customSteps.get(c.from_step) : null
        const toId = c.to_step != null ? customSteps.get(c.to_step) : null
        // Mindestens ein Endpunkt muss aufgelöst werden können (entweder Node oder freie Koord)
        const hasFromCoord = c.from_x != null && c.from_y != null
        const hasToCoord = c.to_x != null && c.to_y != null
        if (!fromId && !hasFromCoord) return null
        if (!toId && !hasToCoord) return null
        return {
          map_id: map.id,
          from_node_id: fromId ?? null,
          to_node_id: toId ?? null,
          from_x: !fromId ? (c.from_x ?? null) : null,
          from_y: !fromId ? (c.from_y ?? null) : null,
          to_x: !toId ? (c.to_x ?? null) : null,
          to_y: !toId ? (c.to_y ?? null) : null,
          number: c.number ?? null,
          step_label: c.step_label ?? null,
          color: c.color ?? '#9CA3AF',
          line_style: c.line_style ?? 'solid',
          stroke_width: c.stroke_width ?? 'medium',
          animation: c.animation ?? 'none',
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
    if (connInserts.length > 0) {
      await admin.from('connections').insert(connInserts)
    }
  }

  // App-URL aus den Env-Vars für die Antwort
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json(
    {
      id: map.id,
      title: map.title,
      url: `${appUrl}/maps/${map.id}`,
      created_at: map.created_at,
    },
    { status: 201 },
  )
}

/**
 * GET /api/v1/maps — listet alle Maps des authentifizierten Users.
 */
export async function GET(request: Request) {
  const auth = await authenticate(request)
  if (auth instanceof NextResponse) return auth

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('maps')
    .select('id, title, description, theme, created_at, updated_at')
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({
    maps: (data ?? []).map((m) => ({
      ...m,
      url: `${appUrl}/maps/${m.id}`,
    })),
  })
}
