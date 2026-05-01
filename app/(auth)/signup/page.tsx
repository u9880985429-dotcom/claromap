import Link from 'next/link'
import { signup } from './actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>
}) {
  const params = await searchParams

  if (params.check === 'email') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green/10 text-green">
          ✓
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold">
          E-Mail bestätigen
        </h1>
        <p className="text-sm text-text3">
          Wir haben dir einen Bestätigungs-Link geschickt. Schau in dein
          Postfach (auch im Spam) und klick den Link, um dein Konto zu
          aktivieren.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-accent hover:underline"
        >
          Zurück zum Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold">Konto erstellen</h1>
      <p className="mb-6 text-sm text-text3">
        Erstelle dein Claromap-Konto und starte deine erste Map.
      </p>

      {params.error && (
        <div className="mb-4 rounded-md border border-red/30 bg-red/10 p-3 text-sm text-red">
          {params.error}
        </div>
      )}

      <form action={signup} className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text2">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-line2 bg-bg2 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text2">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-md border border-line2 bg-bg2 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <p className="mt-1 text-xs text-text4">Mindestens 8 Zeichen.</p>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-gradient-to-r from-accent to-accent2 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
        >
          Konto erstellen
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text3">
        Schon ein Konto?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
