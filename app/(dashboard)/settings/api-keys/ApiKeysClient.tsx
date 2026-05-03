'use client'

import { useState, useTransition } from 'react'
import { Plus, KeyRound, Copy, Check, Trash2, ShieldOff } from 'lucide-react'
import {
  createApiKeyAction,
  deleteApiKeyAction,
  revokeApiKeyAction,
} from './actions'

interface ApiKey {
  id: string
  key_prefix: string
  name: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export function ApiKeysClient({ keys }: { keys: ApiKey[] }) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [justCreated, setJustCreated] = useState<{
    token: string
    prefix: string
  } | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const onCreate = () => {
    setError(null)
    startTransition(async () => {
      const result = await createApiKeyAction(newName)
      if (result.ok) {
        setJustCreated({ token: result.token, prefix: result.prefix })
        setNewName('')
        setShowNew(false)
      } else {
        setError(result.error)
      }
    })
  }

  const onCopy = async () => {
    if (!justCreated) return
    await navigator.clipboard.writeText(justCreated.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const onRevoke = (id: string) => {
    if (!confirm('Diesen Key wirklich widerrufen? Wird sofort ungültig.')) return
    startTransition(async () => {
      await revokeApiKeyAction(id)
    })
  }

  const onDelete = (id: string) => {
    if (
      !confirm(
        'Diesen Key komplett löschen? Nicht wiederherstellbar. (Widerrufen reicht meistens.)',
      )
    )
      return
    startTransition(async () => {
      await deleteApiKeyAction(id)
    })
  }

  return (
    <div>
      {justCreated && (
        <div className="mb-4 rounded-lg border-2 border-amber bg-amber/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber">
            <KeyRound size={14} />
            Dein neuer API-Key — JETZT kopieren!
          </div>
          <p className="mb-3 text-xs text-text2">
            Aus Sicherheitsgründen zeigen wir den vollständigen Key nur dieses
            eine Mal. Wenn du ihn verlierst, musst du einen neuen erstellen.
          </p>
          <div className="flex items-center gap-2 rounded-md bg-bg2 p-2">
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs">
              {justCreated.token}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setJustCreated(null)}
            className="mt-3 text-xs text-text3 underline hover:text-text2"
          >
            Verstanden, ausblenden
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text2">
          {keys.length === 0
            ? 'Noch keine Keys angelegt.'
            : `${keys.length} ${keys.length === 1 ? 'Key' : 'Keys'} insgesamt`}
        </p>
        {!showNew && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-accent to-accent2 px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
          >
            <Plus size={14} />
            Neuer Key
          </button>
        )}
      </div>

      {showNew && (
        <div className="mb-4 rounded-lg border border-line bg-bg2 p-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text3">
            Wofür ist dieser Key?
          </label>
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreate()
              if (e.key === 'Escape') setShowNew(false)
            }}
            placeholder="z. B. MacBook qontroly, Zapier Webhook, n8n Workflow"
            className="w-full rounded-md border border-line2 bg-bg2 px-3 py-2 text-sm outline-none transition focus:border-accent"
            disabled={pending}
          />
          {error && <p className="mt-2 text-xs text-red">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onCreate}
              disabled={pending || !newName.trim()}
              className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Erstelle …' : 'Key erstellen'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNew(false)
                setNewName('')
                setError(null)
              }}
              disabled={pending}
              className="rounded-md border border-line2 bg-bg2 px-4 py-1.5 text-sm text-text2 transition hover:bg-bg3"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {keys.map((k) => {
          const revoked = !!k.revoked_at
          return (
            <div
              key={k.id}
              className={`flex items-center gap-3 rounded-lg border bg-bg2 p-3 transition ${
                revoked
                  ? 'border-line opacity-60'
                  : 'border-line hover:shadow-soft'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  revoked ? 'bg-bg3 text-text4' : 'bg-accent/10 text-accent'
                }`}
              >
                <KeyRound size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-text">{k.name}</span>
                  {revoked && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-red">
                      Widerrufen
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-text3">
                  <code className="font-mono">{k.key_prefix}…</code>
                  <span>·</span>
                  <span>
                    erstellt {new Date(k.created_at).toLocaleDateString('de-DE')}
                  </span>
                  {k.last_used_at ? (
                    <>
                      <span>·</span>
                      <span>
                        zuletzt genutzt{' '}
                        {new Date(k.last_used_at).toLocaleDateString('de-DE')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>·</span>
                      <span>noch nie genutzt</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!revoked && (
                  <button
                    type="button"
                    onClick={() => onRevoke(k.id)}
                    disabled={pending}
                    title="Key widerrufen — wird sofort ungültig, bleibt aber als Eintrag"
                    className="rounded-md p-2 text-text3 transition hover:bg-bg3 hover:text-amber"
                  >
                    <ShieldOff size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(k.id)}
                  disabled={pending}
                  title="Key komplett löschen"
                  className="rounded-md p-2 text-text3 transition hover:bg-bg3 hover:text-red"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
