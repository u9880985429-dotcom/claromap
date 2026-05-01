import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 bg-gradient-to-r from-accent to-accent2 bg-clip-text font-display text-4xl font-bold tracking-tight text-transparent"
      >
        Claromap
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-line bg-bg2 p-8 shadow-soft">
        {children}
      </div>
    </div>
  )
}
