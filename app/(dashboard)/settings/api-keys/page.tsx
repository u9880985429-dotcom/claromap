import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApiKeysClient } from './ApiKeysClient'

export const metadata = {
  title: 'API-Keys · Claromap',
}

interface ApiKey {
  id: string
  key_prefix: string
  name: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, created_at, last_used_at, revoked_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const keys: ApiKey[] = error ? [] : (data ?? [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">API-Keys</h1>
        <p className="mt-1 text-sm text-text3">
          Mit einem API-Key kannst du Maps von außen erstellen — z. B. aus
          Claude Code, einem MCP-Server, n8n, Zapier oder deinem eigenen
          Skript. Der Key wird nur einmal beim Erstellen angezeigt; bewahre
          ihn an einem sicheren Ort auf.
        </p>
      </header>

      <ApiKeysClient keys={keys} />

      <section className="mt-10 rounded-lg border border-line bg-bg2 p-5">
        <h2 className="font-display text-base font-semibold">
          So nutzt du den Key
        </h2>
        <p className="mt-1 text-sm text-text3">
          Schicke einen HTTP-POST-Request an{' '}
          <code className="rounded bg-bg3 px-1 font-mono text-xs">
            /api/v1/maps
          </code>{' '}
          mit deinem Key im Authorization-Header:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-bg3 p-3 font-mono text-xs leading-relaxed text-text2">{`curl -X POST '${
          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        }/api/v1/maps' \\
  -H 'Authorization: Bearer cmk_live_…' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title":    "Mein neues Projekt",
    "template": "wbs",
    "nodes": [
      { "name": "Phase 1", "step_number": 1 },
      { "name": "Phase 2", "step_number": 2, "parent_step": 1 }
    ]
  }'`}</pre>
        <p className="mt-3 text-sm text-text3">
          Antwort enthält die <code className="font-mono">id</code> + eine
          fertige <code className="font-mono">url</code> zum direkten
          Anschauen.
        </p>
      </section>
    </div>
  )
}
