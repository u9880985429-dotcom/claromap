import type { Metadata } from 'next'
import './globals.css'
import { ComfortModeHydrator } from './ComfortModeHydrator'

export const metadata: Metadata = {
  title: 'Claromap — Visuelles Mapping für Leben & Business',
  description:
    'Warm für die Omi, stark für den CEO. Organisiere Ideen, Projekte und Lebensbereiche visuell.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full font-body bg-bg text-text">
        <ComfortModeHydrator />
        {children}
      </body>
    </html>
  )
}
