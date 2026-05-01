import Link from 'next/link'
import { login, signInWithGoogle } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const next = params.next ?? '/maps'

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold">Anmelden</h1>
      <p className="mb-6 text-sm text-text3">Willkommen zurück bei Claromap.</p>

      {params.error && (
        <div className="mb-4 rounded-md border border-red/30 bg-red/10 p-3 text-sm text-red">
          {params.error}
        </div>
      )}

      <form action={signInWithGoogle} className="mb-4">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-line2 bg-bg2 px-4 py-2.5 text-sm font-medium transition hover:bg-bg3"
        >
          <GoogleIcon />
          <span>Mit Google anmelden</span>
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-text4">
        <div className="h-px flex-1 bg-line2" />
        <span>oder per E-Mail</span>
        <div className="h-px flex-1 bg-line2" />
      </div>

      <form action={login} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <Field
          id="email"
          name="email"
          type="email"
          label="E-Mail"
          autoComplete="email"
          required
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Passwort"
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className="w-full rounded-md bg-gradient-to-r from-accent to-accent2 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
        >
          Anmelden
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text3">
        Noch kein Konto?{' '}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-accent hover:underline"
        >
          Registrieren
        </Link>
      </p>
    </div>
  )
}

function Field({
  id,
  name,
  type,
  label,
  autoComplete,
  required,
}: {
  id: string
  name: string
  type: string
  label: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-text2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-line2 bg-bg2 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
