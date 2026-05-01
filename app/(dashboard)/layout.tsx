import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-line bg-bg2 px-6 py-3">
        <Link
          href="/maps"
          className="bg-gradient-to-r from-accent to-accent2 bg-clip-text font-display text-2xl font-bold tracking-tight text-transparent"
        >
          Claromap
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-text3 sm:inline">
            {user.email}
          </span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-line2 bg-bg2 px-3 py-1.5 text-sm text-text2 transition hover:bg-bg3"
            >
              Abmelden
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
