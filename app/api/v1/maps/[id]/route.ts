import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/v1/maps/:id — vollständiger Map-Inhalt (Knoten + Verbindungen + Tasks).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticate(request)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const admin = createAdminClient()
  const { data: map, error: mapErr } = await admin
    .from('maps')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (mapErr) {
    return NextResponse.json(
      { error: 'db_error', message: mapErr.message },
      { status: 500 },
    )
  }
  if (!map) {
    return NextResponse.json(
      {
        error: 'not_found',
        message: 'Map existiert nicht oder du hast keinen Zugriff darauf',
      },
      { status: 404 },
    )
  }

  const [{ data: nodes }, { data: connections }, { data: tasks }] =
    await Promise.all([
      admin
        .from('nodes')
        .select('*')
        .eq('map_id', id)
        .order('step_number', { ascending: true }),
      admin.from('connections').select('*').eq('map_id', id),
      admin
        .from('tasks')
        .select('*, nodes!inner(map_id)')
        .eq('nodes.map_id', id),
    ])

  // tasks haben durch den join ein nodes-Feld — entfernen
  const cleanTasks = (tasks ?? []).map((t) => {
    const { nodes: _, ...rest } = t as { nodes: unknown } & Record<
      string,
      unknown
    >
    void _
    return rest
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({
    map: { ...map, url: `${appUrl}/maps/${map.id}` },
    nodes: nodes ?? [],
    connections: connections ?? [],
    tasks: cleanTasks,
  })
}

/**
 * DELETE /api/v1/maps/:id — Map löschen.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticate(request)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const admin = createAdminClient()
  const { error } = await admin
    .from('maps')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId)
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true })
}
