import Link from 'next/link'
import { ArrowRight, LogIn, Map as MapIcon, Lock, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthed = Boolean(user)

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header isAuthed={isAuthed} />
      <main className="flex-1">
        <Hero isAuthed={isAuthed} />
        <Features />
        <Steps />
        <Views />
        <BottomCTA isAuthed={isAuthed} />
      </main>
      <Footer />
    </div>
  )
}

// ----------------------------------------------------------------------------

function Header({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg2/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="bg-gradient-to-r from-accent to-accent2 bg-clip-text font-display text-2xl font-bold tracking-tight text-transparent"
        >
          Claromap
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              href="/maps"
              className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
            >
              Zur App <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-text2 transition hover:bg-bg3 sm:block"
              >
                Registrieren
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:shadow-mid"
              >
                <LogIn size={14} />
                Anmelden
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

// ----------------------------------------------------------------------------

function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Hintergrund-Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-1/4 top-20 h-96 w-96 translate-x-1/2 rounded-full bg-accent2/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line2 bg-bg2 px-3 py-1 text-xs font-medium text-text3">
          <Sparkles size={12} className="text-accent" />
          Visuelles Mapping-Tool für DACH
        </div>

        <h1 className="mb-4 bg-gradient-to-r from-accent to-accent2 bg-clip-text font-display text-6xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-8xl">
          Claromap
        </h1>

        <p className="mb-3 font-display text-2xl font-semibold text-text sm:text-3xl">
          Warm für die Omi, stark für den CEO.
        </p>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text2">
          Zeichne deine Ideen, Projekte und Lebensbereiche — visuell, klar und
          vernetzt. Ein Werkzeug, das vom Familien-Kalender bis zur
          Firmen-Roadmap mitwächst.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={isAuthed ? '/maps' : '/signup'}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-accent to-accent2 px-6 py-3 text-base font-semibold text-white shadow-mid transition hover:shadow-strong"
          >
            {isAuthed ? 'Zur App' : 'Jetzt loslegen'}
            <ArrowRight size={16} />
          </Link>
          {!isAuthed && (
            <Link
              href="/login"
              className="rounded-md border border-line2 bg-bg2 px-6 py-3 text-base font-medium text-text2 transition hover:bg-bg3"
            >
              Ich habe schon ein Konto
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs text-text4">
          Kostenlos starten · Keine Kreditkarte · Daten in Frankfurt
        </p>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------------

function Features() {
  const features = [
    {
      icon: MapIcon,
      title: '9 Ansichten in einem Tool',
      desc: 'Wechsle mit einem Klick zwischen Workflow, Mind Map, Kanban, Timeline, Swimlane und 3D-Galaxy. Gleiche Daten — andere Perspektive.',
    },
    {
      icon: Sparkles,
      title: 'Universal verständlich',
      desc: 'Vom Familien-Kalender bis zur Firmen-Roadmap. Keine Tech-Sprache, keine versteckten Menüs. Wer eine Tabelle ausfüllen kann, kann auch Claromap.',
    },
    {
      icon: Lock,
      title: 'Privat & DSGVO',
      desc: 'Server in Frankfurt, Auftragsverarbeitung mit deutschem Anbieter, Datenexport jederzeit als JSON. Deine Maps gehören dir.',
    },
  ]

  return (
    <section className="border-y border-line bg-bg2 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-3 text-center font-display text-3xl font-bold sm:text-4xl">
          Drei Versprechen
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-text2">
          Claromap ist nicht Notion, nicht Miro, nicht Excel. Es ist ein
          Werkzeug das einfach klar ist.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-xl border border-line bg-bg p-6 transition hover:border-accent/40 hover:shadow-soft"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 text-accent">
                <f.icon size={20} />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-text2">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------------

function Steps() {
  const steps = [
    {
      n: '1',
      title: 'Anmelden',
      desc: 'In 30 Sekunden, ohne Kreditkarte. E-Mail, Passwort, fertig.',
    },
    {
      n: '2',
      title: 'Map anlegen',
      desc: 'Knoten zeichnen, ziehen, verbinden. Farben, Formen, Status — alles per Klick.',
    },
    {
      n: '3',
      title: 'Perspektive wechseln',
      desc: 'Gleiche Map, neun Sichten. Plane in Workflow, präsentiere in Linear, schau im 3D-Raum drauf.',
    },
  ]

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">
          So funktioniert&apos;s
        </h2>

        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 font-display text-2xl font-bold text-white shadow-soft">
                {s.n}
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-text2">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------------

function Views() {
  const views = [
    { icon: '⬡', label: 'Workflow' },
    { icon: '✦', label: 'Mind Map' },
    { icon: '◎', label: 'Hub' },
    { icon: '📋', label: 'Linear' },
    { icon: '⊞', label: 'Kanban' },
    { icon: '≡', label: 'Liste' },
    { icon: '⟿', label: 'Timeline' },
    { icon: '⫶', label: 'Swimlane' },
    { icon: '✺', label: '3D-Galaxy' },
  ]

  return (
    <section className="border-y border-line bg-bg2 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center font-display text-3xl font-bold sm:text-4xl">
          Neun Sichten, eine Wahrheit
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-text2">
          Du gibst die Daten einmal ein. Claromap zeigt sie dir, wie du sie
          gerade brauchst — zum Planen, Präsentieren, Reflektieren.
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {views.map((v) => (
            <div
              key={v.label}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-bg p-3 text-center"
            >
              <span className="text-2xl leading-none">{v.icon}</span>
              <span className="text-xs font-medium text-text2">{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------------

function BottomCTA({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold sm:text-4xl">
          Bereit für visuelle Klarheit?
        </h2>
        <p className="mb-8 text-lg text-text2">
          Lege die erste Map an und sieh, wie Ideen plötzlich Form bekommen.
        </p>
        <Link
          href={isAuthed ? '/maps' : '/signup'}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-accent to-accent2 px-8 py-4 text-base font-semibold text-white shadow-mid transition hover:shadow-strong"
        >
          {isAuthed ? 'Zu deinen Maps' : 'Jetzt kostenlos starten'}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-line bg-bg2 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-text3 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text font-display text-lg font-bold text-transparent">
            Claromap
          </span>
          <span className="text-text4">·</span>
          <span className="text-xs">DSGVO-konform · Daten in Frankfurt</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="cursor-not-allowed text-xs text-text4">
            Impressum
          </span>
          <span className="cursor-not-allowed text-xs text-text4">
            Datenschutz
          </span>
          <span className="cursor-not-allowed text-xs text-text4">
            Kontakt
          </span>
        </div>
      </div>
    </footer>
  )
}
